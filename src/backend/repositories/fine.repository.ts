import { runQuery, getQuery, allQuery } from '../database/db';
import { FineStatus } from '../../domain/Fine';

export class FineRepository {
  async findById(id: number) {
    return getQuery<any>(
      `SELECT f.*, m.student_id, u.name as member_name, br.borrowing_id, b.title as book_title
       FROM fines f
       JOIN members m ON f.member_id = m.id
       JOIN users u ON m.user_id = u.id
       JOIN borrowings br ON f.borrowing_id = br.id
       JOIN book_copies bc ON br.book_copy_id = bc.id
       JOIN books b ON bc.book_id = b.id
       WHERE f.id = ?`,
      [id]
    );
  }

  async findByBorrowingId(borrowingId: number) {
    return getQuery<any>(`SELECT * FROM fines WHERE borrowing_id = ?`, [borrowingId]);
  }

  async findUnpaidByMemberId(memberId: number) {
    return allQuery<any>(`SELECT * FROM fines WHERE member_id = ? AND status = 'UNPAID'`, [memberId]);
  }

  async findAllFines(filterStatus?: FineStatus, memberId?: number) {
    let sql = `
      SELECT f.*, m.student_id, u.name as member_name, br.borrowing_id, b.title as book_title
      FROM fines f
      JOIN members m ON f.member_id = m.id
      JOIN users u ON m.user_id = u.id
      JOIN borrowings br ON f.borrowing_id = br.id
      JOIN book_copies bc ON br.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (filterStatus) {
      conditions.push(`f.status = ?`);
      params.push(filterStatus);
    }

    if (memberId) {
      conditions.push(`f.member_id = ?`);
      params.push(memberId);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY f.id DESC`;
    return allQuery<any>(sql, params);
  }

  async createFine(fineId: string, borrowingId: number, memberId: number, overdueDays: number, amount: number) {
    const result = await runQuery(
      `INSERT INTO fines (fine_id, borrowing_id, member_id, overdue_days, amount, status)
       VALUES (?, ?, ?, ?, ?, 'UNPAID')`,
      [fineId, borrowingId, memberId, overdueDays, amount]
    );
    return result.lastID;
  }

  async updateFineStatus(id: number, status: FineStatus) {
    const result = await runQuery(`UPDATE fines SET status = ? WHERE id = ?`, [status, id]);
    return result.changes > 0;
  }

  async createPayment(paymentId: string, fineId: number, amount: number, librarianId?: number) {
    const result = await runQuery(
      `INSERT INTO fine_payments (payment_id, fine_id, amount, librarian_id)
       VALUES (?, ?, ?, ?)`,
      [paymentId, fineId, amount, librarianId || null]
    );
    return result.lastID;
  }

  async findPaymentHistory(fineId?: number) {
    let sql = `
      SELECT fp.*, f.fine_id, f.amount as fine_amount, m.student_id, u.name as member_name, lib_u.name as librarian_name
      FROM fine_payments fp
      JOIN fines f ON fp.fine_id = f.id
      JOIN members m ON f.member_id = m.id
      JOIN users u ON m.user_id = u.id
      LEFT JOIN librarians l ON fp.librarian_id = l.id
      LEFT JOIN users lib_u ON l.user_id = lib_u.id
    `;
    const params: any[] = [];
    if (fineId) {
      sql += ` WHERE fp.fine_id = ?`;
      params.push(fineId);
    }
    sql += ` ORDER BY fp.id DESC`;
    return allQuery<any>(sql, params);
  }
}
