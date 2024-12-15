import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { NextAuthProvider } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BoatRental - Aluguel de Barcos',
  description: 'Encontre os melhores barcos para alugar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <NextAuthProvider>
          <Header />
          <div className="pt-16">
            {children}
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
