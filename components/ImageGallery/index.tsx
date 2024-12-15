'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';

interface MediaItem {
  readonly url: string;
  readonly type: 'IMAGE' | 'VIDEO';
}

interface ImageGalleryProps {
  media: readonly MediaItem[];
  alt: string;
}

export default function ImageGallery({ media, alt }: ImageGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const renderMediaPreview = (item: MediaItem) => {
    if (item.type === 'VIDEO') {
      return (
        <div className="relative aspect-square">
          <video
            src={item.url}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            muted
            playsInline
            onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
            onMouseOut={(e) => {
              const video = e.target as HTMLVideoElement;
              video.pause();
              video.currentTime = 0;
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-white opacity-80"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z"
              />
            </svg>
          </div>
        </div>
      );
    }

    return (
      <Image
        src={item.url}
        alt={`${alt} - Mídia ${media.indexOf(item) + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        style={{ objectFit: 'cover' }}
        className="rounded-lg"
      />
    );
  };

  const renderSelectedMedia = () => {
    if (!selectedMedia) return null;

    if (selectedMedia.type === 'VIDEO') {
      return (
        <div className="relative aspect-video w-full">
          <video
            src={selectedMedia.url}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full"
          />
        </div>
      );
    }

    return (
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={selectedMedia.url}
          alt={`${alt} - Visualização ampliada`}
          fill
          sizes="100vw"
          style={{ objectFit: 'contain' }}
          className="bg-black"
        />
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-md"
              onClick={() => setSelectedMedia(item)}
            >
              {renderMediaPreview(item)}
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {renderSelectedMedia()}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
