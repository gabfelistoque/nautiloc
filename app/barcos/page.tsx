'use client';

import { useEffect, useState } from 'react';
import { Boat } from '@prisma/client';
import { Ship } from 'lucide-react';
import BoatCard from '@/components/BoatCard';

export default function BoatsPage() {
  const [boats, setBoats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        const response = await fetch('/api/barcos');
        if (!response.ok) {
          throw new Error('Falha ao carregar barcos');
        }
        const data = await response.json();
        setBoats(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao carregar barcos');
      } finally {
        setLoading(false);
      }
    };

    fetchBoats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white -mt-16">
      {/* Hero Section */}
      <div className="hero-section relative h-[40vh] min-h-[300px] flex items-center justify-center text-white overflow-hidden pt-14 md:pt-0">
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
        <div className="relative container mx-auto px-4 z-30">
          <div className="text-center pt-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Encontre o Barco Perfeito
            </h1>
            <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto">
              Explore nossa seleção de barcos de alta qualidade e encontre o parceiro ideal para sua próxima aventura marítima.
            </p>
          </div>
        </div>
      </div>

      {/* Boats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {boats.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum barco disponível no momento</h3>
            <p className="mt-1 text-sm text-gray-500">Tente novamente mais tarde.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                category={boat.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
