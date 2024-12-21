import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const boats = await prisma.boat.findMany({
      where: {
        available: true,
      },
      include: {
        media: true,
      },
      orderBy: {
        rating: 'desc',
      },
    });

    return NextResponse.json(boats);
  } catch (error) {
    console.error('Error fetching boats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar barcos' },
      { status: 500 }
    );
  }
}