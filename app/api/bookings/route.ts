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
        boat: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Para cada reserva, buscar o usuário separadamente
    const bookingsWithUser = await Promise.all(
      bookings.map(async (booking) => {
        const user = await prisma.user.findUnique({
          where: { id: booking.userId },
          select: { name: true, email: true },
        });
        return {
          ...booking,
          user,
        };
      })
    );

    return NextResponse.json(bookingsWithUser);
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
    console.log('Session:', JSON.stringify(session, null, 2));
    
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
    console.log('Request body:', body);
    
    const { boatId, startDate, endDate, guests, totalPrice } = body;

    // Validações básicas
    if (!boatId || !startDate || !endDate || !guests || totalPrice === undefined) {
      return NextResponse.json({ 
        error: 'Todos os campos são obrigatórios' 
      }, { status: 400 });
    }

    // Verificar se o barco existe e está disponível
    const boat = await prisma.boat.findUnique({
      where: { 
        id: boatId,
        available: true
      },
    });

    if (!boat) {
      return NextResponse.json(
        { error: 'Barco não encontrado ou não está disponível' },
        { status: 404 }
      );
    }

    // Converter strings de data para objetos Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validar datas
    if (end <= start) {
      return NextResponse.json({
        error: 'A data de término deve ser posterior à data de início'
      }, { status: 400 });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);

    if (startDay < now) {
      return NextResponse.json({
        error: 'A data de início deve ser futura'
      }, { status: 400 });
    }

    // Verificar se há conflito com outras reservas
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        boatId,
        status: 'CONFIRMED',
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

    if (conflictingBooking) {
      return NextResponse.json({
        error: 'O barco já está reservado para este período'
      }, { status: 400 });
    }

    // Calcular preço total
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const calculatedPrice = diffDays * boat.pricePerDay;

    // Verificar se o preço calculado corresponde ao preço enviado
    if (Math.abs(calculatedPrice - totalPrice) > 0.01) {
      return NextResponse.json({
        error: 'O preço total não corresponde ao período selecionado'
      }, { status: 400 });
    }

    // Criar a reserva
    const booking = await prisma.booking.create({
      data: {
        startDate: start,
        endDate: end,
        guests: Number(guests),
        totalPrice: calculatedPrice,
        status: 'CONFIRMED',
        userId: user.id,
        boatId: boat.id,
      },
      include: {
        boat: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Erro ao criar reserva' },
      { status: 500 }
    );
  }
}
