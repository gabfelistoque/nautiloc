'use client';
import { WiDaySunny, WiCloudy, WiRain, WiThunderstorm } from 'react-icons/wi';
import { HiLocationMarker } from 'react-icons/hi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';

interface WeatherForecastProps {
  location: string;
}

const locations = [
  { id: 1, name: 'Ilhabela, SP', coords: { lat: -23.8168, lon: -45.3742 } },
  { id: 2, name: 'Santos, SP', coords: { lat: -23.9618, lon: -46.3322 } },
  { id: 3, name: 'Ubatuba, SP', coords: { lat: -23.4345, lon: -45.0711 } },
  { id: 4, name: 'Guarujá, SP', coords: { lat: -23.9934, lon: -46.2567 } },
];

async function getWeatherForecast(coords: { lat: number; lon: number }) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric&lang=pt_br`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 1800 } });
    const data = await response.json();
    
    // Agrupa previsões por dia
    const dailyForecasts = data.list.reduce((acc: any[], item: any) => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!acc[date]) {
        acc[date] = {
          dt: item.dt,
          temp: item.main.temp,
          temp_min: item.main.temp,
          temp_max: item.main.temp,
          weather: item.weather[0]
        };
      } else {
        // Atualiza min/max
        acc[date].temp_min = Math.min(acc[date].temp_min, item.main.temp);
        acc[date].temp_max = Math.max(acc[date].temp_max, item.main.temp);
      }
      
      return acc;
    }, {});

    return Object.values(dailyForecasts).slice(0, 5);
  } catch (error) {
    return null;
  }
}

const getWeatherIcon = (weatherId: number) => {
  const iconClass = "w-8 h-8 flex-shrink-0";
  
  // Thunderstorm
  if (weatherId >= 200 && weatherId < 300) 
    return <WiThunderstorm className={iconClass} />;
  
  // Rain and Drizzle
  if ((weatherId >= 300 && weatherId < 400) || (weatherId >= 500 && weatherId < 600)) 
    return <WiRain className={iconClass} />;
  
  // Clouds
  if (weatherId >= 801 && weatherId < 900) 
    return <WiCloudy className={iconClass} />;
  
  // Clear
  if (weatherId === 800)
    return <WiDaySunny className={iconClass} />;
    
  return <WiCloudy className={iconClass} />;
};

export default function WeatherForecast({ location }: WeatherForecastProps) {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [forecast, setForecast] = useState<any[]>([]);

  useEffect(() => {
    const fetchForecast = async () => {
      const data = await getWeatherForecast(selectedLocation.coords);
      if (data) {
        setForecast(data);
      }
    };
    
    fetchForecast();
  }, [selectedLocation]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">Previsão do Tempo</h3>
          <span className="text-xs text-gray-500">Próximos 5 dias</span>
        </div>
        <div className="flex items-center gap-2 -mt-1">
          <HiLocationMarker className="w-4 h-4 text-gray-400" />
          <select 
            value={selectedLocation.id}
            onChange={(e) => setSelectedLocation(locations.find(l => l.id === Number(e.target.value)) || locations[0])}
            className="text-sm text-gray-500 bg-transparent border-none cursor-pointer hover:text-gray-700 focus:outline-none focus:ring-0 max-w-[150px] pt-1"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {forecast.map((day: any) => (
          <div key={day.dt} 
            className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
          >
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {/* Coluna da Data - largura fixa */}
              <div className="flex flex-col w-[45px] sm:w-[50px] flex-shrink-0">
                <span className="text-sm font-medium text-gray-900">
                  {format(new Date(day.dt * 1000), 'EEE', { locale: ptBR }).slice(0, 3)}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(day.dt * 1000), 'd MMM', { locale: ptBR })}
                </span>
              </div>
              <div className="text-gray-300 hidden sm:block">|</div>
              {/* Coluna do Ícone - largura fixa */}
              <div className="w-[32px] sm:w-[40px] flex items-center justify-center flex-shrink-0">
                <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
                  {getWeatherIcon(day.weather.id)}
                </div>
              </div>
              {/* Coluna da Descrição - largura fixa */}
              <div className="w-[90px] sm:w-[120px] flex-shrink-0">
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors truncate">
                  {day.weather.description}
                </span>
              </div>
            </div>
            {/* Coluna da Temperatura */}
            <div className="w-[50px] sm:w-[60px] flex justify-end flex-shrink-0">
              <span className="text-base font-medium text-gray-900">
                {Math.round(day.temp)}°C
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        Atualizado a cada 30 minutos
      </div>
    </div>
  );
}
