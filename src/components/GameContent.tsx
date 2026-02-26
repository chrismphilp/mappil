import { FC, lazy, Suspense, useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import HUD from './HUD';
import FeedbackOverlay from './FeedbackOverlay';
import SettingsButton from './SettingsButton';
import SettingsPanel from './SettingsPanel';
import GameCompleteModal from './GameCompleteModal';

const Globe = lazy(() => import('./Globe'));

const GameContent: FC<{ onGlobeReady: () => void }> = ({ onGlobeReady }) => {
  const { state, selectRegion, changeDifficulty, resetGame, progress, totalRegions } =
    useGameState();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden">
      <Suspense fallback={null}>
        <Globe
          regionsFound={state.regionsFound}
          flyToRegion={state.skippedRegion}
          onRegionClick={selectRegion}
          onReady={onGlobeReady}
        />
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

export default GameContent;
