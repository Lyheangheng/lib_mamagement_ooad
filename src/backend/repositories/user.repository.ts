import { runQuery, getQuery, allQuery } from '../database/db';
import { UserRole } from '../../domain/Account';
import { MemberStatus } from '../../domain/Member';

export class UserRepository {
  async findAccountByUsername(username: string) {
    return getQuery<any>(`SELECT * FROM accounts WHERE username = ?`, [username]);
  }

  async findAccountById(id: number) {
    return getQuery<any>(`SELECT * FROM accounts WHERE id = ?`, [id]);
  }

  async findUserByAccountId(accountId: number) {
    return getQuery<any>(`SELECT * FROM users WHERE account_id = ?`, [accountId]);
  }

  async findMemberByUserId(userId: number) {
    return getQuery<any>(`SELECT * FROM members WHERE user_id = ?`, [userId]);
  }

  async findMemberByStudentId(studentId: string) {
    return getQuery<any>(`SELECT * FROM members WHERE student_id = ?`, [studentId]);
  }

  async findMemberById(memberId: number) {
    return getQuery<any>(
      `SELECT m.*, u.name, u.email, u.phone, u.account_id, a.username 
       FROM members m
       JOIN users u ON m.user_id = u.id
       JOIN accounts a ON u.account_id = a.id
       WHERE m.id = ?`,
      [memberId]
    );
  }

  async findLibrarianByUserId(userId: number) {
    return getQuery<any>(`SELECT * FROM librarians WHERE user_id = ?`, [userId]);
  }

  async createAccount(username: string, passwordHash: string, role: UserRole) {
    const result = await runQuery(
      `INSERT INTO accounts (username, password_hash, role) VALUES (?, ?, ?)`,
      [username, passwordHash, role]
    );
    return result.lastID;
  }

  async createUser(accountId: number, name: string, email: string, phone?: string) {
    const result = await runQuery(
      `INSERT INTO users (account_id, name, email, phone) VALUES (?, ?, ?, ?)`,
      [accountId, name, email, phone || null]
    );
    return result.lastID;
  }

  async createMember(userId: number, studentId: string, faculty: string, major: string) {
    const result = await runQuery(
      `INSERT INTO members (user_id, student_id, faculty, major, status) VALUES (?, ?, ?, ?, 'ACTIVE')`,
      [userId, studentId, faculty, major]
    );
    return result.lastID;
  }

  async findAllMembers() {
    return allQuery<any>(
      `SELECT m.*, u.name, u.email, u.phone, a.username 
       FROM members m
       JOIN users u ON m.user_id = u.id
       JOIN accounts a ON u.account_id = a.id
       ORDER BY m.id DESC`
    );
  }

  async updateMember(memberId: number, data: { name?: string; email?: string; phone?: string; faculty?: string; major?: string }) {
    const member = await this.findMemberById(memberId);
    if (!member) return false;

    if (data.faculty || data.major) {
      await runQuery(
        `UPDATE members SET faculty = COALESCE(?, faculty), major = COALESCE(?, major) WHERE id = ?`,
        [data.faculty, data.major, memberId]
      );
    }

    if (data.name || data.email || data.phone !== undefined) {
      await runQuery(
        `UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?`,
        [data.name, data.email, data.phone, member.user_id]
      );
    }

    return true;
  }

  async updateMemberStatus(memberId: number, status: MemberStatus) {
    const result = await runQuery(`UPDATE members SET status = ? WHERE id = ?`, [status, memberId]);
    return result.changes > 0;
  }
}
