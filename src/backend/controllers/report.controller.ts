import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';

const reportService = new ReportService();

export const getCurrentBorrowingsReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = req.query.date as string;
    const memberId = req.query.memberId ? Number(req.query.memberId) : undefined;
    const report = await reportService.getCurrentBorrowingsReport(date, memberId);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getOverdueReport = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.getOverdueReport();
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getUnpaidFinesReport = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.getUnpaidFinesReport();
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getTransactionReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const memberId = req.query.memberId ? Number(req.query.memberId) : undefined;
    const bookId = req.query.bookId ? Number(req.query.bookId) : undefined;
    const report = await reportService.getTransactionReport(startDate, endDate, memberId, bookId);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};
