'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface MediaUploadProps {
  onUpload: (url: string) => void;
}

export default function MediaUpload({ onUpload }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        onUpload(data.url);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
        isDragActive ? 'border-indigo-500' : ''
      }`}
    >
      <div className="space-y-1 text-center">
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="text-sm text-gray-600">Uploading...</div>
        ) : (
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Solte os arquivos aqui ...</p>
            ) : (
              <p>
                Arraste e solte arquivos aqui, ou clique para selecionar arquivos
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
