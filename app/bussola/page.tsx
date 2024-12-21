'use client';

import NavigationTools from '@/components/NavigationTools';

export default function CompassPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-12 sm:pt-4">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <NavigationTools />
            
            <div className="mt-8 text-gray-600">
              <h2 className="text-xl font-semibold mb-4">Como usar</h2>
              <ul className="space-y-2">
                <li>• Permita o acesso aos sensores do dispositivo quando solicitado</li>
                <li>• A bússola mostra a direção atual em graus</li>
                <li>• O velocímetro mostra sua velocidade atual em km/h</li>
                <li>• Para melhor precisão, use em áreas abertas</li>
              </ul>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Nota: Esta funcionalidade trabalha melhor em dispositivos móveis com sensores de orientação e GPS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
