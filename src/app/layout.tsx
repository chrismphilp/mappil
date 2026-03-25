import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { SITE_URL } from '../lib/landingContent';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Mappil | Free 3D World Map Game',
    template: '%s | Mappil',
  },
  description:
    'Play Mappil, a free 3D world map game and geography quiz with continent practice, daily challenges, and replayable runs.',
  openGraph: {
    type: 'website',
    siteName: 'Mappil',
    title: 'Mappil | Free 3D World Map Game',
    description:
      'Play Mappil, a free 3D world map game and geography quiz with continent practice, daily challenges, and replayable runs.',
    images: [
      {
        url: '/og/default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mappil | Free 3D World Map Game',
    description:
      'Play Mappil, a free 3D world map game and geography quiz with continent practice, daily challenges, and replayable runs.',
    images: ['/og/default.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
};

export default RootLayout;
