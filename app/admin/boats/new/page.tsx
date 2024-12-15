'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiWifi, FiAnchor, FiCoffee, FiMusic, FiSun, FiTv, FiWind } from 'react-icons/fi';
import { GiCooler, GiGrill } from 'react-icons/gi';

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

const initialFormData: BoatFormData = {
  name: '',
  description: '',
  imageUrl: '',
  capacity: 1,
  location: '',
  pricePerDay: 0,
  length: 0,
  year: new Date().getFullYear(),
  category: 'Lancha',
  amenities: [],
};

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
const iconMap: { [key: string]: React.ElementType } = {
  wifi: FiWifi,
  wind: FiWind,
  shower: FiAnchor,
  kitchen: FiCoffee,
  music: FiMusic,
  tv: FiTv,
  cooler: GiCooler,
  sun: FiSun,
};

export default function NewBoatPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BoatFormData>(initialFormData);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Garantir que todas as amenidades tenham um ícone
      const dataToSend = {
        ...formData,
        amenities: formData.amenities.map(amenity => ({
          name: amenity.name,
          icon: amenity.icon || 'wifi' // Fallback para um ícone padrão
        }))
      };

      console.log('Sending data:', dataToSend);
      const response = await fetch('/api/barcos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create boat');
      }

      router.push('/admin/boats');
    } catch (error) {
      setError('Error creating boat');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Novo Barco</h3>
            <p className="mt-1 text-sm text-gray-600">
              Adicione um novo barco à frota.
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

                {/* URL da imagem */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    URL da Imagem
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Nome */}
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

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Localização */}
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
                      const Icon = iconMap[amenity.icon];
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
                                amenities: [...formData.amenities, {
                                  name: amenity.name,
                                  icon: amenity.icon
                                }],
                              });
                            }
                          }}>
                          <input
                            type="checkbox"
                            checked={formData.amenities.some((a) => a.name === amenity.name)}
                            onChange={() => {}} // Controlado pelo onClick do div pai
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <Icon className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-700">{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Capacidade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Capacidade
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      min="1"
                      required
                    />
                  </div>

                  {/* Preço por dia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Preço por dia
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">R$</span>
                      </div>
                      <input
                        type="number"
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => router.push('/admin/boats')}
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
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
  );
}
