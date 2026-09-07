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
    const id = Number(req.params.id);
    const result = await borrowingService.processReturn(id);
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
