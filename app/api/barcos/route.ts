import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('URL completa:', request.url);
    console.log('Parâmetros recebidos:', Object.fromEntries(searchParams.entries()));

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
          amenities: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(boats);
    }

    // Para usuários normais, retorna apenas barcos disponíveis
    console.log('Buscando barcos disponíveis...');
    const category = searchParams.get('category')?.toUpperCase();
    const location = searchParams.get('location');
    const guests = searchParams.get('guests');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Parâmetros processados:', { category, location, guests, startDate, endDate });

    const whereClause: Prisma.BoatWhereInput = {
      available: true,
      ...(category && { 
        category: {
          equals: category,
          mode: 'insensitive' as Prisma.QueryMode
        }
      }),
      ...(location && { 
        location: {
          contains: location,
          mode: 'insensitive' as Prisma.QueryMode
        }
      }),
      ...(guests && { capacity: { gte: parseInt(guests) } }),
      // Verificar se não há reservas no período solicitado
      ...(startDate && endDate && {
        NOT: {
          bookings: {
            some: {
              OR: [
                {
                  AND: [
                    { startDate: { lte: new Date(endDate) } },
                    { endDate: { gte: new Date(startDate) } }
                  ]
                }
              ]
            }
          }
        }
      })
    };

    console.log('Where clause:', JSON.stringify(whereClause, null, 2));

    const boats = await prisma.boat.findMany({
      where: whereClause,
      include: {
        media: true,
        amenities: true,
        bookings: startDate && endDate ? {
          where: {
            OR: [
              {
                AND: [
                  { startDate: { lte: new Date(endDate) } },
                  { endDate: { gte: new Date(startDate) } }
                ]
              }
            ]
          }
        } : false,
      },
      orderBy: {
        rating: 'desc',
      },
    });
    
    console.log('Total de barcos encontrados:', boats.length);
    console.log('Categorias dos barcos encontrados:', boats.map(boat => boat.category));

    // Formata os dados antes de enviar
    const formattedBoats = boats.map(boat => ({
      ...boat,
      amenities: boat.amenities.map(amenity => ({
        id: amenity.id,
        name: amenity.name,
        iconName: amenity.iconName,
      })),
    }));

    console.log('Barcos formatados:', formattedBoats);

    return NextResponse.json(formattedBoats);
  } catch (error) {
    console.error('Erro ao buscar barcos:', error);
    return new NextResponse('Erro Interno', { status: 500 });
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

    if (!session.user.id) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado' },
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
      price,
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
      price: Number(price),
      available,
      length: Number(length),
      year: Number(year),
      category,
      amenitiesCount: amenities?.length,
      mediaCount: media?.length
    });

    // Validações básicas
    if (!name || !description || !capacity || !location || !price) {
      console.log('Validation failed:', { name, description, capacity, location, price });
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
            price: Number(price),
            available: available ?? true,
            length: Number(length),
            year: Number(year),
            category,
            userId: session.user.id,
            amenities: {
              connect: processedAmenities.map(amenity => ({
                id: amenity.id
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
            amenities: true,
            media: true
          }
        });

        // Formata a resposta
        const formattedBoat = {
          ...boat,
          amenities: boat.amenities.map(amenity => ({
            id: amenity.id,
            name: amenity.name,
            iconName: amenity.iconName
          }))
        };

        return formattedBoat;
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
