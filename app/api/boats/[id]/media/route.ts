import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
          boatId: params.id,
          // Salva o public_id do Cloudinary para poder deletar depois
          publicId: cloudinaryResult.public_id,
        },
      });
    });

    const media = await Promise.all(mediaPromises);

    return NextResponse.json(media);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload das mídias' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    console.error('Erro ao excluir mídia:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir mídia' },
      { status: 500 }
    );
  }
}
