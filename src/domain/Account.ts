export type UserRole = 'MEMBER' | 'LIBRARIAN';

export class Account {
  constructor(
    public id: number,
    public username: string,
    public passwordHash: string,
    public role: UserRole,
    public createdAt: Date = new Date()
  ) {}

  public isMember(): boolean {
    return this.role === 'MEMBER';
  }

  public isLibrarian(): boolean {
    return this.role === 'LIBRARIAN';
  }
}
