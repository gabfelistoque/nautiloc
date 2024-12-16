import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET - Buscando barco:', params.id);
    
    // Verifica se o ID é válido
    if (!params.id) {
      console.error('ID inválido:', params.id);
      return NextResponse.json(
        { error: 'ID do barco inválido' },
        { status: 400 }
      );
    }

    const boat = await prisma.boat.findUnique({
      where: {
        id: params.id,
      },
      include: {
        media: true,
        amenities: true,
      },
    });
    
    console.log('GET - Barco encontrado:', boat);

    if (!boat) {
      console.log('GET - Barco não encontrado');
      return NextResponse.json(
        { error: 'Barco não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(boat);
  } catch (error) {
    console.error('GET - Erro ao buscar barco:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar barco', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    console.log('User role:', session?.user?.role);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
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
      media,
      amenities
    } = body;

    // Validações básicas
    if (!name || !description || !capacity || !location || !price) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Atualiza o barco e sua mídia em uma transação
    const updatedBoat = await prisma.$transaction(async (tx) => {
      // Primeiro, atualiza os dados básicos do barco
      const boat = await tx.boat.update({
        where: {
          id: params.id,
        },
        data: {
          name,
          description,
          imageUrl,
          capacity: parseInt(capacity),
          location,
          price: parseFloat(price),
          available,
          length: length ? parseFloat(length) : null,
          year: year ? parseInt(year) : null,
          category: category || null,
          ...(amenities && {
            amenities: {
              set: [], // Remove todas as amenidades existentes
              connect: amenities.map((amenity: any) => ({ id: amenity.id })) // Conecta as novas amenidades
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

      // Atualiza as mídias
      if (media) {
        // Remove todas as mídias existentes
        await tx.media.deleteMany({
          where: { boatId: params.id },
        });

        // Adiciona as novas mídias
        if (media.length > 0) {
          await tx.media.createMany({
            data: media.map((m: any) => ({
              url: m.url,
              type: m.type,
              boatId: params.id,
            })),
          });
        }
      }

      // Retorna o barco atualizado com suas relações
      return boat;
    });

    return NextResponse.json(updatedBoat);
  } catch (error) {
    console.error('Error updating boat:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar barco' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    console.log('User role:', session?.user?.role);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Primeiro exclui todas as mídias associadas
    await prisma.media.deleteMany({
      where: {
        boatId: params.id,
      },
    });

    // Depois exclui o barco
    const boat = await prisma.boat.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(boat);
  } catch (error) {
    console.error('Error deleting boat:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir barco' },
      { status: 500 }
    );
  }
}
