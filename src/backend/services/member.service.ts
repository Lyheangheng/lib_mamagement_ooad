import { UserRepository } from '../repositories/user.repository';
import { BorrowingRepository } from '../repositories/borrowing.repository';
import { AppError } from '../middleware/error.middleware';
import { MemberStatus } from '../../domain/Member';

export class MemberService {
  private userRepo = new UserRepository();
  private borrowingRepo = new BorrowingRepository();

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
}
