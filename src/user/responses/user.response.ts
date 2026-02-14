import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponse implements User {
  id: string;
  username: string;
  email: string;
  @Exclude()
  password: string;
  @Exclude()
  provider: 'GOOGLE';
  @Exclude()
  isActivated: boolean;
  createdAt: Date;
  @Exclude()
  updatedAt: Date;

  constructor(user: User) {
    Object.assign(this, user);
  }
}
