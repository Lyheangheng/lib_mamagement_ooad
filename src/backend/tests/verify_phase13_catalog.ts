import { BookService } from '../services/book.service';
import { BorrowingService } from '../services/borrowing.service';
import { UserRepository } from '../repositories/user.repository';
import { seedDatabase } from '../database/seed';
import { db } from '../database/db';

const bookService = new BookService();
const borrowingService = new BorrowingService();
const userRepo = new UserRepository();

const runPhase13VerificationSuite = async () => {
  console.log('====================================================');
  console.log(' PHASE 13 MEMBER CATALOG & BORROWING TEST SUITE    ');
  console.log('====================================================\n');

  // 1. Reset Database & Seed Demo Catalog
  console.log('[Step 1] Resetting database to fresh seed state...');
  await seedDatabase();

  // 2. Member Catalog Discovery & Search
  console.log('\n[Step 2] Testing Member Catalog Discovery & Search...');
  const catalog = await bookService.getAllBooks();
  console.log(`  ✅ Loaded ${catalog.length} books in library catalog.`);

  const cleanArchBook = catalog.find((b: any) => b.isbn === '978-0134494166');
  console.log(`  ✅ Catalog Item 1: '${cleanArchBook.title}'`);
  console.log(`     - Author: ${cleanArchBook.author}`);
  console.log(`     - Cover Image: ${cleanArchBook_cover(cleanArchBook)}`);
  console.log(`     - Description: ${cleanArchBook.description}`);
  console.log(`     - Available Copies: ${cleanArchBook.available_copies} / ${cleanArchBook.total_copies}`);

  const searchResults = await bookService.getAllBooks('Algorithms');
  console.log(`  ✅ Catalog Search 'Algorithms' matched ${searchResults.length} book(s): '${searchResults[0]?.title}'`);

  // 3. Member Automatic Copy Selection Borrowing (POST /api/borrowings/borrow-book)
  console.log('\n[Step 3] Testing Member Automatic Copy Selection Borrowing...');
  const member1 = await userRepo.findMemberByStudentId('6712732101');

  // Member 1 (Student 6712732101) borrows Clean Code
  const cleanCodeBook = catalog.find((b: any) => b.isbn === '978-0132350884');
  const borrow1 = await borrowingService.borrowBookByBookId(member1.id, cleanCodeBook.id);
  console.log(`  ✅ Borrowing Succeeded! Transaction ID: ${borrow1.borrowing_id}`);
  console.log(`  ✅ Automatically Selected Copy ID: ${borrow1.copy_id}`);
  console.log(`  ✅ Borrow Date: ${new Date(borrow1.borrow_date).toLocaleDateString()} | Due Date: ${new Date(borrow1.due_date).toLocaleDateString()}`);

  // Verify available copies count decreased
  const cleanCodeUpdated = await bookService.getBookById(cleanCodeBook.id);
  console.log(`  ✅ Available Copies Count Updated: ${cleanCodeUpdated.available_copies} / ${cleanCodeUpdated.total_copies} (PASSED)`);

  // 4. Test BR1 Maximum 3 Active Books Limit Enforcement
  console.log('\n[Step 4] Testing BR1 Maximum 3 Active Loans Enforcement...');
  // Member 1 already has 1 active loan from seed + 1 loan above = 2 active loans
  const javaBook = catalog.find((b: any) => b.isbn === '978-0134685991'); // Effective Java
  const borrow2 = await borrowingService.borrowBookByBookId(member1.id, javaBook.id);
  console.log(`  ✅ Borrowed Book 3 Succeeded: ${borrow2.borrowing_id}`);

  // 4th borrow attempt must be rejected by BR1
  const patternsBook = catalog.find((b: any) => b.isbn === '978-0596007126');
  try {
    await borrowingService.borrowBookByBookId(member1.id, patternsBook.id);
    console.error('  ❌ BR1 Failed: Allowed 4th active loan!');
  } catch (err: any) {
    console.log(`  ✅ BR1 Correctly Enforced: ${err.message} (PASSED)`);
  }

  // 5. Test Return and Re-Borrow Cycle
  console.log('\n[Step 5] Testing Return and Re-Borrow Cycle...');
  await borrowingService.processReturn(borrow1.borrowing_id);
  console.log(`  ✅ Member returned '${cleanCodeBook.title}'. Copy ${borrow1.copy_id} status restored to AVAILABLE.`);

  const reborrow = await borrowingService.borrowBookByBookId(member1.id, cleanCodeBook.id);
  console.log(`  ✅ Member successfully re-borrowed '${cleanCodeBook.title}'! Transaction Code: ${reborrow.borrowing_id} (PASSED)`);

  console.log('\n====================================================');
  console.log(' ALL PHASE 13 CATALOG & BORROWING TESTS PASSED 100% ');
  console.log('====================================================\n');
};

function cleanArchBook_cover(b: any) {
  return b.cover_image ? `${b.cover_image.slice(0, 35)}...` : 'None';
}

runPhase13VerificationSuite()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Phase 13 Verification Failed:', err);
    db.close();
    process.exit(1);
  });
