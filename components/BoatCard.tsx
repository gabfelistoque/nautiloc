'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BoatCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  capacity: number;
  location: string;
  price: number;
  rating: number;
}

export default function BoatCard({
  id,
  name,
  description,
  imageUrl,
  capacity,
  location,
  price,
  rating,
}: BoatCardProps) {
  return (
    <Link href={`/barcos/${id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-48">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <div className="flex items-center text-yellow-500">
              <span className="mr-1">★</span>
              <span className="text-gray-600">{rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <span className="flex items-center mr-4">
              <span className="mr-1">👥</span>
              {capacity} pessoas
            </span>
            <span className="flex items-center">
              <span className="mr-1">📍</span>
              {location}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-blue-600">
                R$ {price?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
              </span>
              <span className="text-gray-500 text-sm">/dia</span>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Ver detalhes
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
