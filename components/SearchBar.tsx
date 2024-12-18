'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { CalendarDaysIcon, MapPinIcon, UsersIcon, TagIcon } from '@heroicons/react/24/outline';
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
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [guests, setGuests] = useState(1);
  const [category, setCategory] = useState<BoatCategory | ''>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    console.log('Enviando busca com categoria:', category);
    
    // Criar uma nova URLSearchParams para manter os parâmetros existentes
    const params = new URLSearchParams();
    
    // Atualizar ou remover parâmetros
    if (location) params.set('location', location);
    if (guests > 1) params.set('guests', guests.toString());
    if (category) params.set('category', category);
    if (dateRange?.from) params.set('startDate', dateRange.from.toISOString());
    if (dateRange?.to) params.set('endDate', dateRange.to.toISOString());

    const url = `/resultados?${params.toString()}`;
    console.log('URL de busca construída:', url);
    
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
    <div className="relative">
      {/* Botão de Pesquisa Colapsado */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full justify-between px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
      >
        <div className="flex items-center divide-x divide-gray-300">
          <div className="flex items-center pr-3">
            <MapPinIcon className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span>{location || 'Onde'}</span>
          </div>
          <div className="flex items-center px-3">
            <TagIcon className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span>{category ? formatBoatCategory(category) : 'Tipo de barco'}</span>
          </div>
          <div className="flex items-center px-3">
            <CalendarDaysIcon className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span>{formatDateRange()}</span>
          </div>
          <div className="flex items-center pl-3">
            <UsersIcon className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span>{guests} {guests === 1 ? 'convidado' : 'convidados'}</span>
          </div>
        </div>
        <div className="bg-blue-600 p-2 ml-3 rounded-full text-white">
          <MagnifyingGlassIcon className="h-3.5 w-3.5" />
        </div>
      </button>

      {/* Painel de Pesquisa Expandido */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
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
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Selecione um local</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Campo de Tipo de Barco */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Barco
              </label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BoatCategory)}
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
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="relative w-full flex items-center rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span>{formatDateRange()}</span>
              </button>
              {showDatePicker && (
                <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
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
                <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                  className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Botão de Pesquisa */}
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Pesquisar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}