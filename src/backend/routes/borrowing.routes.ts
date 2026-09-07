import { Router } from 'express';
import { createBorrowing, processReturn, getMemberBorrowings } from '../controllers/borrowing.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createBorrowing);
router.post('/:id/return', requireRole('LIBRARIAN'), processReturn);
router.get('/member/:memberId', getMemberBorrowings);

export default router;
