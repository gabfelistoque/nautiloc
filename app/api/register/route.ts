import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { hash } from '@/app/libs/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, phone, password } = body;

    console.log('Dados recebidos:', { email, name, phone });

    if (!email || !name || !phone || !password) {
      console.log('Dados faltando:', { email: !!email, name: !!name, phone: !!phone, password: !!password });
      return new NextResponse('Dados incompletos', { status: 400 });
    }

    // Verificar se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      console.log('Email já cadastrado:', email);
      return new NextResponse('E-mail já cadastrado', { status: 400 });
    }

    // Criptografar a senha usando o mesmo método do NextAuth
    const hashedPassword = await hash(password);

    // Criar o usuário
    const userData = {
      email,
      name,
      phone,
      password: hashedPassword,
      role: 'USER',
    };

    console.log('Tentando criar usuário com dados:', { ...userData, password: '[REDACTED]' });

    const user = await prisma.user.create({
      data: userData
    });

    console.log('Usuário criado com sucesso:', { id: user.id, email: user.email });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro detalhado ao registrar:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Erro ao criar usuário',
      { status: 500 }
    );
  }
}
