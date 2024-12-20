export default function ImageGallerySkeleton() {
  return (
    <div className="relative w-full animate-pulse">
      {/* Grid de imagens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2">
        {[...Array(7)].map((_, index) => (
          <div 
            key={index}
            className="aspect-square relative overflow-hidden rounded-lg bg-gray-200"
          >
            {/* Efeito de shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" 
                 style={{ 
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 1.5s infinite'
                 }}
            />
          </div>
        ))}
      </div>

      {/* Botões de navegação */}
      <div className="hidden sm:block">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 rounded-full bg-gray-200" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
