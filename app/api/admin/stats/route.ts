import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Contar total de barcos
    const totalBoats = await prisma.boat.count();

    // Contar total de usuários (excluindo admins)
    const totalUsers = await prisma.user.count({
      where: {
        role: "USER",
      },
    });

    // Buscar reservas confirmadas com seus barcos
    const bookings = await prisma.booking.findMany({
      where: {
        status: "confirmed",
      },
      include: {
        boat: true,
      },
    });

    // Calcular receita total das reservas confirmadas
    const revenue = bookings.reduce((total, booking) => {
      const days = Math.ceil(
        (booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return total + (booking.boat.price * days);
    }, 0);

    // Calcular total de reservas por status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ["status"],
      _count: true,
    });

    // Formatar contagem de reservas por status
    const bookingStats = Object.fromEntries(
      bookingsByStatus.map((item) => [item.status, item._count])
    );

    // Buscar barcos mais populares (com mais reservas)
    const popularBoats = await prisma.boat.findMany({
      take: 5,
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        bookings: {
          _count: "desc",
        },
      },
    });

    return NextResponse.json({
      totalBoats,
      totalUsers,
      revenue,
      bookings: bookingStats,
      popularBoats: popularBoats.map((boat) => ({
        id: boat.id,
        name: boat.name,
        bookings: boat._count.bookings,
      })),
    });
  } catch (error) {
    console.error("[STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
