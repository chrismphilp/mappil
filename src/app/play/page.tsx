import type { Metadata } from 'next';
import GameViewportClient from '../../components/app/GameViewportClient';

export const metadata: Metadata = {
  title: 'Play Mappil On The 3D Globe',
  description:
    'Play Mappil on the interactive 3D globe, including daily challenges, friend challenges, and free-play geography runs.',
  alternates: {
    canonical: '/play',
  },
  openGraph: {
    title: 'Play Mappil On The 3D Globe',
    description:
      'Play Mappil on the interactive 3D globe, including daily challenges, friend challenges, and free-play geography runs.',
    url: '/play',
    images: ['/og/default.png'],
  },
  twitter: {
    title: 'Play Mappil On The 3D Globe',
    description:
      'Play Mappil on the interactive 3D globe, including daily challenges, friend challenges, and free-play geography runs.',
    images: ['/og/default.png'],
  },
};

const Page = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <GameViewportClient />
    </div>
  );
};

export default Page;
