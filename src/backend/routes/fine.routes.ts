import { Router } from 'express';
import { getFines, getFineById, payFine, getPaymentHistory } from '../controllers/fine.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getFines);
router.get('/payments', requireRole('LIBRARIAN'), getPaymentHistory);
router.get('/:id', getFineById);
router.post('/:id/pay', requireRole('LIBRARIAN'), payFine);

export default router;
