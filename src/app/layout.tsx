import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import LibrarySync from '@/components/LibrarySync';
import ProWelcomeOffer from '@/components/ProExperience';
import AdPopunder from '@/components/AdPopunder';

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
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5148520806929313" crossOrigin="anonymous"></script>
        <script type='text/javascript' src='//pl30627933.effectivecpmnetwork.com/86/78/30/86783013856778154df262d9add97b99.js'></script>
      </head>
      <body>
        {children}
        <LibrarySync />
        <ProWelcomeOffer />
        <AdPopunder />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
