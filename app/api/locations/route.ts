import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Buscar todos os locais únicos dos barcos disponíveis
    const locations = await prisma.boat.findMany({
      where: {
        available: true,
      },
      select: {
        location: true,
      },
      distinct: ['location'],
      orderBy: {
        location: 'asc',
      },
    });

    // Extrair apenas os nomes dos locais e remover duplicatas
    const uniqueLocations = [...new Set(locations.map(item => item.location))];

    return NextResponse.json(uniqueLocations);
  } catch (error) {
    console.error('Erro ao buscar locais:', error);
    return new NextResponse('Erro Interno', { status: 500 });
  }
}
