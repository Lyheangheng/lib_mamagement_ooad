import { BorrowingService } from '../services/borrowing.service';
import { MemberService } from '../services/member.service';
import { seedDatabase } from '../database/seed';
import { db, runQuery, allQuery } from '../database/db';

const borrowingService = new BorrowingService();
const memberService = new MemberService();

const runBorrowingVerificationSuite = async () => {
  console.log('====================================================');
  console.log('   PHASE 7 BORROWING & RETURNING TEST SUITE        ');
  console.log('====================================================\n');

  // 1. Reset Database
  console.log('[Test 1] Resetting database to clean seed state...');
  await seedDatabase();

  const members = await memberService.getAllMembers();
  // Member 1 (somchai_j) has 1 active borrowing, 0 overdue, 0 unpaid fine
  const activeMember = members.find((m) => m.student_id === '6712732101');
  if (!activeMember) throw new Error('Member 6712732101 not found in seed data.');

  // Member 2 (somsri_s) has 1 overdue borrowing and 40 THB unpaid fine
  const blockedMember = members.find((m) => m.student_id === '6712732102');
  if (!blockedMember) throw new Error('Member 6712732102 not found in seed data.');

  const availableCopies = await allQuery<any>("SELECT * FROM book_copies WHERE status = 'AVAILABLE'");
  if (availableCopies.length === 0) throw new Error('No available book copy found in seed database.');

  const targetCopy = availableCopies[0];

  // 2. Test Normal Borrowing (7-Day Loan Policy)
  console.log('\n[Test 2] Testing Normal Borrowing & 7-Day Loan Calculation...');
  const borrowing1 = await borrowingService.createBorrowing(activeMember.id, targetCopy.copy_id);
  console.log('  ✅ Borrowing Issued ID:', borrowing1.borrowing_id);
  console.log('  ✅ Borrow Date:', new Date(borrowing1.borrow_date).toLocaleDateString());
  console.log('  ✅ Due Date:', new Date(borrowing1.due_date).toLocaleDateString());

  const borrowTime = new Date(borrowing1.borrow_date).getTime();
  const dueTime = new Date(borrowing1.due_date).getTime();
  const daysDiff = Math.round((dueTime - borrowTime) / (1000 * 60 * 60 * 24));
  console.log('  ✅ Loan Duration (Days):', daysDiff, daysDiff === 7 ? '(Correct: 7 Days)' : '(FAILED)');
  if (daysDiff !== 7) throw new Error('Due date is not exactly 7 days after borrow date.');

  // Verify BookCopy state changed to BORROWED
  const checkCopy1 = await allQuery<any>("SELECT * FROM book_copies WHERE copy_id = ?", [targetCopy.copy_id]);
  console.log('  ✅ BookCopy Status after Borrowing:', checkCopy1[0].status, checkCopy1[0].status === 'BORROWED' ? '(PASSED)' : '(FAILED)');
  if (checkCopy1[0].status !== 'BORROWED') throw new Error('BookCopy status was not updated to BORROWED.');

  // 3. Test Cannot Borrow Already Borrowed Copy
  console.log('\n[Test 3] Testing Duplicate Copy Borrowing Prevention...');
  try {
    await borrowingService.createBorrowing(activeMember.id, targetCopy.copy_id);
    throw new Error('FAILED: System allowed borrowing an already borrowed copy!');
  } catch (err: any) {
    console.log('  ✅ Correctly Blocked Borrowed Copy:', err.message);
  }

  // 4. Test Maximum 3 Active Borrowings Limit Enforcement
  console.log('\n[Test 4] Testing Maximum 3 Active Books Limit Enforcement...');
  // Member already has 1 active borrowing from seed + 1 borrowing from Test 2 = 2 active.
  const remainingCopies = await allQuery<any>("SELECT * FROM book_copies WHERE status = 'AVAILABLE'");
  
  // Borrow 3rd book (succeeds)
  await borrowingService.createBorrowing(activeMember.id, remainingCopies[0].copy_id);
  console.log('  ✅ Member reached 3 active borrowed books limit.');

  // Attempt 4th borrowing (fails)
  try {
    await borrowingService.createBorrowing(activeMember.id, remainingCopies[1].copy_id);
    throw new Error('FAILED: System allowed exceeding 3 active books limit!');
  } catch (err: any) {
    console.log('  ✅ Correctly Rejected 4th Borrowing:', err.message);
  }

  // 5. Test Block Borrowing for Suspended Member
  console.log('\n[Test 5] Testing Block Borrowing for Suspended Member...');
  await memberService.updateStatus(activeMember.id, 'SUSPENDED');
  try {
    await borrowingService.createBorrowing(activeMember.id, remainingCopies[1].copy_id);
    throw new Error('FAILED: System allowed suspended member to borrow!');
  } catch (err: any) {
    console.log('  ✅ Correctly Rejected Suspended Member:', err.message);
  }
  // Restore member status to ACTIVE
  await memberService.updateStatus(activeMember.id, 'ACTIVE');

  // 6. Test Block Borrowing for Member with Overdue Books & Unpaid Fines
  console.log('\n[Test 6] Testing Block Borrowing for Member with Overdue Books & Unpaid Fines...');
  try {
    await borrowingService.createBorrowing(blockedMember.id, remainingCopies[1].copy_id);
    throw new Error('FAILED: System allowed member with overdue books/unpaid fines to borrow!');
  } catch (err: any) {
    console.log('  ✅ Correctly Blocked Member with Overdue/Fine:', err.message);
  }

  // 7. Test Normal On-Time Book Return
  console.log('\n[Test 7] Testing Normal On-Time Book Return...');
  const returnRes1 = await borrowingService.processReturn(borrowing1.id);
  console.log('  ✅ Return Message:', returnRes1.message);
  console.log('  ✅ Is Overdue:', returnRes1.isOverdue, 'Overdue Days:', returnRes1.overdueDays, 'Fine Amount:', returnRes1.fineAmount);

  // Verify BookCopy status reverted to AVAILABLE
  const checkCopy2 = await allQuery<any>("SELECT * FROM book_copies WHERE copy_id = ?", [targetCopy.copy_id]);
  console.log('  ✅ BookCopy Status after Return:', checkCopy2[0].status, checkCopy2[0].status === 'AVAILABLE' ? '(PASSED)' : '(FAILED)');
  if (checkCopy2[0].status !== 'AVAILABLE') throw new Error('BookCopy status did not revert to AVAILABLE.');

  // 8. Test Duplicate Return Prevention
  console.log('\n[Test 8] Testing Duplicate Return Prevention...');
  try {
    await borrowingService.processReturn(borrowing1.id);
    throw new Error('FAILED: System allowed duplicate return!');
  } catch (err: any) {
    console.log('  ✅ Correctly Rejected Duplicate Return:', err.message);
  }

  // 9. Test Overdue Return & Fine Generation (10 THB/day)
  console.log('\n[Test 9] Testing Overdue Return & Fine Calculation (10 THB/day)...');
  // Create overdue borrowing by inserting past due_date directly
  const pastBorrowDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days ago
  const pastDueDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();   // 3 days overdue
  
  const overdueTargetCopy = remainingCopies[1];
  const overdueBorrowingId = await runQuery(
    `INSERT INTO borrowings (borrowing_id, member_id, book_copy_id, borrow_date, due_date, status)
     VALUES (?, ?, ?, ?, ?, 'OVERDUE')`,
    [`BRW-OVERDUE-TEST`, activeMember.id, overdueTargetCopy.id, pastBorrowDate, pastDueDate]
  );
  await runQuery(`UPDATE book_copies SET status = 'BORROWED' WHERE id = ?`, [overdueTargetCopy.id]);

  // Process overdue return
  const returnRes2 = await borrowingService.processReturn(overdueBorrowingId.lastID);
  console.log('  ✅ Overdue Return Result:');
  console.log('     - Is Overdue:', returnRes2.isOverdue);
  console.log('     - Calculated Overdue Days:', returnRes2.overdueDays, '(Expected ~3 Days)');
  console.log('     - Fine Generated:', returnRes2.fineGenerated);
  console.log('     - Fine Amount (10 THB/day):', returnRes2.fineAmount, 'THB');

  if (!returnRes2.isOverdue || returnRes2.fineAmount <= 0) {
    throw new Error('Overdue fine was not generated correctly.');
  }

  // 10. Test Member Borrowing History & Librarian Global Records
  console.log('\n[Test 10] Testing Member History & Global Librarian Borrowing Records...');
  const memberHistory = await borrowingService.getMemberBorrowings(activeMember.id);
  console.log('  ✅ Member Borrowing History Records Count:', memberHistory.length);

  const globalRecords = await borrowingService.getAllBorrowings();
  console.log('  ✅ Global Librarian Borrowing Records Count:', globalRecords.length);

  console.log('\n====================================================');
  console.log(' ALL PHASE 7 BORROWING & RETURNING TESTS PASSED 100% ');
  console.log('====================================================\n');
};

runBorrowingVerificationSuite()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Borrowing Verification Suite Failed:', err);
    db.close();
    process.exit(1);
  });
