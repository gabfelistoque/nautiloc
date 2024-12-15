'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
}

export default function BoatsPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBoats();
  }, []);

  const fetchBoats = async () => {
    try {
      const response = await fetch('/api/admin/boats');
      if (!response.ok) throw new Error('Failed to fetch boats');
      const data = await response.json();
      setBoats(data);
    } catch (error) {
      console.error('Error fetching boats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este barco?')) return;

    try {
      const response = await fetch(`/api/admin/boats/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete boat');
      
      setBoats(boats.filter(boat => boat.id !== id));
    } catch (error) {
      console.error('Error deleting boat:', error);
    }
  };

  const toggleAvailability = async (id: string, currentAvailability: boolean) => {
    try {
      const response = await fetch(`/api/admin/boats/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: !currentAvailability }),
      });

      if (!response.ok) throw new Error('Failed to update boat availability');

      setBoats(boats.map(boat => 
        boat.id === id ? { ...boat, available: !boat.available } : boat
      ));
    } catch (error) {
      console.error('Error updating boat availability:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Barcos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os barcos disponíveis para aluguel.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/boats/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Adicionar Barco
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Barco
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Localização
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Capacidade
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Preço/Dia
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {boats.map((boat) => (
                    <tr key={boat.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <Image
                              className="h-10 w-10 rounded-full object-cover"
                              src={boat.imageUrl}
                              alt={boat.name}
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{boat.name}</div>
                            <div className="text-gray-500">{boat.description.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {boat.location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {boat.capacity} pessoas
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        R$ {boat.pricePerDay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <button
                          onClick={() => toggleAvailability(boat.id, boat.available)}
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            boat.available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {boat.available ? 'Disponível' : 'Indisponível'}
                        </button>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/admin/boats/${boat.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(boat.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
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
  );
}
