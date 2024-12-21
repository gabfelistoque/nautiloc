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
}

interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
}

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
    course: null
  });
  const [showDebug, setShowDebug] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastPosition = useRef<Position | null>(null);
  const speedHistory = useRef<number[]>([]);
  const startTime = useRef<number | null>(null);
  const totalDistance = useRef<number>(0);

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

  // Função para calcular a distância entre dois pontos em metros
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

  // Função para calcular a velocidade com base na mudança de posição
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
          {/* Status dos Sensores */}
          <div className="text-sm text-gray-600 mb-4">
            <div>Bússola: {data.heading !== null ? 'Ativa' : 'Inativa'}</div>
            <div>GPS: {data.gpsStatus === 'granted' ? 'Ativo' : 'Inativo'}</div>
            {data.accuracy && (
              <div>Precisão: ±{Math.round(data.accuracy)}m</div>
            )}
            {data.gpsStatus === 'denied' && (
              <button
                onClick={requestGPSPermission}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
              >
                Ativar GPS
              </button>
            )}
          </div>

          {/* Grid de informações */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-4">
            {/* Velocidade Atual */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">
                {data.speed !== null ? `${data.speed.toFixed(1)}` : '--'}
              </div>
              <div className="text-sm text-gray-500">km/h atual</div>
            </div>

            {/* Velocidade Média */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">
                {data.avgSpeed !== null ? `${data.avgSpeed.toFixed(1)}` : '--'}
              </div>
              <div className="text-sm text-gray-500">km/h média</div>
            </div>

            {/* Velocidade Máxima */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">
                {data.maxSpeed !== null ? `${data.maxSpeed.toFixed(1)}` : '--'}
              </div>
              <div className="text-sm text-gray-500">km/h máxima</div>
            </div>

            {/* Distância */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">
                {data.distance !== null ? `${data.distance.toFixed(2)}` : '--'}
              </div>
              <div className="text-sm text-gray-500">km percorridos</div>
            </div>
          </div>

          {/* Bússola */}
          <div className="relative w-40 h-40">
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
              <div className="text-xl font-bold">
                {data.heading !== null ? `${Math.round(data.heading)}°` : '--'}
              </div>
            </div>
          </div>

          {/* Direção do movimento */}
          {data.course !== null && (
            <div className="text-center mt-2">
              <div className="text-sm text-gray-500">Direção do movimento</div>
              <div className="text-lg">{Math.round(data.course)}°</div>
            </div>
          )}

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
