import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Se for admin, retorna todas as reservas
    // Se for usuário normal, retorna apenas suas reservas
    const bookings = await prisma.booking.findMany({
      where: session.user.role === 'ADMIN' ? undefined : {
        userId: session.user.id,
      },
      include: {
        boat: {
          include: {
            media: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reservas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado - Faça login para continuar' },
        { status: 401 }
      );
    }

    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log('Body recebido:', body);
    
    const {
      boatId,
      startDate,
      endDate,
      totalPrice,
      guests = 1,
    } = body;

    // Validações básicas
    if (!boatId || !startDate || !endDate || !totalPrice || !guests) {
      console.log('Campos faltando:', { boatId, startDate, endDate, totalPrice, guests });
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Converter strings de data para objetos Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validar datas
    if (start >= end) {
      return NextResponse.json(
        { error: 'Data de início deve ser anterior à data de fim' },
        { status: 400 }
      );
    }

    if (start < new Date()) {
      return NextResponse.json(
        { error: 'Data de início deve ser futura' },
        { status: 400 }
      );
    }

    // Buscar o barco
    const boat = await prisma.boat.findUnique({
      where: { id: boatId }
    });

    if (!boat) {
      return NextResponse.json(
        { error: 'Barco não encontrado' },
        { status: 404 }
      );
    }

    if (!boat.available) {
      return NextResponse.json(
        { error: 'Barco não está disponível' },
        { status: 400 }
      );
    }

    // Verificar conflitos de datas
    const existingBooking = await prisma.booking.findFirst({
      where: {
        boatId,
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gt: start } }
            ]
          },
          {
            AND: [
              { startDate: { lt: end } },
              { endDate: { gte: end } }
            ]
          }
        ]
      }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Barco já está reservado para este período' },
        { status: 400 }
      );
    }

    // Calcular preço total
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const calculatedPrice = diffDays * boat.price;

    // Verificar se o preço calculado corresponde ao preço enviado
    if (Math.abs(calculatedPrice - totalPrice) > 0.01) {
      return NextResponse.json(
        { error: 'Preço total inválido' },
        { status: 400 }
      );
    }

    // Criar a reserva
    const booking = await prisma.booking.create({
      data: {
        startDate: start,
        endDate: end,
        totalPrice: calculatedPrice,
        guests: Number(guests),
        status: 'PENDENTE',
        userId: user.id,
        boatId
      }
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
