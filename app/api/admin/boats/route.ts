import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/admin/boats - Lista todos os barcos
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const boats = await prisma.boat.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        amenities: true,
        media: true,
      },
    });

    return NextResponse.json(boats);
  } catch (error) {
    console.error('Error fetching boats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/boats - Cria um novo barco
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado - Apenas administradores podem criar barcos' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Validação básica dos campos obrigatórios
    const requiredFields = ['name', 'description', 'imageUrl', 'location', 'price', 'capacity'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos obrigatórios faltando: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validação dos tipos de dados
    if (isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) {
      return NextResponse.json(
        { error: 'Preço deve ser um número positivo' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(data.capacity)) || parseInt(data.capacity) <= 0) {
      return NextResponse.json(
        { error: 'Capacidade deve ser um número inteiro positivo' },
        { status: 400 }
      );
    }

    if (data.length && (isNaN(parseFloat(data.length)) || parseFloat(data.length) < 0)) {
      return NextResponse.json(
        { error: 'Comprimento deve ser um número positivo' },
        { status: 400 }
      );
    }

    if (data.year && (isNaN(parseInt(data.year)) || parseInt(data.year) < 1900 || parseInt(data.year) > new Date().getFullYear())) {
      return NextResponse.json(
        { error: 'Ano inválido' },
        { status: 400 }
      );
    }

    // Verificar se já existe um barco com o mesmo nome
    const existingBoat = await prisma.boat.findUnique({
      where: { name: data.name },
    });

    if (existingBoat) {
      return NextResponse.json(
        { error: 'Já existe um barco com este nome' },
        { status: 400 }
      );
    }

    // Criar o barco em uma transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Criar o barco
      const boat = await tx.boat.create({
        data: {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          capacity: parseInt(data.capacity),
          location: data.location,
          price: parseFloat(data.price),
          rating: 0,
          available: true,
          length: data.length ? parseFloat(data.length) : 0,
          year: data.year ? parseInt(data.year) : new Date().getFullYear(),
          category: data.category || 'Lancha',
        },
      });

      // Criar as mídias se houver
      if (data.media && Array.isArray(data.media) && data.media.length > 0) {
        await tx.media.createMany({
          data: data.media.map((media: any) => ({
            url: media.url,
            type: media.type || 'image',
            boatId: boat.id,
          })),
        });
      }

      // Criar as amenidades se houver
      if (data.amenities && Array.isArray(data.amenities) && data.amenities.length > 0) {
        // Primeiro, cria ou encontra as amenidades
        for (const amenity of data.amenities) {
          await tx.amenity.upsert({
            where: {
              iconName: amenity.icon
            },
            create: {
              name: amenity.name,
              iconName: amenity.icon,
            },
            update: {
              name: amenity.name,
            }
          });
        }

        // Agora cria as relações com o barco
        const createdAmenities = await tx.amenity.findMany({
          where: {
            iconName: {
              in: data.amenities.map((a: any) => a.icon)
            }
          }
        });

        await tx.boatAmenityRelation.createMany({
          data: createdAmenities.map((amenity) => ({
            amenityId: amenity.id,
            boatId: boat.id,
          })),
        });
      }

      // Retornar o barco com suas relações
      return await tx.boat.findUnique({
        where: { id: boat.id },
        include: {
          media: true,
          amenities: {
            include: {
              amenity: true
            }
          },
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating boat:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Já existe um barco com este nome' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Erro ao relacionar amenidades ou mídia ao barco' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar barco' },
      { status: 500 }
    );
  }
}
