'use client';

import { useState, useEffect } from 'react';
import { Wind, Waves, Sun, CloudRain, Cloud, CloudLightning, Thermometer, MapPin, ChevronRight } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
}

const LOCATIONS: Location[] = [
  { id: 'ilhabela', name: 'Ilhabela', state: 'SP', lat: -23.8168, lon: -45.3742 },
  { id: 'ubatuba', name: 'Ubatuba', state: 'SP', lat: -23.4336, lon: -45.0838 },
  { id: 'santos', name: 'Santos', state: 'SP', lat: -23.9618, lon: -46.3322 },
  { id: 'guaruja', name: 'Guarujá', state: 'SP', lat: -23.9935, lon: -46.2568 },
];

interface WeatherData {
  temperature: number;
  windSpeed: number;
  waveHeight: number;
  weatherCondition: string;
  windDirection: number;
  humidity: number;
  timestamp: number;
}

export default function CompactWeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(`/api/weather?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`);
        if (!response.ok) throw new Error('Failed to fetch weather data');
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-6 gap-1.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-2">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-5 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'clouds': return <Cloud className="w-4 h-4 text-gray-500" />;
      case 'rain': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'thunderstorm': return <CloudLightning className="w-4 h-4 text-purple-500" />;
      default: return <Sun className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getWeatherConditionText = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return 'Céu Limpo';
      case 'clouds': return 'Nublado';
      case 'rain': return 'Chuva';
      case 'thunderstorm': return 'Tempestade';
      default: return 'Céu Limpo';
    }
  };

  const getConditionColor = (waveHeight: number) => {
    if (waveHeight < 1) return 'bg-emerald-500';
    if (waveHeight < 2) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getConditionText = (waveHeight: number) => {
    if (waveHeight < 1) return 'Ideal';
    if (waveHeight < 2) return 'Moderado';
    return 'Alto';
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200">
      {/* Header com Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 group">
            <MapPin className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-800 transition-colors" />
            <select 
              value={selectedLocation.id}
              onChange={(e) => {
                const location = LOCATIONS.find(loc => loc.id === e.target.value);
                if (location) setSelectedLocation(location);
              }}
              className="text-xs text-gray-700 bg-transparent border-none cursor-pointer hover:text-gray-900 focus:outline-none focus:ring-0 group-hover:text-gray-900 transition-colors"
            >
              {LOCATIONS.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}, {location.state}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            {getWeatherIcon(weather.weatherCondition)}
            <span className="text-xs font-medium text-gray-800">{getWeatherConditionText(weather.weatherCondition)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] text-gray-600 tabular-nums">
            {new Date(weather.timestamp).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Indicadores em linha única */}
      <div className="overflow-x-auto md:overflow-x-visible scrollbar-hide">
        <div className="flex md:grid md:grid-cols-6 gap-2 min-w-max md:min-w-0 pb-2">
          {/* Ondas */}
          <div className="bg-gray-100 rounded-xl p-2.5 md:p-2 hover:bg-gray-200 transition-colors flex-shrink-0 md:flex-shrink">
            <div className="flex items-center gap-1.5 mb-1">
              <Waves className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs text-gray-700">Ondas</span>
            </div>
            <p className="text-lg md:text-sm font-medium text-gray-900">{weather.waveHeight.toFixed(1)}m</p>
          </div>

          {/* Vento */}
          <div className="bg-gray-100 rounded-xl p-2.5 md:p-2 hover:bg-gray-200 transition-colors flex-shrink-0 md:flex-shrink">
            <div className="flex items-center gap-1.5 mb-1">
              <Wind className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs text-gray-700">Vento</span>
            </div>
            <p className="text-lg md:text-sm font-medium text-gray-900">{Math.round(weather.windSpeed)} km/h</p>
          </div>

          {/* Direção */}
          <div className="bg-gray-100 rounded-xl p-2.5 md:p-2 hover:bg-gray-200 transition-colors flex-shrink-0 md:flex-shrink">
            <div className="flex items-center gap-1.5 mb-1">
              <Wind 
                className="w-3.5 h-3.5 text-gray-700 transition-transform duration-500" 
                style={{ transform: `rotate(${weather.windDirection}deg)` }}
              />
              <span className="text-xs text-gray-700">Dir.</span>
            </div>
            <p className="text-lg md:text-sm font-medium text-gray-900">{Math.round(weather.windDirection)}°</p>
          </div>

          {/* Temperatura */}
          <div className="bg-gray-100 rounded-xl p-2.5 md:p-2 hover:bg-gray-200 transition-colors flex-shrink-0 md:flex-shrink">
            <div className="flex items-center gap-1.5 mb-1">
              <Thermometer className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs text-gray-700">Temp.</span>
            </div>
            <p className="text-lg md:text-sm font-medium text-gray-900">{Math.round(weather.temperature)}°</p>
          </div>

          {/* Umidade */}
          <div className="bg-gray-100 rounded-xl p-2.5 md:p-2 hover:bg-gray-200 transition-colors flex-shrink-0 md:flex-shrink">
            <div className="flex items-center gap-1.5 mb-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-gray-700">Umid.</span>
            </div>
            <p className="text-lg md:text-sm font-medium text-gray-900">{weather.humidity}%</p>
          </div>

          {/* Condição */}
          <div className="bg-gray-100 rounded-xl p-2.5 md:p-2 hover:bg-gray-200 transition-colors flex-shrink-0 md:flex-shrink">
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`w-2 h-2 rounded-full ${getConditionColor(weather.waveHeight)}`}></div>
              <span className="text-xs text-gray-700">Cond.</span>
            </div>
            <p className="text-lg md:text-sm font-medium text-gray-900">{getConditionText(weather.waveHeight)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
