import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boat = await prisma.boat.findUnique({
      where: {
        id: params.id,
      },
      include: {
        media: true,
        amenities: {
          include: {
            amenity: true
          }
        },
        bookings: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!boat) {
      return NextResponse.json(
        { error: 'Barco não encontrado' },
        { status: 404 }
      );
    }

    // Formata os dados antes de enviar
    const formattedBoat = {
      ...boat,
      amenities: boat.amenities.map(amenity => ({
        id: amenity.amenity.id,
        name: amenity.amenity.name,
        iconName: amenity.amenity.iconName,
      })),
      bookings: boat.bookings.map(booking => ({
        id: booking.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        status: booking.status,
        user: booking.user,
      })),
    };

    return NextResponse.json(formattedBoat);
  } catch (error: any) {
    console.error('Error fetching boat:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar barco' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('Dados recebidos:', data);

    // Verifica se o barco existe
    const boat = await prisma.boat.findUnique({
      where: { id: params.id },
      include: {
        amenities: true,
        media: true,
      },
    });

    if (!boat) {
      return NextResponse.json(
        { error: 'Barco não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se todas as amenidades existem
    const amenityIds = data.amenities.map((amenity: any) => amenity.id);
    console.log('IDs das amenidades:', amenityIds);

    const existingAmenities = await prisma.amenity.findMany({
      where: {
        id: {
          in: amenityIds,
        },
      },
    });

    console.log('Amenidades encontradas:', existingAmenities);

    if (existingAmenities.length !== amenityIds.length) {
      const missingAmenities = amenityIds.filter(
        (id: string) => !existingAmenities.find((a) => a.id === id)
      );
      return NextResponse.json(
        {
          error: 'Algumas amenidades não foram encontradas',
          missingAmenities,
        },
        { status: 400 }
      );
    }

    // Atualiza o barco em uma transação
    const updatedBoat = await prisma.$transaction(async (prisma) => {
      // Primeiro, remove todas as relações existentes de amenidades
      await prisma.boatAmenityRelation.deleteMany({
        where: {
          boatId: params.id,
        },
      });

      // Depois, cria as novas relações
      const amenityRelations = amenityIds.map((amenityId: string) => ({
        boatId: params.id,
        amenityId,
      }));

      await prisma.boatAmenityRelation.createMany({
        data: amenityRelations,
      });

      // Atualiza os dados básicos do barco
      return prisma.boat.update({
        where: { id: params.id },
        data: {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          capacity: data.capacity,
          location: data.location,
          pricePerDay: data.pricePerDay,
          available: data.available,
          length: data.length,
          year: data.year,
          category: data.category,
          media: {
            deleteMany: {},
            create: data.media.map((media: any) => ({
              url: media.url,
              type: media.type,
            })),
          },
        },
        include: {
          amenities: true,
          media: true,
        },
      });
    });

    console.log('Barco atualizado:', updatedBoat);
    return NextResponse.json(updatedBoat);
  } catch (error) {
    console.error('Erro ao atualizar barco:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar barco' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = new PrismaClient();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Deleta as mídias primeiro
    await prisma.media.deleteMany({
      where: {
        boatId: params.id,
      },
    });

    // Deleta as amenidades
    await prisma.boatAmenityRelation.deleteMany({
      where: {
        boatId: params.id,
      },
    });

    // Deleta o barco
    await prisma.boat.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Barco deletado com sucesso' });
  } catch (error: any) {
    console.error('Error deleting boat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar barco' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
