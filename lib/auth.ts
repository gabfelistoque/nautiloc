import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { hash } from "@/app/libs/auth";
import { getServerSession } from "next-auth/next";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            throw new Error("Invalid credentials");
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user || !user?.password) {
            throw new Error("Invalid credentials");
          }

          const hashedInputPassword = await hash(credentials.password);
          const isValid = hashedInputPassword === user.password;

          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            phone: user.phone || "",
            role: user.role,
          };
        } catch (error) {
          console.log("Error in authorize:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Se a URL for a página inicial após o login
      if (url.startsWith(baseUrl)) {
        const session = await getServerSession(authOptions);
        // Se for um usuário normal, redireciona para minhas reservas
        if (session?.user?.role === 'USER') {
          return `${baseUrl}/reservas/minhas`;
        }
        // Se for admin, mantém o comportamento padrão
        return url;
      }
      return baseUrl;
    }
  },
  debug: process.env.NODE_ENV === "development",
};
