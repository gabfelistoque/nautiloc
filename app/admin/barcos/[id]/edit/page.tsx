'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MediaUpload from './components/MediaUpload';
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
  CloudIcon,
  ShieldCheckIcon,
  HomeModernIcon,
  ComputerDesktopIcon,
  XMarkIcon,
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

interface Media {
  id?: string;
  url: string;
  type: string;
  publicId?: string;
  boatId?: string;
}

interface BoatFormData {
  name: string;
  description: string;
  imageUrl: string;
  capacity: number;
  location: string;
  pricePerDay: number;
  available: boolean;
  media: Media[];
  length: number;
  year: number;
  category: string;
  amenities: Array<{
    id?: string;
    name: string;
    iconName?: string;
  }>;
}

export default function EditBoatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<BoatFormData>({
    name: '',
    description: '',
    imageUrl: '',
    capacity: 0,
    location: '',
    pricePerDay: 0,
    available: true,
    media: [],
    length: 0,
    year: new Date().getFullYear(),
    category: boatCategories[0],
    amenities: [],
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState<Array<{
    id: string;
    name: string;
    iconName: string;
  }>>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch('/api/amenities');
        if (!response.ok) {
          throw new Error('Erro ao carregar amenidades');
        }
        const data = await response.json();
        setAvailableAmenities(data);
      } catch (error) {
        console.error('Error fetching amenities:', error);
      }
    };

    fetchAmenities();
  }, []);

  useEffect(() => {
    const fetchBoat = async () => {
      try {
        const response = await fetch(`/api/barcos/${params.id}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do barco');
        }
        const data = await response.json();
        setFormData({
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          capacity: data.capacity,
          location: data.location,
          pricePerDay: data.pricePerDay,
          available: data.available,
          media: data.media || [],
          length: data.length || 0,
          year: data.year || new Date().getFullYear(),
          category: data.category || boatCategories[0],
          amenities: data.amenities || [],
        });
      } catch (error: any) {
        console.error('Error fetching boat:', error);
        setError(error.message || 'Erro ao carregar dados do barco');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoat();
  }, [params.id]);

  const handleMainImageUpload = async (file: File) => {
    setIsLoading(true);
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
      setFormData((prev: any) => ({
        ...prev,
        imageUrl: data.secure_url,
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Erro ao fazer upload da imagem. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
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
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formattedData = {
        ...formData,
        pricePerDay: Number(formData.pricePerDay),
        capacity: Number(formData.capacity),
        length: Number(formData.length),
        year: Number(formData.year),
        media: formData.media.map(media => ({
          url: media.url,
          type: media.type,
          publicId: media.publicId,
        })),
        amenities: formData.amenities.map(amenity => {
          const commonAmenity = availableAmenities.find(a => a.name === amenity.name);
          return {
            id: commonAmenity?.id || amenity.id,
          };
        }),
      };

      console.log('Enviando dados:', formattedData);
      console.log('Mídias sendo enviadas:', formattedData.media);
      console.log('Amenidades sendo enviadas:', formattedData.amenities);

      const response = await fetch(`/api/barcos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta:', errorData);
        throw new Error(errorData.error || 'Erro ao atualizar barco');
      }

      const updatedBoat = await response.json();
      console.log('Barco atualizado:', updatedBoat);
      console.log('Mídias retornadas:', updatedBoat.media);
      console.log('Amenidades retornadas:', updatedBoat.amenities);

      router.push('/admin/barcos');
    } catch (error: any) {
      console.error('Error updating boat:', error);
      setError(error.message || 'Erro ao atualizar barco');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = async (uploadedMedia: Media[]) => {
    try {
      console.log('Iniciando upload de mídia:', uploadedMedia);
      // Adiciona cada mídia individualmente usando a API
      for (const media of uploadedMedia) {
        console.log('Enviando mídia para a API:', media);
        const response = await fetch(`/api/barcos/${params.id}/media`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: media.url,
            type: media.type,
            publicId: media.publicId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erro na resposta da API:', errorData);
          throw new Error(errorData.error || 'Erro ao adicionar mídia');
        }

        // Atualiza o estado com a nova mídia
        const addedMedia = await response.json();
        console.log('Mídia adicionada com sucesso:', addedMedia);
        setFormData(prev => ({
          ...prev,
          media: [...prev.media, addedMedia],
        }));
      }
    } catch (error) {
      console.error('Error adding media:', error);
      setError('Erro ao adicionar mídia. Por favor, tente novamente.');
    }
  };

  const handleMediaError = (error: string) => {
    setError(error);
  };

  const handleMediaDelete = async (media: Media) => {
    if (!media.id) {
      setError('ID da mídia não encontrado');
      return;
    }

    try {
      console.log('Tentando deletar mídia:', media);
      const response = await fetch(`/api/barcos/${params.id}/media`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaId: media.id }),
      });

      console.log('Status da resposta:', response.status);
      const responseData = await response.json();
      console.log('Dados da resposta:', responseData);

      if (!response.ok) {
        // Se a mídia não foi encontrada, apenas remove do estado local
        if (response.status === 404) {
          setFormData(prev => ({
            ...prev,
            media: prev.media.filter(m => m.id !== media.id)
          }));
          return;
        }
        throw new Error(responseData.error || 'Erro ao remover mídia');
      }

      // Atualiza o estado local removendo a mídia
      setFormData(prev => ({
        ...prev,
        media: prev.media.filter(m => m.id !== media.id)
      }));

      console.log('Mídia removida com sucesso');
    } catch (error) {
      console.error('Error removing media:', error);
      setError(error instanceof Error ? error.message : 'Erro ao remover mídia. Por favor, tente novamente.');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedItem === null) return;

    const newMedia = [...formData.media];
    const [draggedMedia] = newMedia.splice(draggedItem, 1);
    newMedia.splice(dropIndex, 0, draggedMedia);

    // Atualiza o estado local
    setFormData(prev => ({
      ...prev,
      media: newMedia
    }));

    // Envia a nova ordem para o backend
    try {
      const response = await fetch(`/api/barcos/${params.id}/media`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaIds: newMedia.map(m => m.id)
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao reordenar mídia');
      }
    } catch (error) {
      console.error('Error reordering media:', error);
      setError(error instanceof Error ? error.message : 'Erro ao reordenar mídia');
    } finally {
      setDraggedItem(null);
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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Editar Barco</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Informações Básicas</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Informações principais do barco.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Localização
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Categoria
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                    >
                      {boatCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700">
                      Preço por dia
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">R$</span>
                      </div>
                      <input
                        type="number"
                        name="pricePerDay"
                        id="pricePerDay"
                        value={formData.pricePerDay}
                        onChange={handleChange}
                        className="mt-1 p-3 pl-12 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                      Capacidade
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      id="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="length" className="block text-sm font-medium text-gray-700">
                      Comprimento (metros)
                    </label>
                    <input
                      type="number"
                      name="length"
                      id="length"
                      value={formData.length}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                      Ano
                    </label>
                    <input
                      type="number"
                      name="year"
                      id="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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
                </div>

                <div className="mt-6">
                </div>
              </div>
            </div>
          </div>

          {/* Imagem Principal */}
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
                    formData.imageUrl ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <input {...getMainImageInputProps()} />
                  {formData.imageUrl ? (
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={formData.imageUrl}
                        alt="Imagem principal"
                        fill
                        className="rounded-lg object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

          {/* Amenidades */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Amenidades</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Selecione as amenidades disponíveis no barco.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {availableAmenities.map((amenity) => {
                      const isSelected = formData.amenities.some(a => a.name === amenity.name);
                      
                      return (
                        <div
                          key={amenity.id}
                          className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                            isSelected ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50 border border-gray-200'
                          }`}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              amenities: isSelected
                                ? prev.amenities.filter(a => a.id !== amenity.id)
                                : [...prev.amenities, { 
                                    id: amenity.id, 
                                    name: amenity.name,
                                    iconName: amenity.iconName
                                  }]
                            }));
                          }}
                        >
                          <div className="flex-shrink-0">
                            {(() => {
                              const IconComponent = iconMap[amenity.iconName as keyof typeof iconMap] || WifiIcon;
                              return <IconComponent className={`h-5 w-5 ${isSelected ? 'text-blue-500' : 'text-gray-500'}`} />;
                            })()}
                          </div>
                          <span className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                            {amenity.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Mídia */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Mídia</h3>
            <MediaUpload 
              onUploadComplete={handleMediaUpload} 
              onError={setError}
            />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {formData.media.map((media, index) => (
                <div
                  key={media.id || index}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                >
                  {media.type === 'VIDEO' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={media.url}
                        className="absolute inset-0 w-full h-full object-cover"
                        controls
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={media.url}
                      alt={`Mídia ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMediaDelete(media);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2 text-center">
                    {index + 1} de {formData.media.length}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/admin/barcos')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const iconMap = {
  wifi: WifiIcon,
  safety: ShieldCheckIcon,
  water: BeakerIcon,
  shower: HomeIcon,
  gps: MapPinIcon,
  radio: SignalIcon,
  microwave: HomeModernIcon,
  ac: ComputerDesktopIcon,
  anchor: LifebuoyIcon,
  grill: FireIcon,
  sound: MusicalNoteIcon,
  tv: FilmIcon,
  cooler: BeakerIcon,
  sunarea: SunIcon,
  cover: CloudIcon,
};
