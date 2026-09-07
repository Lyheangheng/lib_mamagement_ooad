import { BookCopy } from './BookCopy';

export class Book {
  constructor(
    public id: number,
    public isbn: string,
    public title: string,
    public author: string,
    public publisher: string,
    public publicationYear: number,
    public quantity: number = 1,
    public copies: BookCopy[] = []
  ) {}

  public getAvailableCopiesCount(): number {
    return this.copies.filter((copy) => copy.isAvailable()).length;
  }
}
