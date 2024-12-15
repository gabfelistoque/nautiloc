import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(amenities);
  } catch (error) {
    console.error("[AMENITIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { boatId, amenityIds } = body;

    if (!boatId || !amenityIds || !Array.isArray(amenityIds)) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // Verificar se o barco existe
    const boat = await prisma.boat.findUnique({
      where: { id: boatId },
      include: { amenities: true },
    });

    if (!boat) {
      return new NextResponse("Boat not found", { status: 404 });
    }

    // Atualizar as amenidades do barco
    const updatedBoat = await prisma.boat.update({
      where: { id: boatId },
      data: {
        amenities: {
          set: amenityIds.map(id => ({ id })),
        },
      },
      include: {
        amenities: true,
      },
    });

    return NextResponse.json(updatedBoat.amenities);
  } catch (error) {
    console.error("[AMENITIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, iconName } = body;

    if (!name || !iconName) {
      return new NextResponse("Name and icon name are required", { status: 400 });
    }

    const amenity = await prisma.amenity.create({
      data: {
        name,
        iconName,
      },
    });

    return NextResponse.json(amenity);
  } catch (error) {
    console.error("[AMENITY_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse("Amenity ID is required", { status: 400 });
    }

    const amenity = await prisma.amenity.delete({
      where: { id },
    });

    return NextResponse.json(amenity);
  } catch (error) {
    console.error("[AMENITY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
