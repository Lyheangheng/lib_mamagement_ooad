import { allQuery } from '../database/db';

export class ReportRepository {
  async getCurrentBorrowingsReport(filterDate?: string, filterMemberId?: number) {
    let sql = `
      SELECT b.id as book_id, b.title, u.name as member_name, m.student_id, br.borrow_date, br.due_date, br.status
      FROM borrowings br
      JOIN members m ON br.member_id = m.id
      JOIN users u ON m.user_id = u.id
      JOIN book_copies bc ON br.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      WHERE br.status IN ('ACTIVE', 'OVERDUE')
    `;
    const params: any[] = [];
    if (filterMemberId) {
      sql += ` AND br.member_id = ?`;
      params.push(filterMemberId);
    }
    if (filterDate) {
      sql += ` AND DATE(br.borrow_date) = DATE(?)`;
      params.push(filterDate);
    }
    sql += ` ORDER BY br.due_date ASC`;
    return allQuery<any>(sql, params);
  }

  async getOverdueReport() {
    return allQuery<any>(
      `SELECT br.borrowing_id, b.title, bc.copy_id, u.name as member_name, m.student_id, br.borrow_date, br.due_date,
              f.amount as fine_amount, f.overdue_days, f.status as fine_status
       FROM borrowings br
       JOIN members m ON br.member_id = m.id
       JOIN users u ON m.user_id = u.id
       JOIN book_copies bc ON br.book_copy_id = bc.id
       JOIN books b ON bc.book_id = b.id
       LEFT JOIN fines f ON br.id = f.borrowing_id
       WHERE br.status = 'OVERDUE' OR (br.status = 'ACTIVE' AND br.due_date < CURRENT_TIMESTAMP)
       ORDER BY br.due_date ASC`
    );
  }

  async getUnpaidFinesReport() {
    return allQuery<any>(
      `SELECT f.fine_id, f.amount, f.overdue_days, f.created_at, u.name as member_name, m.student_id, m.faculty, b.title as book_title
       FROM fines f
       JOIN members m ON f.member_id = m.id
       JOIN users u ON m.user_id = u.id
       JOIN borrowings br ON f.borrowing_id = br.id
       JOIN book_copies bc ON br.book_copy_id = bc.id
       JOIN books b ON bc.book_id = b.id
       WHERE f.status = 'UNPAID'
       ORDER BY f.amount DESC`
    );
  }

  async getTransactionReport(startDate?: string, endDate?: string, memberId?: number, bookId?: number) {
    let sql = `
      SELECT br.borrowing_id, br.borrow_date, br.due_date, br.return_date, br.status,
             b.id as book_id, b.title as book_title, bc.copy_id,
             u.name as member_name, m.student_id
      FROM borrowings br
      JOIN members m ON br.member_id = m.id
      JOIN users u ON m.user_id = u.id
      JOIN book_copies bc ON br.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (startDate) {
      conditions.push(`DATE(br.borrow_date) >= DATE(?)`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`DATE(br.borrow_date) <= DATE(?)`);
      params.push(endDate);
    }
    if (memberId) {
      conditions.push(`br.member_id = ?`);
      params.push(memberId);
    }
    if (bookId) {
      conditions.push(`b.id = ?`);
      params.push(bookId);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY br.id DESC`;
    return allQuery<any>(sql, params);
  }
}
