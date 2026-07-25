import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import LibrarySync from '@/components/LibrarySync';

export const metadata: Metadata = {
  title: 'Vertyx Vault — Tu espacio audiovisual',
  description: 'Una experiencia premium para descubrir y organizar contenido audiovisual.',
  icons: {
    icon: [{ url: '/favicon/vertyx-vault-icon.png', type: 'image/png', sizes: '192x192' }],
    apple: [{ url: '/favicon/vertyx-vault-icon.png', type: 'image/png', sizes: '192x192' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        {children}
        <LibrarySync />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
