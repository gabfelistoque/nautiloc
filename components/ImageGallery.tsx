'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Media {
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

interface ImageGalleryProps {
  media: Media[];
  alt: string;
}

export default function ImageGallery({ media, alt }: ImageGalleryProps) {
  const swiperRef = useRef(null);

  return (
    <div className="relative bg-gray-100">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full aspect-[16/9] max-h-[600px]"
      >
        {media.map((item, index) => (
          <SwiperSlide key={index}>
            {item.type === 'IMAGE' ? (
              <div className="relative w-full h-full">
                <img
                  src={item.url}
                  alt={`${alt} - Imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <video
                  src={item.url}
                  controls
                  className="w-full h-full object-cover"
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Miniaturas */}
      <div className="container mx-auto px-4 mt-4">
        <Swiper
          spaceBetween={10}
          slidesPerView="auto"
          className="thumbnails-swiper"
          breakpoints={{
            320: { slidesPerView: 3 },
            480: { slidesPerView: 4 },
            768: { slidesPerView: 5 },
            1024: { slidesPerView: 6 },
          }}
        >
          {media.map((item, index) => (
            <SwiperSlide key={index} className="!w-24 h-16 cursor-pointer">
              {item.type === 'IMAGE' ? (
                <img
                  src={item.url}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-400"
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
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
