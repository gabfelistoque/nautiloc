import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; mediaId: string } }
) {
  try {
    console.log('Iniciando DELETE de mídia');
    const session = await getServerSession(authOptions);
    console.log('Session:', JSON.stringify(session, null, 2));
    
    if (!session || !session.user) {
      console.log('Usuário não autenticado');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Busca o usuário no banco de dados para verificar a role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      console.log('Usuário não autorizado. Role:', user?.role);
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id, mediaId } = params;

    // Verifica se a mídia existe e pertence ao barco
    const media = await prisma.media.findFirst({
      where: {
        id: mediaId,
        boatId: id
      }
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    // Deleta a mídia
    await prisma.media.delete({
      where: {
        id: mediaId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error detalhado:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar mídia: ' + error.message },
      { status: 500 }
    );
  }
}
