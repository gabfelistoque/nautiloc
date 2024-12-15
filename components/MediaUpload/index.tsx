'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface MediaUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export default function MediaUpload({
  onUpload,
  accept = 'image/*,video/*',
  multiple = true,
  className = '',
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
    onUpload(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
        />

        <div className="space-y-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 mx-auto text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>

          <div className="text-sm text-gray-600">
            <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
          </div>
          <p className="text-xs text-gray-500">Imagens e vídeos</p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map(({ preview, file }, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
              {file.type.startsWith('video/') ? (
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseOut={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.pause();
                    video.currentTime = 0;
                  }}
                />
              ) : (
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
