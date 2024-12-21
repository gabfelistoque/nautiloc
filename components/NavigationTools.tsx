'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NavigationData {
  heading: number | null;
  speed: number | null;
  error: string | null;
}

// Estendendo a interface DeviceOrientationEvent para incluir propriedades webkit
interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

const NavigationTools = () => {
  const [data, setData] = useState<NavigationData>({
    heading: null,
    speed: null,
    error: null
  });

  useEffect(() => {
    // Verificar se o navegador suporta os sensores necessários
    if (!window.DeviceOrientationEvent) {
      setData(prev => ({ ...prev, error: 'Seu dispositivo não suporta orientação' }));
      return;
    }

    // Solicitar permissão para usar os sensores (necessário em alguns navegadores)
    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission !== 'granted') {
            setData(prev => ({ ...prev, error: 'Permissão negada para acessar os sensores' }));
          }
        } catch (err) {
          setData(prev => ({ ...prev, error: 'Erro ao solicitar permissão' }));
        }
      }
    };

    requestPermission();

    // Manipulador para orientação do dispositivo
    const handleOrientation = (event: DeviceOrientationEventWithWebkit) => {
      if (event.webkitCompassHeading) {
        // Para dispositivos iOS
        setData(prev => ({ ...prev, heading: event.webkitCompassHeading }));
      } else if (event.alpha) {
        // Para outros dispositivos
        setData(prev => ({ ...prev, heading: 360 - event.alpha }));
      }
    };

    // Manipulador para velocidade via GPS
    const handlePosition = (position: GeolocationPosition) => {
      if (position.coords.speed !== null) {
        // Converter m/s para km/h
        const speedKmh = (position.coords.speed * 3.6);
        setData(prev => ({ ...prev, speed: speedKmh }));
      }
    };

    // Configurar observadores
    window.addEventListener('deviceorientation', handleOrientation as any, true);
    
    const watchId = navigator.geolocation.watchPosition(
      handlePosition,
      (error) => setData(prev => ({ ...prev, error: 'Erro ao obter localização' })),
      { enableHighAccuracy: true }
    );

    // Limpar observadores
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation as any, true);
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6 p-4 bg-white rounded-lg shadow-md">
      {data.error ? (
        <div className="text-red-500">{data.error}</div>
      ) : (
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
