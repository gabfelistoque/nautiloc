'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface NavigationData {
  heading: number | null;
  speed: number | null;
  error: string | null;
  permissionStatus: 'not-requested' | 'requesting' | 'granted' | 'denied';
  debug: string;
  gpsStatus: 'not-requested' | 'requesting' | 'granted' | 'denied';
  accuracy: number | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
  distance: number | null;
  course: number | null;
  latitude: number | null;
  longitude: number | null;
  weather: {
    windSpeed: number | null;
    windDirection: number | null;
    humidity: number | null;
    temperature: number | null;
  };
}

interface WeatherData {
  wind: { speed: number; deg: number };
  main: { humidity: number; temp: number };
}

interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';

const NavigationTools = () => {
  const [data, setData] = useState<NavigationData>({
    heading: null,
    speed: null,
    error: null,
    permissionStatus: 'not-requested',
    debug: '',
    gpsStatus: 'not-requested',
    accuracy: null,
    avgSpeed: null,
    maxSpeed: null,
    distance: null,
    course: null,
    latitude: null,
    longitude: null,
    weather: {
      windSpeed: null,
      windDirection: null,
      humidity: null,
      temperature: null
    }
  });
  const [showDebug, setShowDebug] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useNautical, setUseNautical] = useState(false);
  const lastPosition = useRef<Position | null>(null);
  const speedHistory = useRef<number[]>([]);
  const startTime = useRef<number | null>(null);
  const totalDistance = useRef<number>(0);
  const weatherUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const addDebugMessage = (message: string) => {
    console.log(message);
    setData(prev => ({ ...prev, debug: `${new Date().toLocaleTimeString()}: ${message}\n${prev.debug}` }));
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        // Prevenir que a tela apague no iOS
        if (navigator.userAgent.match(/iPhone/i)) {
          // @ts-ignore
          navigator.wakeLock?.request('screen');
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      addDebugMessage('Erro ao alternar tela cheia: ' + err);
    }
  };

  const kmhToKnots = (kmh: number) => kmh / 1.852;
  const kmToNauticalMiles = (km: number) => km / 1.852;
  const msToKnots = (ms: number) => ms * 1.944;
  const celsiusToFahrenheit = (c: number) => (c * 9/5) + 32;

  const formatCoordinate = (coord: number | null, type: 'lat' | 'lon'): string => {
    if (coord === null) return '--';
    const direction = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    const abs = Math.abs(coord);
    const degrees = Math.floor(abs);
    const minutes = ((abs - degrees) * 60).toFixed(3);
    return `${degrees}°${minutes}'${direction}`;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const calculateSpeed = (currentPosition: Position): number | null => {
    if (!lastPosition.current) {
      lastPosition.current = currentPosition;
      return null;
    }

    const distance = calculateDistance(
      lastPosition.current.latitude,
      lastPosition.current.longitude,
      currentPosition.latitude,
      currentPosition.longitude
    );

    const timeDiff = (currentPosition.timestamp - lastPosition.current.timestamp) / 1000; // em segundos
    
    // Atualiza a última posição
    lastPosition.current = currentPosition;

    // Se o tempo for muito pequeno ou a distância for muito pequena, retorna null
    if (timeDiff < 0.1 || distance < 0.1) return null;

    // Calcula a velocidade em km/h
    const speedMS = distance / timeDiff; // m/s
    const speedKMH = speedMS * 3.6; // km/h

    // Se a velocidade for muito alta (provavelmente erro), retorna null
    if (speedKMH > 200) return null;

    return speedKMH;
  };

  const updateStats = (speed: number | null, position: Position) => {
    if (speed !== null) {
      // Atualiza histórico de velocidade
      speedHistory.current.push(speed);
      if (speedHistory.current.length > 10) { // mantém apenas últimos 10 registros
        speedHistory.current.shift();
      }

      // Calcula velocidade média
      const avgSpeed = speedHistory.current.reduce((a, b) => a + b, 0) / speedHistory.current.length;

      // Atualiza velocidade máxima
      const maxSpeed = Math.max(...speedHistory.current);

      // Inicializa tempo de início se necessário
      if (!startTime.current) {
        startTime.current = Date.now();
      }

      // Atualiza distância total
      if (lastPosition.current) {
        const segmentDistance = calculateDistance(
          lastPosition.current.latitude,
          lastPosition.current.longitude,
          position.latitude,
          position.longitude
        );
        totalDistance.current += segmentDistance;
      }

      setData(prev => ({
        ...prev,
        avgSpeed,
        maxSpeed,
        distance: totalDistance.current / 1000, // converte para km
      }));
    }
  };

  const requestGPSPermission = async () => {
    addDebugMessage('Solicitando permissão do GPS...');
    setData(prev => ({ ...prev, gpsStatus: 'requesting' }));

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'granted') {
        addDebugMessage('Permissão do GPS concedida');
        setData(prev => ({ ...prev, gpsStatus: 'granted' }));
        initializeGPS();
      } else if (permission.state === 'prompt') {
        // Solicitar permissão explicitamente
        navigator.geolocation.getCurrentPosition(
          () => {
            addDebugMessage('Permissão do GPS concedida após prompt');
            setData(prev => ({ ...prev, gpsStatus: 'granted' }));
            initializeGPS();
          },
          (error) => {
            addDebugMessage(`Erro ao solicitar GPS: ${error.message}`);
            setData(prev => ({ 
              ...prev, 
              gpsStatus: 'denied',
              error: 'Permissão do GPS negada. Por favor, permita o acesso à localização.'
            }));
          },
          { enableHighAccuracy: true }
        );
      } else {
        addDebugMessage('Permissão do GPS negada');
        setData(prev => ({ 
          ...prev, 
          gpsStatus: 'denied',
          error: 'Permissão do GPS negada. Por favor, permita o acesso à localização nas configurações.'
        }));
      }
    } catch (err) {
      addDebugMessage(`Erro ao verificar permissão do GPS: ${err}`);
      setData(prev => ({ 
        ...prev, 
        gpsStatus: 'denied',
        error: 'Erro ao acessar o GPS. Verifique as permissões do seu navegador.'
      }));
    }
  };

  const initializeGPS = () => {
    addDebugMessage('Inicializando GPS...');
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentPosition: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp
        };

        setData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));

        // Atualiza dados meteorológicos a cada 5 minutos
        if (!weatherUpdateInterval.current) {
          updateWeather(position.coords.latitude, position.coords.longitude);
          weatherUpdateInterval.current = setInterval(() => {
            updateWeather(position.coords.latitude, position.coords.longitude);
          }, 5 * 60 * 1000);
        }

        // Atualiza o curso (direção do movimento)
        if (position.coords.heading !== null) {
          setData(prev => ({ ...prev, course: position.coords.heading }));
        }

        // Atualiza a precisão
        setData(prev => ({ ...prev, accuracy: position.coords.accuracy }));

        // Tenta usar a velocidade do GPS primeiro
        if (position.coords.speed !== null) {
          const speedKmh = position.coords.speed * 3.6;
          setData(prev => ({ ...prev, speed: speedKmh }));
          updateStats(speedKmh, currentPosition);
          addDebugMessage(`Velocidade do GPS: ${speedKmh.toFixed(1)} km/h`);
        } else {
          // Se não tiver velocidade do GPS, calcula baseado na mudança de posição
          const calculatedSpeed = calculateSpeed(currentPosition);
          if (calculatedSpeed !== null) {
            setData(prev => ({ ...prev, speed: calculatedSpeed }));
            updateStats(calculatedSpeed, currentPosition);
            addDebugMessage(`Velocidade calculada: ${calculatedSpeed.toFixed(1)} km/h`);
          }
        }

        lastPosition.current = currentPosition;
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Permissão de localização negada';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Localização indisponível';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Tempo esgotado ao obter localização';
        }
        addDebugMessage(`Erro GPS: ${errorMessage} (${error.message})`);
        setData(prev => ({ ...prev, error: errorMessage }));
      },
      { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // Tenta manter a tela ligada
    try {
      // @ts-ignore
      navigator.wakeLock?.request('screen');
    } catch (err) {
      addDebugMessage('Erro ao tentar manter tela ligada: ' + err);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (weatherUpdateInterval.current) {
        clearInterval(weatherUpdateInterval.current);
      }
    };
  };

  const requestSensorPermissions = async () => {
    setData(prev => ({ ...prev, permissionStatus: 'requesting' }));
    
    try {
      addDebugMessage('Solicitando permissões...');
      
      // Solicitar permissão para orientação do dispositivo (iOS)
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          addDebugMessage('Dispositivo iOS detectado, solicitando permissão...');
          const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();
          if (orientationPermission === 'granted') {
            addDebugMessage('Permissão de orientação concedida');
            setData(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
            initializeSensors();
            // Solicitar GPS após permissão da bússola
            requestGPSPermission();
          } else {
            addDebugMessage('Permissão de orientação negada');
            setData(prev => ({
              ...prev,
              permissionStatus: 'denied',
              error: 'Permissão para sensores negada. Por favor, permita o acesso aos sensores nas configurações do seu navegador.'
            }));
          }
        } catch (err) {
          addDebugMessage('Erro ao solicitar permissão de orientação, tentando como Android');
          setData(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
          initializeSensors();
          // Solicitar GPS após permissão da bússola
          requestGPSPermission();
        }
      } else {
        addDebugMessage('Dispositivo não requer permissão explícita para orientação');
        setData(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
        initializeSensors();
        // Solicitar GPS após permissão da bússola
        requestGPSPermission();
      }
    } catch (err) {
      const errorMsg = 'Erro ao acessar os sensores: ' + (err instanceof Error ? err.message : String(err));
      addDebugMessage(errorMsg);
      setData(prev => ({
        ...prev,
        permissionStatus: 'denied',
        error: 'Erro ao acessar os sensores. Verifique as permissões do seu navegador.'
      }));
    }
  };

  const initializeSensors = () => {
    addDebugMessage('Inicializando sensores de orientação...');

    const handleOrientation = (event: DeviceOrientationEventWithWebkit) => {
      if (event.webkitCompassHeading !== undefined) {
        setData(prev => ({ ...prev, heading: event.webkitCompassHeading || null }));
      } else if (event.alpha !== null) {
        setData(prev => ({ ...prev, heading: event.alpha ? 360 - event.alpha : null }));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation as any, true);
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation as any, true);
    };
  };

  const updateWeather = async (latitude: number, longitude: number) => {
    try {
      if (!WEATHER_API_KEY) {
        addDebugMessage('Chave da API do OpenWeather não configurada');
        return;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados meteorológicos');
      }

      const weatherData: WeatherData = await response.json();
      
      setData(prev => ({
        ...prev,
        weather: {
          windSpeed: weatherData.wind.speed,
          windDirection: weatherData.wind.deg,
          humidity: weatherData.main.humidity,
          temperature: weatherData.main.temp
        }
      }));
    } catch (error) {
      addDebugMessage('Erro ao atualizar dados meteorológicos: ' + error);
    }
  };

  const getStaticMapUrl = (latitude: number | null, longitude: number | null, zoom: number = 15): string => {
    if (!latitude || !longitude) return '';
    
    // Usando OpenStreetMap estático (sem necessidade de API key)
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=300x200&markers=${latitude},${longitude}`;
  };

  useEffect(() => {
    if (!window.DeviceOrientationEvent) {
      addDebugMessage('DeviceOrientationEvent não suportado');
      setData(prev => ({
        ...prev,
        error: 'Seu dispositivo não suporta orientação',
        permissionStatus: 'denied'
      }));
      return;
    }
    addDebugMessage('Componente montado, DeviceOrientationEvent suportado');
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6 p-4 bg-white rounded-lg shadow-md">
      {/* Botões de controle */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={toggleFullscreen}
          className="px-3 py-1 bg-gray-200 text-sm rounded"
        >
          {isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
        </button>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="px-3 py-1 bg-gray-200 text-sm rounded"
        >
          {showDebug ? 'Ocultar Debug' : 'Mostrar Debug'}
        </button>
      </div>

      {data.permissionStatus === 'not-requested' && (
        <button
          onClick={requestSensorPermissions}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Iniciar Navegação
        </button>
      )}

      {data.permissionStatus === 'requesting' && (
        <div className="text-blue-600">
          Solicitando permissões...
        </div>
      )}

      {data.error && (
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-md">
          {data.error}
        </div>
      )}

      {data.permissionStatus === 'granted' && (
        <>
          {/* Bússola */}
          <div className="relative w-40 h-40 mt-8">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backgroundImage: `url('/compass.svg')`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat'
              }}
              animate={{ rotate: data.heading || 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <div className="absolute top-0 w-1 h-5 bg-red-500" />
            </motion.div>
            
            {/* Direção em graus */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-lg font-bold">
                {data.heading !== null ? `${Math.round(data.heading)}°` : '--'}
              </div>
            </div>
          </div>

          {/* Mapa */}
          {data.latitude && data.longitude && (
            <div className="w-full max-w-sm overflow-hidden rounded-lg shadow-md">
              <img
                src={getStaticMapUrl(data.latitude, data.longitude)}
                alt="Localização atual"
                className="w-full h-[200px] object-cover"
                onError={(e) => {
                  // Se a imagem falhar, mostra uma mensagem
                  e.currentTarget.style.display = 'none';
                  addDebugMessage('Erro ao carregar o mapa');
                }}
              />
            </div>
          )}

          {/* Coordenadas GPS */}
          <div className="text-center p-3 bg-gray-50 rounded-lg w-full max-w-sm">
            <div className="text-sm font-mono">
              {formatCoordinate(data.latitude, 'lat')} <br />
              {formatCoordinate(data.longitude, 'lon')}
            </div>
            <div className="text-sm text-gray-500">Coordenadas</div>
          </div>

          {/* Grid de informações */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {/* Velocidade Atual */}
            <div 
              className="text-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => setUseNautical(!useNautical)}
            >
              <div className="text-2xl font-bold">
                {data.speed !== null 
                  ? useNautical 
                    ? `${kmhToKnots(data.speed).toFixed(1)}`
                    : `${data.speed.toFixed(1)}`
                  : '--'}
              </div>
              <div className="text-sm text-gray-500">
                {useNautical ? 'nós' : 'km/h'} atual
              </div>
            </div>

            {/* Velocidade Média */}
            <div 
              className="text-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => setUseNautical(!useNautical)}
            >
              <div className="text-2xl font-bold">
                {data.avgSpeed !== null 
                  ? useNautical 
                    ? `${kmhToKnots(data.avgSpeed).toFixed(1)}`
                    : `${data.avgSpeed.toFixed(1)}`
                  : '--'}
              </div>
              <div className="text-sm text-gray-500">
                {useNautical ? 'nós' : 'km/h'} média
              </div>
            </div>

            {/* Velocidade Máxima */}
            <div 
              className="text-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => setUseNautical(!useNautical)}
            >
              <div className="text-2xl font-bold">
                {data.maxSpeed !== null 
                  ? useNautical 
                    ? `${kmhToKnots(data.maxSpeed).toFixed(1)}`
                    : `${data.maxSpeed.toFixed(1)}`
                  : '--'}
              </div>
              <div className="text-sm text-gray-500">
                {useNautical ? 'nós' : 'km/h'} máxima
              </div>
            </div>

            {/* Distância */}
            <div 
              className="text-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => setUseNautical(!useNautical)}
            >
              <div className="text-2xl font-bold">
                {data.distance !== null 
                  ? useNautical 
                    ? `${kmToNauticalMiles(data.distance).toFixed(2)}`
                    : `${data.distance.toFixed(2)}`
                  : '--'}
              </div>
              <div className="text-sm text-gray-500">
                {useNautical ? 'milhas náuticas' : 'km'}
              </div>
            </div>

            {/* Dados Meteorológicos */}
            {data.weather.windSpeed !== null && (
              <>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold">
                    {useNautical 
                      ? `${msToKnots(data.weather.windSpeed).toFixed(1)} nós`
                      : `${(data.weather.windSpeed * 3.6).toFixed(1)} km/h`}
                  </div>
                  <div className="text-sm">
                    {data.weather.windDirection !== null 
                      ? `${Math.round(data.weather.windDirection)}°`
                      : '--'}
                  </div>
                  <div className="text-sm text-gray-500">Vento</div>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold">
                    {data.weather.humidity !== null 
                      ? `${Math.round(data.weather.humidity)}%`
                      : '--'}
                  </div>
                  <div className="text-sm">
                    {data.weather.temperature !== null
                      ? `${Math.round(data.weather.temperature)}°C`
                      : '--'}
                  </div>
                  <div className="text-sm text-gray-500">Umidade/Temp</div>
                </div>
              </>
            )}
          </div>

          {/* Status dos Sensores */}
          <div className="text-sm text-gray-600 mt-4 text-center">
            <div>Bússola: {data.heading !== null ? 'Ativa' : 'Inativa'}</div>
            <div>GPS: {data.gpsStatus === 'granted' ? 'Ativo' : 'Inativo'}</div>
            {data.accuracy && (
              <div>Precisão: ±{Math.round(data.accuracy)}m</div>
            )}
          </div>

          {/* Debug Info */}
          {showDebug && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto w-full">
              {data.debug || 'Aguardando dados dos sensores...'}
            </div>
          )}
        </>
      )}
    </div>
  );

};

export default NavigationTools;
