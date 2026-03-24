import { FC } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/app/HomePage';
import PlayPage from './pages/app/PlayPage';
import ContinentQuizPage from './pages/landing/ContinentQuizPage';

const PlayRedirect: FC = () => {
  const { search } = useLocation();
  return <Navigate to={`/${search}`} replace />;
};

const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/play" element={<PlayRedirect />} />
      <Route path="/:quizId" element={<ContinentQuizPage />} />
    </Routes>
  );
};

export default App;
