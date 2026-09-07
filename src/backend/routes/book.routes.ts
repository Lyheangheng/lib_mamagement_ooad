import { Router } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  addCopy,
  updateCopyStatus,
} from '../controllers/book.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public / Authenticated catalog viewing
router.get('/', getAllBooks);
router.get('/:id', getBookById);

// Restricted Librarian operations
router.post('/', authenticateToken, requireRole('LIBRARIAN'), createBook);
router.put('/:id', authenticateToken, requireRole('LIBRARIAN'), updateBook);
router.delete('/:id', authenticateToken, requireRole('LIBRARIAN'), deleteBook);
router.post('/:id/copies', authenticateToken, requireRole('LIBRARIAN'), addCopy);
router.put('/copies/:copyId/status', authenticateToken, requireRole('LIBRARIAN'), updateCopyStatus);

export default router;
