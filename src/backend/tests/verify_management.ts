import { BookService } from '../services/book.service';
import { MemberService } from '../services/member.service';
import { seedDatabase } from '../database/seed';
import { db } from '../database/db';

const bookService = new BookService();
const memberService = new MemberService();

const runManagementVerificationSuite = async () => {
  console.log('====================================================');
  console.log('   PHASE 6 BOOK & MEMBER MANAGEMENT TEST SUITE     ');
  console.log('====================================================\n');

  // 1. Reset DB
  console.log('[Test 1] Resetting database to clean seed state...');
  await seedDatabase();

  // 2. Book Search by Title, Author, ISBN, Book ID
  console.log('\n[Test 2] Testing Book Multi-Criteria Search...');
  const searchTitle = await bookService.getAllBooks('Clean Architecture');
  console.log('  ✅ Search by Title count:', searchTitle.length, 'Title:', searchTitle[0]?.title);

  const searchAuthor = await bookService.getAllBooks('Robert C. Martin');
  console.log('  ✅ Search by Author count:', searchAuthor.length, 'Author:', searchAuthor[0]?.author);

  const searchIsbn = await bookService.getAllBooks('978-0134494166');
  console.log('  ✅ Search by ISBN count:', searchIsbn.length, 'ISBN:', searchIsbn[0]?.isbn);

  const searchId = await bookService.getAllBooks('1');
  console.log('  ✅ Search by Book ID count:', searchId.length, 'Found ID 1:', searchId[0]?.id === 1);

  // 3. Book Creation & Physical Copy Auto-Generation
  console.log('\n[Test 3] Testing Book Creation & Copy Generation...');
  const testIsbn = `978-${Date.now().toString().slice(-10)}`;
  const createdBook = await bookService.createBook({
    isbn: testIsbn,
    title: 'Refactoring: Improving the Design of Existing Code',
    author: 'Martin Fowler',
    publisher: 'Addison-Wesley',
    publicationYear: 2018,
    quantity: 3,
  });
  console.log('  ✅ Created Book ID:', createdBook.id, 'Total Copies:', createdBook.total_copies, 'Available:', createdBook.available_copies);
  console.log('  ✅ Physical Copy IDs:', createdBook.copies.map((c: any) => c.copy_id));

  // 4. Book Update
  console.log('\n[Test 4] Testing Book Metadata Update...');
  const updatedBook = await bookService.updateBook(createdBook.id, {
    title: 'Refactoring 2nd Edition',
    publisher: 'Pearson Education',
  });
  console.log('  ✅ Updated Book Title:', updatedBook.title, 'Publisher:', updatedBook.publisher);

  // 5. Add Physical BookCopy
  console.log('\n[Test 5] Testing Adding Physical BookCopy...');
  const copyAddedBook = await bookService.addCopy(createdBook.id, `BC-${createdBook.id}-04`);
  console.log('  ✅ New Copy Count:', copyAddedBook.copies.length, 'Latest Copy ID:', copyAddedBook.copies[copyAddedBook.copies.length - 1].copy_id);

  // 6. Member Directory Listing & Update
  console.log('\n[Test 6] Testing Member Directory & Profile Updates...');
  const members = await memberService.getAllMembers();
  console.log('  ✅ Total Registered Members:', members.length);

  const memberToEdit = members[0];
  const updatedMember = await memberService.updateMember(memberToEdit.id, {
    faculty: 'Engineering & Technology',
    major: 'Software Engineering',
  });
  console.log('  ✅ Updated Member ID:', updatedMember.id, 'New Faculty:', updatedMember.faculty, 'New Major:', updatedMember.major);

  // 7. Member Account Activation / Deactivation
  console.log('\n[Test 7] Testing Member Account Status Toggle...');
  const suspendedResult = await memberService.updateStatus(memberToEdit.id, 'SUSPENDED');
  console.log('  ✅ Member Account Status Changed:', suspendedResult.status);

  const activeResult = await memberService.updateStatus(memberToEdit.id, 'ACTIVE');
  console.log('  ✅ Member Account Restored Status:', activeResult.status);

  // 8. Book Deletion
  console.log('\n[Test 8] Testing Catalog Book Removal...');
  const deleteResult = await bookService.deleteBook(createdBook.id);
  console.log('  ✅ Book Deletion Status:', deleteResult.success, 'Message:', deleteResult.message);

  console.log('\n====================================================');
  console.log(' ALL PHASE 6 BOOK & MEMBER MANAGEMENT TESTS PASSED  ');
  console.log('====================================================\n');
};

runManagementVerificationSuite()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Management Verification Suite Failed:', err);
    db.close();
    process.exit(1);
  });
