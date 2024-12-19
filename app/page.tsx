import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BoatCard from '@/components/BoatCard';
import SearchForm from '@/components/SearchForm';
import WeatherWidget from '@/components/WeatherWidget';
import TourMap from '@/components/TourMap';
import TourCard from '@/components/TourCard';
import { Clock, Users, MapPin, Star, Heart, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

async function getBoats() {
  return await prisma.boat.findMany({
    where: {
      available: true,
    },
    orderBy: {
      rating: 'desc',
    },
    take: 3,
  });
}

export const revalidate = 0; // Desabilita o cache da página

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

      {/* Weather Widget */}
      <div className="container mx-auto px-4 -mt-20 relative z-20">
        <WeatherWidget />
      </div>

      {/* Tours Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Passeios Imperdíveis</h2>
        <p className="text-center text-gray-600 mb-8">Explore nossos passeios exclusivos</p>
        
        {/* Tour Map */}
        <div className="mb-8">
          <TourMap />
        </div>

        {/* Tour Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <TourCard
            title="Praias Paradisíacas"
            duration="6h"
            rating={4.8}
            capacity={12}
            location="Praia do Forte"
            description="Descubra as mais belas praias da região em um passeio inesquecível"
            price={600}
            imageUrl="https://images.unsplash.com/photo-1468413253725-0d5181091126"
          />
          <TourCard
            title="Pôr do Sol Romântico"
            duration="2h"
            rating={4.9}
            capacity={8}
            location="Marina"
            description="Navegue durante o entardecer em um passeio romântico e relaxante"
            price={350}
            imageUrl="https://images.unsplash.com/photo-1572889464105-3d3f39ee2cf7"
          />
          <TourCard
            title="Avistamento de Baleias"
            duration="4h"
            rating={4.7}
            capacity={10}
            location="Alto Mar"
            description="Observe as magníficas baleias em seu habitat natural e aprenda sobre seus hábitos"
            price={800}
            imageUrl="https://images.unsplash.com/photo-1568430462989-44163eb1752f"
          />
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
