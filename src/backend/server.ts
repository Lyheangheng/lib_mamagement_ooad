import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import memberRoutes from './routes/member.routes';
import borrowingRoutes from './routes/borrowing.routes';
import fineRoutes from './routes/fine.routes';
import reportRoutes from './routes/report.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Library Management System API Server - Phase 3 Backend Ready',
    systemConfig: {
      maxBooksPerMember: Number(process.env.MAX_BOOKS_PER_MEMBER) || 3,
      borrowPeriodDays: Number(process.env.BORROW_PERIOD_DAYS) || 7,
      fineRatePerDayTHB: Number(process.env.FINE_RATE_PER_DAY_THB) || 10,
    },
  });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] Library Management System API running on port ${PORT}`);
});

export default app;
