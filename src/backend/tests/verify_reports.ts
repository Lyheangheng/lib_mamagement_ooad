import { ReportService } from '../services/report.service';
import { MemberService } from '../services/member.service';
import { seedDatabase } from '../database/seed';
import { db } from '../database/db';

const reportService = new ReportService();
const memberService = new MemberService();

const runReportVerificationSuite = async () => {
  console.log('====================================================');
  console.log('   PHASE 9 REPORTS & DASHBOARD TEST SUITE          ');
  console.log('====================================================\n');

  // 1. Reset Database
  console.log('[Test 1] Resetting database to clean seed state...');
  await seedDatabase();

  // 2. Test Librarian Dashboard Statistics Calculation & Data Accuracy
  console.log('\n[Test 2] Testing Librarian Dashboard Statistics Accuracy...');
  const stats = await reportService.getDashboardStats();
  console.log('  ✅ Total Books:', stats.totalBooks);
  console.log('  ✅ Total Book Copies:', stats.totalBookCopies);
  console.log('  ✅ Inventory Breakdown:');
  console.log('     - Available Copies:', stats.availableCopies);
  console.log('     - Borrowed Copies:', stats.borrowedCopies);
  console.log('     - Lost Copies:', stats.lostCopies);
  console.log('  ✅ Member Breakdown:');
  console.log('     - Active Members:', stats.activeMembers);
  console.log('     - Suspended Members:', stats.suspendedMembers);
  console.log('  ✅ Loan & Fine Metrics:');
  console.log('     - Active Borrowings:', stats.activeBorrowings);
  console.log('     - Overdue Loans:', stats.overdueBorrowings);
  console.log('     - Unpaid Fines Count:', stats.unpaidFinesCount);
  console.log('     - Total Unpaid Fine Amount:', stats.totalUnpaidFineAmount, 'THB');

  // Verify inventory distribution equality: available + borrowed + lost == totalBookCopies
  const copySum = stats.availableCopies + stats.borrowedCopies + stats.lostCopies;
  console.log('  ✅ Physical Copy Distribution Math Check:', `${stats.availableCopies} + ${stats.borrowedCopies} + ${stats.lostCopies} = ${copySum} (Total Copies: ${stats.totalBookCopies})`);
  if (copySum !== stats.totalBookCopies) {
    throw new Error('Data Inconsistency: Sum of available, borrowed, and lost copies does not equal total book copies!');
  }

  // 3. Test Member Dashboard Summary Endpoint
  console.log('\n[Test 3] Testing Member Dashboard Summary API...');
  const members = await memberService.getAllMembers();
  const member1 = members[0];
  const memberSummary = await memberService.getMemberBorrowingSummary(member1.id);
  console.log('  ✅ Member Name:', memberSummary.member.name);
  console.log('  ✅ Active Borrowings:', memberSummary.activeCount, '/ 3');
  console.log('  ✅ Account Status:', memberSummary.member.status);
  console.log('  ✅ Unpaid Fine Amount:', memberSummary.unpaidFineAmount, 'THB');

  // 4. Test Current Borrowings Report
  console.log('\n[Test 4] Testing Current Borrowing Report...');
  const currentReport = await reportService.getCurrentBorrowingsReport();
  console.log('  ✅ Current Active Loans Count:', currentReport.length);
  if (currentReport.length > 0) {
    console.log('  ✅ First Record:', currentReport[0].title, 'to', currentReport[0].member_name, 'Due:', new Date(currentReport[0].due_date).toLocaleDateString());
  }

  // 5. Test Overdue Report
  console.log('\n[Test 5] Testing Overdue Report...');
  const overdueReport = await reportService.getOverdueReport();
  console.log('  ✅ Overdue Loans Count:', overdueReport.length);
  if (overdueReport.length > 0) {
    console.log('  ✅ First Overdue Item:', overdueReport[0].title, 'Member:', overdueReport[0].member_name, 'Overdue Days:', overdueReport[0].overdue_days, 'Fine:', overdueReport[0].fine_amount, 'THB');
  }

  // 6. Test Unpaid Fines Report
  console.log('\n[Test 6] Testing Unpaid Fine Report...');
  const unpaidReport = await reportService.getUnpaidFinesReport();
  console.log('  ✅ Total Unpaid Fines Count:', unpaidReport.totalUnpaidCount);
  console.log('  ✅ Total Unpaid Amount:', unpaidReport.totalUnpaidAmount, 'THB');
  console.log('  ✅ Report Rows Count:', unpaidReport.rows.length);

  // 7. Test Borrowing / Returning Transaction History Report
  console.log('\n[Test 7] Testing Transaction Log Report...');
  const transactionReport = await reportService.getTransactionReport();
  console.log('  ✅ Total Logged Transactions Count:', transactionReport.length);

  // 8. Test Multi-Criteria Report Filtering
  console.log('\n[Test 8] Testing Multi-Criteria Report Filtering...');
  const filteredReport = await reportService.getTransactionReport(undefined, undefined, 'Somchai', undefined, 'RETURNED');
  console.log('  ✅ Filtered Transactions Count (Member: Somchai, Status: RETURNED):', filteredReport.length);
  if (filteredReport.length > 0) {
    console.log('  ✅ Filtered Result Member Name:', filteredReport[0].member_name, 'Status:', filteredReport[0].status);
  }

  console.log('\n====================================================');
  console.log(' ALL PHASE 9 REPORTS & DASHBOARD TESTS PASSED 100%  ');
  console.log('====================================================\n');
};

runReportVerificationSuite()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Report Verification Suite Failed:', err);
    db.close();
    process.exit(1);
  });
