import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

interface UploadedFile {
  url: string;
  type: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return new NextResponse("No files received", { status: 400 });
    }

    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const fileName = `${Date.now()}-${file.name}`;
      const uploadDir = join(process.cwd(), "public", "uploads");
      const filePath = join(uploadDir, fileName);

      // Save file
      await writeFile(filePath, buffer);

      // Add file URL to list
      uploadedFiles.push({
        url: `/uploads/${fileName}`,
        type: file.type,
      });
    }

    return NextResponse.json(uploadedFiles);
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
