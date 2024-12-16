import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DELETE /api/reservations/[id] - Cancelar uma reserva
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se a reserva existe e pertence ao usuário
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        boat: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado a cancelar esta reserva' },
        { status: 403 }
      );
    }

    // Verificar se a reserva está dentro do prazo de cancelamento (48 horas antes)
    const startDate = new Date(booking.startDate);
    const now = new Date();
    const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilStart < 48) {
      return NextResponse.json(
        { error: 'Cancelamentos só são permitidos com 48 horas de antecedência' },
        { status: 400 }
      );
    }

    // Verificar se a reserva já não está cancelada
    if (booking.status === 'CANCELADO') {
      return NextResponse.json(
        { error: 'Esta reserva já está cancelada' },
        { status: 400 }
      );
    }

    // Deletar a reserva e liberar o barco
    await prisma.$transaction([
      prisma.booking.delete({
        where: { id: params.id },
      }),
      prisma.boat.update({
        where: { id: booking.boatId },
        data: { available: true },
      }),
    ]);

    return NextResponse.json({ message: 'Reserva deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar reserva' },
      { status: 500 }
    );
  }
}
