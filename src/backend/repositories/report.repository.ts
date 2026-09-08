import { allQuery, getQuery } from '../database/db';

export class ReportRepository {
  async getDashboardStats() {
    const booksCount = await getQuery<any>(`SELECT COUNT(*) as count FROM books`);
    const copiesCount = await getQuery<any>(`SELECT COUNT(*) as count FROM book_copies`);
    const availableCopies = await getQuery<any>(`SELECT COUNT(*) as count FROM book_copies WHERE status = 'AVAILABLE'`);
    const borrowedCopies = await getQuery<any>(`SELECT COUNT(*) as count FROM book_copies WHERE status = 'BORROWED'`);
    const lostCopies = await getQuery<any>(`SELECT COUNT(*) as count FROM book_copies WHERE status = 'LOST'`);

    const membersCount = await getQuery<any>(`SELECT COUNT(*) as count FROM members`);
    const activeMembersCount = await getQuery<any>(`SELECT COUNT(*) as count FROM members WHERE status = 'ACTIVE'`);
    const suspendedMembersCount = await getQuery<any>(`SELECT COUNT(*) as count FROM members WHERE status = 'SUSPENDED'`);

    const activeBorrowings = await getQuery<any>(`SELECT COUNT(*) as count FROM borrowings WHERE status IN ('ACTIVE', 'OVERDUE')`);
    const overdueBorrowings = await getQuery<any>(
      `SELECT COUNT(*) as count FROM borrowings WHERE status = 'OVERDUE' OR (status = 'ACTIVE' AND due_date < CURRENT_TIMESTAMP)`
    );

    const unpaidFines = await getQuery<any>(`SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM fines WHERE status = 'UNPAID'`);

    return {
      totalBooks: booksCount.count || 0,
      totalBookCopies: copiesCount.count || 0,
      availableCopies: availableCopies.count || 0,
      borrowedCopies: borrowedCopies.count || 0,
      lostCopies: lostCopies.count || 0,
      totalMembers: membersCount.count || 0,
      activeMembers: activeMembersCount.count || 0,
      suspendedMembers: suspendedMembersCount.count || 0,
      activeBorrowings: activeBorrowings.count || 0,
      overdueBorrowings: overdueBorrowings.count || 0,
      unpaidFinesCount: unpaidFines.count || 0,
      totalUnpaidFineAmount: unpaidFines.total || 0,
    };
  }

  async getCurrentBorrowingsReport(fromDate?: string, toDate?: string, memberSearch?: string, bookSearch?: string, status?: string) {
    let sql = `
      SELECT br.id, br.borrowing_id, b.id as book_id, b.title, bc.copy_id, u.name as member_name, m.student_id, br.borrow_date, br.due_date, br.status
      FROM borrowings br
      JOIN members m ON br.member_id = m.id
      JOIN users u ON m.user_id = u.id
      JOIN book_copies bc ON br.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND br.status = ?`;
      params.push(status);
    } else {
      sql += ` AND br.status IN ('ACTIVE', 'OVERDUE')`;
    }

    if (fromDate) {
      sql += ` AND DATE(br.borrow_date) >= DATE(?)`;
      params.push(fromDate);
    }
    if (toDate) {
      sql += ` AND DATE(br.borrow_date) <= DATE(?)`;
      params.push(toDate);
    }
    if (memberSearch && memberSearch.trim() !== '') {
      const term = `%${memberSearch.trim()}%`;
      sql += ` AND (u.name LIKE ? OR m.student_id LIKE ?)`;
      params.push(term, term);
    }
    if (bookSearch && bookSearch.trim() !== '') {
      const term = `%${bookSearch.trim()}%`;
      sql += ` AND (b.title LIKE ? OR CAST(b.id AS TEXT) = ? OR bc.copy_id LIKE ?)`;
      params.push(term, bookSearch.trim(), term);
    }

