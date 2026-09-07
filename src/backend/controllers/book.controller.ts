import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/book.service';

const bookService = new BookService();

export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string;
    const books = await bookService.getAllBooks(search);
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
};

export const getBookById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const book = await bookService.getBookById(id);
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await bookService.createBook(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const book = await bookService.updateBook(id, req.body);
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await bookService.deleteBook(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const addCopy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = Number(req.params.id);
    const { copyId } = req.body;
    const book = await bookService.addCopy(bookId, copyId);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const updateCopyStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { copyId } = req.params;
    const { status } = req.body;
    const result = await bookService.updateCopyStatus(copyId, status);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
