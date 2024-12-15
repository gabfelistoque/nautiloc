import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

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

    return NextResponse.json(boat);
  } catch (error) {
    console.error('Error fetching boat:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/boats/[id] - Atualiza um barco
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Verifica se o barco existe
    const existingBoat = await prisma.boat.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingBoat) {
      return NextResponse.json({ error: 'Boat not found' }, { status: 404 });
    }

    // Atualiza o barco
    const boat = await prisma.boat.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        description: data.description !== undefined ? data.description : undefined,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
        capacity: data.capacity !== undefined ? parseInt(data.capacity) : undefined,
        location: data.location !== undefined ? data.location : undefined,
        pricePerDay: data.pricePerDay !== undefined ? parseFloat(data.pricePerDay) : undefined,
        available: data.available !== undefined ? data.available : undefined,
      },
    });

    return NextResponse.json(boat);
  } catch (error) {
    console.error('Error updating boat:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
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
    // Verifica se existem reservas para este barco
    const bookings = await prisma.booking.findMany({
      where: {
        boatId: params.id,
        status: 'ACTIVE',
      },
    });

    if (bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete boat with active bookings' },
        { status: 400 }
      );
    }

    await prisma.boat.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting boat:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
