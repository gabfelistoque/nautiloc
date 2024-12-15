import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth/next";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        console.log("Iniciando autorização para:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.error("Credenciais faltando");
          return null;
        }

        try {
          console.log("Buscando usuário no banco de dados...");
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            }
          });

          console.log("Usuário encontrado:", user ? "Sim" : "Não");
          console.log("Dados do usuário:", JSON.stringify(user, null, 2));

          if (!user || !user.password) {
            console.error("Usuário não encontrado ou sem senha");
            return null;
          }

          console.log("Verificando senha...");
          console.log("Senha fornecida:", credentials.password);
          console.log("Hash armazenado:", user.password);

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log("Senha válida:", isPasswordValid ? "Sim" : "Não");

          if (!isPasswordValid) {
            console.error("Senha inválida para o usuário:", credentials.email);
            return null;
          }

          console.log("Autenticação bem-sucedida para:", credentials.email);
          
          // Retorna apenas os dados necessários
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Erro durante a autenticação:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
