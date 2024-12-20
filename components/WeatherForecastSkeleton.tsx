export default function WeatherForecastSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Forecast Items */}
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {/* Data */}
              <div className="flex flex-col w-[45px] sm:w-[50px] flex-shrink-0">
                <div className="h-4 w-10 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="text-gray-300 hidden sm:block">|</div>
              {/* Ícone */}
              <div className="w-[32px] sm:w-[40px] flex items-center justify-center flex-shrink-0">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </div>
              {/* Descrição */}
              <div className="w-[90px] sm:w-[120px] flex-shrink-0">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
            {/* Temperatura */}
            <div className="w-[50px] sm:w-[60px] flex justify-end flex-shrink-0">
              <div className="h-6 w-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Status de atualização */}
      <div className="mt-3 pt-2 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
        <div className="h-3 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
