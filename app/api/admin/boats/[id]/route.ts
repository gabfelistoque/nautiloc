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
    const { 
      name,
      description,
      price,
      capacity,
      length,
      amenityIds,
    } = body;

    const boat = await prisma.boat.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        price,
        capacity,
        length,
        updatedAt: new Date(),
        amenities: {
          set: amenityIds ? amenityIds.map((id: string) => ({ id })) : [],
        },
      },
      include: {
        amenities: true,
        media: true,
      },
    });

    return NextResponse.json(boat);
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

    await prisma.boat.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BOAT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
