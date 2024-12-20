import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado - Faça login para continuar' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { boatId, startDate, endDate } = body;

    // Validações básicas
    if (!boatId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Converter strings de data para objetos Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validar datas
    if (start.getTime() !== end.getTime() && start >= end) {
      return NextResponse.json(
        { error: 'A data de término deve ser posterior à data de início' },
        { status: 400 }
      );
    }

    // Verificar se há reservas conflitantes
    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        boatId,
        NOT: {
          status: 'CANCELADO',
        },
        OR: [
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: start } }
            ]
          }
        ]
      }
    });

    if (conflictingBookings) {
      return NextResponse.json(
        { error: 'O barco não está disponível para as datas selecionadas' },
        { status: 409 }
      );
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar disponibilidade' },
      { status: 500 }
    );
  }
}
