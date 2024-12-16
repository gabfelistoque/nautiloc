import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
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
        amenities: true,
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
        id: amenity.id,
        name: amenity.name,
        iconName: amenity.iconName,
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
      // Atualiza o barco com os novos dados e reconecta as amenidades
      const updatedBoat = await prisma.boat.update({
        where: { id: params.id },
        data: {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          capacity: parseInt(data.capacity),
          length: parseFloat(data.length),
          location: data.location,
          category: data.category,
          year: parseInt(data.year),
          available: data.available,
          amenities: {
            set: [], // Remove todas as amenidades existentes
            connect: data.amenities.map((amenity: any) => ({ id: amenity.id })) // Conecta as novas amenidades
          }
        },
        include: {
          amenities: true,
          media: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
      });

      return updatedBoat;
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

    // Deleta o barco (as relações serão deletadas automaticamente devido ao onDelete: Cascade)
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
