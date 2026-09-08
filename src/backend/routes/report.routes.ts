import { Router } from 'express';
import {
  getDashboardStats,
  getCurrentBorrowingsReport,
  getOverdueReport,
  getUnpaidFinesReport,
  getTransactionReport,
} from '../controllers/report.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken, requireRole('LIBRARIAN'));

router.get('/stats', getDashboardStats);
router.get('/current-borrowings', getCurrentBorrowingsReport);
router.get('/overdue', getOverdueReport);
router.get('/unpaid-fines', getUnpaidFinesReport);
router.get('/transactions', getTransactionReport);

export default router;
