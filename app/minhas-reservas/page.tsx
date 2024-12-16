'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Booking } from '@prisma/client';

interface BookingWithBoat extends Booking {
  boat: {
    id: string;
    name: string;
    imageUrl: string;
    pricePerDay: number;
  };
  user?: {
    name: string;
    email: string;
  };
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
          throw new Error('Falha ao carregar reservas');
        }
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao carregar reservas');
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
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Minhas Reservas</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhuma reserva encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">Comece reservando um barco agora mesmo.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => router.push('/barcos')}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Ver Barcos Disponíveis
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <img
                  src={booking.boat.imageUrl}
                  alt={booking.boat.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {booking.boat.name}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Data de Início:</span>{' '}
                      {new Date(booking.startDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p>
                      <span className="font-medium">Data de Fim:</span>{' '}
                      {new Date(booking.endDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'CONFIRMADO' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'PENDENTE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status === 'CONFIRMADO' ? 'Confirmada' :
                         booking.status === 'PENDENTE' ? 'Pendente' : 'Cancelada'}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Valor Total:</span>{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(booking.totalPrice)}
                    </p>
                  </div>
                  {(booking.status === 'CONFIRMADO' || booking.status === 'PENDENTE') && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Cancelar Reserva
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
