export type BorrowingStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export class Borrowing {
  constructor(
    public id: number,
    public borrowingId: string,
    public memberId: number,
    public bookCopyId: number,
    public borrowDate: Date,
    public dueDate: Date,
    public returnDate?: Date,
    public status: BorrowingStatus = 'ACTIVE'
  ) {}

  public isOverdue(currentDate: Date = new Date()): boolean {
    if (this.returnDate) return false;
    return currentDate > this.dueDate;
  }

  public calculateOverdueDays(currentDate: Date = new Date()): number {
    const targetDate = this.returnDate || currentDate;
    if (targetDate <= this.dueDate) return 0;
    const diffMs = targetDate.getTime() - this.dueDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}
