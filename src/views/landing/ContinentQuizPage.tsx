import LandingPageShell from '../../components/landing/LandingPageShell';
import {
  getQuizPageContent,
  isQuizRoute,
  QuizRouteId,
} from '../../lib/landingContent';

interface ContinentQuizPageProps {
  quizId: QuizRouteId;
}

const ContinentQuizPage = ({ quizId }: ContinentQuizPageProps) => {
  if (!isQuizRoute(quizId)) {
    return null;
  }

  return <LandingPageShell content={getQuizPageContent(quizId)} />;
};

export default ContinentQuizPage;
