'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { v2 as cloudinary } from 'cloudinary';

interface MediaUploaderProps {
  onMediaAdd: (media: { url: string; type: 'IMAGE' | 'VIDEO' }) => void;
  onMediaRemove: (mediaId: string) => void;
  existingMedia: Array<{ id: string; url: string; type: 'IMAGE' | 'VIDEO' }>;
}

export default function MediaUploader({
  onMediaAdd,
  onMediaRemove,
  existingMedia,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);
      setUploadProgress(0);

      for (const file of acceptedFiles) {
        try {
          // Criar FormData para upload
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'boat-rental');

          // Iniciar upload
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!response.ok) throw new Error('Upload failed');

          const data = await response.json();

          // Determinar o tipo de mídia
          const mediaType = file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';

          // Adicionar a nova mídia
          onMediaAdd({
            url: data.secure_url,
            type: mediaType,
          });

          setUploadProgress(100);
        } catch (error) {
          console.error('Error uploading file:', error);
          // Adicione aqui uma notificação de erro para o usuário
        }
      }

      setIsUploading(false);
      setUploadProgress(0);
    },
    [onMediaAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg'],
    },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="flex justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div className="text-gray-600">
            {isDragActive ? (
              <p>Solte os arquivos aqui...</p>
            ) : (
              <p>
                Arraste e solte imagens ou vídeos aqui, ou clique para selecionar
                arquivos
              </p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Suporta imagens (JPG, PNG, GIF) e vídeos (MP4, WebM, OGG)
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {existingMedia.map((media, index) => (
          <div
            key={media.id}
            className="relative group rounded-lg overflow-hidden bg-gray-100"
          >
            {media.type === 'IMAGE' ? (
              <div className="relative aspect-video">
                <Image
                  src={media.url}
                  alt={`Mídia ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="relative aspect-video">
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  controls
                />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
              <button
                onClick={() => onMediaRemove(media.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
