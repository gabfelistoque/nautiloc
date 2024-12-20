import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Se for admin, retorna todas as reservas
    // Se for usuário normal, retorna apenas suas reservas
    const bookings = await prisma.booking.findMany({
      where: session.user.role === 'ADMIN' ? undefined : {
        userId: session.user.id,
      },
      include: {
        boat: {
          include: {
            media: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reservas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado - Faça login para continuar' },
        { status: 401 }
      );
    }

    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log('Body recebido:', body);
    
    const {
      boatId,
      startDate,
      endDate,
      totalPrice,
      guests = 1,
    } = body;

    // Validações básicas
    if (!boatId || !startDate || !endDate || guests < 1) {
      console.log('Campos faltando:', { boatId, startDate, endDate, totalPrice, guests });
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Validar preço total
    if (typeof totalPrice !== 'number' || totalPrice <= 0) {
      return NextResponse.json(
        { error: 'Preço total inválido' },
        { status: 400 }
      );
    }

    // Converter strings de data para objetos Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Se as datas forem iguais, não precisa verificar se a data final é maior
    if (start.getTime() !== end.getTime() && end <= start) {
      return NextResponse.json(
        { error: 'A data de término deve ser posterior à data de início' },
        { status: 400 }
      );
    }

    // Buscar o barco para validar o preço
    const boat = await prisma.boat.findUnique({
      where: { id: boatId }
    });

    if (!boat) {
      return NextResponse.json(
        { error: 'Barco não encontrado' },
        { status: 404 }
      );
    }

    // Calcular o número de dias
    let days = 1;
    if (start.getTime() !== end.getTime()) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Calcular preço esperado
    const subtotal = days * boat.price;
    const serviceFee = subtotal * 0.1; // 10% de taxa de serviço
    const expectedTotalPrice = subtotal + serviceFee;

    // Verificar se o preço total está correto (com margem de erro de R$1 para arredondamentos)
    if (Math.abs(totalPrice - expectedTotalPrice) > 1) {
      console.log('Preço inválido:', { totalPrice, expectedTotalPrice });
      return NextResponse.json(
        { error: 'Preço total inválido' },
        { status: 400 }
      );
    }

    // Criar a reserva
    const booking = await prisma.booking.create({
      data: {
        startDate: start,
        endDate: end,
        totalPrice,
        guests,
        userId: user.id,
        boatId,
        status: 'PENDENTE'
      },
      include: {
        boat: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
