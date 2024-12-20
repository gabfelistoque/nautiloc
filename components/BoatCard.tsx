'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, MapPin, Star, Heart } from 'lucide-react';
import ImageCarousel from './ImageCarousel';

interface BoatCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  media?: { url: string; type: string }[];
  capacity: number;
  location: string;
  price: number;
  rating: number;
  category: string;
}

export default function BoatCard({
  id,
  name,
  description,
  imageUrl = '/images/default-boat.jpg',
  media = [],
  capacity,
  location,
  price,
  rating,
  category,
}: BoatCardProps) {
  // Combina a imagem principal com a mídia adicional
  const allImages = [
    imageUrl,
    ...media
      .filter(m => m.type === 'IMAGE')
      .map(m => m.url)
  ];

  return (
    <Link href={`/barcos/${id}`} className="group">
      <div className="rounded-xl overflow-hidden card-shadow hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col w-full">
        <ImageCarousel
          images={allImages}
          alt={name}
          aspectRatio="video"
          className="h-52"
        />
        <div className="p-5 flex flex-col flex-1">
          {/* Nome e Rating */}
          <div className="flex items-center justify-between mb-2 gap-2">
            <h3 className="text-lg font-semibold flex-shrink">{name}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-400" strokeWidth={1.5} fill="currentColor" />
                <span className="text-gray-700 ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
              </div>
              <button className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
                <Heart className="w-5 h-5 text-red-400 hover:text-red-500 transition-colors" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Capacidade e Localização */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" strokeWidth={1.5} />
              <span>{capacity} pessoas</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" strokeWidth={1.5} />
              <span>{location}</span>
            </div>
          </div>

          {/* Descrição */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-grow">{description}</p>

          {/* Preço e Botão */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-blue-600">
                R$ {price.toLocaleString('pt-BR')}
              </span>
              <span className="text-gray-500 text-sm">/dia</span>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/barcos/${id}`;
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Ver detalhes
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
