export class FinePayment {
  constructor(
    public id: number,
    public paymentId: string,
    public fineId: number,
    public paymentDate: Date,
    public amount: number,
    public librarianId?: number
  ) {}
}
