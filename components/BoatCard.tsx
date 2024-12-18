'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UsersIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/solid';

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
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{name}</h3>
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-700 ml-1 text-sm font-medium">{rating}</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{description}</p>
          <div className="flex items-center text-gray-500 text-sm space-x-4 mb-4 pb-4 border-b border-gray-100">
            <span className="flex items-center">
              <UsersIcon className="w-4 h-4 mr-1.5 text-gray-400" />
              <span className="font-medium text-gray-600">{capacity} pessoas</span>
            </span>
            <span className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400" />
              <span className="font-medium text-gray-600">{location}</span>
            </span>
          </div>
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
