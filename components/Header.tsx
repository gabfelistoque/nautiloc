'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { UserCircle, Menu, LayoutDashboard, Ship, Calendar, Users, Heart, LogOut, LogIn, UserPlus } from 'lucide-react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import SearchBar from './SearchBar';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Handle user menu clicks
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }

      // Handle search modal clicks
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-colors duration-300 ${
      pathname === '/' ? (isScrolled ? 'bg-white shadow-sm' : 'bg-transparent') : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Principal */}
        <div className="flex items-center justify-between py-2.5">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className={`text-xl font-bold transition-colors duration-300 ${
              pathname === '/' ? (isScrolled ? 'text-blue-600' : 'text-white') : 'text-blue-600'
            }`}>nautiloc</span>
          </Link>

          {/* Barra de Pesquisa Desktop */}
          <div ref={searchRef} className="hidden md:block bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-shadow">
            <SearchBar isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
          </div>

          {/* Menu do Usuário */}
          <div className="flex items-center">
            <div className="relative">
              {session ? (
                <>
                  <button
                    ref={buttonRef}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 ml-4 px-3 py-1.5 border border-gray-300 rounded-full hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm"
                  >
                    <UserCircle className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                    <Menu className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                  </button>

                  {/* Menu Dropdown */}
                  {isUserMenuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg py-2 z-50"
                    >
                      {session ? (
                        <>
                          <div className="px-4 py-2 border-b border-gray-200">
                            <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                            <p className="text-sm text-gray-500">{session.user?.email}</p>
                          </div>
                          {session.user?.role === 'ADMIN' ? (
                            <>
                              <Link
                                href="/admin/dashboard"
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                Dashboard
                              </Link>
                              <Link
                                href="/admin/barcos"
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Ship className="h-4 w-4 mr-2" />
                                Gerenciar Barcos
                              </Link>
                              <Link
                                href="/admin/reservas"
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Gerenciar Reservas
                              </Link>
                              <Link
                                href="/admin/usuarios"
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Gerenciar Usuários
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link
                                href="/minhas-reservas"
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Minhas Reservas
                              </Link>
                              <Link
                                href="/favoritos"
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Heart className="h-4 w-4 mr-2" />
                                Favoritos
                              </Link>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              signOut();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className={`transition-colors duration-300 ${
                              pathname === '/' ? (isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200') : 'text-gray-700 hover:text-blue-600'
                            }`}
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Entrar
                          </Link>
                          <Link
                            href="/registrar"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Registrar
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className={`transition-colors duration-300 ${
                      pathname === '/' ? (isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200') : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/registrar"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Registrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa Mobile */}
        <div className="md:hidden pb-2.5">
          <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-shadow">
            <SearchBar isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
          </div>
        </div>
      </div>
    </header>
  );
}
