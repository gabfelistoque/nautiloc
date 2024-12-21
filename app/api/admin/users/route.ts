import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/users - Listar todos os usuários
export async function GET() {
  try {
    console.log('Iniciando busca de usuários...');
    
    // Verificar se o usuário está autenticado e é admin
    const session = await getServerSession(authOptions);
    console.log('Sessão do usuário:', session);
    
    if (!session?.user) {
      console.log('Usuário não autenticado');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      console.log('Usuário não é admin:', session.user.role);
      return NextResponse.json(
        { error: 'Não autorizado - apenas administradores podem acessar esta página' },
        { status: 403 }
      );
    }

    console.log('Buscando usuários no banco de dados...');
    // Buscar todos os usuários, excluindo campos sensíveis
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Encontrados ${users.length} usuários`);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro detalhado ao buscar usuários:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno ao buscar usuários' },
      { status: 500 }
    );
  }
}
