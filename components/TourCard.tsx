import Image from 'next/image';
import { Clock, Users, MapPin, Star, Heart, ArrowRight } from 'lucide-react';

interface TourCardProps {
  id?: string;
  title: string;
  duration: string;
  rating: number;
  capacity: number;
  location: string;
  description: string;
  price: number;
  imageUrl: string;
  loading?: boolean;
}

export default function TourCard({
  title,
  duration,
  rating,
  capacity,
  location,
  description,
  price,
  imageUrl,
  loading = false,
}: TourCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden card-shadow hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col w-full animate-pulse">
        {/* Image Skeleton */}
        <div className="relative h-48 bg-gray-200" />

        <div className="p-6 flex flex-col flex-1">
          {/* Title and Rating Skeleton */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-8 w-16 bg-gray-200 rounded-full" />
              <div className="h-8 w-8 bg-gray-200 rounded-full" />
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="h-5 bg-gray-200 rounded w-24" />
            <div className="h-5 bg-gray-200 rounded w-24" />
          </div>

          {/* Description Skeleton */}
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />

          {/* Price Skeleton */}
          <div className="flex justify-between items-center mt-4">
            <div className="h-6 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden card-shadow hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col w-full">
      <div className="relative h-48">
        <Image
          src={imageUrl}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          className="transform hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1.5 shadow-lg z-10">
          <Clock className="w-4 h-4" strokeWidth={1.5} />
          {duration}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="text-lg font-semibold mb-0 flex-shrink line-clamp-2">{title}</h3>
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
        <p className="text-gray-600 text-sm flex-1 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-blue-600 font-semibold flex items-center gap-1">
            A partir de R$ {price}
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </div>
  );
}
