import { User } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'password'> & {
  image?: string | null;
  phone?: string | null;
};
