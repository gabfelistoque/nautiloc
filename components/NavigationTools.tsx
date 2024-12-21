'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NavigationData {
  heading: number | null;
  speed: number | null;
  error: string | null;
  permissionStatus: 'not-requested' | 'requesting' | 'granted' | 'denied';
  debug: string;
  gpsStatus: 'not-requested' | 'requesting' | 'granted' | 'denied';
}

interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

const NavigationTools = () => {
  const [data, setData] = useState<NavigationData>({
    heading: null,
    speed: null,
    error: null,
    permissionStatus: 'not-requested',
    debug: '',
    gpsStatus: 'not-requested'
  });
  const [showDebug, setShowDebug] = useState(false);

  const addDebugMessage = (message: string) => {
    console.log(message);
    setData(prev => ({ ...prev, debug: `${new Date().toLocaleTimeString()}: ${message}\n${prev.debug}` }));
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
        addDebugMessage(`
          Posição GPS atualizada:
          Velocidade: ${position.coords.speed !== null ? position.coords.speed + ' m/s' : 'não disponível'}
          Precisão: ${position.coords.accuracy} metros
          Latitude: ${position.coords.latitude}
          Longitude: ${position.coords.longitude}
        `);

        if (position.coords.speed !== null) {
          const speedKmh = position.coords.speed * 3.6;
          setData(prev => ({ ...prev, speed: speedKmh }));
        }
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
      {/* Botão de Debug */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="absolute top-4 right-4 px-3 py-1 bg-gray-200 text-sm rounded"
      >
        {showDebug ? 'Ocultar Debug' : 'Mostrar Debug'}
      </button>

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
            {data.gpsStatus === 'denied' && (
              <button
                onClick={requestGPSPermission}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
              >
                Ativar GPS
              </button>
            )}
          </div>

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
