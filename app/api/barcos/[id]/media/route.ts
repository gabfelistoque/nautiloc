import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MediaRequestBody {
  url: string;
  type: 'IMAGE' | 'VIDEO';
  publicId?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Iniciando POST de mídia');
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

    const body = await request.json();
    console.log('Body recebido:', JSON.stringify(body, null, 2));
    const { url, type, publicId } = body;

    if (!url || !type) {
      console.log('Dados inválidos:', { url, type });
      return NextResponse.json(
        { error: 'URL e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se o barco existe e atualiza com a nova mídia
    console.log('Buscando e atualizando barco:', params.id);
    const updatedBoat = await prisma.boat.update({
      where: { id: params.id },
      data: {
        media: {
          create: {
            url,
            type,
            publicId,
          },
        },
      },
      include: {
        media: true,
      },
    });

    console.log('Barco atualizado:', JSON.stringify(updatedBoat, null, 2));

    // Retorna apenas a mídia criada
    const newMedia = updatedBoat.media[updatedBoat.media.length - 1];
    console.log('Nova mídia:', JSON.stringify(newMedia, null, 2));

    return NextResponse.json(newMedia);
  } catch (error: any) {
    console.error('Error detalhado:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });

    // Se for um erro do Prisma
    if (error.code) {
      return NextResponse.json(
        { error: `Erro do banco de dados: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao adicionar mídia: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Iniciando DELETE de mídia');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.email) {
      console.log('Usuário não autenticado');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Busca o usuário no banco de dados para verificar a role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });
    console.log('User role:', user?.role);

    if (!user || user.role !== 'ADMIN') {
      console.log('Usuário não autorizado');
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Body recebido:', body);
    const { mediaId } = body;

    if (!mediaId) {
      console.log('ID da mídia não fornecido');
      return NextResponse.json(
        { error: 'ID da mídia é obrigatório' },
        { status: 400 }
      );
    }

    // Verifica se a mídia existe e pertence ao barco
    const media = await prisma.media.findFirst({
      where: {
        id: mediaId,
        boatId: params.id
      }
    });
    console.log('Mídia encontrada:', media);

    if (!media) {
      console.log('Mídia não encontrada');
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    // Deleta a mídia usando uma transação para garantir consistência
    const deletedMedia = await prisma.$transaction(async (tx) => {
      // Verifica novamente se a mídia existe dentro da transação
      const mediaExists = await tx.media.findUnique({
        where: { id: mediaId }
      });

      if (!mediaExists) {
        throw new Error('Mídia não encontrada ou já foi deletada');
      }

      return await tx.media.delete({
        where: { id: mediaId }
      });
    });

    console.log('Mídia deletada:', deletedMedia);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error detalhado:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });

    // Se for um erro de registro não encontrado
    if (error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Mídia não encontrada ou já foi deletada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao deletar mídia: ' + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Rota para atualizar a ordem das mídias
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user?.role || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { mediaIds } = body;

    if (!Array.isArray(mediaIds)) {
      return NextResponse.json(
        { error: 'Lista de IDs inválida' },
        { status: 400 }
      );
    }

    // Atualiza a ordem das mídias usando uma transação
    await prisma.$transaction(async (tx) => {
      // Verifica se todas as mídias pertencem ao barco
      const medias = await tx.media.findMany({
        where: {
          id: { in: mediaIds },
          boatId: params.id
        }
      });

      if (medias.length !== mediaIds.length) {
        throw new Error('Algumas mídias não foram encontradas ou não pertencem a este barco');
      }

      // Atualiza a ordem de cada mídia
      for (let i = 0; i < mediaIds.length; i++) {
        await tx.media.update({
          where: { id: mediaIds[i] },
          data: { order: i }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating media order:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar ordem das mídias: ' + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
