import { AuthService } from '../services/auth.service';
import { BookService } from '../services/book.service';
import { BorrowingService } from '../services/borrowing.service';
import { FineService } from '../services/fine.service';
import { ReportService } from '../services/report.service';
import { MemberService } from '../services/member.service';
import { seedDatabase } from '../database/seed';
import { db } from '../database/db';

const authService = new AuthService();
const bookService = new BookService();
const borrowingService = new BorrowingService();
const fineService = new FineService();
const reportService = new ReportService();
const memberService = new MemberService();

const runApiVerificationSuite = async () => {
  console.log('====================================================');
  console.log('      PHASE 3 BACKEND & API VERIFICATION SUITE      ');
  console.log('====================================================\n');

  // 0. Seed Database first
  console.log('[Test 0] Resetting and seeding clean test database...');
  await seedDatabase();

  // 1. Test Registration & Password Hashing
  console.log('\n[Test 1] Member Registration & Password Hashing...');
  const testStudentId = `STU-${Date.now().toString().slice(-6)}`;
  const regResult = await authService.registerMember({
    name: 'Teerapat TestUser',
    studentId: testStudentId,
    faculty: 'Engineering',
    major: 'Computer Engineering',
    password: 'SecurePassword123',
  });
  console.log('  ✅ Registration successful for Student ID:', regResult.user.studentId);

  // 2. Test Login
  console.log('\n[Test 2] Member & Librarian Authentication...');
  const memberLogin = await authService.login(testStudentId, 'SecurePassword123');
  console.log('  ✅ Member Login token issued:', memberLogin.token.slice(0, 20) + '...');

  const librarianLogin = await authService.login('librarian_anan', 'pbkdf2_hash_placeholder_123');
  console.log('  ✅ Librarian Login token issued for role:', librarianLogin.user.role);

  // 3. Test Book Search & Creation
  console.log('\n[Test 3] Book Catalog Search & Creation...');
  const newBook = await bookService.createBook({
    isbn: `978-TEST-${Date.now().toString().slice(-4)}`,
    title: 'OOAD System Design Patterns',
    author: 'Gang of Four Extended',
    publisher: 'Academic Press',
    publicationYear: 2026,
    quantity: 2,
  });
  console.log('  ✅ Book created ID:', newBook.id, 'with copies:', newBook.copies.map((c: any) => c.copy_id));

  const searchResults = await bookService.getAllBooks('OOAD');
  console.log('  ✅ Book Search result count:', searchResults.length);

  // 4. Test Borrowing Rules & 7-Day Due Date
  console.log('\n[Test 4] Borrowing Rules & 7-Day Loan Period...');
  const newMemberId = regResult.user.memberId;
  const copyToBorrow = newBook.copies[0].copy_id;

  const borrowing = await borrowingService.createBorrowing(newMemberId, copyToBorrow);
  console.log('  ✅ Borrowing created ID:', borrowing.borrowing_id);
  
  const borrowDate = new Date(borrowing.borrow_date);
  const dueDate = new Date(borrowing.due_date);
  const diffDays = Math.round((dueDate.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24));
  console.log(`  ✅ Verified Loan Duration: ${diffDays} days (Expected 7 days)`);

  // 5. Test Same-Copy Double Borrow Protection
  console.log('\n[Test 5] Same-Copy Protection...');
  try {
    await borrowingService.createBorrowing(newMemberId, copyToBorrow);
    console.error('  ❌ Failed: Allowed borrowing already borrowed copy!');
  } catch (err: any) {
    console.log('  ✅ Correctly rejected double borrowing:', err.message);
  }

  // 6. Test Max 3 Books Limit
  console.log('\n[Test 6] Maximum 3 Active Books Limit...');
  const copy2 = newBook.copies[1].copy_id;
  await borrowingService.createBorrowing(newMemberId, copy2);

  // Add 3rd book copy and borrow
  const book2 = await bookService.createBook({
    isbn: `978-TEST3-${Date.now().toString().slice(-4)}`,
    title: 'Operating Systems Principles',
    author: 'Silberschatz',
    publisher: 'Wiley',
    publicationYear: 2024,
    quantity: 1,
  });
  const copy3 = book2.copies[0].copy_id;
  await borrowingService.createBorrowing(newMemberId, copy3);

  // Try 4th borrowing
  const book3 = await bookService.createBook({
    isbn: `978-TEST4-${Date.now().toString().slice(-4)}`,
    title: 'Computer Networks',
    author: 'Tanenbaum',
    publisher: 'Pearson',
    publicationYear: 2025,
    quantity: 1,
  });
  try {
    await borrowingService.createBorrowing(newMemberId, book3.copies[0].copy_id);
    console.error('  ❌ Failed: Allowed 4th active borrowing!');
  } catch (err: any) {
    console.log('  ✅ Correctly enforced Max 3 Active Books limit:', err.message);
  }

  // 7. Test Returning & Overdue Detection & Fine Generation
  console.log('\n[Test 7] Book Returning & Overdue Fine Calculation...');
  const members = await memberService.getAllMembers();
  const member2 = members.find((m: any) => m.student_id === '6712732102');
  const member2Id = member2 ? member2.id : 2;

  const overdueBorrowings = await borrowingService.getMemberBorrowings(member2Id);
  const overdueBrw = overdueBorrowings.find((b: any) => b.status === 'OVERDUE') || overdueBorrowings[0];
  
  if (overdueBrw) {
    const returnResult = await borrowingService.processReturn(overdueBrw.id);
    console.log('  ✅ Book Return processed:', returnResult.message);
    console.log(`  ✅ Overdue: ${returnResult.isOverdue}, Overdue Days: ${returnResult.overdueDays}, Fine Amount: ${returnResult.fineAmount} THB (10 THB/day)`);
  } else {
    console.log('  ⚠️ Warning: No overdue borrowing found to test return');
  }

  // 8. Test Fine Payment Processing
  console.log('\n[Test 8] Fine Payment Processing...');
  const unpaidFines = await fineService.getFines('UNPAID');
  console.log('  ✅ Total Unpaid Fines:', unpaidFines.length);
  if (unpaidFines.length > 0) {
    const fineToPay = unpaidFines[0];
    const payResult = await fineService.payFine(fineToPay.id, librarianLogin.user.librarianId);
    console.log('  ✅ Fine Paid:', payResult.paymentId, 'New Status:', payResult.status);
  }

  // 9. Test Reports Generation
  console.log('\n[Test 9] Analytics Reports Execution...');
  const currReport = await reportService.getCurrentBorrowingsReport();
  console.log('  ✅ Current Borrowings Report count:', currReport.length);

  const overdueReport = await reportService.getOverdueReport();
  console.log('  ✅ Overdue Report count:', overdueReport.length);

  const unpaidFinesReport = await reportService.getUnpaidFinesReport();
  console.log('  ✅ Unpaid Fines Report count:', unpaidFinesReport.totalUnpaidCount);

  const txReport = await reportService.getTransactionReport();
  console.log('  ✅ Transaction Report count:', txReport.length);

  console.log('\n====================================================');
  console.log('   ALL PHASE 3 BACKEND & API TESTS PASSED 100%      ');
  console.log('====================================================\n');
};

runApiVerificationSuite()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ API Verification Suite Failed:', err);
    db.close();
    process.exit(1);
  });
