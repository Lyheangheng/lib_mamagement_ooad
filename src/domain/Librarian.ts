import { User } from './User';

export class Librarian {
  constructor(
    public id: number,
    public userId: number,
    public employeeId: string,
    public user?: User
  ) {}
}
