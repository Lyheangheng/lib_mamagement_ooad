import { ReportRepository } from '../repositories/report.repository';

export class ReportService {
  private reportRepo = new ReportRepository();

  async getCurrentBorrowingsReport(filterDate?: string, filterMemberId?: number) {
    return this.reportRepo.getCurrentBorrowingsReport(filterDate, filterMemberId);
  }

  async getOverdueReport() {
    return this.reportRepo.getOverdueReport();
  }

  async getUnpaidFinesReport() {
    return this.reportRepo.getUnpaidFinesReport();
  }

  async getTransactionReport(startDate?: string, endDate?: string, memberId?: number, bookId?: number) {
    return this.reportRepo.getTransactionReport(startDate, endDate, memberId, bookId);
  }
}
