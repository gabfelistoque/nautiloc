'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Ship, MapPin, Calendar, Users, Search } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const boatCategories = [
  'LANCHA',
  'VELEIRO',
  'CATAMARA',
  'IATE',
  'JET SKI',
  'CASA BARCO',
] as const;

type BoatCategory = typeof boatCategories[number];

type SearchBarProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function SearchBar({ isOpen, setIsOpen }: SearchBarProps) {
  const router = useRouter();
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [guests, setGuests] = useState(1);
  const [category, setCategory] = useState<BoatCategory | ''>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (!response.ok) {
          throw new Error('Falha ao carregar locais');
        }
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Erro ao carregar locais:', error);
      }
    };

    fetchLocations();
  }, []);

  const handleSearch = () => {
    // Criar uma nova URLSearchParams para manter os parâmetros existentes
    const params = new URLSearchParams();
    
    // Atualizar ou remover parâmetros
    if (location) params.set('location', location);
    if (guests > 1) params.set('guests', guests.toString());
    if (category) params.set('category', category);
    if (dateRange?.from) params.set('startDate', dateRange.from.toISOString());
    if (dateRange?.to) params.set('endDate', dateRange.to.toISOString());

    const url = `/resultados?${params.toString()}`;
    router.push(url);
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return 'Quando';
    if (!dateRange.to) return format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR });
    return `${format(dateRange.from, 'dd/MM')} - ${format(dateRange.to, 'dd/MM')}`;
  };

  const formatBoatCategory = (cat: string) => {
    // Converter de volta para título case para exibição
    return cat.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div ref={searchBarRef} className="relative">
      {/* Botão de Pesquisa Colapsado */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full justify-between px-4 py-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-full hover:shadow-md transition-shadow"
      >
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-3 divide-x divide-gray-300 min-w-max pr-3">
            <div className="flex items-center shrink-0">
              <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
              <span className="whitespace-nowrap">{location || 'Onde'}</span>
            </div>
            <div className="flex items-center pl-3 shrink-0">
              <Ship className="h-4 w-4 mr-1.5 text-gray-500" />
              <span className="whitespace-nowrap">
                {category ? formatBoatCategory(category) : (
                  <>
                    <span className="hidden md:inline">Tipo de barco</span>
                    <span className="md:hidden">Barco</span>
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center pl-3 shrink-0">
              <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
              <span className="whitespace-nowrap">{formatDateRange()}</span>
            </div>
            <div className="flex items-center pl-3 shrink-0">
              <Users className="h-4 w-4 mr-1.5 text-gray-500" />
              <span className="whitespace-nowrap">{guests} {guests === 1 ? 'pessoa' : 'pessoas'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center pl-3 ml-1.5 border-l border-gray-300">
          <div className="p-2 bg-blue-600 rounded-full">
            <Search className="h-4 w-4 text-white" />
          </div>
        </div>
      </button>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Painel de Pesquisa Expandido */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            {/* Campo de Localização */}
            <div className="relative">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Local de Partida
              </label>
              <div className="relative">
                <select
                  id="location"
                  value={location}
                  onChange={(e) => {
                    e.stopPropagation();
                    setLocation(e.target.value);
                  }}
                  className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-base"
                >
                  <option value="">Selecione um local</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Campo de Tipo de Barco */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Barco
              </label>
              <div className="relative">
                <Ship className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={category}
                  onChange={(e) => {
                    e.stopPropagation();
                    setCategory(e.target.value as BoatCategory);
                  }}
                  className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">Todos os tipos</option>
                  {boatCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {formatBoatCategory(cat)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo de Datas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datas
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDatePicker(!showDatePicker);
                }}
                className="relative w-full flex items-center rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span>{formatDateRange()}</span>
              </button>
              {showDatePicker && (
                <div 
                  className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={ptBR}
                    fromDate={new Date()}
                  />
                </div>
              )}
            </div>

            {/* Campo de Convidados */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Convidados
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => {
                    e.stopPropagation();
                    setGuests(Math.max(1, parseInt(e.target.value) || 1));
                  }}
                  className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Botão de Pesquisa */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSearch();
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Search className="h-5 w-5 mr-2" />
              Pesquisar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
