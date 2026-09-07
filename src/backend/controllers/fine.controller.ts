import { Response, NextFunction } from 'express';
import { FineService } from '../services/fine.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { FineStatus } from '../../domain/Fine';
import { AppError } from '../middleware/error.middleware';

const fineService = new FineService();

export const getFines = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as FineStatus;
    let memberId: number | undefined;

    if (req.user?.role === 'MEMBER') {
      memberId = req.user.memberId;
    } else if (req.query.memberId) {
      memberId = Number(req.query.memberId);
    }

    const fines = await fineService.getFines(status, memberId);
    res.json({ success: true, data: fines });
  } catch (err) {
    next(err);
  }
};

export const getFineById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const fine = await fineService.getFineById(id);

    if (req.user?.role === 'MEMBER' && fine.member_id !== req.user.memberId) {
      throw new AppError(403, 'Access denied. Members can only view their own fines.');
    }

    res.json({ success: true, data: fine });
  } catch (err) {
    next(err);
  }
};

export const payFine = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await fineService.payFine(id, req.user?.librarianId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const fineId = req.query.fineId ? Number(req.query.fineId) : undefined;
    const history = await fineService.getPaymentHistory(fineId);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};
