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
  const prisma = new PrismaClient();

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado' },
        { status: 401 }
      );
    }

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
    } = await request.json();

    // Validações básicas
    if (!name || !description || !capacity || !location || !price || !length) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    const boat = await prisma.$transaction(async (tx) => {
      // Cria o barco com todos os campos necessários
      const newBoat = await tx.boat.create({
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
          userId: session.user.id,
          ...(amenities && {
            amenities: {
              connect: amenities.map((amenity: any) => ({
                id: amenity.id
              }))
            }
          }),
          ...(media?.length > 0 && {
            media: {
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

      return newBoat;
    });

    return NextResponse.json(boat);
  } catch (error: any) {
    console.error('Error creating boat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar barco' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
