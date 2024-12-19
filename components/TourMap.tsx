'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap } from 'leaflet';

export default function TourMap() {
  const mapRef = useRef<LeafletMap | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Garante que só montamos no cliente
  useEffect(() => {
    setIsClient(true);
    return () => setIsClient(false);
  }, []);

  useEffect(() => {
    // Só inicializa se estivermos no cliente
    if (!isClient) return;

    const initMap = async () => {
      try {
        // Limpa mapa anterior se existir
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const L = (await import('leaflet')).default;
        const container = document.getElementById('map-container');
        
        if (!container) return;

        // Cria o mapa
        mapRef.current = L.map(container).setView([-23.82, -45.42], 11);
        
        // Adiciona o layer do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ' OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 10
        }).addTo(mapRef.current);

        // Adiciona controles de zoom em posição customizada
        L.control.zoom({
          position: 'bottomright'
        }).addTo(mapRef.current);
      } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isClient]); // Só re-executa quando isClient muda

  if (!isClient) return null;

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg">
      <div id="map-container" className="h-full w-full" />
    </div>
  );
}
