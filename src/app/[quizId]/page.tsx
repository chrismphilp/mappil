import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContinentQuizPage from '../../views/landing/ContinentQuizPage';
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
  return QUIZ_ROUTE_IDS.map((quizId) => ({ quizId }));
};

export const generateMetadata = async ({
  params,
}: QuizPageProps): Promise<Metadata> => {
  const { quizId } = await params;

  if (!isQuizRoute(quizId)) {
    return {};
  }

  const content = getQuizPageContent(quizId as QuizRouteId);

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

  if (!isQuizRoute(quizId)) {
    notFound();
  }

  return <ContinentQuizPage quizId={quizId as QuizRouteId} />;
};

export default Page;
