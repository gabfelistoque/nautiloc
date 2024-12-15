import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

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

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const mediaType = formData.get('type') as string;

    const boat = await prisma.boat.findUnique({
      where: { id: params.id },
    });

    if (!boat) {
      return NextResponse.json(
        { error: 'Barco não encontrado' },
        { status: 404 }
      );
    }

    const mediaPromises = files.map(async (file) => {
      // Upload para o Cloudinary
      const result = await uploadToCloudinary(file);
      const cloudinaryResult = result as any;

      return prisma.media.create({
        data: {
          url: cloudinaryResult.secure_url,
          type: mediaType,
          publicId: cloudinaryResult.public_id,
          boat: {
            connect: {
              id: params.id
            }
          }
        }
      });
    });

    const media = await Promise.all(mediaPromises);

    return NextResponse.json(media);
  } catch (error) {
    console.error("[MEDIA_CREATE]", error);
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

    const { mediaId } = await request.json();

    const media = await prisma.media.findFirst({
      where: {
        id: mediaId,
        boatId: params.id,
      },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    // Deleta do Cloudinary
    if (media.publicId) {
      await deleteFromCloudinary(media.publicId);
    }

    await prisma.media.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MEDIA_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { mediaOrder } = await request.json();

    // Update each media item's order
    for (const item of mediaOrder) {
      await prisma.media.update({
        where: { id: item.id },
        data: { order: item.order }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MEDIA_REORDER]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
