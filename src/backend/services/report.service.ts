import { ReportRepository } from '../repositories/report.repository';

export class ReportService {
  private reportRepo = new ReportRepository();

  async getDashboardStats() {
    return this.reportRepo.getDashboardStats();
  }

  async getCurrentBorrowingsReport(fromDate?: string, toDate?: string, memberSearch?: string, bookSearch?: string, status?: string) {
    return this.reportRepo.getCurrentBorrowingsReport(fromDate, toDate, memberSearch, bookSearch, status);
  }

  async getOverdueReport(memberSearch?: string, bookSearch?: string) {
    return this.reportRepo.getOverdueReport(memberSearch, bookSearch);
  }

  async getUnpaidFinesReport(memberSearch?: string, bookSearch?: string) {
    return this.reportRepo.getUnpaidFinesReport(memberSearch, bookSearch);
  }

  async getTransactionReport(startDate?: string, endDate?: string, memberSearch?: string, bookSearch?: string, status?: string) {
    return this.reportRepo.getTransactionReport(startDate, endDate, memberSearch, bookSearch, status);
  }
}
