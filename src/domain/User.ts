import { Account } from './Account';

export class User {
  constructor(
    public id: number,
    public accountId: number,
    public name: string,
    public email: string,
    public phone?: string,
    public account?: Account,
    public createdAt: Date = new Date()
  ) {}
}
