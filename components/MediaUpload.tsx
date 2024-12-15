'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface Media {
  url: string;
  type: string;
}

export interface MediaUploadProps {
  media: Media[];
  onMediaChange: (newMedia: Media[]) => void;
}

export default function MediaUpload({ media, onMediaChange }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Faz o upload das imagens para o servidor
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer upload das imagens');
      }

      const uploadedFiles = await response.json();
      const newMedia = uploadedFiles.map((file: any) => ({
        url: file.url,
        type: 'IMAGE',
      }));

      onMediaChange([...media, ...newMedia]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  }, [media, onMediaChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
  });

  const removeMedia = (index: number) => {
    const newMedia = [...media];
    newMedia.splice(index, 1);
    onMediaChange(newMedia);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="text-gray-500">Carregando...</div>
        ) : isDragActive ? (
          <div className="text-blue-500">Solte as imagens aqui...</div>
        ) : (
          <div className="text-gray-500">
            Arraste e solte imagens aqui, ou clique para selecionar
          </div>
        )}
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={item.url}
                alt={`Media ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded-lg object-cover"
              />
              <button
                onClick={() => removeMedia(index)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
              >
                <XMarkIcon className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
