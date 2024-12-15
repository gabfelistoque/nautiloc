import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/amenities - Lista todos os amenities disponíveis
export async function GET() {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(amenities);
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar amenidades' },
      { status: 500 }
    );
  }
}

// POST /api/amenities/boat - Adiciona amenidades a um barco
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { boatId, amenityIds } = body;

    if (!boatId || !amenityIds || !Array.isArray(amenityIds)) {
      return NextResponse.json(
        { error: 'ID do barco e lista de IDs de amenidades são obrigatórios' },
        { status: 400 }
      );
    }

    // Remove todas as amenidades existentes do barco
    await prisma.boatAmenityRelation.deleteMany({
      where: { boatId }
    });

    // Adiciona as novas amenidades
    const relations = await prisma.boatAmenityRelation.createMany({
      data: amenityIds.map(amenityId => ({
        boatId,
        amenityId
      }))
    });

    return NextResponse.json(relations);
  } catch (error) {
    console.error('Error updating boat amenities:', error);
    return NextResponse.json({ error: 'Erro ao atualizar amenidades do barco' }, { status: 500 });
  }
}
