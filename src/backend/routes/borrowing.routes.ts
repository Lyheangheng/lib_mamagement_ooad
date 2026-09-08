import { Router } from 'express';
import { createBorrowing, processReturn, getMemberBorrowings, getAllBorrowings, getActiveCopyBorrowing, borrowBook } from '../controllers/borrowing.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole('LIBRARIAN'), getAllBorrowings);
router.post('/', createBorrowing);
router.post('/borrow-book', borrowBook);
router.post('/:id/return', requireRole('LIBRARIAN'), processReturn);
router.get('/active-copy/:copyRef', requireRole('LIBRARIAN'), getActiveCopyBorrowing);
router.get('/member/:memberId', getMemberBorrowings);

export default router;

