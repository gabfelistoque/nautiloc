'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MediaUploader from '@/components/MediaUploader';
import { useDropzone } from 'react-dropzone';
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
} from '@heroicons/react/24/outline';

interface BoatMedia {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

interface NewBoat {
  name: string;
  description: string;
  imageUrl: string;
  capacity: number;
  location: string;
  price: number;
  available: boolean;
  media: BoatMedia[];
  length: number;
  year: number;
  category: string;
  amenities: Array<{
    id: string;
    name: string;
    iconName: string;
  }>;
}

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
  { id: 'wifi', name: 'Wi-Fi a bordo', iconName: 'wifi' },
  { id: 'safety', name: 'Equipamentos de segurança', iconName: 'safety' },
  { id: 'water', name: 'Água potável', iconName: 'water' },
  { id: 'shower', name: 'Chuveiro de água doce', iconName: 'shower' },
  { id: 'gps', name: 'GPS', iconName: 'gps' },
  { id: 'radio', name: 'Rádio VHF', iconName: 'radio' },
  { id: 'microwave', name: 'Microondas', iconName: 'microwave' },
  { id: 'ac', name: 'Ar Condicionado', iconName: 'ac' },
  { id: 'anchor', name: 'Âncora', iconName: 'anchor' },
  { id: 'grill', name: 'Churrasqueira', iconName: 'grill' },
  { id: 'sound', name: 'Som', iconName: 'sound' },
  { id: 'tv', name: 'TV', iconName: 'tv' },
  { id: 'cooler', name: 'Cooler', iconName: 'cooler' },
  { id: 'sunarea', name: 'Área de Sol', iconName: 'sunarea' },
  { id: 'cover', name: 'Toldo', iconName: 'cover' },
];

// Mapeamento de ícones
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

export default function NewBoatPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<NewBoat>({
    name: '',
    description: '',
    imageUrl: '',
    capacity: 0,
    location: '',
    price: 0,
    available: true,
    media: [],
    length: 0,
    year: new Date().getFullYear(),
    category: 'Lancha',
    amenities: []
  });

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
      setFormData((prev) => ({
        ...prev,
        imageUrl: data.secure_url,
      }));
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? Number(value)
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/barcos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          capacity: Number(formData.capacity),
          length: Number(formData.length),
          year: Number(formData.year),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar barco');
      }

      router.push('/admin/barcos');
    } catch (error: any) {
      console.error('Error creating boat:', error);
      setError(error.message || 'Erro ao criar barco');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Novo Barco</h1>

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
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Preço por dia
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">R$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        value={formData.price}
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
                    {commonAmenities.map((amenity) => {
                      const isSelected = formData.amenities.some(a => a.id === amenity.id);
                      
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

          {/* Mídia */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Mídia</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Adicione fotos do barco.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-6">
                  <MediaUploader
                    existingMedia={formData.media}
                    onMediaAdd={(media) => {
                      setFormData((prev) => ({
                        ...prev,
                        media: [...prev.media, { ...media, id: Date.now().toString() }],
                      }));
                    }}
                    onMediaRemove={(mediaId) => {
                      setFormData((prev) => ({
                        ...prev,
                        media: prev.media.filter((m) => m.id !== mediaId),
                      }));
                    }}
                  />
                </div>
              </div>
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
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
