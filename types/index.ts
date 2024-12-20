import { User } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'password'> & {
  image?: string | null;
  phone?: string | null;
};

export interface ExtendedUser extends User {
  phone?: string | null;
}
