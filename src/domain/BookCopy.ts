export type BookCopyStatus = 'AVAILABLE' | 'BORROWED' | 'LOST';

export class BookCopy {
  constructor(
    public id: number,
    public copyId: string,
    public bookId: number,
    public status: BookCopyStatus = 'AVAILABLE'
  ) {}

  public isAvailable(): boolean {
    return this.status === 'AVAILABLE';
  }

  public markAsBorrowed(): void {
    this.status = 'BORROWED';
  }

  public markAsAvailable(): void {
    this.status = 'AVAILABLE';
  }

  public markAsLost(): void {
    this.status = 'LOST';
  }
}
