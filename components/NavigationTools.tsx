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
  accuracy: number;
  speed: number | null;
}

interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';

const SPEED_BUFFER_SIZE = 5; // Quantidade de medições para média móvel
const MIN_ACCURACY = 20; // Precisão mínima em metros
const SPEED_THRESHOLD = 1.0; // Velocidade mínima em km/h para considerar movimento

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
  const speedBuffer = useRef<number[]>([]);
  const lastValidSpeed = useRef<number>(0);
  const lastPosition = useRef<Position | null>(null);
  const totalDistance = useRef<number>(0);
  const speedHistory = useRef<number[]>([]);
  const startTime = useRef<number | null>(null);
  const weatherUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const addDebugMessage = (message: string) => {
    console.log(message);
    setData(prev => ({ ...prev, debug: `${new Date().toLocaleTimeString()}: ${message}\n${prev.debug}` }));
  };

  const calculateAverageSpeed = (newSpeed: number): number => {
    speedBuffer.current.push(newSpeed);
    if (speedBuffer.current.length > SPEED_BUFFER_SIZE) {
      speedBuffer.current.shift();
    }
    
    const sortedSpeeds = [...speedBuffer.current].sort((a, b) => a - b);
    const validSpeeds = sortedSpeeds.slice(1, -1); // Remove o maior e menor valor
    
    if (validSpeeds.length === 0) return 0;
    
    const avg = validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length;
    return avg < SPEED_THRESHOLD ? 0 : avg;
  };

  const processSpeed = (position: Position): number => {
    if (position.accuracy > MIN_ACCURACY) {
      addDebugMessage(`Precisão baixa (${position.accuracy}m), mantendo última velocidade`);
      return lastValidSpeed.current;
    }

    let speed: number;

    if (position.speed !== null) {
      speed = position.speed * 3.6; // Converte m/s para km/h
    } else {
      if (!lastPosition.current) {
        lastPosition.current = position;
        return 0;
      }

      const timeDiff = (position.timestamp - lastPosition.current.timestamp) / 1000;
      if (timeDiff < 1) {
        return lastValidSpeed.current; // Muito pouco tempo entre medições
      }

      const distance = calculateDistance(
        lastPosition.current.latitude,
        lastPosition.current.longitude,
        position.latitude,
        position.longitude
      );

      speed = (distance / timeDiff) * 3.6; // Converte m/s para km/h
    }

    lastPosition.current = position;

    if (speed > 200 || speed < 0) { // Velocidade improvável
      return lastValidSpeed.current;
    }

    const averageSpeed = calculateAverageSpeed(speed);
    lastValidSpeed.current = averageSpeed;
    return averageSpeed;
  };

  const updateStats = (speed: number) => {
    speedHistory.current.push(speed);
    if (speedHistory.current.length > 10) { // mantém apenas últimos 10 registros
      speedHistory.current.shift();
    }

    const avgSpeed = speedHistory.current.reduce((a, b) => a + b, 0) / speedHistory.current.length;

    const maxSpeed = Math.max(...speedHistory.current);

    if (!startTime.current) {
      startTime.current = Date.now();
    }

    if (lastPosition.current) {
      const segmentDistance = calculateDistance(
        lastPosition.current.latitude,
        lastPosition.current.longitude,
        lastPosition.current.latitude,
        lastPosition.current.longitude
      );
      totalDistance.current += segmentDistance;
    }

    setData(prev => ({
      ...prev,
      avgSpeed,
      maxSpeed,
      distance: totalDistance.current / 1000, // converte para km
    }));
  };

  const initializeGPS = () => {
    addDebugMessage('Inicializando GPS...');
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentPosition: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed
        };

        // Atualiza dados meteorológicos a cada 5 minutos
        if (!weatherUpdateInterval.current) {
          updateWeather(position.coords.latitude, position.coords.longitude);
          weatherUpdateInterval.current = setInterval(() => {
            updateWeather(position.coords.latitude, position.coords.longitude);
          }, 5 * 60 * 1000);
        }

        const processedSpeed = processSpeed(currentPosition);
        
        setData(prev => ({
          ...prev,
          speed: processedSpeed,
          accuracy: position.coords.accuracy,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          course: position.coords.heading || prev.course
        }));

        if (processedSpeed > 0) {
          updateStats(processedSpeed);
        }

        addDebugMessage(`
          Velocidade: ${processedSpeed ? processedSpeed.toFixed(1) : 'N/A'} km/h
          Precisão: ${position.coords.accuracy ? position.coords.accuracy.toFixed(1) : 'N/A'}m
          GPS Speed: ${position.coords.speed !== null ? (position.coords.speed * 3.6).toFixed(1) : 'N/A'} km/h
        `);
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

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (weatherUpdateInterval.current) {
        clearInterval(weatherUpdateInterval.current);
      }
    };
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        if (navigator.userAgent.match(/iPhone/i)) {
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

  const requestSensorPermissions = async () => {
    setData(prev => ({ ...prev, permissionStatus: 'requesting' }));
    
    try {
      addDebugMessage('Solicitando permissões...');
      
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          addDebugMessage('Dispositivo iOS detectado, solicitando permissão...');
          const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();
          if (orientationPermission === 'granted') {
            addDebugMessage('Permissão de orientação concedida');
            setData(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
            initializeSensors();
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
          requestGPSPermission();
        }
      } else {
        addDebugMessage('Dispositivo não requer permissão explícita para orientação');
        setData(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
        initializeSensors();
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

  const updateWeather = async (lat: number, lon: number) => {
    if (!WEATHER_API_KEY) {
      addDebugMessage('API key não configurada para dados meteorológicos');
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados meteorológicos');
      }

      const weatherData = await response.json();
      
      setData(prev => ({
        ...prev,
        weather: {
          windSpeed: weatherData.wind?.speed || null,
          windDirection: weatherData.wind?.deg || null,
          humidity: weatherData.main?.humidity || null,
          temperature: weatherData.main?.temp || null
        }
      }));

      addDebugMessage(`Dados meteorológicos atualizados`);
    } catch (error) {
      addDebugMessage(`Erro ao buscar dados meteorológicos: ${error}`);
    }
  };

  const getStaticMapUrl = (latitude: number | null, longitude: number | null, zoom: number = 15): string => {
    if (!latitude || !longitude) return '';
    
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
    <div className="flex flex-col items-center space-y-6 p-4">
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
          <div className="relative w-48 h-48 mt-4">
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
              <div className="absolute top-0 w-1 h-6 bg-red-500" />
            </motion.div>
            
            {/* Direção em graus */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-lg font-bold">
                {data.heading !== null ? `${Math.round(data.heading)}°` : '--'}
              </div>
            </div>
          </div>

          {/* Coordenadas GPS */}
          <div className="text-center p-3 bg-gray-50 rounded-lg w-full max-w-sm">
            <div className="text-sm font-mono">
              {formatCoordinate(data.latitude, 'lat')} <br />
              {formatCoordinate(data.longitude, 'lon')}
            </div>
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
