'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Media {
  id?: string;
  url: string;
  type: string;
  publicId?: string;
  boatId?: string;
}

interface MediaUploadProps {
  onUploadComplete: (media: Media[]) => void;
  onError: (error: string) => void;
}

export default function MediaUpload({ onUploadComplete, onError }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
        formData.append('resource_type', 'auto');

        // Determina o tipo de recurso (video ou image)
        const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
        console.log('Tipo de recurso:', resourceType, 'para arquivo:', file.name);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
        console.log('URL de upload:', uploadUrl);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('Erro no upload para Cloudinary:', error);
          throw new Error(`Erro ao fazer upload do arquivo ${file.name}`);
        }

        const data = await response.json();
        console.log('Resposta do Cloudinary:', data);
        
        const mediaData = {
          url: data.secure_url,
          type: resourceType === 'video' ? 'VIDEO' : 'IMAGE',
          publicId: data.public_id,
        };
        console.log('Dados da mídia:', mediaData);
        
        return mediaData;
      });

      const uploadedMedia = await Promise.all(uploadPromises);
      console.log('Mídias enviadas:', uploadedMedia);
      onUploadComplete(uploadedMedia);
    } catch (error) {
      console.error('Error uploading files:', error);
      onError('Erro ao fazer upload dos arquivos. Por favor, tente novamente.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg'],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
      `}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
          <p className="text-sm text-gray-600">Fazendo upload...</p>
        </div>
      ) : isDragActive ? (
        <p className="text-blue-600">Solte os arquivos aqui...</p>
      ) : (
        <div>
          <p className="text-gray-600 mb-2">
            Arraste e solte imagens ou vídeos aqui, ou clique para selecionar
          </p>
          <p className="text-sm text-gray-500">
            Suporta imagens (PNG, JPG, GIF) e vídeos (MP4, WebM, OGG)
          </p>
        </div>
      )}
    </div>
  );
}
