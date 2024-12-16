import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { url, type = "image", publicId } = body;

    if (!url) {
      return new NextResponse("URL is required", { status: 400 });
    }

    // Verificar se o barco existe
    const boat = await prisma.boat.findUnique({
      where: { id: params.id },
    });

    if (!boat) {
      return new NextResponse("Boat not found", { status: 404 });
    }

    // Verificar se o usuário é o dono do barco ou admin
    if (boat.userId !== session.user.id && session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const media = await prisma.media.create({
      data: {
        url,
        type,
        publicId,
        boatId: params.id,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("[MEDIA_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");

    if (!mediaId) {
      return new NextResponse("Media ID is required", { status: 400 });
    }

    // Verificar se a mídia existe e pertence ao barco
    const media = await prisma.media.findFirst({
      where: {
        id: mediaId,
        boatId: params.id,
      },
      include: {
        boat: true,
      },
    });

    if (!media) {
      return new NextResponse("Media not found", { status: 404 });
    }

    // Verificar se o usuário é o dono do barco ou admin
    if (media.boat.userId !== session.user.id && session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.media.delete({
      where: { id: mediaId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[MEDIA_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
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
