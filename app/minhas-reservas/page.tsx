'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Booking } from '@prisma/client';
import { CalendarIcon, CurrencyDollarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingWithBoat extends Booking {
  boat: {
    id: string;
    name: string;
    imageUrl: string;
    pricePerDay: number;
    location: string;
  };
  user?: {
    name: string;
    email: string;
  };
  guests: number;
}

export default function MinhasReservasPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithBoat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Erro ao carregar reservas');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [session, router]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao cancelar reserva');
      }

      setBookings(bookings.filter(book => book.id !== bookingId));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao cancelar reserva');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Minhas Reservas</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma reserva encontrada</h3>
            <p className="mt-2 text-sm text-gray-500">Comece sua aventura reservando um barco agora mesmo.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => router.push('/barcos')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ver Barcos Disponíveis
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Lado esquerdo - Informações principais */}
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 flex-shrink-0">
                        <img
                          src={booking.boat.imageUrl || '/boat-placeholder.jpg'}
                          alt={booking.boat.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{booking.boat.name}</h3>
                        <div className="mt-1 flex flex-col space-y-1 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                            {booking.boat.location}
                          </div>
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
                            {booking.guests} {booking.guests === 1 ? 'pessoa' : 'pessoas'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Centro - Status, datas e preço */}
                    <div className="flex flex-col sm:items-start space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${booking.status === 'CONFIRMADO' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'CANCELADO' ? 'bg-red-100 text-red-800' : 
                            booking.status === 'CONCLUIDO' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {format(new Date(booking.startDate), "dd 'de' MMMM", { locale: ptBR })} {' - '}
                        {format(new Date(booking.endDate), "dd 'de' MMMM", { locale: ptBR })}
                      </div>

                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(booking.totalPrice)}
                      </div>
                    </div>

                    {/* Lado direito - Botão de cancelar */}
                    <div className="flex items-center">
                      {booking.status === 'PENDENTE' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancelar Reserva
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
