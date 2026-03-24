import { FC } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/app/HomePage';
import ContinentQuizPage from './pages/landing/ContinentQuizPage';
import MapGamePage from './pages/landing/MapGamePage';

const PlayRedirect: FC = () => {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/', search }} replace />;
};

const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/play" element={<PlayRedirect />} />
      <Route path="/map-game" element={<MapGamePage />} />
      <Route path="/:quizId" element={<ContinentQuizPage />} />
    </Routes>
  );
};

export default App;
