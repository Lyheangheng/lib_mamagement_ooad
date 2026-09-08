import { Router } from 'express';
import {
  getAllMembers,
  getMemberById,
  updateMember,
  updateMemberStatus,
  getMemberBorrowings,
  getMemberBorrowingSummary,
} from '../controllers/member.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole('LIBRARIAN'), getAllMembers);
router.get('/:id', getMemberById);
router.put('/:id', updateMember);
router.put('/:id/status', requireRole('LIBRARIAN'), updateMemberStatus);
router.get('/:id/borrowings', getMemberBorrowings);
router.get('/:id/summary', getMemberBorrowingSummary);

export default router;
