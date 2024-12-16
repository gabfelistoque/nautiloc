'use client';

import { useEffect, useState } from 'react';
import { Boat } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { 
  StarIcon, 
  UsersIcon, 
  MapPinIcon, 
  CalendarIcon 
} from '@heroicons/react/24/solid';

export default function BoatsPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        console.log('Iniciando busca de barcos...');
        const response = await fetch('/api/barcos');
        console.log('Resposta da API:', response.status);
        if (!response.ok) {
          throw new Error('Falha ao carregar barcos');
        }
        const data = await response.json();
        console.log('Dados recebidos:', data);
        setBoats(data);
      } catch (error) {
        console.error('Erro detalhado:', error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Encontre o Barco Perfeito
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-3xl">
            Explore nossa seleção de barcos de alta qualidade e encontre o parceiro ideal para sua próxima aventura marítima.
          </p>
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
              <div
                key={boat.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => router.push(`/boats/${boat.id}`)}
              >
                {/* Imagem Principal */}
                <div className="relative h-64">
                  <img
                    src={boat.imageUrl || '/placeholder-boat.jpg'}
                    alt={boat.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full shadow-md">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">{boat.rating}</span>
                    </div>
                  </div>
                  {!boat.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">Indisponível</span>
                    </div>
                  )}
                </div>

                {/* Informações do Barco */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{boat.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{boat.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(Number(boat.price))}
                      </p>
                      <p className="text-sm text-gray-500">por dia</p>
                    </div>
                  </div>

                  {/* Detalhes do Barco */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <UsersIcon className="w-4 h-4 text-gray-400" />
                      <span>Capacidade: {boat.capacity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span>{boat.location}</span>
                    </div>
                  </div>

                  {/* Botão de Reserva */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/boats/${boat.id}`);
                    }}
                    disabled={!boat.available}
                    className={`mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                      ${boat.available 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {boat.available ? (
                      <>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </>
                    ) : (
                      'Indisponível'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
