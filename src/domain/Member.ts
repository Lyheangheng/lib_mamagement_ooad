import { User } from './User';

export type MemberStatus = 'ACTIVE' | 'SUSPENDED';

export class Member {
  constructor(
    public id: number,
    public userId: number,
    public studentId: string,
    public faculty: string,
    public major: string,
    public status: MemberStatus = 'ACTIVE',
    public user?: User
  ) {}

  public canBorrow(activeBorrowingsCount: number, hasUnpaidFines: boolean): boolean {
    if (this.status !== 'ACTIVE') return false;
    if (hasUnpaidFines) return false;
    return activeBorrowingsCount < 3;
  }
}
