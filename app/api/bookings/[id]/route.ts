import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: params.id,
      },
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

    // Verifica se o usuário tem permissão para ver esta reserva
    if (session.user.role !== 'ADMIN' && booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reserva' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }

    // Primeiro, buscar a reserva atual e suas datas
    const currentBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { boat: true },
    });

    if (!currentBooking) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    // Se estiver confirmando a reserva, verificar se há conflito com outras reservas
    if (status === 'CONFIRMADO') {
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          id: { not: params.id }, // Excluir a reserva atual
          boatId: currentBooking.boatId,
          status: 'CONFIRMADO',
          OR: [
            {
              // Verifica se há alguma reserva que começa durante o período
              startDate: {
                gte: currentBooking.startDate,
                lte: currentBooking.endDate,
              },
            },
            {
              // Verifica se há alguma reserva que termina durante o período
              endDate: {
                gte: currentBooking.startDate,
                lte: currentBooking.endDate,
              },
            },
            {
              // Verifica se há alguma reserva que engloba todo o período
              AND: [
                { startDate: { lte: currentBooking.startDate } },
                { endDate: { gte: currentBooking.endDate } },
              ],
            },
          ],
        },
      });

      if (conflictingBookings.length > 0) {
        return NextResponse.json(
          { error: 'Já existe uma reserva confirmada para este barco neste período' },
          { status: 400 }
        );
      }
    }

    // Atualizar o status da reserva
    const booking = await prisma.booking.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
      include: {
        boat: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar reserva' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se a reserva existe e pertence ao usuário
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { user: true }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o dono da reserva ou é admin
    if (booking.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado a cancelar esta reserva' },
        { status: 403 }
      );
    }

    const deletedBooking = await prisma.booking.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Reserva deletada com sucesso' });


  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar reserva' },
      { status: 500 }
    );
  }
}
