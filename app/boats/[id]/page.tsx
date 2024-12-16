import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BookingForm from '@/components/BookingForm';
import ImageGallery from '@/components/ImageGallery';

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
    include: {
      media: true
    }
  });

  if (!boat) {
    notFound();
  }

  return {
    ...boat,
    length: boat.length || 0,
    year: boat.year || new Date().getFullYear(),
    category: boat.category || 'Default'
  };
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
          <div className="container mx-auto px-4 h-full flex items-end pb-8">
            <div className="text-white">
              <Link
                href="/boats"
                className="text-white/80 hover:text-white flex items-center gap-2 mb-4 w-fit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Voltar para lista
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{boat.name}</h1>
              <div className="flex items-center gap-4 text-lg">
                <span className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  {boat.rating.toFixed(1)}
                </span>
                <span>•</span>
                <span>{boat.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Galeria de Imagens */}
      <ImageGallery media={media} alt={boat.name} />

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Boat Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Sobre este barco</h2>
              <p className="text-gray-600 leading-relaxed">{boat.description}</p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Características</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  <span>Capacidade: {boat.capacity} pessoas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  <span>{boat.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span>Avaliação: {boat.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Regras e requisitos</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Proibido fumar a bordo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Obrigatório uso de coletes salva-vidas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Necessário habilitação náutica para navegação</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Respeitar limite de capacidade de pessoas</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
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
                  pricePerDay={boat.price}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
