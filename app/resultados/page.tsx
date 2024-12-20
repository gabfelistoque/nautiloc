'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BoatCard from '@/components/BoatCard';
import SearchForm from '@/components/SearchForm';

interface Boat {
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

export default function ResultsPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        const response = await fetch(`/api/search${searchParams ? `?${searchParams.toString()}` : ''}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar barcos');
        }
        const data = await response.json();
        setBoats(data);
      } catch (error) {
        console.error('Error fetching boats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoats();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="hidden md:block relative overflow-hidden">
        <div className="absolute inset-0">
          <video
            src="https://res.cloudinary.com/gaburo/video/upload/v1734630847/fkmfzzfg4esckvefofpt.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="relative bg-blue-600/0 py-8">
          <div className="container mx-auto px-4">
            <SearchForm />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-20 md:pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {boats.length} {boats.length === 1 ? 'barco encontrado' : 'barcos encontrados'}
          </h1>
        </div>

        {boats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boats.map((boat) => (
              <BoatCard
                key={boat.id}
                id={boat.id}
                name={boat.name}
                description={boat.description}
                imageUrl={boat.imageUrl}
                media={boat.media}
                capacity={boat.capacity}
                location={boat.location}
                price={boat.price}
                rating={boat.rating}
                category={boat.category || 'LANCHA'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-600">
              Nenhum barco encontrado com os critérios selecionados.
            </h2>
            <p className="mt-2 text-gray-500">
              Tente ajustar seus filtros de busca.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
