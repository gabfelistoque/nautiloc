import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

      return NextResponse.json(boats, {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
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
    
    return NextResponse.json(boats, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
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
    
    console.log('Session:', session);
    console.log('User ID:', session?.user?.id);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado na sessão' },
        { status: 401 }
      );
    }

    // Verificar se o usuário existe no banco
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!userExists) {
      return NextResponse.json(
        { error: 'Usuário não encontrado no banco de dados' },
        { status: 404 }
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

    try {
      // Primeiro, vamos criar o barco base
      const boat = await prisma.boat.create({
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
        }
      });

      // Depois, em uma transação separada, adicionamos as relações
      const updatedBoat = await prisma.$transaction(async (tx) => {
        // Conecta amenities se existirem
        if (amenities?.length > 0) {
          await tx.boat.update({
            where: { id: boat.id },
            data: {
              amenities: {
                connect: amenities.map((amenity: any) => ({
                  id: amenity.id
                }))
              }
            }
          });
        }

        // Adiciona media se existir
        if (media?.length > 0) {
          await tx.media.createMany({
            data: media.map((m: any, index: number) => ({
              url: m.url,
              type: m.type || 'image',
              order: index,
              boatId: boat.id
            }))
          });
        }

        // Retorna o barco atualizado com todas as relações
        return await tx.boat.findUnique({
          where: { id: boat.id },
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
      }, {
        timeout: 15000 // 15 segundos de timeout
      });

      return NextResponse.json(updatedBoat);
    } catch (error: any) {
      console.error('Error creating boat:', error);
      return NextResponse.json(
        { error: error.message || 'Erro ao criar barco' },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  } catch (error: any) {
    console.error('Error creating boat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar barco' },
      { status: 500 }
    );
  }
}