    sql += ` ORDER BY br.due_date ASC`;
    return allQuery<any>(sql, params);
  }

  async getOverdueReport(memberSearch?: string, bookSearch?: string) {
    let sql = `
      SELECT br.id, br.borrowing_id, b.id as book_id, b.title, bc.copy_id, u.name as member_name, m.student_id, br.borrow_date, br.due_date,
             COALESCE(f.amount, 0) as fine_amount, COALESCE(f.overdue_days, 0) as overdue_days, COALESCE(f.status, 'UNPAID') as fine_status
      FROM borrowings br
      JOIN members m ON br.member_id = m.id
      JOIN users u ON m.user_id = u.id
      JOIN book_copies bc ON br.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      LEFT JOIN fines f ON br.id = f.borrowing_id
      WHERE br.status = 'OVERDUE' OR (br.status = 'ACTIVE' AND br.due_date < CURRENT_TIMESTAMP)
    `;
    const params: any[] = [];

    if (memberSearch && memberSearch.trim() !== '') {
      const term = `%${memberSearch.trim()}%`;
      sql += ` AND (u.name LIKE ? OR m.student_id LIKE ?)`;
      params.push(term, term);
    }
    if (bookSearch && bookSearch.trim() !== '') {
      const term = `%${bookSearch.trim()}%`;
      sql += ` AND (b.title LIKE ? OR CAST(b.id AS TEXT) = ? OR bc.copy_id LIKE ?)`;
      params.push(term, bookSearch.trim(), term);
    }

    sql += ` ORDER BY br.due_date ASC`;
    return allQuery<any>(sql, params);
  }

  async getUnpaidFinesReport(memberSearch?: string, bookSearch?: string) {
    let sql = `
      SELECT f.id, f.fine_id, f.borrowing_id, f.amount, f.overdue_days, f.status, f.created_at,
             u.name as member_name, m.student_id, m.faculty, b.title as book_title, br.borrowing_id as borrowing_code
      FROM fines f
      JOIN members m ON f.member_id = m.id
      JOIN users u ON m.user_id = u.id
      JOIN borrowings br ON f.borrowing_id = br.id
      JOIN book_copies bc ON br.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      WHERE f.status = 'UNPAID'
    `;
    const params: any[] = [];

    if (memberSearch && memberSearch.trim() !== '') {
      const term = `%${memberSearch.trim()}%`;
      sql += ` AND (u.name LIKE ? OR m.student_id LIKE ?)`;
      params.push(term, term);
    }
    if (bookSearch && bookSearch.trim() !== '') {
      const term = `%${bookSearch.trim()}%`;
      sql += ` AND (b.title LIKE ? OR f.fine_id LIKE ?)`;
      params.push(term, term);
    }

    sql += ` ORDER BY f.amount DESC`;
    const rows = await allQuery<any>(sql, params);

    const totalUnpaidCount = rows.length;
    const totalUnpaidAmount = rows.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);

    return {
      totalUnpaidCount,
      totalUnpaidAmount,
      rows,
    };
  }

  async getTransactionReport(startDate?: string, endDate?: string, memberSearch?: string, bookSearch?: string, status?: string) {
    let sql = `
      SELECT br.id, br.borrowing_id, br.borrow_date, br.due_date, br.return_date, br.status,
             b.id as book_id, b.title as book_title, bc.copy_id,
             u.name as member_name, m.student_id
      FROM borrowings br
      JOIN members m ON br.member_id = m.id
      JOIN users u ON m.user_id = u.id
      JOIN book_copies bc ON br.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND br.status = ?`;
      params.push(status);
    }
    if (startDate) {
      sql += ` AND DATE(br.borrow_date) >= DATE(?)`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND DATE(br.borrow_date) <= DATE(?)`;
      params.push(endDate);
    }
    if (memberSearch && memberSearch.trim() !== '') {
      const term = `%${memberSearch.trim()}%`;
      sql += ` AND (u.name LIKE ? OR m.student_id LIKE ?)`;
      params.push(term, term);
    }
    if (bookSearch && bookSearch.trim() !== '') {
      const term = `%${bookSearch.trim()}%`;
      sql += ` AND (b.title LIKE ? OR CAST(b.id AS TEXT) = ? OR bc.copy_id LIKE ?)`;
      params.push(term, bookSearch.trim(), term);
    }

    sql += ` ORDER BY br.id DESC`;
    return allQuery<any>(sql, params);
  }
}
