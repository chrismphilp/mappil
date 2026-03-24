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
import QuitChallengeButton from './QuitChallengeButton';

import ShootingStarsBackground from '../app/ShootingStarsBackground';

const loadGlobe = () => import('../globe/Globe');
export const preloadGlobe = () => loadGlobe();
const Globe = lazy(loadGlobe);

interface GameContentProps {
  onGlobeReady: () => void;
  initialContinent?: ContinentFilter;
  initialDifficulty?: Difficulty;
  initialGameMode?: GameMode;
  challengeId?: string;
  seed?: string;
  isDailyChallenge?: boolean;
}

const GameContent: FC<GameContentProps> = ({
  onGlobeReady,
  initialContinent = ContinentFilter.WORLD,
  initialDifficulty = Difficulty.MEDIUM,
  initialGameMode = GameMode.QUICK,
  challengeId,
  seed,
  isDailyChallenge,
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
  } = useGameState(initialContinent, initialDifficulty, initialGameMode, challengeId, seed, isDailyChallenge);
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
        isDailyChallenge={state.isDailyChallenge}
      />

      <FeedbackOverlay
        lastAnswerCorrect={state.lastAnswerCorrect}
        streak={state.streak}
        skippedRegion={state.skippedRegion}
      />

      <div 
        className="fixed z-30 flex gap-3"
        style={{ 
          bottom: 'max(var(--sab), 1.5rem)',
          left: 'max(var(--sal), 1.5rem)'
        }}
      >
        {!state.isDailyChallenge ? (
          <SettingsButton onClick={() => setSettingsOpen(true)} />
        ) : (
          <QuitChallengeButton />
        )}
        <LeaderboardButton onClick={() => setLeaderboardOpen(true)} />
      </div>

      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        difficulty={state.difficulty}
        continent={state.continent}
        gameMode={state.gameMode}
        challengeId={state.challengeId}
        isDailyChallenge={state.isDailyChallenge}
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
        challengeId={state.challengeId}
        seed={state.seed}
        isDailyChallenge={state.isDailyChallenge}
        onPlayAgain={resetGame}
      />
    </div>
  );
};

export default GameContent;
