'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link 
              href="/"
              className="text-blue-600 font-semibold text-lg"
            >
              nautiloc
            </Link>
            <nav className="ml-8 flex space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/barcos"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Barcos
              </Link>
              <Link
                href="/admin/reservas"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Reservas
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            {session?.user?.name && (
              <span className="text-gray-700 mr-4">
                Olá, {session.user.name}
              </span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
