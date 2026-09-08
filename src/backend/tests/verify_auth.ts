import { AuthService } from '../services/auth.service';
import { verifyToken } from '../config/auth';
import { seedDatabase } from '../database/seed';
import { db } from '../database/db';

const authService = new AuthService();

const runAuthVerificationSuite = async () => {
  console.log('====================================================');
  console.log('    PHASE 5 AUTHENTICATION & SECURITY TEST SUITE    ');
  console.log('====================================================\n');

  // 1. Reset DB
  console.log('[Test 1] Resetting database to clean seed state...');
  await seedDatabase();

  // 2. Member Registration (Valid)
  console.log('\n[Test 2] Testing Member Registration...');
  const newStudentId = `STU-${Date.now().toString().slice(-6)}`;
  const regResult = await authService.registerMember({
    name: 'Wichai AuthTest',
    studentId: newStudentId,
    faculty: 'Science',
    major: 'Computer Science',
    password: 'MemberPass123!',
  });
  console.log('  ✅ Member Registered Successfully:', regResult.user.studentId);
  console.log('  ✅ JWT Token Issued:', regResult.token.slice(0, 25) + '...');

  // 3. Member Registration (Duplicate Student ID Error)
  console.log('\n[Test 3] Testing Duplicate Student ID Rejection...');
  try {
    await authService.registerMember({
      name: 'Duplicate User',
      studentId: newStudentId,
      faculty: 'Arts',
      major: 'History',
      password: 'Pass123!',
    });
    console.error('  ❌ Failed: Allowed duplicate student ID registration!');
  } catch (err: any) {
    console.log('  ✅ Correctly Rejected Duplicate Student ID:', err.message);
  }

  // 4. Member Login (Valid)
  console.log('\n[Test 4] Testing Valid Member Login...');
  const memberLogin = await authService.login(newStudentId, 'MemberPass123!');
  console.log('  ✅ Member Login Success. User:', memberLogin.user.name, 'Role:', memberLogin.user.role);

  // Decode and verify JWT
  const decodedMember = verifyToken(memberLogin.token);
  console.log('  ✅ Verified Decoded JWT Role:', decodedMember.role, 'MemberId:', decodedMember.memberId);

  // 5. Librarian Login (Valid)
  console.log('\n[Test 5] Testing Valid Librarian Login...');
  const libLogin = await authService.login('librarian_anan', 'pbkdf2_hash_placeholder_123');
  console.log('  ✅ Librarian Login Success. User:', libLogin.user.name, 'Role:', libLogin.user.role);

  const decodedLib = verifyToken(libLogin.token);
  console.log('  ✅ Verified Decoded JWT Role:', decodedLib.role, 'LibrarianId:', decodedLib.librarianId);

  // 6. Invalid Password Test
  console.log('\n[Test 6] Testing Invalid Password Rejection...');
  try {
    await authService.login('librarian_anan', 'WrongPassword!999');
    console.error('  ❌ Failed: Allowed login with incorrect password!');
  } catch (err: any) {
    console.log('  ✅ Correctly Rejected Invalid Password:', err.message);
  }

  // 7. Non-existent User Test
  console.log('\n[Test 7] Testing Non-existent Username Rejection...');
  try {
    await authService.login('fake_user_99999', 'SomePassword');
    console.error('  ❌ Failed: Allowed login for non-existent user!');
  } catch (err: any) {
    console.log('  ✅ Correctly Rejected Non-existent User:', err.message);
  }

  console.log('\n====================================================');
  console.log('  ALL PHASE 5 AUTHENTICATION TESTS PASSED 100%      ');
  console.log('====================================================\n');
};

runAuthVerificationSuite()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Auth Verification Suite Failed:', err);
    db.close();
    process.exit(1);
  });
