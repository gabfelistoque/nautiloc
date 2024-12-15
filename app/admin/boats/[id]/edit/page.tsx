'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import MediaUpload from '@/components/MediaUpload';
import { 
  WifiIcon, 
  MusicalNoteIcon, 
  TvIcon, 
  AcademicCapIcon 
} from '@heroicons/react/24/outline';

interface Boat {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
  capacity: number;
  length: number;
  features: string[];
  images: string[];
}

export default function EditBoat({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [boat, setBoat] = useState<Boat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/login');
        return;
      }
    };

    const fetchBoat = async () => {
      try {
        const response = await fetch(`/api/admin/boats/${params.id}`);
        if (!response.ok) {
          throw new Error('Falha ao carregar dados do barco');
        }
        const data = await response.json();
        setBoat(data);
      } catch (err) {
        setError('Erro ao carregar dados do barco');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchBoat();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boat) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/boats/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(boat),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar barco');
      }

      router.push('/admin/boats');
    } catch (err) {
      setError('Erro ao atualizar barco');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!boat) {
    return <div>Barco não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Editar Barco
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Atualize as informações do barco.
              </p>
            </div>
          </div>

          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={boat.name}
                      onChange={(e) => setBoat({ ...boat, name: e.target.value })}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={boat.description}
                      onChange={(e) => setBoat({ ...boat, description: e.target.value })}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700">
                        Preço por Dia
                      </label>
                      <input
                        type="number"
                        name="pricePerDay"
                        id="pricePerDay"
                        value={boat.pricePerDay}
                        onChange={(e) => setBoat({ ...boat, pricePerDay: Number(e.target.value) })}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                        Capacidade
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        id="capacity"
                        value={boat.capacity}
                        onChange={(e) => setBoat({ ...boat, capacity: Number(e.target.value) })}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="length" className="block text-sm font-medium text-gray-700">
                      Comprimento (pés)
                    </label>
                    <input
                      type="number"
                      name="length"
                      id="length"
                      value={boat.length}
                      onChange={(e) => setBoat({ ...boat, length: Number(e.target.value) })}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Características
                    </label>
                    <div className="mt-4 space-y-4">
                      {['WiFi', 'Som', 'TV', 'Instrutor'].map((feature, index) => (
                        <div key={feature} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`feature-${index}`}
                              name={`feature-${index}`}
                              type="checkbox"
                              checked={boat.features.includes(feature)}
                              onChange={(e) => {
                                const newFeatures = e.target.checked
                                  ? [...boat.features, feature]
                                  : boat.features.filter(f => f !== feature);
                                setBoat({ ...boat, features: newFeatures });
                              }}
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={`feature-${index}`} className="font-medium text-gray-700">
                              {feature}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Imagens
                    </label>
                    <MediaUpload
                      onUpload={(url: string) => setBoat({ ...boat, images: [...boat.images, url] })}
                    />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {boat.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Imagem ${index + 1} do barco`}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...boat.images];
                              newImages.splice(index, 1);
                              setBoat({ ...boat, images: newImages });
                            }}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
