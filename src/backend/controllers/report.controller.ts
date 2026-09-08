import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';

const reportService = new ReportService();

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await reportService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export const getCurrentBorrowingsReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;
    const memberSearch = req.query.memberSearch as string;
    const bookSearch = req.query.bookSearch as string;
    const status = req.query.status as string;
    const report = await reportService.getCurrentBorrowingsReport(fromDate, toDate, memberSearch, bookSearch, status);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getOverdueReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memberSearch = req.query.memberSearch as string;
    const bookSearch = req.query.bookSearch as string;
    const report = await reportService.getOverdueReport(memberSearch, bookSearch);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getUnpaidFinesReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memberSearch = req.query.memberSearch as string;
    const bookSearch = req.query.bookSearch as string;
    const report = await reportService.getUnpaidFinesReport(memberSearch, bookSearch);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getTransactionReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const memberSearch = req.query.memberSearch as string;
    const bookSearch = req.query.bookSearch as string;
    const status = req.query.status as string;
    const report = await reportService.getTransactionReport(startDate, endDate, memberSearch, bookSearch, status);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};
