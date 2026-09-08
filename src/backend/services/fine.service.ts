import { FineRepository } from '../repositories/fine.repository';
import { AppError } from '../middleware/error.middleware';
import { FineStatus } from '../../domain/Fine';

export class FineService {
  private fineRepo = new FineRepository();

  async getFines(filterStatus?: FineStatus, memberId?: number, search?: string) {
    return this.fineRepo.findAllFines(filterStatus, memberId, search);
  }

  async getFineById(id: number) {
    const fine = await this.fineRepo.findById(id);
    if (!fine) {
      throw new AppError(404, `Fine record with ID ${id} not found.`);
    }
    return fine;
  }

  async payFine(fineId: number, librarianId?: number) {
    const fine = await this.getFineById(fineId);
    if (fine.status === 'PAID') {
      throw new AppError(400, `Fine '${fine.fine_id}' is already PAID.`);
    }

    const paymentCode = `PAY-${Date.now().toString().slice(-6)}`;
    await this.fineRepo.createPayment(paymentCode, fine.id, fine.amount, librarianId);
    await this.fineRepo.updateFineStatus(fine.id, 'PAID');

    return {
      message: 'Fine payment recorded successfully',
      paymentId: paymentCode,
      fineId: fine.id,
      amount: fine.amount,
      status: 'PAID',
    };
  }

  async getPaymentHistory(fineId?: number) {
    return this.fineRepo.findPaymentHistory(fineId);
  }
}
