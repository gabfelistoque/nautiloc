import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import BookingForm from '@/components/BookingForm';
import ImageGallery from './components/ImageGallery';
import WeatherForecast from '@/components/WeatherForecast';
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

// Mapa de ícones para cada amenidade
const amenityIcons: { [key: string]: any } = {
  'wifi': WifiIcon,
  'safety': ShieldCheckIcon,
  'water': BeakerIcon,
  'shower': HomeIcon,
  'gps': MapPinIcon,
  'radio': SignalIcon,
  'microwave': HomeModernIcon,
  'ac': ComputerDesktopIcon,
  'anchor': LifebuoyIcon,
  'grill': FireIcon,
  'sound': MusicalNoteIcon,
  'tv': FilmIcon,
  'cooler': BeakerIcon,
  'sunarea': SunIcon,
  'cover': CloudIcon,
};

interface ExtendedBoat {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  capacity: number;
  location: string;
  price: number;
  available: boolean;
  rating: number;
  length: number;
  year: number;
  category: string;
  amenities: {
    id: string;
    name: string;
    icon: string;
  }[];
  media: {
    id: string;
    url: string;
    type: string;
    publicId: string | null;
    boatId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

async function getBoat(id: string): Promise<ExtendedBoat> {
  const boat = await prisma.boat.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      capacity: true,
      location: true,
      price: true,
      available: true,
      rating: true,
      length: true,
      year: true,
      category: true,
      media: true,
      amenities: {
        select: {
          id: true,
          name: true,
          iconName: true
        }
      }
    }
  });

  if (!boat) {
    notFound();
  }

  // Transforma os dados para o formato esperado
  const transformedBoat = {
    ...boat,
    amenities: boat.amenities.map((amenity: { id: string; name: string; iconName: string }) => ({
      id: amenity.id,
      name: amenity.name,
      icon: amenity.iconName,
    }))
  };

  return transformedBoat as ExtendedBoat;
}

export default async function BoatPage({ params }: { params: { id: string } }) {
  const boat = await getBoat(params.id);
  
  // Converte a imagem principal e a mídia adicional para o formato da galeria
  const media = [
    { url: boat.imageUrl, type: 'IMAGE' as const },
    ...boat.media.map(m => ({ 
      url: m.url, 
      type: (m.type === 'IMAGE' || m.type === 'VIDEO' ? m.type : 'IMAGE') as 'IMAGE' | 'VIDEO'
    }))
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <Image
          src={boat.imageUrl}
          alt={boat.name}
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <div className="text-white">
              <Link
                href="/barcos"
                className="text-sm hover:underline inline-flex items-center"
              >
                ← Voltar para lista de barcos
              </Link>
              <h1 className="text-4xl font-bold mt-2">{boat.name}</h1>
              <p className="text-lg opacity-90 mb-6">{boat.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="-mt-8 mb-8">
          <ImageGallery media={media} alt={boat.name} />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Barco */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Sobre este barco</h2>
              <p className="text-gray-600">{boat.description}</p>
              
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Capacidade</p>
                  <p className="text-base font-semibold">{boat.capacity} pessoas</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18m0 0l-4 4m4-4l-4 4" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Comprimento</p>
                  <p className="text-base font-semibold">{boat.length}m</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Ano</p>
                  <p className="text-base font-semibold">{boat.year}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Categoria</p>
                  <p className="text-base font-semibold">{boat.category}</p>
                </div>
              </div>
            </div>

            {/* O que este barco oferece */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">O que este barco oferece</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {boat.amenities.map(amenity => {
                  const IconComponent = amenityIcons[amenity.icon] || amenityIcons[amenity.name] || WifiIcon;
                  return (
                    <div key={amenity.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-blue-500" />
                      </div>
                      <span className="text-gray-600">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regras e Requisitos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Regras e Requisitos</h2>
              
              <div className="space-y-6">
                {/* Documentação Necessária */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Documentação Necessária</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Carteira de Habilitação Náutica (Arrais, Mestre ou Capitão) válida</li>
                    <li>Documento de identificação com foto (RG ou CNH)</li>
                    <li>Comprovante de residência</li>
                  </ul>
                </div>

                {/* Regras de Uso */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Regras de Uso</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Respeitar o limite máximo de {boat.capacity} pessoas a bordo</li>
                    <li>Devolução com tanque de combustível no mesmo nível da retirada</li>
                    <li>Proibido fumar a bordo</li>
                    <li>Uso obrigatório de coletes salva-vidas</li>
                    <li>Respeitar as áreas de navegação permitidas</li>
                  </ul>
                </div>

                {/* Política de Cancelamento */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Política de Cancelamento</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Cancelamento gratuito até 7 dias antes da data da reserva</li>
                    <li>50% de reembolso para cancelamentos até 3 dias antes</li>
                    <li>Sem reembolso para cancelamentos com menos de 3 dias de antecedência</li>
                  </ul>
                </div>

                {/* Horários */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Horários</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Check-in: 09:00</li>
                    <li>Check-out: 17:00</li>
                    <li>Duração mínima do aluguel: 1 dia</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Reserva */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {boat.price.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-gray-500">por dia</span>
                </div>
                <BookingForm 
                  boatId={boat.id} 
                  boatName={boat.name} 
                  price={boat.price}
                />
              </div>
              <div className="mt-6 bg-white rounded-xl shadow-sm">
                <WeatherForecast location={boat.location} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
