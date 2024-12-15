'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Boat {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  capacity: number;
  location: string;
  pricePerDay: number;
  rating: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  guests: number;
  status: string;
}

export default function BoatDetailsPage({ params }: { params: { id: string } }) {
  const [boat, setBoat] = useState<Boat | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const response = await fetch(`/api/admin/boats/${params.id}`);
        if (!response.ok) {
          throw new Error('Falha ao carregar os detalhes do barco');
        }
        const data = await response.json();
        setBoat(data);

        // Carregar reservas do barco
        const bookingsResponse = await fetch(`/api/admin/boats/${params.id}/bookings`);
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchBoatDetails();
  }, [params.id]);

  const handleEdit = () => {
    router.push(`/admin/boats/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este barco?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/boats/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir o barco');
      }

      router.push('/admin/boats');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir barco');
    }
  };

  const toggleAvailability = async () => {
    try {
      const response = await fetch(`/api/admin/boats/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: !boat?.available }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar disponibilidade');
      }

      const updatedBoat = await response.json();
      setBoat(updatedBoat);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar disponibilidade');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!boat) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">Barco não encontrado</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Cabeçalho */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-2xl leading-6 font-bold text-gray-900">{boat.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              ID: {boat.id}
            </p>
          </div>
          <div className="space-x-3">
            <button
              onClick={toggleAvailability}
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                boat.available
                  ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                  : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
              }`}
            >
              {boat.available ? 'Marcar Indisponível' : 'Marcar Disponível'}
            </button>
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </div>

        {/* Detalhes do Barco */}
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Imagem</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                <div className="relative h-64 w-96">
                  <Image
                    src={boat.imageUrl}
                    alt={boat.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Descrição</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{boat.description}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Capacidade</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{boat.capacity} pessoas</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Localização</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{boat.location}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Preço por dia</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                R$ {boat.pricePerDay.toFixed(2)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Avaliação</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{boat.rating.toFixed(1)} / 5.0</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    boat.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {boat.available ? 'Disponível' : 'Indisponível'}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Seção de Reservas */}
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Reservas</h3>
          {bookings.length > 0 ? (
            <div className="mt-4">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data Início
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data Fim
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hóspedes
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bookings.map((booking) => (
                            <tr key={booking.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(booking.startDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(booking.endDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {booking.guests}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  booking.status === 'CONFIRMADO'
                                    ? 'text-green-700 bg-green-50'
                                    : booking.status === 'PENDENTE'
                                    ? 'text-yellow-700 bg-yellow-50'
                                    : 'text-red-700 bg-red-50'
                                }`}>
                                  {booking.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Nenhuma reserva encontrada para este barco.</p>
          )}
        </div>
      </div>
    </div>
  );
}
