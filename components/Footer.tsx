import Link from 'next/link';
import { 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  GlobeAltIcon,
  PhotoIcon,
  ChatBubbleBottomCenterIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Sobre */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                nauti
              </span>
              <span className="text-2xl font-bold text-blue-600">
                loc
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Sua plataforma para aluguel de embarcações. 
              Navegue com conforto e segurança pelos melhores destinos.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              {['Sobre Nós', 'Como Funciona', 'Destinos', 'Embarcações', 'Blog'].map((item) => (
                <li key={item}>
                  <Link 
                    href="#" 
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600 text-sm">
                <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
                <span>Av. Princesa Isabel, 1000 - Ilhabela, SP</span>
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <PhoneIcon className="h-5 w-5 mr-2 text-blue-600" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-blue-600" />
                <span>contato@nautiloc.com.br</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter</h3>
            <p className="text-gray-600 text-sm mb-4">
              Receba novidades e ofertas exclusivas
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Inscrever-se
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Divisor */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-500">
              2024 Nautiloc. Todos os direitos reservados.
            </div>

            {/* Redes Sociais */}
            <div className="flex space-x-4">
              {[
                { Icon: GlobeAltIcon, href: '#' },
                { Icon: PhotoIcon, href: '#' },
                { Icon: ChatBubbleBottomCenterIcon, href: '#' }
              ].map(({ Icon, href }, i) => (
                <Link
                  key={i}
                  href={href}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
