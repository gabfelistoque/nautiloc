'use client';

import { useEffect, useState } from 'react';
import BookingCalendar from '@/components/BookingCalendar';

interface DashboardStats {
  totalBoats: number;
  totalBookings: number;
  activeBookings: number;
  revenue: number;
}

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  boat: {
    id: string;
    name: string;
  };
  user: {
    name: string;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      // Buscar estatísticas
      fetch('/api/admin/stats').then(res => {
        if (!res.ok) throw new Error('Falha ao carregar estatísticas');
        return res.json();
      }),
      // Buscar reservas
      fetch('/api/bookings').then(res => {
        if (!res.ok) throw new Error('Falha ao carregar reservas');
        return res.json();
      })
    ])
      .then(([statsData, bookingsData]) => {
        setStats(statsData);
        setBookings(bookingsData);
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total de Barcos */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Barcos
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalBoats}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total de Reservas */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Reservas
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalBookings}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Reservas Ativas */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reservas Ativas
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.activeBookings}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Receita Total */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Receita Total
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {typeof stats.revenue === 'number' 
                      ? `R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : 'R$ 0,00'
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendário de Reservas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Calendário de Reservas</h2>
        <BookingCalendar bookings={bookings} />
      </div>
    </div>
  );
}
