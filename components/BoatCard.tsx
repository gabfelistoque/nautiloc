'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, MapPin, Star, Heart } from 'lucide-react';

interface BoatCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
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
  capacity,
  location,
  price,
  rating,
  category,
}: BoatCardProps) {
  return (
    <Link href={`/boats/${id}`} className="group">
      <div className="rounded-xl overflow-hidden card-shadow hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col w-full">
        <div className="relative h-52">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium tracking-wide shadow-lg">
            {category}
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3 className="text-lg font-semibold flex-shrink">{name}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-400" strokeWidth={1.5} fill="currentColor" />
                <span className="text-gray-700 ml-1 text-sm font-medium">{rating}</span>
              </div>
              <button className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
                <Heart className="w-5 h-5 text-red-400 hover:text-red-500 transition-colors" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center text-gray-500 text-sm gap-4 mb-4">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              {capacity} pessoas
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              {location}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">{description}</p>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-blue-600">
                R$ {price?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
              </span>
              <span className="text-gray-500 text-sm -mt-1">por dia</span>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg">
              Ver detalhes
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
