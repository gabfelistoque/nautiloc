'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NavigationData {
  heading: number | null;
  speed: number | null;
  error: string | null;
  permissionStatus: 'not-requested' | 'requesting' | 'granted' | 'denied';
}

interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

const NavigationTools = () => {
  const [data, setData] = useState<NavigationData>({
    heading: null,
    speed: null,
    error: null,
    permissionStatus: 'not-requested'
  });

  const requestSensorPermissions = async () => {
    setData(prev => ({ ...prev, permissionStatus: 'requesting' }));
    
    try {
      // Solicitar permissão para geolocalização primeiro
      const geoPermission = await navigator.permissions.query({ name: 'geolocation' });
      
      // Solicitar permissão para orientação do dispositivo (iOS)
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();
          if (orientationPermission === 'granted') {
            setData(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
            initializeSensors();
          } else {
            setData(prev => ({
              ...prev,
              permissionStatus: 'denied',
              error: 'Permissão para sensores negada. Por favor, permita o acesso aos sensores nas configurações do seu navegador.'
            }));
          }
        } catch (err) {
          console.error('Erro ao solicitar permissão de orientação:', err);
          // Em alguns dispositivos Android, o requestPermission não existe, mas os sensores funcionam
          setData(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
          initializeSensors();
        }
      } else {
        // Em dispositivos que não precisam de permissão explícita
        setData(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
        initializeSensors();
      }
    } catch (err) {
      console.error('Erro ao solicitar permissões:', err);
      setData(prev => ({
        ...prev,
        permissionStatus: 'denied',
        error: 'Erro ao acessar os sensores. Verifique as permissões do seu navegador.'
      }));
    }
  };

  const initializeSensors = () => {
    // Manipulador para orientação do dispositivo
    const handleOrientation = (event: DeviceOrientationEventWithWebkit) => {
      if (event.webkitCompassHeading !== undefined) {
        setData(prev => ({ ...prev, heading: event.webkitCompassHeading || null }));
      } else if (event.alpha !== null) {
        setData(prev => ({ ...prev, heading: event.alpha ? 360 - event.alpha : null }));
      }
    };

    // Manipulador para velocidade via GPS
    const handlePosition = (position: GeolocationPosition) => {
      if (position.coords.speed !== null) {
        const speedKmh = (position.coords.speed * 3.6);
        setData(prev => ({ ...prev, speed: speedKmh }));
      }
    };

    const handlePositionError = (error: GeolocationPositionError) => {
      let errorMessage = 'Erro ao obter localização';
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Permissão de localização negada';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Localização indisponível';
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Tempo esgotado ao obter localização';
      }
      setData(prev => ({ ...prev, error: errorMessage }));
    };

    window.addEventListener('deviceorientation', handleOrientation as any, true);
    
    navigator.geolocation.watchPosition(
      handlePosition,
      handlePositionError,
      { enableHighAccuracy: true }
    );

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation as any, true);
    };
  };

  useEffect(() => {
    if (!window.DeviceOrientationEvent) {
      setData(prev => ({
        ...prev,
        error: 'Seu dispositivo não suporta orientação',
        permissionStatus: 'denied'
      }));
      return;
    }
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6 p-4 bg-white rounded-lg shadow-md">
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

      {data.permissionStatus === 'granted' && !data.error && (
        <>
          {/* Bússola */}
          <div className="relative w-32 h-32">
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
              <div className="absolute top-0 w-1 h-4 bg-red-500" />
            </motion.div>
          </div>

          {/* Velocímetro */}
          <div className="text-center">
            <div className="text-2xl font-bold">
              {data.speed !== null ? `${data.speed.toFixed(1)} km/h` : '--'}
            </div>
            <div className="text-sm text-gray-500">Velocidade</div>
          </div>

          {/* Direção em graus */}
          <div className="text-center">
            <div className="text-xl">
              {data.heading !== null ? `${Math.round(data.heading)}°` : '--'}
            </div>
            <div className="text-sm text-gray-500">Direção</div>
          </div>
        </>
      )}
    </div>
  );
};

export default NavigationTools;
