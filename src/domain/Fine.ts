export type FineStatus = 'UNPAID' | 'PAID';

export class Fine {
  constructor(
    public id: number,
    public fineId: string,
    public borrowingId: number,
    public memberId: number,
    public overdueDays: number,
    public amount: number,
    public status: FineStatus = 'UNPAID',
    public createdAt: Date = new Date()
  ) {}

  public static calculateAmount(overdueDays: number, dailyRate: number = 10): number {
    return Math.max(0, overdueDays * dailyRate);
  }

  public markAsPaid(): void {
    this.status = 'PAID';
  }
}
