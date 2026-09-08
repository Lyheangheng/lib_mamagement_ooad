import { BookRepository } from '../repositories/book.repository';
import { AppError } from '../middleware/error.middleware';
import { BookCopyStatus } from '../../domain/BookCopy';

export class BookService {
  private bookRepo = new BookRepository();

  async getAllBooks(search?: string) {
    return this.bookRepo.findAllBooks(search);
  }

  async getBookById(id: number) {
    const book = await this.bookRepo.findBookById(id);
    if (!book) {
      throw new AppError(404, `Book with ID ${id} not found.`);
    }
    return book;
  }

  async createBook(data: { isbn: string; title: string; author: string; publisher: string; publicationYear: number; quantity?: number; coverImage?: string; description?: string }) {
    if (!data.isbn || !data.title || !data.author || !data.publisher || !data.publicationYear) {
      throw new AppError(400, 'ISBN, title, author, publisher, and publicationYear are required.');
    }

    const existing = await this.bookRepo.findBookByIsbn(data.isbn);
    if (existing) {
      throw new AppError(400, `Book with ISBN '${data.isbn}' already exists.`);
    }

    const quantity = data.quantity || 1;
    const bookId = await this.bookRepo.createBook({ ...data, quantity });

    // Automatically generate initial physical BookCopies
    for (let i = 1; i <= quantity; i++) {
      const copyId = `BC-${bookId}-${String(i).padStart(2, '0')}`;
      await this.bookRepo.createCopy(bookId, copyId, 'AVAILABLE');
    }

    return this.getBookById(bookId);
  }

  async updateBook(id: number, data: { isbn?: string; title?: string; author?: string; publisher?: string; publicationYear?: number; quantity?: number; coverImage?: string; description?: string }) {
    await this.getBookById(id); // Ensure exists
    await this.bookRepo.updateBook(id, data);
    return this.getBookById(id);
  }

  async deleteBook(id: number) {
    await this.getBookById(id);
    const success = await this.bookRepo.deleteBook(id);
    return { success, message: `Book ${id} deleted successfully.` };
  }

  async addCopy(bookId: number, copyId?: string) {
    const book = await this.getBookById(bookId);
    const generatedCopyId = copyId || `BC-${bookId}-${String(book.total_copies + 1).padStart(2, '0')}`;

    const existingCopy = await this.bookRepo.findCopyByCopyId(generatedCopyId);
    if (existingCopy) {
      throw new AppError(400, `Copy ID '${generatedCopyId}' already exists.`);
    }

    await this.bookRepo.createCopy(bookId, generatedCopyId, 'AVAILABLE');
    await this.bookRepo.updateBook(bookId, { quantity: book.quantity + 1 });
    return this.getBookById(bookId);
  }

  async updateCopyStatus(copyIdStr: string, status: BookCopyStatus) {
    const copy = await this.bookRepo.findCopyByCopyId(copyIdStr);
    if (!copy) {
      throw new AppError(404, `BookCopy '${copyIdStr}' not found.`);
    }

    await this.bookRepo.updateCopyStatus(copy.id, status);
    return { success: true, copyId: copyIdStr, newStatus: status };
  }
}
