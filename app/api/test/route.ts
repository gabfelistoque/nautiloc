import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Tenta buscar todos os barcos
    const boats = await prisma.boat.findMany({
      take: 1, // Limita a 1 resultado
    });

    return NextResponse.json({
      success: true,
      message: 'Conexão com o banco de dados OK',
      firstBoat: boats[0]
    });
  } catch (error) {
    console.error('Erro no teste:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
