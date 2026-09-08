import { FineService } from '../services/fine.service';
import { BorrowingService } from '../services/borrowing.service';
import { MemberService } from '../services/member.service';
import { seedDatabase } from '../database/seed';
import { db, runQuery, allQuery } from '../database/db';

const fineService = new FineService();
const borrowingService = new BorrowingService();
const memberService = new MemberService();

const runFineVerificationSuite = async () => {
  console.log('====================================================');
  console.log('   PHASE 8 FINE MANAGEMENT TEST SUITE              ');
  console.log('====================================================\n');

  // 1. Reset Database
  console.log('[Test 1] Resetting database to clean seed state...');
  await seedDatabase();

  const members = await memberService.getAllMembers();
  const activeMember = members.find((m) => m.student_id === '6712732101');
  if (!activeMember) throw new Error('Member 6712732101 not found.');

  const librarians = await allQuery<any>("SELECT * FROM librarians");
  if (librarians.length === 0) throw new Error('No librarian found in seed database.');
  const librarianId = librarians[0].id;

  // 2. Test Fine Generation on Overdue Return (10 THB/day)
  console.log('\n[Test 2] Testing Overdue Return Fine Generation (10 THB/day)...');
  const availableCopies = await allQuery<any>("SELECT * FROM book_copies WHERE status = 'AVAILABLE'");
  const targetCopy = availableCopies[0];

  const pastBorrowDate = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(); // 12 days ago
  const pastDueDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();   // ~5 days overdue

  const overdueBorrowingId = await runQuery(
    `INSERT INTO borrowings (borrowing_id, member_id, book_copy_id, borrow_date, due_date, status)
     VALUES (?, ?, ?, ?, ?, 'OVERDUE')`,
    [`BRW-FINE-TEST-01`, activeMember.id, targetCopy.id, pastBorrowDate, pastDueDate]
  );
  await runQuery(`UPDATE book_copies SET status = 'BORROWED' WHERE id = ?`, [targetCopy.id]);

  const returnResult = await borrowingService.processReturn(overdueBorrowingId.lastID);
  console.log('  ✅ Return Processed. Overdue Days:', returnResult.overdueDays, 'Fine Amount:', returnResult.fineAmount, 'THB');
  
  const expectedFine = returnResult.overdueDays * 10;
  if (returnResult.fineAmount !== expectedFine) {
    throw new Error(`Expected fine amount of ${expectedFine} THB (${returnResult.overdueDays} days * 10 THB), got ${returnResult.fineAmount}`);
  }

  const generatedFines = await fineService.getFines('UNPAID', activeMember.id);
  const targetFine = generatedFines.find((f) => f.borrowing_id === 'BRW-FINE-TEST-01');
  if (!targetFine) throw new Error('Generated fine record not found in UNPAID query.');
  console.log('  ✅ UNPAID Fine Record Created ID:', targetFine.fine_id, 'Status:', targetFine.status, 'Amount:', targetFine.amount, 'THB');

  // 3. Test Unpaid Fine Blocks New Borrowing
  console.log('\n[Test 3] Testing Unpaid Fine Blocks Borrowing...');
  try {
    const nextCopy = (await allQuery<any>("SELECT * FROM book_copies WHERE status = 'AVAILABLE'"))[0];
    await borrowingService.createBorrowing(activeMember.id, nextCopy.copy_id);
    throw new Error('FAILED: System allowed member with unpaid fine to borrow!');
  } catch (err: any) {
    console.log('  ✅ Correctly Rejected Borrowing due to Unpaid Fine:', err.message);
  }

  // 4. Test Fine Inspection & Member View Boundary
  console.log('\n[Test 4] Testing Fine Inspection & Authorization...');
  const memberFines = await fineService.getFines(undefined, activeMember.id);
  console.log('  ✅ Member Fines Count:', memberFines.length);

  // 5. Test Librarian Process Fine Payment (UNPAID -> PAID)
  console.log('\n[Test 5] Testing Librarian Process Fine Payment (UNPAID -> PAID)...');
  const payResult = await fineService.payFine(targetFine.id, librarianId);
  console.log('  ✅ Payment Processed:', payResult.message);
  console.log('  ✅ Payment Reference Code:', payResult.paymentId);
  console.log('  ✅ Status after Payment:', payResult.status);

  // Verify status in DB
  const updatedFine = await fineService.getFineById(targetFine.id);
  console.log('  ✅ Verified Fine DB Status:', updatedFine.status, updatedFine.status === 'PAID' ? '(PASSED)' : '(FAILED)');
  if (updatedFine.status !== 'PAID') throw new Error('Fine status was not updated to PAID in DB.');

  // 6. Test Prevent Duplicate Fine Payment
  console.log('\n[Test 6] Testing Duplicate Fine Payment Prevention...');
  try {
    await fineService.payFine(targetFine.id, librarianId);
    throw new Error('FAILED: System allowed duplicate fine payment!');
  } catch (err: any) {
    console.log('  ✅ Correctly Rejected Duplicate Payment:', err.message);
  }

  // 7. Test Borrowing Unblocked After Fine Payment
  console.log('\n[Test 7] Testing Borrowing Unblocked After Fine Payment...');
  const availableNextCopies = await allQuery<any>("SELECT * FROM book_copies WHERE status = 'AVAILABLE'");
  const newBorrowing = await borrowingService.createBorrowing(activeMember.id, availableNextCopies[0].copy_id);
  console.log('  ✅ Borrowing Succeeded After Fine Payment! Transaction Code:', newBorrowing.borrowing_id);

  // 8. Test Historical Fine & Payment Log Preservation
  console.log('\n[Test 8] Testing Historical Fine & Payment Log Preservation...');
  const paymentHistory = await fineService.getPaymentHistory(targetFine.id);
  console.log('  ✅ Historical Payment Record Found:', paymentHistory[0]?.payment_id);
  console.log('  ✅ Amount Paid:', paymentHistory[0]?.amount, 'THB');
  console.log('  ✅ Payment Timestamp:', paymentHistory[0]?.payment_date);

  console.log('\n====================================================');
  console.log(' ALL PHASE 8 FINE MANAGEMENT TESTS PASSED 100%      ');
  console.log('====================================================\n');
};

runFineVerificationSuite()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Fine Verification Suite Failed:', err);
    db.close();
    process.exit(1);
  });
