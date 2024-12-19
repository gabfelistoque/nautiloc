'use client';

import { useState, useEffect } from 'react';
import { Wind, Waves, Compass, Sun, CloudRain, Thermometer, Cloud, CloudLightning } from 'lucide-react';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  waveHeight: number;
  weatherCondition: string;
  windDirection: number;
  humidity: number;
  timestamp: number;
  isReal: boolean;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch('/api/weather');
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError('Não foi possível carregar os dados meteorológicos');
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    // Atualizar a cada 30 minutos
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Grid de informações */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicador de Condições */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (!weather) return null;

  const getConditionColor = (waveHeight: number) => {
    if (waveHeight < 1) return 'text-green-500';
    if (waveHeight < 2) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-5 h-5 text-yellow-500" strokeWidth={1.5} />;
      case 'clouds':
        return <Cloud className="w-5 h-5 text-gray-500" strokeWidth={1.5} />;
      case 'rain':
        return <CloudRain className="w-5 h-5 text-blue-500" strokeWidth={1.5} />;
      case 'thunderstorm':
        return <CloudLightning className="w-5 h-5 text-purple-500" strokeWidth={1.5} />;
      default:
        return <Sun className="w-5 h-5 text-yellow-500" strokeWidth={1.5} />;
    }
  };

  const getWeatherConditionText = (condition: string) => {
    const translations: { [key: string]: string } = {
      'clear': 'Limpo',
      'clouds': 'Nublado',
      'rain': 'Chuva',
      'thunderstorm': 'Tempestade',
    };
    return translations[condition.toLowerCase()] || condition;
  };

  const formatLastUpdate = () => {
    return `Atualizado ${new Date(weather.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Condições Marítimas</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>{formatLastUpdate()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Temperatura */}
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
          <div>
            <p className="text-sm text-gray-500">Temperatura</p>
            <p className="font-semibold">{Math.round(weather.temperature)}°C</p>
          </div>
        </div>

        {/* Velocidade do Vento */}
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
          <div>
            <p className="text-sm text-gray-500">Vento</p>
            <p className="font-semibold">{Math.round(weather.windSpeed)} km/h</p>
          </div>
        </div>

        {/* Altura das Ondas */}
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
          <div>
            <p className="text-sm text-gray-500">Ondas</p>
            <p className={`font-semibold ${getConditionColor(weather.waveHeight)}`}>
              {weather.waveHeight.toFixed(1)}m
            </p>
          </div>
        </div>

        {/* Direção do Vento */}
        <div className="flex items-center gap-2">
          <Compass 
            className="w-5 h-5 text-gray-600 transition-transform duration-500" 
            style={{ transform: `rotate(${weather.windDirection}deg)` }}
            strokeWidth={1.5}
          />
          <div>
            <p className="text-sm text-gray-500">Direção</p>
            <p className="font-semibold">{Math.round(weather.windDirection)}°</p>
          </div>
        </div>

        {/* Condição do Tempo */}
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather.weatherCondition)}
          <div>
            <p className="text-sm text-gray-500">Condição</p>
            <p className="font-semibold">{getWeatherConditionText(weather.weatherCondition)}</p>
          </div>
        </div>

        {/* Umidade */}
        <div className="flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-blue-300" strokeWidth={1.5} />
          <div>
            <p className="text-sm text-gray-500">Umidade</p>
            <p className="font-semibold">{weather.humidity}%</p>
          </div>
        </div>
      </div>

      {/* Indicador de Condições */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Condições para Navegação</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            weather.waveHeight < 1 
              ? 'bg-green-100 text-green-800'
              : weather.waveHeight < 2
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {weather.waveHeight < 1 
              ? 'Excelente'
              : weather.waveHeight < 2
              ? 'Moderada'
              : 'Desfavorável'}
          </span>
        </div>
      </div>
    </div>
  );
}
