import { BorrowingRepository } from '../repositories/borrowing.repository';
import { BookRepository } from '../repositories/book.repository';
import { UserRepository } from '../repositories/user.repository';
import { FineRepository } from '../repositories/fine.repository';
import { AppError } from '../middleware/error.middleware';

export class BorrowingService {
  private borrowingRepo = new BorrowingRepository();
  private bookRepo = new BookRepository();
  private userRepo = new UserRepository();
  private fineRepo = new FineRepository();

  async createBorrowing(memberId: number, bookCopyIdOrCode: string | number) {
    // 1. Verify member exists and is ACTIVE
    const member = await this.userRepo.findMemberById(memberId);
    if (!member) {
      throw new AppError(404, `Member with ID ${memberId} not found.`);
    }
    if (member.status !== 'ACTIVE') {
      throw new AppError(400, `Member account is ${member.status}. Only ACTIVE members can borrow books.`);
    }

    // 2. Verify member active books limit (< 3)
    const activeBorrowings = await this.borrowingRepo.findActiveByMemberId(memberId);
    if (activeBorrowings.length >= 3) {
      throw new AppError(400, `Member has reached the maximum borrowing limit of 3 books.`);
    }

    // 3. Verify member has no blocking overdue books
    const nowISO = new Date().toISOString();
    const overdueBorrowings = await this.borrowingRepo.findOverdueByMemberId(memberId, nowISO);
    if (overdueBorrowings.length > 0) {
      throw new AppError(400, `Member has ${overdueBorrowings.length} overdue book(s). Overdue books must be returned before borrowing new items.`);
    }

    // 4. Verify member has no blocking unpaid fines
    const unpaidFines = await this.fineRepo.findUnpaidByMemberId(memberId);
    if (unpaidFines.length > 0) {
      throw new AppError(400, `Member has unpaid fine(s) totaling ${unpaidFines.reduce((sum, f) => sum + f.amount, 0)} THB. Fines must be paid before borrowing.`);
    }

    // 5. Verify BookCopy exists and status == AVAILABLE
    let copy: any;
    if (typeof bookCopyIdOrCode === 'number' || !isNaN(Number(bookCopyIdOrCode))) {
      copy = await this.bookRepo.findCopyById(Number(bookCopyIdOrCode));
    } else {
      copy = await this.bookRepo.findCopyByCopyId(String(bookCopyIdOrCode));
    }

    if (!copy) {
      throw new AppError(404, `BookCopy '${bookCopyIdOrCode}' not found.`);
    }

    if (copy.status !== 'AVAILABLE') {
      throw new AppError(400, `BookCopy '${copy.copy_id}' is currently ${copy.status} and cannot be borrowed.`);
    }

    // 6. Double check copy is not in active borrowing
    const activeCopyBorrowing = await this.borrowingRepo.findActiveByBookCopyId(copy.id);
    if (activeCopyBorrowing) {
      throw new AppError(400, `BookCopy '${copy.copy_id}' is already assigned to an active borrowing transaction.`);
    }

    // 7. Calculate dates (7 days borrow period)
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const borrowingCode = `BRW-${Date.now().toString().slice(-6)}`;

    // 8. Execute borrowing transaction
    const borrowingId = await this.borrowingRepo.createBorrowing(
      borrowingCode,
      memberId,
      copy.id,
      borrowDate.toISOString(),
      dueDate.toISOString()
    );

    // Update BookCopy status
    await this.bookRepo.updateCopyStatus(copy.id, 'BORROWED');

    return this.borrowingRepo.findById(borrowingId);
  }

  async processReturn(borrowingRef: number | string) {
    let borrowing: any;
    if (typeof borrowingRef === 'number' || (!isNaN(Number(borrowingRef)) && String(borrowingRef).length < 8)) {
      borrowing = await this.borrowingRepo.findById(Number(borrowingRef));
    }
    if (!borrowing && typeof borrowingRef === 'string') {
      borrowing = await this.borrowingRepo.findActiveByCopyRef(borrowingRef);
    }
    if (!borrowing) {
      throw new AppError(404, `Borrowing transaction '${borrowingRef}' not found or active.`);
    }

    if (borrowing.status === 'RETURNED') {
      throw new AppError(400, `Borrowing transaction '${borrowing.borrowing_id}' has already been returned.`);
    }

    const returnDate = new Date();
    const dueDate = new Date(borrowing.due_date);
    let overdueDays = 0;
    let fineGenerated = false;
    let fineAmount = 0;

    if (returnDate > dueDate) {
      const diffMs = returnDate.getTime() - dueDate.getTime();
      overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      fineAmount = overdueDays * 10; // 10 THB per day

      if (overdueDays > 0) {
        const existingFine = await this.fineRepo.findByBorrowingId(borrowing.id);
        if (!existingFine) {
          const fineCode = `FINE-${Date.now().toString().slice(-6)}`;
          await this.fineRepo.createFine(fineCode, borrowing.id, borrowing.member_id, overdueDays, fineAmount);
        } else {
          fineAmount = existingFine.amount;
        }
        fineGenerated = true;
      }
    }

    // Update borrowing record
    await this.borrowingRepo.processReturn(borrowing.id, returnDate.toISOString(), 'RETURNED');

    // Update BookCopy status back to AVAILABLE
    await this.bookRepo.updateCopyStatus(borrowing.book_copy_id, 'AVAILABLE');

    return {
      message: 'Book returned successfully',
      borrowingId: borrowing.id,
      borrowingCode: borrowing.borrowing_id,
      copyId: borrowing.copy_id,
      bookTitle: borrowing.book_title,
      memberName: borrowing.member_name,
      studentId: borrowing.student_id,
      borrowDate: borrowing.borrow_date,
      dueDate: borrowing.due_date,
      returnDate: returnDate.toISOString(),
      isOverdue: overdueDays > 0,
      overdueDays,
      fineGenerated,
      fineAmount,
    };
  }

  async getMemberBorrowings(memberId: number) {
    return this.borrowingRepo.findHistoryByMemberId(memberId);
  }

  async getAllBorrowings(search?: string, status?: string) {
    return this.borrowingRepo.findAll(search, status);
  }

  async getActiveCopyBorrowing(copyRef: string) {
    const borrowing = await this.borrowingRepo.findActiveByCopyRef(copyRef);
    if (!borrowing) {
      throw new AppError(404, `No active borrowing transaction found for copy/transaction '${copyRef}'.`);
    }
    
    // Calculate expected overdue info preview
    const returnDate = new Date();
    const dueDate = new Date(borrowing.due_date);
    let overdueDays = 0;
    let fineAmount = 0;
    if (returnDate > dueDate) {
      const diffMs = returnDate.getTime() - dueDate.getTime();
      overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      fineAmount = overdueDays * 10;
    }

    return {
      ...borrowing,
      isOverdue: overdueDays > 0,
      overdueDays,
      expectedFine: fineAmount
    };
  }

  async borrowBookByBookId(memberId: number, bookId: number) {
    // 1. Verify book exists
    const book = await this.bookRepo.findBookById(bookId);
    if (!book) {
      throw new AppError(404, `Book with ID ${bookId} not found.`);
    }

    // 2. Query available physical copy
    const copies = await this.bookRepo.findBookById(bookId);
    const availableCopy = copies?.copies?.find((c: any) => c.status === 'AVAILABLE');
    
    if (!availableCopy) {
      throw new AppError(400, `No available copies of '${book.title}' are currently available for borrowing.`);
    }

    // 3. Delegate to createBorrowing using available physical Copy ID
    return this.createBorrowing(memberId, availableCopy.copy_id);
  }
}

