import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlayPage from './pages/PlayPage';
import ContinentQuizPage from './pages/landing/ContinentQuizPage';

const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="/:quizId" element={<ContinentQuizPage />} />
    </Routes>
  );
};

export default App;
