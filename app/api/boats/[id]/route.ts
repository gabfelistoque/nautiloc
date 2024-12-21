import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    console.log('Dados recebidos:', data); 
    console.log('ImageUrl recebida:', data.imageUrl); 

    const {
      name,
      description,
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
      // Primeiro, busca o barco atual
      const currentBoat = await tx.boat.findUnique({
        where: { id: params.id },
        include: {
          amenities: true,
          media: true
        }
      });

      if (!currentBoat) {
        throw new Error('Barco não encontrado');
      }

      // Atualiza o barco com todos os campos necessários
      const boat = await tx.boat.update({
        where: { id: params.id },
        data: {
          name,
          description,
          imageUrl: data.imageUrl, 
          capacity: parseInt(capacity.toString()),
          location,
          price: parseFloat(price.toString()),
          length: parseFloat(length.toString()),
          year: year ? parseInt(year.toString()) : 2024,
          category: category || 'Lancha',
          available: available ?? true,
          ...(amenities && {
            amenities: {
              set: [], 
              connect: amenities.map((amenity: any) => ({ id: amenity.id }))
            }
          }),
          ...(media && {
            media: {
              deleteMany: {}, 
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
