import type { Metadata } from 'next';
import { Lexend_Deca } from 'next/font/google';
import './globals.css';

const lexendDeca = Lexend_Deca({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-lexend-deca',
});

export const metadata: Metadata = {
  title: 'CINE HAX - Películas y Series GRATIS',
  description:
    'Las mejores películas y series gratis en un solo lugar, no te pierdas de la mejor plataforma de todas.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={lexendDeca.variable}>
      <body className="home blog wp-theme-cinehax">{children}</body>
    </html>
  );
}
