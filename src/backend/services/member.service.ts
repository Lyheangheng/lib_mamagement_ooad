import { UserRepository } from '../repositories/user.repository';
import { BorrowingRepository } from '../repositories/borrowing.repository';
import { FineRepository } from '../repositories/fine.repository';
import { AppError } from '../middleware/error.middleware';
import { MemberStatus } from '../../domain/Member';

export class MemberService {
  private userRepo = new UserRepository();
  private borrowingRepo = new BorrowingRepository();
  private fineRepo = new FineRepository();

  async getAllMembers() {
    return this.userRepo.findAllMembers();
  }

  async getMemberById(id: number) {
    const member = await this.userRepo.findMemberById(id);
    if (!member) {
      throw new AppError(404, `Member with ID ${id} not found.`);
    }
    return member;
  }

  async updateMember(id: number, data: { name?: string; email?: string; phone?: string; faculty?: string; major?: string }) {
    await this.getMemberById(id);
    await this.userRepo.updateMember(id, data);
    return this.getMemberById(id);
  }

  async updateStatus(id: number, status: MemberStatus) {
    await this.getMemberById(id);
    await this.userRepo.updateMemberStatus(id, status);
    return { success: true, memberId: id, status };
  }

  async getBorrowingHistory(memberId: number) {
    await this.getMemberById(memberId);
    return this.borrowingRepo.findHistoryByMemberId(memberId);
  }

  async getMemberBorrowingSummary(memberId: number) {
    const member = await this.getMemberById(memberId);
    const activeBorrowings = await this.borrowingRepo.findActiveByMemberId(memberId);
    const nowISO = new Date().toISOString();
    const overdueBorrowings = await this.borrowingRepo.findOverdueByMemberId(memberId, nowISO);
    const unpaidFines = await this.fineRepo.findUnpaidByMemberId(memberId);
    const totalUnpaidFineAmount = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

    const isBlocked = member.status !== 'ACTIVE' || activeBorrowings.length >= 3 || overdueBorrowings.length > 0 || totalUnpaidFineAmount > 0;

    return {
      member,
      activeCount: activeBorrowings.length,
      maxLimit: 3,
      overdueCount: overdueBorrowings.length,
      unpaidFineAmount: totalUnpaidFineAmount,
      isBlocked,
      reasons: [
        member.status !== 'ACTIVE' ? `Account status is ${member.status}` : null,
        activeBorrowings.length >= 3 ? 'Member has reached maximum borrowing limit (3 books)' : null,
        overdueBorrowings.length > 0 ? `Member has ${overdueBorrowings.length} overdue book(s)` : null,
        totalUnpaidFineAmount > 0 ? `Member has unpaid fines of ${totalUnpaidFineAmount} THB` : null,
      ].filter(Boolean) as string[]
    };
  }
}
