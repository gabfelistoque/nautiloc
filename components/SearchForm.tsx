'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function SearchForm() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);

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
    const params = new URLSearchParams();
    
    if (location) {
      params.append('location', location);
    }
    if (checkIn) {
      params.append('startDate', checkIn.toISOString());
    }
    if (checkOut) {
      params.append('endDate', checkOut.toISOString());
    }
    if (guests > 0) {
      params.append('guests', guests.toString());
    }

    router.push(`/barcos?${params.toString()}`);
  };

  return (
    <div className="search-container max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Local de Partida
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value="" className="text-gray-900">Selecione um local</option>
            {locations.map((loc) => (
              <option key={loc} value={loc} className="text-gray-900">{loc}</option>
            ))}
          </select>
        </div>

        {/* Check-in */}
        <div className="space-y-2 relative">
          <label className="block text-sm font-medium text-gray-700">
            Data de Início
          </label>
          <DatePicker
            selected={checkIn}
            onChange={(date) => setCheckIn(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Selecione a data"
            minDate={new Date()}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            popperClassName="z-[1000]"
            popperPlacement="bottom-start"
            popperModifiers={[
              {
                name: "preventOverflow",
                options: {
                  padding: 8
                }
              }
            ]}
          />
        </div>

        {/* Check-out */}
        <div className="space-y-2 relative">
          <label className="block text-sm font-medium text-gray-700">
            Data de Fim
          </label>
          <DatePicker
            selected={checkOut}
            onChange={(date) => setCheckOut(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Selecione a data"
            minDate={checkIn || new Date()}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            popperClassName="z-[1000]"
            popperPlacement="bottom-start"
            popperModifiers={[
              {
                name: "preventOverflow",
                options: {
                  padding: 8
                }
              }
            ]}
          />
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Quantidade de Pessoas
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          />
        </div>
      </div>

      <button 
        onClick={handleSearch}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
      >
        Buscar Barcos
      </button>
    </div>
  );
}
