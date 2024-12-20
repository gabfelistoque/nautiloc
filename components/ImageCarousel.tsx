'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  overlay?: React.ReactNode;
  className?: string;
}

export default function ImageCarousel({ 
  images, 
  alt,
  aspectRatio = 'square',
  overlay,
  className = ''
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [isLoading, setIsLoading] = useState(true);

  // Preload das próximas imagens
  useEffect(() => {
    const preloadImages = () => {
      const nextIndex = (currentIndex + 1) % images.length;
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      
      [nextIndex, prevIndex].forEach(index => {
        if (!loadedImages.has(index)) {
          const img = document.createElement('img');
          img.src = images[index];
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
          };
        }
      });
    };

    preloadImages();
  }, [currentIndex, images, loadedImages]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setIsLoading(true);
    setCurrentIndex((prevIndex) => {
      let newIndex = prevIndex + newDirection;
      if (newIndex >= images.length) newIndex = 0;
      if (newIndex < 0) newIndex = images.length - 1;
      return newIndex;
    });
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  };

  if (!images.length) return null;

  return (
    <div className={`relative group overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}>
      {/* Background com blur */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px)',
          transform: 'scale(1.1)',
          opacity: 0.5
        }}
      />

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={images[currentIndex]}
            alt={`${alt} - ${currentIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-opacity duration-300 ${
              loadedImages.has(currentIndex) ? 'opacity-100' : 'opacity-0'
            }`}
            priority={currentIndex === 0}
            onLoadingComplete={() => {
              setLoadedImages(prev => new Set([...prev, currentIndex]));
              setIsLoading(false);
            }}
          />

          {/* Skeleton loader */}
          {!loadedImages.has(currentIndex) && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navegação */}
      {images.length > 1 && (
        <>
          {/* Botões de navegação */}
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-20"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              paginate(-1);
            }}
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-20"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              paginate(1);
            }}
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-800" />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white w-3' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Overlay customizado */}
      {overlay}
    </div>
  );
}
