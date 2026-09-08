import { execSync } from 'child_process';

const suites = [
  { name: 'Phase 5: Authentication & Security', path: 'src/backend/tests/verify_auth.ts' },
  { name: 'Phase 6: Book & Member Management', path: 'src/backend/tests/verify_management.ts' },
  { name: 'Phase 7: Borrowing & Returning Workflows', path: 'src/backend/tests/verify_borrowing.ts' },
  { name: 'Phase 8: Fine Management & Payments', path: 'src/backend/tests/verify_fines.ts' },
  { name: 'Phase 9: Reports & Dashboards Analytics', path: 'src/backend/tests/verify_reports.ts' },
  { name: 'Phase 10: Full E2E & Business Rules Suite', path: 'src/backend/tests/verify_phase10_e2e.ts' },
  { name: 'Phase 13: Member Book Discovery & Catalog Borrowing', path: 'src/backend/tests/verify_phase13_catalog.ts' },
];

console.log('====================================================');
console.log('  LIBRARY MANAGEMENT SYSTEM - MASTER TEST RUNNER   ');
console.log('====================================================\n');

let passedCount = 0;
let failedCount = 0;

for (const suite of suites) {
  console.log(`\n▶ Running Suite: ${suite.name} (${suite.path})...`);
  try {
    const output = execSync(`npx tsx ${suite.path}`, { encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
    console.log(`✅ [PASS] ${suite.name}`);
    passedCount++;
  } catch (err: any) {
    console.error(`❌ [FAIL] ${suite.name}`);
    if (err.stdout) console.log(err.stdout);
    if (err.stderr) console.error(err.stderr);
    failedCount++;
  }
}

console.log('\n====================================================');
console.log(` MASTER TEST RUNNER SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('====================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
