import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BoatCard from '@/components/BoatCard';
import SearchForm from '@/components/SearchForm';
import { ClockIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import { UsersIcon, MapPinIcon } from '@heroicons/react/24/solid';
import Footer from '@/components/Footer';

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
      <div className="hero-section relative h-[780px] md:h-[700px] flex items-center justify-center text-white overflow-hidden">
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
        <div className="relative container mx-auto px-4 pt-20 md:pt-0 z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-7xl font-bold mb-4 md:mb-6">
              Navegue pela Aventura
            </h1>
            <p className="text-lg md:text-2xl text-gray-200">
              Descubra os melhores barcos para sua experiência!
            </p>
          </div>

          {/* Search Form */}
          <div>
            <SearchForm />
          </div>
        </div>
      </div>

      {/* Tours Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Passeios Imperdíveis</h2>
        <p className="text-gray-600 text-center mb-8 md:mb-12">Explore nossos roteiros exclusivos e viva experiências únicas</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Tour Card 1 - Praias Paradisíacas */}
          <div className="rounded-xl overflow-hidden card-shadow hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col w-full">
            <div className="relative h-48">
              <Image
                src="https://images.unsplash.com/photo-1468413253725-0d5181091126"
                alt="Passeio às praias paradisíacas"
                fill
                style={{ objectFit: 'cover' }}
                className="transform hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1.5 shadow-lg z-10">
                <ClockIcon className="w-4 h-4" />
                6h
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3 gap-2">
                <h3 className="text-xl font-semibold mb-0 flex-shrink">Praias Paradisíacas</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-700 ml-1 text-sm font-medium">4.8</span>
                  </div>
                  <button className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
                    <HeartIcon className="w-5 h-5 text-red-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center text-gray-500 text-sm gap-4 mb-4">
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                  12 pessoas
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  Praia do Forte
                </span>
              </div>
              <p className="text-gray-600 flex-1">Descubra as mais belas praias da região em um passeio inesquecível</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  A partir de R$ 600
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Tour Card 2 - Pôr do Sol */}
          <div className="rounded-xl overflow-hidden card-shadow hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col w-full">
            <div className="relative h-48">
              <Image
                src="https://images.unsplash.com/photo-1572889464105-3d3f39ee2cf7"
                alt="Passeio ao pôr do sol"
                fill
                style={{ objectFit: 'cover' }}
                className="transform hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1.5 shadow-lg z-10">
                <ClockIcon className="w-4 h-4" />
                2h
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3 gap-2">
                <h3 className="text-xl font-semibold mb-0 flex-shrink">Pôr do Sol Romântico</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-700 ml-1 text-sm font-medium">4.9</span>
                  </div>
                  <button className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
                    <HeartIcon className="w-5 h-5 text-red-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center text-gray-500 text-sm gap-4 mb-4">
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                  8 pessoas
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  Marina
                </span>
              </div>
              <p className="text-gray-600 flex-1">Navegue durante o entardecer em um passeio romântico e relaxante</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  A partir de R$ 350
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Tour Card 3 - Baleias */}
          <div className="rounded-xl overflow-hidden card-shadow hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col w-full">
            <div className="relative h-48">
              <Image
                src="https://images.unsplash.com/photo-1568430462989-44163eb1752f"
                alt="Avistamento de baleias"
                fill
                style={{ objectFit: 'cover' }}
                className="transform hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1.5 shadow-lg z-10">
                <ClockIcon className="w-4 h-4" />
                4h
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3 gap-2">
                <h3 className="text-xl font-semibold mb-0 flex-shrink">Avistamento de Baleias</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-700 ml-1 text-sm font-medium">4.7</span>
                  </div>
                  <button className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
                    <HeartIcon className="w-5 h-5 text-red-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center text-gray-500 text-sm gap-4 mb-4">
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                  15 pessoas
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  Porto
                </span>
              </div>
              <p className="text-gray-600 flex-1">Observe as magníficas baleias em seu habitat natural e aprenda sobre seus hábitos</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  A partir de R$ 800
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/tours" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300">
            Ver Todos os Passeios
          </Link>
        </div>
      </div>

      {/* Featured Boats Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Barcos em Destaque</h2>
        <p className="text-gray-600 mb-6 md:mb-8">Explore nossas embarcações disponíveis</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boats.map((boat) => (
            <BoatCard
              key={boat.id}
              id={boat.id}
              name={boat.name}
              description={boat.description}
              imageUrl={boat.imageUrl || undefined}
              capacity={boat.capacity}
              location={boat.location}
              price={boat.price}
              rating={boat.rating}
              category={boat.category}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Por que escolher nossa plataforma?</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Oferecemos a melhor experiência em aluguel de barcos, com segurança e conforto para você aproveitar o mar.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Segurança Garantida</h3>
              <p className="text-gray-600">Todos os barcos são verificados e seguem rigorosos padrões de segurança</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Experiência Premium</h3>
              <p className="text-gray-600">Barcos de luxo e serviço de primeira classe</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Reserva Simplificada</h3>
              <p className="text-gray-600">Processo de reserva rápido e fácil</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para Navegar?</h2>
          <p className="text-xl mb-8">Comece sua aventura marítima hoje mesmo!</p>
          <Link href="/boats" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-300">
            Explorar Barcos
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
