import { FC, lazy, Suspense, useEffect, useState } from 'react';
import { loadGeoJson } from './data/maps';
import { useGameState } from './hooks/useGameState';
import HUD from './components/HUD';
import FeedbackOverlay from './components/FeedbackOverlay';
import SettingsButton from './components/SettingsButton';
import SettingsPanel from './components/SettingsPanel';
import GameCompleteModal from './components/GameCompleteModal';

const Globe = lazy(() => import('./components/Globe'));

const GameContent: FC = () => {
  const { state, selectRegion, changeDifficulty, resetGame, progress, totalRegions } =
    useGameState();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden">
      <Suspense fallback={null}>
        <Globe regionsFound={state.regionsFound} flyToRegion={state.skippedRegion} onRegionClick={selectRegion} />
      </Suspense>

      <HUD
        regionToFind={state.regionToFind}
        score={state.score}
        errors={state.errors}
        streak={state.streak}
        currentGuessErrors={state.currentGuessErrors}
        progress={progress}
        regionsFound={state.regionsFound.length}
        totalRegions={totalRegions}
      />

      <FeedbackOverlay
        lastAnswerCorrect={state.lastAnswerCorrect}
        streak={state.streak}
      />

      <SettingsButton onClick={() => setSettingsOpen(true)} />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        difficulty={state.difficulty}
        onChangeDifficulty={changeDifficulty}
        onReset={resetGame}
      />

      <GameCompleteModal
        open={state.gameOver}
        score={state.score}
        errors={state.errors}
        bestStreak={state.bestStreak}
        totalRegions={totalRegions}
        onPlayAgain={resetGame}
      />
    </div>
  );
};

const App: FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGeoJson().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  return <GameContent />;
};

export default App;
