export class User {
  id: number;
  username: string;
  password?: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  todo: Array<any>;
  isDeleting?: boolean;
}
