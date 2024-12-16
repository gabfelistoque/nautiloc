import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BookingStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar estatísticas básicas
    const [totalBoats, totalUsers, bookings] = await Promise.all([
      prisma.boat.count(),
      prisma.user.count({
        where: { role: "USER" }
      }),
      prisma.booking.findMany({
        where: {
          status: "CONFIRMADO" as BookingStatus
        },
        include: {
          boat: {
            select: {
              price: true
            }
          }
        }
      })
    ]);

    // Calcular receita total
    const revenue = bookings.reduce((total, booking) => {
      if (!booking.boat?.price) return total;
      
      const days = Math.ceil(
        (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      return total + (booking.boat.price * days);
    }, 0);

    // Contar reservas por status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ["status"],
      _count: true
    });

    // Formatar contagem de reservas por status
    const bookingStats = Object.fromEntries(
      bookingsByStatus.map(item => [item.status, item._count])
    );

    // Buscar barcos mais populares
    const popularBoats = await prisma.boat.findMany({
      take: 5,
      include: {
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: {
        bookings: {
          _count: "desc"
        }
      }
    });

    return NextResponse.json({
      totalBoats,
      totalUsers,
      revenue,
      bookings: bookingStats,
      popularBoats: popularBoats.map(boat => ({
        id: boat.id,
        name: boat.name,
        bookings: boat._count.bookings
      }))
    });
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
