import { UserRepository } from '../repositories/user.repository';
import { hashPassword, verifyPassword, generateToken } from '../config/auth';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  private userRepo = new UserRepository();

  async registerMember(data: { name: string; studentId: string; faculty: string; major: string; password?: string }) {
    const { name, studentId, faculty, major, password } = data;

    if (!name || !studentId || !faculty || !major || !password) {
      throw new AppError(400, 'All fields (name, studentId, faculty, major, password) are required.');
    }

    if (password.length < 4) {
      throw new AppError(400, 'Password must be at least 4 characters long.');
    }

    // Check duplicate studentId
    const existingMember = await this.userRepo.findMemberByStudentId(studentId);
    if (existingMember) {
      throw new AppError(400, `Student ID '${studentId}' is already registered.`);
    }

    // Student ID serves as username
    const existingAccount = await this.userRepo.findAccountByUsername(studentId);
    if (existingAccount) {
      throw new AppError(400, `Username/Student ID '${studentId}' already exists.`);
    }

    const passwordHash = hashPassword(password);
    const accountId = await this.userRepo.createAccount(studentId, passwordHash, 'MEMBER');
    const email = `${studentId}@student.libdemo.edu`;
    const userId = await this.userRepo.createUser(accountId, name, email);
    const memberId = await this.userRepo.createMember(userId, studentId, faculty, major);

    const token = generateToken({
      accountId,
      userId,
      username: studentId,
      role: 'MEMBER',
      memberId,
    });

    return {
      message: 'Registration successful',
      user: {
        accountId,
        userId,
        memberId,
        studentId,
        name,
        role: 'MEMBER',
      },
      token,
    };
  }

  async login(username: string, password?: string) {
    if (!username || !password) {
      throw new AppError(400, 'Username and password are required.');
    }

    const account = await this.userRepo.findAccountByUsername(username);
    if (!account) {
      throw new AppError(401, 'Invalid username or password.');
    }

    const isMatch = verifyPassword(password, account.password_hash);
    if (!isMatch) {
      throw new AppError(401, 'Invalid username or password.');
    }

    const user = await this.userRepo.findUserByAccountId(account.id);
    let memberId: number | undefined;
    let librarianId: number | undefined;

    if (account.role === 'MEMBER') {
      const member = await this.userRepo.findMemberByUserId(user.id);
      memberId = member?.id;
    } else if (account.role === 'LIBRARIAN') {
      const librarian = await this.userRepo.findLibrarianByUserId(user.id);
      librarianId = librarian?.id;
    }

    const token = generateToken({
      accountId: account.id,
      userId: user.id,
      username: account.username,
      role: account.role,
      memberId,
      librarianId,
    });

    return {
      message: 'Login successful',
      user: {
        accountId: account.id,
        userId: user.id,
        username: account.username,
        name: user.name,
        email: user.email,
        role: account.role,
        memberId,
        librarianId,
      },
      token,
    };
  }
}
