import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const session = await getServerSession(authOptions);

    // Se for uma requisição admin, verifica autenticação
    if (isAdmin) {
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        );
      }

      const boats = await prisma.boat.findMany({
        include: {
          amenities: true,
          media: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(boats);
    }

    // Para usuários normais, retorna apenas barcos disponíveis
    const boats = await prisma.boat.findMany({
      where: {
        available: true,
      },
      include: {
        amenities: true,
        media: true,
      },
      orderBy: {
        rating: 'desc',
      },
    });
    
    return NextResponse.json(boats);
  } catch (error) {
    console.error('Error fetching boats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar barcos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Dados de exemplo para um novo barco
    const exampleBoat = {
      name: "Veleiro Sunset Dream",
      description: "Veleiro luxuoso perfeito para passeios ao pôr do sol. Equipado com todos os itens de conforto e segurança para uma experiência inesquecível.",
      imageUrl: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      capacity: 8,
      location: "Marina da Glória, Rio de Janeiro",
      price: 1500,
      available: true,
      length: 12.5,
      year: 2020,
      category: "Veleiro",
      amenities: [
        { name: "Wi-Fi", iconName: "WifiIcon" },
        { name: "Ar Condicionado", iconName: "SignalIcon" },
        { name: "Som", iconName: "MusicalNoteIcon" },
        { name: "Churrasqueira", iconName: "FireIcon" },
        { name: "Área de Sol", iconName: "SunIcon" }
      ],
      media: [
        {
          url: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          type: "IMAGE"
        },
        {
          url: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          type: "IMAGE"
        }
      ]
    };

    // Cria o barco com suas mídias em uma transação
    const boat = await prisma.$transaction(async (tx) => {
      // Primeiro, cria o barco
      const newBoat = await tx.boat.create({
        data: {
          name: exampleBoat.name,
          description: exampleBoat.description,
          imageUrl: exampleBoat.imageUrl,
          capacity: exampleBoat.capacity,
          location: exampleBoat.location,
          price: exampleBoat.price,
          available: exampleBoat.available,
          length: exampleBoat.length,
          year: exampleBoat.year,
          category: exampleBoat.category,
        },
      });

      // Adiciona as mídias
      if (exampleBoat.media.length > 0) {
        await tx.media.createMany({
          data: exampleBoat.media.map((m) => ({
            url: m.url,
            type: m.type,
            boatId: newBoat.id,
          })),
        });
      }

      // Adiciona as amenidades
      if (exampleBoat.amenities.length > 0) {
        // Primeiro cria as amenidades
        const amenityPromises = exampleBoat.amenities.map(amenity =>
          tx.amenity.create({
            data: {
              name: amenity.name,
              iconName: amenity.iconName,
            },
          })
        );
        const createdAmenities = await Promise.all(amenityPromises);

        // Depois cria as relações
        await tx.boatAmenityRelation.createMany({
          data: createdAmenities.map(amenity => ({
            boatId: newBoat.id,
            amenityId: amenity.id,
          })),
        });
      }

      // Retorna o barco criado com suas relações
      return tx.boat.findUnique({
        where: {
          id: newBoat.id,
        },
        include: {
          media: true,
          amenities: {
            include: {
              amenity: true,
            },
          },
        },
      });
    });

    return NextResponse.json(boat);
  } catch (error) {
    console.error('Error creating boat:', error);
    return NextResponse.json(
      { error: 'Erro ao criar barco' },
      { status: 500 }
    );
  }
}
