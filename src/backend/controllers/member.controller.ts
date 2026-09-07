import { Response, NextFunction } from 'express';
import { MemberService } from '../services/member.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const memberService = new MemberService();

export const getAllMembers = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const members = await memberService.getAllMembers();
    res.json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
};

export const getMemberById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    // Authorization check: Members can only access their own profile unless Librarian
    if (req.user?.role === 'MEMBER' && req.user.memberId !== id) {
      throw new AppError(403, 'Access denied. Members can only access their own profile.');
    }

    const member = await memberService.getMemberById(id);
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

export const updateMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (req.user?.role === 'MEMBER' && req.user.memberId !== id) {
      throw new AppError(403, 'Access denied. Members can only update their own profile.');
    }

    const member = await memberService.updateMember(id, req.body);
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

export const updateMemberStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const result = await memberService.updateStatus(id, status);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMemberBorrowings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (req.user?.role === 'MEMBER' && req.user.memberId !== id) {
      throw new AppError(403, 'Access denied. Members can only view their own borrowing history.');
    }

    const history = await memberService.getBorrowingHistory(id);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};
