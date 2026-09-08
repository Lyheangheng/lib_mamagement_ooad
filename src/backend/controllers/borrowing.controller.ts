import { Response, NextFunction } from 'express';
import { BorrowingService } from '../services/borrowing.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const borrowingService = new BorrowingService();

export const createBorrowing = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId, bookCopyId, copyId } = req.body;
    const targetMemberId = memberId || req.user?.memberId;

    if (!targetMemberId) {
      throw new AppError(400, 'Member ID is required.');
    }

    if (req.user?.role === 'MEMBER' && req.user.memberId !== targetMemberId) {
      throw new AppError(403, 'Access denied. Members can only create borrowings for themselves.');
    }

    const copyRef = copyId || bookCopyId;
    if (!copyRef) {
      throw new AppError(400, 'BookCopy ID or Code is required.');
    }

    const borrowing = await borrowingService.createBorrowing(targetMemberId, copyRef);
    res.status(201).json({ success: true, data: borrowing });
  } catch (err) {
    next(err);
  }
};

export const processReturn = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ref = req.params.id;
    const result = await borrowingService.processReturn(ref);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getMemberBorrowings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const memberId = Number(req.params.memberId) || req.user?.memberId;

    if (!memberId) {
      throw new AppError(400, 'Member ID is required.');
    }

    if (req.user?.role === 'MEMBER' && req.user.memberId !== memberId) {
      throw new AppError(403, 'Access denied. Members can only view their own borrowings.');
    }

    const history = await borrowingService.getMemberBorrowings(memberId);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

export const getAllBorrowings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const borrowings = await borrowingService.getAllBorrowings(search, status);
    res.json({ success: true, data: borrowings });
  } catch (err) {
    next(err);
  }
};

export const getActiveCopyBorrowing = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { copyRef } = req.params;
    const result = await borrowingService.getActiveCopyBorrowing(copyRef);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const borrowBook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { bookId, memberId } = req.body;
    const targetMemberId = memberId || req.user?.memberId;

    if (!targetMemberId) {
      throw new AppError(400, 'Member ID is required to borrow a book.');
    }

    if (!bookId) {
      throw new AppError(400, 'Book ID is required.');
    }

    if (req.user?.role === 'MEMBER' && req.user.memberId !== targetMemberId) {
      throw new AppError(403, 'Access denied. Members can only borrow books for themselves.');
    }

    const borrowing = await borrowingService.borrowBookByBookId(targetMemberId, Number(bookId));
    res.status(201).json({ success: true, data: borrowing, message: 'Book borrowed successfully!' });
  } catch (err) {
    next(err);
  }
};

