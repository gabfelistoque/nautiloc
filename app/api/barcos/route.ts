import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
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
          media: true,
          amenities: {
            include: {
              amenity: true
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Formata os dados antes de enviar
      const formattedBoats = boats.map(boat => ({
        ...boat,
        amenities: boat.amenities.map(amenity => ({
          id: amenity.amenity.id,
          name: amenity.amenity.name,
          iconName: amenity.amenity.iconName,
        })),
      }));

      return NextResponse.json(formattedBoats);
    }

    // Para usuários normais, retorna apenas barcos disponíveis
    const boats = await prisma.boat.findMany({
      where: {
        available: true,
      },
      include: {
        media: true,
        amenities: {
          include: {
            amenity: true
          }
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });
    
    // Formata os dados antes de enviar
    const formattedBoats = boats.map(boat => ({
      ...boat,
      amenities: boat.amenities.map(amenity => ({
        id: amenity.amenity.id,
        name: amenity.amenity.name,
        iconName: amenity.amenity.iconName,
      })),
    }));

    return NextResponse.json(formattedBoats);
  } catch (error) {
    console.error('Error fetching boats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar barcos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    
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
      amenities
    } = body;

    console.log('Parsed data:', {
      name,
      description,
      imageUrl,
      capacity: Number(capacity),
      location,
      pricePerDay: Number(pricePerDay),
      available,
      length: Number(length),
      year: Number(year),
      category,
      amenitiesCount: amenities?.length,
      mediaCount: media?.length
    });

    // Validações básicas
    if (!name || !description || !capacity || !location || !pricePerDay) {
      console.log('Validation failed:', { name, description, capacity, location, pricePerDay });
      return NextResponse.json(
        { error: 'Campos básicos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar amenidades
    if (amenities && !Array.isArray(amenities)) {
      return NextResponse.json(
        { error: 'Formato inválido para amenidades' },
        { status: 400 }
      );
    }

    // Cria o barco e suas relações em uma transação
    const boat = await prisma.$transaction(async (tx) => {
      try {
        // Primeiro, processa todas as amenidades para garantir que existam no banco
        const processedAmenities = await Promise.all(
          (amenities || []).map(async (amenity: any) => {
            console.log('Processing amenity:', amenity);
            
            // Verifica se temos um ID ou iconName válido
            if (!amenity.id && !amenity.iconName) {
              console.log('Missing amenity identifier:', amenity);
              throw new Error(`Identificador da amenidade "${amenity.name}" não encontrado`);
            }

            let existingAmenity;

            // Se temos um ID, tenta encontrar a amenidade
            if (amenity.id) {
              existingAmenity = await tx.amenity.findUnique({
                where: { id: amenity.id }
              });
            }

            // Se não encontrou por ID ou não tinha ID, procura ou cria por iconName
            if (!existingAmenity && amenity.iconName) {
              existingAmenity = await tx.amenity.upsert({
                where: { iconName: amenity.iconName },
                update: {},
                create: {
                  name: amenity.name,
                  iconName: amenity.iconName,
                }
              });
            }

            if (!existingAmenity) {
              throw new Error(`Amenidade "${amenity.name}" não encontrada`);
            }

            return existingAmenity;
          })
        );

        // Agora cria o barco com as amenidades processadas
        const boat = await tx.boat.create({
          data: {
            name,
            description,
            imageUrl,
            capacity: Number(capacity),
            location,
            pricePerDay: Number(pricePerDay),
            available: available ?? true,
            length: Number(length),
            year: Number(year),
            category,
            amenities: {
              create: processedAmenities.map(amenity => ({
                amenity: {
                  connect: {
                    id: amenity.id
                  }
                }
              }))
            },
            ...(media?.length > 0 && {
              media: {
                create: media.map((m: any) => ({
                  url: m.url,
                  type: m.type || 'IMAGE',
                }))
              }
            })
          },
          include: {
            amenities: {
              include: {
                amenity: true
              }
            },
            media: true
          }
        });

        return boat;
      } catch (txError) {
        console.error('Transaction error:', txError);
        throw txError;
      }
    });

    return NextResponse.json(boat);
  } catch (error) {
    console.error('Error creating boat:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Erro ao criar barco: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao criar barco' },
      { status: 500 }
    );
  }
}
