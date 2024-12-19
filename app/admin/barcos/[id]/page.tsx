'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MediaUploader from '@/components/MediaUploader';
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
import { useDropzone } from 'react-dropzone';

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
  { name: 'Wi-Fi', icon: WifiIcon },
  { name: 'Ar Condicionado', icon: SignalIcon },
  { name: 'Âncora', icon: LifebuoyIcon },
  { name: 'Café', icon: BeakerIcon },
  { name: 'Churrasqueira', icon: FireIcon },
  { name: 'Som', icon: MusicalNoteIcon },
  { name: 'TV', icon: FilmIcon },
  { name: 'Cooler', icon: BeakerIcon },
  { name: 'Área de Sol', icon: SunIcon },
  { name: 'Toldo', icon: CloudIcon },
];

interface BoatMedia {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

interface Boat {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  capacity: number;
  location: string;
  pricePerDay: number;
  available: boolean;
  media: BoatMedia[];
  length: number;
  year: number;
  category: string;
  amenities: Array<{
    name: string;
    icon: any;
  }>;
}

export default function EditBoatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<Boat>({
    id: '',
    name: '',
    description: '',
    imageUrl: '',
    capacity: 1,
    location: '',
    pricePerDay: 0,
    available: true,
    media: [],
    length: 0,
    year: new Date().getFullYear(),
    category: boatCategories[0],
    amenities: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBoat = async () => {
      try {
        console.log('Buscando barco:', params.id);
        const response = await fetch(`/api/barcos/${params.id}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.error || 'Erro ao carregar dados do barco');
        }
        
        const data = await response.json();
        console.log('Dados do barco:', data);
        
        // Mapeia as amenidades para incluir os componentes de ícone corretos
        const mappedAmenities = data.amenities.map((amenity: any) => {
          const foundAmenity = commonAmenities.find(a => a.name === amenity.name);
          return foundAmenity || { name: amenity.name, icon: WifiIcon }; // Fallback icon
        });

        setFormData({
          ...data,
          amenities: mappedAmenities,
          length: data.length || 0,
          year: data.year || new Date().getFullYear(),
          category: data.category || boatCategories[0],
        });
        setError('');
      } catch (error) {
        console.error('Error fetching boat:', error);
        setError('Erro ao carregar dados do barco');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoat();
  }, [params.id]);

  const handleMainImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      console.log('Nova imageUrl:', data.secure_url); // Log da nova URL
      
      setFormData((prev) => {
        const updated = {
          ...prev,
          imageUrl: data.secure_url,
        };
        console.log('FormData atualizado:', updated); // Log do formData atualizado
        return updated;
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Erro ao fazer upload da imagem. Por favor, tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps: getMainImageRootProps, getInputProps: getMainImageInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await handleMainImageUpload(acceptedFiles[0]);
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value, type } = e.target;
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log('Enviando dados:', {
        ...formData,
        imageUrl: formData.imageUrl, // Garante que a imageUrl seja enviada
        pricePerDay: Number(formData.pricePerDay),
        capacity: Number(formData.capacity),
        length: Number(formData.length),
        year: Number(formData.year),
        amenities: formData.amenities.map(amenity => ({
          name: amenity.name,
          icon: amenity.icon.name,
        })),
      });

      const response = await fetch(`/api/barcos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: formData.imageUrl, // Garante que a imageUrl seja enviada
          pricePerDay: Number(formData.pricePerDay),
          capacity: Number(formData.capacity),
          length: Number(formData.length),
          year: Number(formData.year),
          amenities: formData.amenities.map(amenity => ({
            name: amenity.name,
            icon: amenity.icon.name,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar barco');
      }

      router.push('/admin/barcos');
      router.refresh();
    } catch (error) {
      console.error('Error updating boat:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar barco');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Barco não encontrado</div>
      </div>
    );
  }

  return (
    <div className="py-6">
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
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nome
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Galeria de Mídia</h3>
                    <MediaUploader
                      existingMedia={formData.media || []}
                      onMediaAdd={(media) => {
                        setFormData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            media: [...(prev.media || []), { ...media, id: Date.now().toString() }]
                          } as Boat;
                        });
                      }}
                      onMediaRemove={(mediaId) => {
                        setFormData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            media: prev.media.filter((m) => m.id !== mediaId)
                          } as Boat;
                        });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Capacidade */}
                    <div>
                      <label
                        htmlFor="capacity"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Capacidade
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        id="capacity"
                        required
                        min="1"
                        value={formData.capacity}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Localização */}
                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Localização
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Preço por Dia */}
                    <div>
                      <label
                        htmlFor="pricePerDay"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Preço por Dia
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">R$</span>
                        </div>
                        <input
                          type="number"
                          name="pricePerDay"
                          id="pricePerDay"
                          required
                          min="0"
                          step="0.01"
                          value={formData.pricePerDay}
                          onChange={handleChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="available"
                      id="available"
                      checked={formData.available}
                      onChange={(e) =>
                        setFormData((prev) =>
                          prev ? { ...prev, available: e.target.checked } : prev
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="available"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Disponível para Aluguel
                    </label>
                  </div>

                  {/* Detalhes do Barco */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Comprimento */}
                    <div>
                      <label
                        htmlFor="length"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Comprimento (metros)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          name="length"
                          id="length"
                          required
                          min="0"
                          step="0.1"
                          value={formData.length}
                          onChange={handleChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">m</span>
                        </div>
                      </div>
                    </div>

                    {/* Ano */}
                    <div>
                      <label
                        htmlFor="year"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Ano
                      </label>
                      <input
                        type="number"
                        name="year"
                        id="year"
                        required
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.year}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Categoria */}
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Categoria
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Amenidades</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {commonAmenities.map((amenity) => (
                        <div
                          key={amenity.name}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            id={`amenity-${amenity.name}`}
                            checked={formData.amenities?.some((a) => a.name === amenity.name) ?? false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  amenities: [...(prev.amenities || []), amenity],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  amenities: prev.amenities?.filter((a) => a.name !== amenity.name) || [],
                                }));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`amenity-${amenity.name}`}
                            className="flex items-center cursor-pointer"
                          >
                            <amenity.icon className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700">{amenity.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
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
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Imagem Principal</h3>
            <p className="mt-1 text-sm text-gray-500">
              Esta será a imagem exibida no card do barco.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div
              {...getMainImageRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors hover:border-blue-400 ${
                isUploading ? 'bg-gray-50' : formData.imageUrl ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              <input {...getMainImageInputProps()} />
              {isUploading ? (
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Fazendo upload...</p>
                </div>
              ) : formData.imageUrl ? (
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={formData.imageUrl}
                    alt="Imagem principal"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                    <p className="text-white text-sm">Clique para trocar a imagem</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">
                    Arraste e solte uma imagem aqui, ou clique para selecionar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
