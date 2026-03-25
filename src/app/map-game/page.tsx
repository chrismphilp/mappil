import type { Metadata } from 'next';
import MapGamePage from '../../views/landing/MapGamePage';
import { MAP_GAME_PAGE_CONTENT } from '../../lib/landingContent';

export const metadata: Metadata = {
  title: MAP_GAME_PAGE_CONTENT.title,
  description: MAP_GAME_PAGE_CONTENT.description,
  alternates: {
    canonical: MAP_GAME_PAGE_CONTENT.path,
  },
  openGraph: {
    title: MAP_GAME_PAGE_CONTENT.title,
    description: MAP_GAME_PAGE_CONTENT.description,
    url: MAP_GAME_PAGE_CONTENT.path,
    images: ['/og/default.png'],
  },
  twitter: {
    title: MAP_GAME_PAGE_CONTENT.title,
    description: MAP_GAME_PAGE_CONTENT.description,
    images: ['/og/default.png'],
  },
};

const Page = () => {
  return <MapGamePage />;
};

export default Page;
