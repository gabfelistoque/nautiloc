'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }
      const bookings = await response.json();
      
      // Calcular estatísticas
      const totalBookings = bookings.length;
      const pendingBookings = bookings.filter((b: any) => b.status === 'PENDENTE').length;
      const confirmedBookings = bookings.filter((b: any) => b.status === 'CONFIRMADO').length;
      const totalRevenue = bookings
        .filter((b: any) => b.status === 'CONFIRMADO')
        .reduce((acc: number, b: any) => acc + b.totalPrice, 0);

      setStats({
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Reservas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total de Reservas</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.totalBookings}
          </div>
        </div>

        {/* Reservas Pendentes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Reservas Pendentes</div>
          <div className="mt-2 text-3xl font-semibold text-yellow-600">
            {stats.pendingBookings}
          </div>
        </div>

        {/* Reservas Confirmadas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Reservas Confirmadas</div>
          <div className="mt-2 text-3xl font-semibold text-green-600">
            {stats.confirmedBookings}
          </div>
        </div>

        {/* Receita Total */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Receita Total</div>
          <div className="mt-2 text-3xl font-semibold text-blue-600">
            R$ {stats.totalRevenue.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/reservas"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Gerenciar Reservas</h3>
            <p className="mt-2 text-sm text-gray-500">
              Visualize e gerencie todas as reservas do sistema
            </p>
          </a>

          <a
            href="/admin/barcos"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Gerenciar Barcos</h3>
            <p className="mt-2 text-sm text-gray-500">
              Adicione, edite ou remova barcos do catálogo
            </p>
          </a>

          <a
            href="/admin/usuarios"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Gerenciar Usuários</h3>
            <p className="mt-2 text-sm text-gray-500">
              Administre as contas de usuários do sistema
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
