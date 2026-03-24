import { FC, lazy, Suspense, useState } from 'react';
import { useGameState } from '../../hooks/game/useGameState';
import { ContinentFilter, Difficulty, GameMode } from '../../types/game.types';
import HUD from './HUD';
import FeedbackOverlay from './FeedbackOverlay';
import SettingsButton from '../settings/SettingsButton';
import SettingsPanel from '../settings/SettingsPanel';
import GameCompleteModal from './GameCompleteModal';
import LeaderboardButton from '../leaderboard/LeaderboardButton';
import LeaderboardModal from '../leaderboard/LeaderboardModal';

import ShootingStarsBackground from '../ShootingStarsBackground';

const loadGlobe = () => import('../globe/Globe');
export const preloadGlobe = () => loadGlobe();
const Globe = lazy(loadGlobe);

interface GameContentProps {
  onGlobeReady: () => void;
  initialContinent?: ContinentFilter;
  initialDifficulty?: Difficulty;
  initialGameMode?: GameMode;
}

const GameContent: FC<GameContentProps> = ({
  onGlobeReady,
  initialContinent = ContinentFilter.WORLD,
  initialDifficulty = Difficulty.MEDIUM,
  initialGameMode = GameMode.QUICK,
}) => {
  const {
    state,
    selectRegion,
    skipRegion,
    changeDifficulty,
    changeContinent,
    changeGameMode,
    resetGame,
    progress,
    totalRegions,
    durationSecs,
  } = useGameState(initialContinent, initialDifficulty, initialGameMode);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-transparent overflow-hidden">
      <ShootingStarsBackground />
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
        gameOver={state.gameOver}
        onSkip={skipRegion}
      />

      <FeedbackOverlay
        lastAnswerCorrect={state.lastAnswerCorrect}
        streak={state.streak}
        skippedRegion={state.skippedRegion}
      />

      <div className="fixed bottom-6 left-6 z-30 flex gap-3">
        <SettingsButton onClick={() => setSettingsOpen(true)} />
        <LeaderboardButton onClick={() => setLeaderboardOpen(true)} />
      </div>

      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        difficulty={state.difficulty}
        continent={state.continent}
        gameMode={state.gameMode}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        difficulty={state.difficulty}
        continent={state.continent}
        gameMode={state.gameMode}
        onChangeDifficulty={changeDifficulty}
        onChangeContinent={changeContinent}
        onChangeGameMode={changeGameMode}
        onReset={resetGame}
      />

      <GameCompleteModal
        open={state.gameOver}
        score={state.score}
        errors={state.errors}
        bestStreak={state.bestStreak}
        totalRegions={totalRegions}
        difficulty={state.difficulty}
        continent={state.continent}
        gameMode={state.gameMode}
        durationSecs={durationSecs}
        onPlayAgain={resetGame}
      />
    </div>
  );
};

export default GameContent;
