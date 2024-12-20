import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.id) {
      return new NextResponse("Boat id is required", { status: 400 });
    }

    const boat = await prisma.boat.findUnique({
      where: {
        id: params.id,
      },
      include: {
        amenities: true,
        media: true,
      },
    });

    if (!boat) {
      return new NextResponse("Boat not found", { status: 404 });
    }

    return NextResponse.json(boat);
  } catch (error) {
    console.error("[BOAT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, amenityIds, ...data } = body;

    if (!params.id) {
      return new NextResponse("Boat id is required", { status: 400 });
    }

    // Verificar se o barco existe
    const existingBoat = await prisma.boat.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingBoat) {
      return new NextResponse("Boat not found", { status: 404 });
    }

    // Verifica se já existe um barco com o mesmo nome
    if (name && name !== existingBoat.name) {
      const boatWithSameName = await prisma.boat.findFirst({
        where: { 
          name,
          id: { not: params.id } // Exclui o barco atual da busca
        },
      });

      if (boatWithSameName) {
        return NextResponse.json(
          { error: 'Já existe um barco com este nome' },
          { status: 400 }
        );
      }
    }

    // Atualizar o barco
    const updatedBoat = await prisma.boat.update({
      where: {
        id: params.id,
      },
      data: {
        ...data,
        name,
        amenities: amenityIds ? {
          set: amenityIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        amenities: true,
        media: true,
      },
    });

    return NextResponse.json(updatedBoat);
  } catch (error) {
    console.error("[BOAT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.id) {
      return new NextResponse("Boat id is required", { status: 400 });
    }

    const boat = await prisma.boat.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(boat);
  } catch (error) {
    console.error("[BOAT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
