import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/boats - Lista todos os barcos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const boats = await prisma.boat.findMany({
      include: {
        amenities: true,
        media: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(boats);
  } catch (error) {
    console.error("[BOATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST /api/admin/boats - Cria um novo barco
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      capacity,
      length,
      location,
      category,
      year,
      imageUrl,
      amenityIds,
    } = body;

    // Validação básica dos campos obrigatórios
    const requiredFields = ['name', 'description', 'imageUrl', 'location', 'price', 'capacity'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos obrigatórios faltando: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validação dos tipos de dados
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return NextResponse.json(
        { error: 'Preço deve ser um número positivo' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0) {
      return NextResponse.json(
        { error: 'Capacidade deve ser um número inteiro positivo' },
        { status: 400 }
      );
    }

    if (length && (isNaN(parseFloat(length)) || parseFloat(length) < 0)) {
      return NextResponse.json(
        { error: 'Comprimento deve ser um número positivo' },
        { status: 400 }
      );
    }

    if (year && (isNaN(parseInt(year)) || parseInt(year) < 1900 || parseInt(year) > new Date().getFullYear())) {
      return NextResponse.json(
        { error: 'Ano inválido' },
        { status: 400 }
      );
    }

    // Verificar se já existe um barco com o mesmo nome
    const existingBoat = await prisma.boat.findUnique({
      where: { name },
    });

    if (existingBoat) {
      return NextResponse.json(
        { error: 'Já existe um barco com este nome' },
        { status: 400 }
      );
    }

    const boat = await prisma.boat.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        capacity: parseInt(capacity),
        length: length ? parseFloat(length) : 0,
        location,
        category: category || 'Lancha',
        year: year ? parseInt(year) : new Date().getFullYear(),
        imageUrl,
        userId: session.user.id,
        amenities: {
          connect: amenityIds ? amenityIds.map((id: string) => ({ id })) : [],
        },
      },
      include: {
        amenities: true,
        media: true,
      },
    });

    // Criar as mídias se houver
    if (body.media && Array.isArray(body.media) && body.media.length > 0) {
      await prisma.media.createMany({
        data: body.media.map((media: any) => ({
          url: media.url,
          type: media.type || 'image',
          boatId: boat.id,
        })),
      });
    }

    return NextResponse.json(boat);
  } catch (error) {
    console.error("[BOAT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
