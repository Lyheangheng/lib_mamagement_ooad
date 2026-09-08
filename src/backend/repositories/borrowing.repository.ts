import { runQuery, getQuery, allQuery } from '../database/db';
import { BorrowingStatus } from '../../domain/Borrowing';

export class BorrowingRepository {
  async findById(id: number) {
    return getQuery<any>(
      `SELECT br.*, 
        m.student_id, u.name as member_name, 
        bc.copy_id, b.title as book_title, b.isbn
       FROM borrowings br
       JOIN members m ON br.member_id = m.id
       JOIN users u ON m.user_id = u.id
       JOIN book_copies bc ON br.book_copy_id = bc.id
       JOIN books b ON bc.book_id = b.id
       WHERE br.id = ?`,
      [id]
    );
  }

  async findActiveByMemberId(memberId: number) {
    return allQuery<any>(
      `SELECT br.*, bc.copy_id, b.title as book_title 
       FROM borrowings br
       JOIN book_copies bc ON br.book_copy_id = bc.id
       JOIN books b ON bc.book_id = b.id
       WHERE br.member_id = ? AND br.status IN ('ACTIVE', 'OVERDUE')`,
      [memberId]
    );
  }

  async findOverdueByMemberId(memberId: number, currentDateStr: string) {
    return allQuery<any>(
      `SELECT * FROM borrowings 
       WHERE member_id = ? AND return_date IS NULL AND due_date < ?`,
      [memberId, currentDateStr]
    );
  }

  async findActiveByBookCopyId(bookCopyId: number) {
    return getQuery<any>(
      `SELECT * FROM borrowings WHERE book_copy_id = ? AND status IN ('ACTIVE', 'OVERDUE')`,
      [bookCopyId]
    );
  }

  async createBorrowing(borrowingId: string, memberId: number, bookCopyId: number, borrowDate: string, dueDate: string) {
    const result = await runQuery(
      `INSERT INTO borrowings (borrowing_id, member_id, book_copy_id, borrow_date, due_date, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [borrowingId, memberId, bookCopyId, borrowDate, dueDate]
    );
    return result.lastID;
  }

  async processReturn(id: number, returnDate: string, status: BorrowingStatus) {
    const result = await runQuery(
      `UPDATE borrowings SET return_date = ?, status = ? WHERE id = ?`,
      [returnDate, status, id]
    );
    return result.changes > 0;
  }

  async findHistoryByMemberId(memberId: number) {
    return allQuery<any>(
      `SELECT br.*, bc.copy_id, b.title as book_title, b.isbn, f.id as fine_id, f.amount as fine_amount, f.status as fine_status
       FROM borrowings br
       JOIN book_copies bc ON br.book_copy_id = bc.id
       JOIN books b ON bc.book_id = b.id
       LEFT JOIN fines f ON br.id = f.borrowing_id
       WHERE br.member_id = ?
       ORDER BY br.id DESC`,
      [memberId]
    );
  }

  async findActiveByCopyRef(copyRef: string) {
    return getQuery<any>(
      `SELECT br.*, 
        m.student_id, u.name as member_name, 
        bc.copy_id, b.title as book_title, b.isbn
       FROM borrowings br
       JOIN members m ON br.member_id = m.id
       JOIN users u ON m.user_id = u.id
       JOIN book_copies bc ON br.book_copy_id = bc.id
       JOIN books b ON bc.book_id = b.id
       WHERE (bc.copy_id = ? OR br.borrowing_id = ? OR br.id = ?)
         AND br.status IN ('ACTIVE', 'OVERDUE')`,
      [copyRef, copyRef, Number(copyRef) || 0]
    );
  }

  async findAll(search?: string, status?: string) {
    let sql = `
      SELECT br.*, 
        m.student_id, u.name as member_name, 
        bc.copy_id, b.title as book_title, b.isbn,
        f.id as fine_id, f.amount as fine_amount, f.status as fine_status
      FROM borrowings br
      JOIN members m ON br.member_id = m.id
      JOIN users u ON m.user_id = u.id
      JOIN book_copies bc ON br.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      LEFT JOIN fines f ON br.id = f.borrowing_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND br.status = ?`;
      params.push(status);
    }

    if (search) {
      const query = `%${search}%`;
      sql += ` AND (m.student_id LIKE ? OR u.name LIKE ? OR bc.copy_id LIKE ? OR b.title LIKE ? OR br.borrowing_id LIKE ?)`;
      params.push(query, query, query, query, query);
    }

    sql += ` ORDER BY br.id DESC`;
    return allQuery<any>(sql, params);
  }
}
