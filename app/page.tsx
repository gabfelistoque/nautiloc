import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BoatCard from '@/components/BoatCard';
import SearchForm from '@/components/SearchForm';

async function getBoats() {
  return await prisma.boat.findMany({
    where: {
      available: true,
    },
    orderBy: {
      rating: 'desc',
    },
  });
}

export default async function Home() {
  const boats = await getBoats();

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="hero-section relative h-[700px] md:h-[600px] flex items-center justify-center text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-4.0.3"
            alt="Hero background"
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
            className="brightness-50"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-7xl font-bold mb-4 md:mb-6">
              Navegue pela Aventura
            </h1>
            <p className="text-lg md:text-2xl text-gray-200">
              Descubra os melhores barcos para sua experiência!
            </p>
          </div>

          {/* Search Form */}
          <SearchForm />
        </div>
      </div>

      {/* Featured Boats Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Barcos em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boats.map((boat) => (
            <BoatCard
              key={boat.id}
              id={boat.id}
              name={boat.name}
              description={boat.description}
              imageUrl={boat.imageUrl}
              capacity={boat.capacity}
              location={boat.location}
              pricePerDay={boat.pricePerDay}
              rating={boat.rating}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Por que escolher nossa plataforma?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl mb-4">🛟</div>
              <h3 className="text-xl font-semibold mb-2">Segurança Garantida</h3>
              <p className="text-gray-600">Todos os barcos são verificados e seguem rigorosos padrões de segurança</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-semibold mb-2">Experiência Premium</h3>
              <p className="text-gray-600">Barcos de luxo e serviço de primeira classe</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Reserva Simplificada</h3>
              <p className="text-gray-600">Processo de reserva rápido e fácil</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
