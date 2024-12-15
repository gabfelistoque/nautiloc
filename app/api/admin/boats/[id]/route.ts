import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/admin/boats/[id] - Obtém um barco específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const boat = await prisma.boat.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!boat) {
      return NextResponse.json({ error: 'Boat not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...boat,
      features: JSON.parse(boat.features),
      images: JSON.parse(boat.images),
    });
  } catch (error) {
    console.error("[BOAT_GET]", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/boats/[id] - Atualiza um barco
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { 
      name, 
      description, 
      pricePerDay, 
      capacity, 
      length,
      features,
      images,
    } = await request.json();

    const boat = await prisma.boat.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        pricePerDay,
        capacity,
        length,
        features: JSON.stringify(features),
        images: JSON.stringify(images),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(boat);
  } catch (error) {
    console.error("[BOAT_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/admin/boats/[id] - Exclui um barco
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.boat.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Boat deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
