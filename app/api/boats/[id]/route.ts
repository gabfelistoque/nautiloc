import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

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

    return NextResponse.json({
      ...boat,
      features: JSON.parse(boat.features),
      images: JSON.parse(boat.images),
    });
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
      pricePerDay,
      available,
      media,
      length,
      year,
      category,
      amenities,
      features,
      images
    } = body;

    // Validações básicas
    if (!name || !description || !capacity || !location || !pricePerDay) {
      return NextResponse.json(
        { error: 'Campos básicos são obrigatórios' },
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
          capacity,
          location,
          pricePerDay,
          available,
          length: length || null,
          year: year || null,
          category: category || null,
          features: JSON.stringify(features),
          images: JSON.stringify(images),
        },
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

      // Atualiza as amenidades
      if (amenities) {
        // Remove todas as amenidades existentes
        await tx.boatAmenity.deleteMany({
          where: { boatId: params.id },
        });

        // Adiciona as novas amenidades
        if (amenities.length > 0) {
          await tx.boatAmenity.createMany({
            data: amenities.map((amenity: any) => ({
              name: amenity.name,
              icon: typeof amenity.icon === 'string' ? amenity.icon : 'WifiIcon',
              boatId: params.id,
            })),
          });
        }
      }

      // Retorna o barco atualizado com suas relações
      return tx.boat.findUnique({
        where: { id: params.id },
        include: {
          media: true,
          amenities: true,
        },
      });
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

    // Get the boat's media first
    const boat = await prisma.boat.findUnique({
      where: { id: params.id },
      include: { media: true }
    });

    if (!boat) {
      return NextResponse.json(
        { error: 'Barco não encontrado' },
        { status: 404 }
      );
    }

    // Delete the boat and all related media in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all media first
      if (boat.media.length > 0) {
        await tx.media.deleteMany({
          where: { boatId: params.id }
        });
      }

      // Then delete the boat
      await tx.boat.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ message: "Boat deleted successfully" });
  } catch (error) {
    console.error('Error deleting boat:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir barco' },
      { status: 500 }
    );
  }
}
