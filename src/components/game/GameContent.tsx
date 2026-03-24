import { FC, lazy, Suspense, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameState } from '../../hooks/game/useGameState';
import { ChallengeType, ContinentFilter, Difficulty, GameMode } from '../../types/game.types';
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
  challengeType?: ChallengeType;
  seed?: string;
  isDailyChallenge?: boolean;
}

const GameContent: FC<GameContentProps> = ({
  onGlobeReady,
  initialContinent = ContinentFilter.WORLD,
  initialDifficulty = Difficulty.MEDIUM,
  initialGameMode = GameMode.QUICK,
  challengeId,
  challengeType,
  seed,
  isDailyChallenge,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state,
    selectRegion,
    skipRegion,
    changeRuleset,
    resetGame,
    progress,
    totalRegions,
    durationSecs,
  } = useGameState(
    initialContinent,
    initialDifficulty,
    initialGameMode,
    challengeId,
    challengeType,
    seed,
    isDailyChallenge,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const startFreePlay = useCallback(
    (nextDifficulty: Difficulty, nextContinent: ContinentFilter, nextGameMode: GameMode) => {
      if (
        nextContinent !== state.continent ||
        nextDifficulty !== state.difficulty ||
        nextGameMode !== state.gameMode
      ) {
        changeRuleset(nextDifficulty, nextContinent, nextGameMode);
      }

      const search = new URLSearchParams(location.search);
      search.delete('daily');
      search.delete('challenge');

      if (nextContinent === ContinentFilter.WORLD) {
        search.delete('continent');
      } else {
        search.set('continent', nextContinent);
      }

      if (nextDifficulty === Difficulty.MEDIUM) {
        search.delete('difficulty');
      } else {
        search.set('difficulty', nextDifficulty);
      }

      if (nextGameMode === GameMode.QUICK) {
        search.delete('mode');
      } else {
        search.set('mode', nextGameMode);
      }

      navigate(
        {
          pathname: location.pathname,
          search: search.toString() ? `?${search.toString()}` : '',
        },
        { replace: true },
      );
    },
    [
      state.continent,
      state.difficulty,
      state.gameMode,
      changeRuleset,
      location.pathname,
      location.search,
      navigate,
    ],
  );

  return (
    <div className="fixed inset-0 bg-transparent overflow-hidden">
      <ShootingStarsBackground />
      <Suspense fallback={null}>
        <Globe
          regionsFound={state.regionsFound}
          flyToRegion={state.feedback?.outcome === 'skip' ? state.feedback.skippedRegion : null}
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
        challengeType={state.challengeType}
      />

      <FeedbackOverlay
        feedback={state.feedback}
        currentGuessErrors={state.currentGuessErrors}
      />

      <div
        className="fixed z-30 flex gap-3"
        style={{
          bottom: 'max(var(--sab), 1.5rem)',
          left: 'max(var(--sal), 1.5rem)',
        }}
      >
        {!state.isDailyChallenge && state.challengeType !== ChallengeType.FRIEND ? (
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
        challengeType={state.challengeType}
        isDailyChallenge={state.isDailyChallenge}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        difficulty={state.difficulty}
        continent={state.continent}
        gameMode={state.gameMode}
        onChangeDifficulty={(nextDifficulty) =>
          startFreePlay(nextDifficulty, state.continent, state.gameMode)
        }
        onChangeContinent={(nextContinent) =>
          startFreePlay(state.difficulty, nextContinent, state.gameMode)
        }
        onChangeGameMode={(nextGameMode) =>
          startFreePlay(state.difficulty, state.continent, nextGameMode)
        }
        onReset={resetGame}
      />

      <GameCompleteModal
        open={state.gameOver}
        runId={state.runId}
        score={state.score}
        baseScore={state.baseScore}
        bonusScore={state.bonusScore}
        maxPossibleScore={state.maxPossibleScore}
        scoreBreakdown={state.scoreBreakdown}
        errors={state.errors}
        bestStreak={state.bestStreak}
        totalRegions={totalRegions}
        correctAnswers={state.correctAnswers}
        skippedCount={state.skippedCount}
        firstTryCount={state.firstTryCount}
        secondTryCount={state.secondTryCount}
        thirdTrySaveCount={state.thirdTrySaveCount}
        difficulty={state.difficulty}
        continent={state.continent}
        gameMode={state.gameMode}
        durationSecs={durationSecs}
        challengeId={state.challengeId}
        challengeType={state.challengeType}
        seed={state.seed}
        isDailyChallenge={state.isDailyChallenge}
        onPlayAgain={resetGame}
        onViewLeaderboard={() => setLeaderboardOpen(true)}
        onStartFreePlay={startFreePlay}
      />
    </div>
  );
};

export default GameContent;
