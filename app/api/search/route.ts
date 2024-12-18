import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const guests = searchParams.get('guests');
    const category = searchParams.get('category')?.toUpperCase();

    console.log('Search params:', { location, startDate, endDate, guests, category });

    const boats = await prisma.boat.findMany({
      where: {
        AND: [
          { available: true },
          location ? { location } : {},
          guests ? { capacity: { gte: parseInt(guests) } } : {},
          category ? { 
            category: {
              equals: category,
              mode: 'insensitive'
            }
          } : {},
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
        bookings: true,
      },
      orderBy: {
        rating: 'desc',
      },
    });

    // Remove bookings from response
    const boatsWithoutBookings = boats.map(({ bookings, ...boat }) => boat);

    console.log(`Found ${boatsWithoutBookings.length} boats`);
    return NextResponse.json(boatsWithoutBookings);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar barcos' },
      { status: 500 }
    );
  }
}
