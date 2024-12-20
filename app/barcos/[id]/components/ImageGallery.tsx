'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ImageGallerySkeleton from './ImageGallerySkeleton';
import 'swiper/css';
import 'swiper/css/navigation';

interface Media {
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

interface ImageGalleryProps {
  media: Media[];
  alt: string;
}

export default function ImageGallery({ media, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Pré-carrega as imagens
    const preloadImages = async () => {
      setIsLoading(true);
      try {
        await Promise.all(
          media
            .filter(item => item.type === 'IMAGE')
            .map(item => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = item.url;
                img.onload = resolve;
                img.onerror = reject;
              });
            })
        );
      } catch (error) {
        console.error('Erro ao carregar imagens:', error);
      }
      setIsLoading(false);
    };

    preloadImages();
  }, [media]);

  if (isLoading) {
    return <ImageGallerySkeleton />;
  }

  // Reordena a mídia para que a imagem principal fique por último
  const reorderedMedia = [...media].sort((a, b) => {
    // Se for a primeira imagem (principal), move para o final
    if (media.indexOf(a) === 0) return 1;
    if (media.indexOf(b) === 0) return -1;
    return 0;
  });

  const openModal = (index: number) => {
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < reorderedMedia.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const goToPrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const selectedMedia = selectedIndex !== null ? reorderedMedia[selectedIndex] : null;

  return (
    <>
      {/* Container com largura fixa */}
      <div className="relative w-full">
        <Swiper
          modules={[Navigation]}
          slidesPerView={5}
          spaceBetween={8}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          className="relative"
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 8 },
            480: { slidesPerView: 3, spaceBetween: 8 },
            640: { slidesPerView: 4, spaceBetween: 8 },
            768: { slidesPerView: 5, spaceBetween: 8 },
            1024: { slidesPerView: 6, spaceBetween: 8 },
            1280: { slidesPerView: 7, spaceBetween: 8 },
          }}
        >
          {reorderedMedia.map((item, index) => (
            <SwiperSlide key={index}>
              <div 
                onClick={() => openModal(index)}
                className="aspect-square relative cursor-pointer group overflow-hidden rounded-lg bg-gray-100"
              >
                {item.type === 'IMAGE' ? (
                  <img
                    src={item.url}
                    alt={`${alt} - ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center relative group">
                    <div className="absolute inset-0">
                      <video
                        key={item.url}
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        poster={`${item.url.split('/upload/')[0]}/upload/c_fill,h_300,w_300/${item.url.split('/upload/')[1].split('.')[0]}.jpg`}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center transition-opacity duration-300 group-hover:bg-opacity-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                {/* Overlay de hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
              </div>
            </SwiperSlide>
          ))}
          {/* Botões de navegação customizados */}
          <button className="swiper-button-prev after:!content-['prev'] !w-4 !h-4 !bg-white !rounded-full !shadow-lg hover:!bg-gray-50 transition-colors !left-2">
            <span className="sr-only">Anterior</span>
          </button>
          <button className="swiper-button-next after:!content-['next'] !w-4 !h-4 !bg-white !rounded-full !shadow-lg hover:!bg-gray-50 transition-colors !right-2">
            <span className="sr-only">Próximo</span>
          </button>

          <style jsx global>{`
            .swiper-button-next::after,
            .swiper-button-prev::after {
              font-size: 8px !important;
              font-weight: bold;
              margin-top: -1px;
            }
            .swiper-button-prev {
              transform: scale(0.85) !important;
            }
            .swiper-button-next {
              transform: scale(0.85) !important;
            }
          `}</style>
        </Swiper>
      </div>

      {/* Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Botão Fechar */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Botão Anterior */}
            {selectedIndex > 0 && (
              <button
                onClick={goToPrev}
                className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full z-10"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
            )}

            {/* Mídia Selecionada */}
            <div className="w-full h-full flex items-center justify-center">
              {selectedMedia?.type === 'VIDEO' ? (
                <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
                  <video
                    key={selectedMedia.url}
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    className="w-full h-full object-contain"
                    poster={`${selectedMedia.url.split('/upload/')[0]}/upload/c_fill,h_720,w_1280/${selectedMedia.url.split('/upload/')[1].split('.')[0]}.jpg`}
                  />
                </div>
              ) : (
                <img
                  src={selectedMedia?.url}
                  alt={`${alt} - ${selectedIndex + 1}`}
                  className="max-w-[90vw] max-h-[90vh] object-contain"
                />
              )}
            </div>

            {/* Contador de fotos */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full z-10">
              <span className="text-white text-sm">
                {selectedIndex + 1} / {reorderedMedia.length}
              </span>
            </div>

            {/* Botão Próximo */}
            {selectedIndex < reorderedMedia.length - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full z-10"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
