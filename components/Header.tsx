'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <header className="fixed w-full top-0 bg-white shadow-md z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-blue-600">
              nautiloc
            </Link>
          </div>
          
          {/* Links de navegação centralizados */}
          <div className="flex-grow flex justify-center">
            <div className="hidden sm:flex sm:space-x-8 h-16">
              {session?.user?.role === 'ADMIN' ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className={`inline-flex items-center px-1 h-full border-b-2 text-sm font-medium ${
                      pathname === '/admin/dashboard'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/barcos"
                    className={`inline-flex items-center px-1 h-full border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/admin/barcos')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Barcos
                  </Link>
                  <Link
                    href="/admin/reservas"
                    className={`inline-flex items-center px-1 h-full border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/admin/reservas')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Reservas
                  </Link>
                  <Link
                    href="/admin/usuarios"
                    className={`inline-flex items-center px-1 h-full border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/admin/usuarios')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Usuários
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/barcos"
                    className={`inline-flex items-center px-1 h-full border-b-2 text-sm font-medium ${
                      pathname === '/barcos'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Barcos
                  </Link>
                  <Link
                    href="/minhas-reservas"
                    className={`inline-flex items-center px-1 h-full border-b-2 text-sm font-medium ${
                      pathname === '/minhas-reservas'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Minhas Reservas
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Botões de autenticação */}
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Olá, {session.user?.name || 'Usuário'}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
