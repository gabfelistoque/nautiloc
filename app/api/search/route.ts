import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const category = searchParams.get('category');
  const guests = searchParams.get('guests');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    const boats = await prisma.boat.findMany({
      where: {
        AND: [
          location ? { location: { contains: location, mode: 'insensitive' } } : {},
          category ? { category: { equals: category, mode: 'insensitive' } } : {},
          guests ? { capacity: { gte: parseInt(guests) } } : {},
          { available: true },
          startDate && endDate
            ? {
                bookings: {
                  none: {
                    OR: [
                      {
                        AND: [
                          { startDate: { lte: new Date(endDate) } },
                          { endDate: { gte: new Date(startDate) } },
                        ],
                      },
                    ],
                  },
                },
              }
            : {},
        ],
      },
      include: {
        media: true,
        amenities: true,
      },
      orderBy: {
        rating: 'desc',
      },
    });

    return NextResponse.json(boats);
  } catch (error) {
    console.error('Error searching boats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar barcos' },
      { status: 500 }
    );
  }
}
