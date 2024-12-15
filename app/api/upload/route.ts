import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files');

    interface UploadedFile {
      url: string;
      type: string;
    }

    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Gera um nome único para o arquivo
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = join(process.cwd(), 'public', 'uploads', fileName);

      // Salva o arquivo no diretório public/uploads
      await writeFile(filePath, buffer);

      // Adiciona a URL do arquivo à lista
      uploadedFiles.push({
        url: `/uploads/${fileName}`,
        type: file.type,
      });
    }

    return NextResponse.json(uploadedFiles);
  } catch (error: any) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload dos arquivos' },
      { status: 500 }
    );
  }
}
