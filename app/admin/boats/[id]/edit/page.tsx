'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MediaUpload from '@/components/MediaUpload';
import { 
  WifiIcon, 
  MusicalNoteIcon, 
  LifebuoyIcon,
  SunIcon,
  BeakerIcon,
  HomeIcon,
  FireIcon,
  MapPinIcon,
  SignalIcon,
  FilmIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

// Lista de categorias disponíveis
const boatCategories = [
  'Lancha',
  'Veleiro',
  'Iate',
  'Catamarã',
  'Jet Ski',
  'Barco de Pesca',
];

// Lista de amenidades comuns com seus ícones
const commonAmenities = [
  { name: 'Wi-Fi a bordo', icon: 'wifi' },
  { name: 'Ar Condicionado', icon: 'wind' },
  { name: 'Chuveiro de água doce', icon: 'shower' },
  { name: 'Microondas', icon: 'kitchen' },
  { name: 'Som', icon: 'music' },
  { name: 'TV', icon: 'tv' },
  { name: 'Cooler', icon: 'cooler' },
  { name: 'Área de Sol', icon: 'sun' },
];

// Mapa de ícones para componentes
const iconMap: { [key: string]: any } = {
  wifi: WifiIcon,
  wind: SignalIcon,
  shower: LifebuoyIcon,
  kitchen: BeakerIcon,
  music: MusicalNoteIcon,
  tv: FilmIcon,
  cooler: BeakerIcon,
  sun: SunIcon,
};

interface BoatFormData {
  name: string;
  description: string;
  imageUrl: string;
  capacity: number;
  location: string;
  pricePerDay: number;
  length: number;
  year: number;
  category: string;
  amenities: Array<{
    name: string;
    icon: string;
  }>;
}

export default function EditBoatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BoatFormData>({
    name: '',
    description: '',
    imageUrl: '',
    capacity: 0,
    location: '',
    pricePerDay: 0,
    length: 0,
    year: new Date().getFullYear(),
    category: boatCategories[0],
    amenities: []
  });

  useEffect(() => {
    const fetchBoat = async () => {
      const response = await fetch(`/api/barcos/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        // Mapeia as amenidades para incluir os ícones corretos
        const mappedAmenities = data.amenities.map((amenity: any) => {
          const foundAmenity = commonAmenities.find(a => a.name === amenity.name);
          return {
            name: foundAmenity?.name || amenity.name,
            icon: foundAmenity?.icon || 'wifi'
          };
        });

        setFormData({
          ...data,
          amenities: mappedAmenities,
        });
      }
    };
    fetchBoat();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const dataToSend = {
        ...formData,
        amenities: formData.amenities.map(amenity => ({
          name: amenity.name,
          icon: amenity.icon || 'wifi'
        }))
      };

      const response = await fetch(`/api/barcos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to update boat');
      }

      router.push('/admin/boats');
    } catch (error) {
      setError('Error updating boat');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
      formData.append('type', file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE');
    });

    try {
      const response = await fetch(`/api/barcos/${params.id}/media`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload media');
      }

      // Atualiza a galeria
      router.refresh();
    } catch (error) {
      console.error('Error uploading media:', error);
      setError('Error uploading media');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Editar Barco</h3>
              <p className="mt-1 text-sm text-gray-600">
                Atualize as informações do barco.
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  {/* Campos do formulário */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      URL da Imagem Principal
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Capacidade
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Preço por Dia
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  {/* Detalhes do Barco */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Comprimento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Comprimento (metros)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={formData.length}
                          onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) })}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                          min="0"
                          step="0.1"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">m</span>
                        </div>
                      </div>
                    </div>

                    {/* Ano */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ano
                      </label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        min="1900"
                        max={new Date().getFullYear()}
                        required
                      />
                    </div>

                    {/* Categoria */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Categoria
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      >
                        {boatCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Amenidades */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenidades
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {commonAmenities.map((amenity) => {
                        return (
                          <div key={amenity.name} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              if (formData.amenities.some((a) => a.name === amenity.name)) {
                                setFormData({
                                  ...formData,
                                  amenities: formData.amenities.filter((a) => a.name !== amenity.name),
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  amenities: [...formData.amenities, amenity],
                                });
                              }
                            }}>
                            <input
                              type="checkbox"
                              checked={formData.amenities.some((a) => a.name === amenity.name)}
                              onChange={() => {}} // Controlado pelo onClick do div pai
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            {iconMap[amenity.icon] && <iconMap[amenity.icon] className="h-5 w-5 text-gray-500" />}
                            <span className="text-sm text-gray-700">{amenity.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upload de Mídia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adicionar Imagens/Vídeos
                    </label>
                    <MediaUpload onUpload={handleMediaUpload} />
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
