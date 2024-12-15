import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const [totalBoats, totalBookings, activeBookings, bookings] = await Promise.all([
      prisma.boat.count(),
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          status: 'CONFIRMADO',
          endDate: {
            gte: new Date(),
          },
        },
      }),
      prisma.booking.findMany({
        where: {
          status: 'CONFIRMADO',
        },
        include: {
          boat: true,
        },
      }),
    ]);

    // Calcular receita total apenas das reservas confirmadas
    const revenue = bookings.reduce((total, booking) => {
      return total + booking.totalPrice;
    }, 0);

    return NextResponse.json({
      totalBoats,
      totalBookings,
      activeBookings,
      revenue,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
