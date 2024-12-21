import NextAuth from "next-auth";
import { User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      phone?: string;
    }
  }

  interface User extends PrismaUser {}
}
