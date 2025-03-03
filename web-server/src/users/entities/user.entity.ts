import { User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class UserEntity {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string | null;  // Allow 'null' here to be compatible with Prisma's null value

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  password: string;  // Allow 'null' here too

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
