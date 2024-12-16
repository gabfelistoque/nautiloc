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
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
    });

    if (!boat) {
      return NextResponse.json(
        { error: 'Barco não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(boat);
  } catch (error: any) {
    console.error('Error fetching boat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar barco' },
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
    const {
      name,
      description,
      imageUrl,
      capacity,
      location,
      price,
      available,
      length,
      year,
      category,
      amenities,
      media
    } = data;

    // Validações básicas
    if (!name || !description || !capacity || !location || !price || !length) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    const updatedBoat = await prisma.$transaction(async (tx) => {
      // Atualiza o barco com todos os campos necessários
      const boat = await tx.boat.update({
        where: { id: params.id },
        data: {
          name,
          description,
          imageUrl,
          capacity: parseInt(capacity),
          location,
          price: parseFloat(price),
          length: parseFloat(length),
          year: year ? parseInt(year) : 2024,
          category: category || 'Lancha',
          available: available ?? true,
          ...(amenities && {
            amenities: {
              set: [], // Remove todas as amenidades existentes
              connect: amenities.map((amenity: any) => ({ id: amenity.id }))
            }
          }),
          ...(media && {
            media: {
              deleteMany: {}, // Remove todas as mídias existentes
              create: media.map((m: any, index: number) => ({
                url: m.url,
                type: m.type || 'image',
                order: index
              }))
            }
          })
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
        }
      });

      return boat;
    });

    return NextResponse.json(updatedBoat);
  } catch (error: any) {
    console.error('Error updating boat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar barco' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
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
