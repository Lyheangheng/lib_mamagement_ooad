import { runQuery, getQuery, allQuery } from '../database/db';
import { BookCopyStatus } from '../../domain/BookCopy';

export class BookRepository {
  async findAllBooks(search?: string) {
    let sql = `
      SELECT b.*, 
        COUNT(bc.id) as total_copies,
        SUM(CASE WHEN bc.status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_copies
      FROM books b
      LEFT JOIN book_copies bc ON b.id = bc.book_id
    `;
    const params: any[] = [];

    if (search && search.trim() !== '') {
      sql += ` WHERE b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR CAST(b.id AS TEXT) = ?`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, search.trim());
    }

    sql += ` GROUP BY b.id ORDER BY b.id DESC`;
    return allQuery<any>(sql, params);
  }

  async findBookById(id: number) {
    const book = await getQuery<any>(
      `SELECT b.*, 
        COUNT(bc.id) as total_copies,
        SUM(CASE WHEN bc.status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_copies
       FROM books b
       LEFT JOIN book_copies bc ON b.id = bc.book_id
       WHERE b.id = ?
       GROUP BY b.id`,
      [id]
    );

    if (!book) return null;

    const copies = await allQuery<any>(`SELECT * FROM book_copies WHERE book_id = ?`, [id]);
    return { ...book, copies };
  }

  async findBookByIsbn(isbn: string) {
    return getQuery<any>(`SELECT * FROM books WHERE isbn = ?`, [isbn]);
  }

  async createBook(data: { isbn: string; title: string; author: string; publisher: string; publicationYear: number; quantity: number }) {
    const result = await runQuery(
      `INSERT INTO books (isbn, title, author, publisher, publication_year, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
      [data.isbn, data.title, data.author, data.publisher, data.publicationYear, data.quantity]
    );
    return result.lastID;
  }

  async updateBook(id: number, data: { isbn?: string; title?: string; author?: string; publisher?: string; publicationYear?: number; quantity?: number }) {
    const result = await runQuery(
      `UPDATE books 
       SET isbn = COALESCE(?, isbn),
           title = COALESCE(?, title),
           author = COALESCE(?, author),
           publisher = COALESCE(?, publisher),
           publication_year = COALESCE(?, publication_year),
           quantity = COALESCE(?, quantity)
       WHERE id = ?`,
      [data.isbn, data.title, data.author, data.publisher, data.publicationYear, data.quantity, id]
    );
    return result.changes > 0;
  }

  async deleteBook(id: number) {
    const result = await runQuery(`DELETE FROM books WHERE id = ?`, [id]);
    return result.changes > 0;
  }

  // BookCopy Operations
  async findCopyById(id: number) {
    return getQuery<any>(`SELECT * FROM book_copies WHERE id = ?`, [id]);
  }

  async findCopyByCopyId(copyId: string) {
    return getQuery<any>(`SELECT * FROM book_copies WHERE copy_id = ?`, [copyId]);
  }

  async createCopy(bookId: number, copyId: string, status: BookCopyStatus = 'AVAILABLE') {
    const result = await runQuery(
      `INSERT INTO book_copies (book_id, copy_id, status) VALUES (?, ?, ?)`,
      [bookId, copyId, status]
    );
    return result.lastID;
  }

  async updateCopyStatus(id: number, status: BookCopyStatus) {
    const result = await runQuery(`UPDATE book_copies SET status = ? WHERE id = ?`, [status, id]);
    return result.changes > 0;
  }
}
