import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LandingPageShell from '../../components/landing/LandingPageShell';
import {
  getOrganicPageContent,
  isOrganicRoute,
  ORGANIC_ROUTE_IDS,
  OrganicRouteId,
} from '../../lib/growthLandingPages';
import {
  getQuizPageContent,
  isQuizRoute,
  QUIZ_ROUTE_IDS,
  QuizRouteId,
} from '../../lib/landingContent';

interface QuizPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export const generateStaticParams = () => {
  return [...QUIZ_ROUTE_IDS, ...ORGANIC_ROUTE_IDS].map((quizId) => ({ quizId }));
};

export const generateMetadata = async ({
  params,
}: QuizPageProps): Promise<Metadata> => {
  const { quizId } = await params;

  if (!isQuizRoute(quizId) && !isOrganicRoute(quizId)) {
    return {};
  }

  const content = isQuizRoute(quizId)
    ? getQuizPageContent(quizId as QuizRouteId)
    : getOrganicPageContent(quizId as OrganicRouteId);

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: content.path,
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: content.path,
      images: ['/og/default.png'],
    },
    twitter: {
      title: content.title,
      description: content.description,
      images: ['/og/default.png'],
    },
  };
};

const Page = async ({ params }: QuizPageProps) => {
  const { quizId } = await params;

  if (!isQuizRoute(quizId) && !isOrganicRoute(quizId)) {
    notFound();
  }

  const content = isQuizRoute(quizId)
    ? getQuizPageContent(quizId as QuizRouteId)
    : getOrganicPageContent(quizId as OrganicRouteId);

  return <LandingPageShell content={content} />;
};

export default Page;
