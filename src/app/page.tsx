import type { Metadata } from 'next';
import HomePage from '../views/app/HomePage';
import { HOME_PAGE_CONTENT } from '../lib/landingContent';

export const metadata: Metadata = {
  title: HOME_PAGE_CONTENT.title,
  description: HOME_PAGE_CONTENT.description,
  alternates: {
    canonical: HOME_PAGE_CONTENT.path,
  },
  openGraph: {
    title: HOME_PAGE_CONTENT.title,
    description: HOME_PAGE_CONTENT.description,
    url: HOME_PAGE_CONTENT.path,
    images: ['/og/default.png'],
  },
  twitter: {
    title: HOME_PAGE_CONTENT.title,
    description: HOME_PAGE_CONTENT.description,
    images: ['/og/default.png'],
  },
};

const Page = () => {
  return <HomePage />;
};

export default Page;
