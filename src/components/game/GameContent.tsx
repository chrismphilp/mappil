'use client';

import { FC, lazy, Suspense, useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import StarfieldBackground from '../app/StarfieldBackground';
import ProfileButton from '../profile/ProfileButton';
import ProfilePanel from '../profile/ProfilePanel';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPathname = pathname ?? '/';
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [backgroundVisible, setBackgroundVisible] = useState(false);
  const { isMobile } = useIsMobileViewport();
  const startFreePlay = useCallback(
    (nextDifficulty: Difficulty, nextContinent: ContinentFilter, nextGameMode: GameMode) => {
      if (
        nextContinent !== state.continent ||
        nextDifficulty !== state.difficulty ||
        nextGameMode !== state.gameMode
      ) {
        changeRuleset(nextDifficulty, nextContinent, nextGameMode);
      }

      const search = new URLSearchParams(searchParams?.toString() ?? '');
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

      router.replace(
        search.toString() ? `${currentPathname}?${search.toString()}` : currentPathname,
        { scroll: false },
      );
    },
    [
      state.continent,
      state.difficulty,
      state.gameMode,
      changeRuleset,
      currentPathname,
      router,
      searchParams,
    ],
  );
  const handleGlobeReady = useCallback(() => {
    setBackgroundVisible(true);
    onGlobeReady();
  }, [onGlobeReady]);

  return (
    <div className="fixed inset-0 bg-transparent overflow-hidden">
      {backgroundVisible && <StarfieldBackground />}
      <ShootingStarsBackground enabled={backgroundVisible} />
      <Suspense fallback={null}>
        <Globe
          regionsFound={state.regionsFound}
          flyToRegion={state.feedback?.outcome === 'skip' ? state.feedback.skippedRegion : null}
          onRegionClick={selectRegion}
          onReady={handleGlobeReady}
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
        className={`fixed z-30 flex items-center ${
          isMobile
            ? 'gap-1.5 rounded-full border border-white/10 bg-slate-950/55 p-1.5 shadow-2xl backdrop-blur-xl'
            : 'gap-3'
        }`}
        style={{
          bottom: `max(var(--sab), ${isMobile ? '1rem' : '1.5rem'})`,
          left: `max(var(--sal), ${isMobile ? '1rem' : '1.5rem'})`,
        }}
      >
        {!state.isDailyChallenge && state.challengeType !== ChallengeType.FRIEND ? (
          <SettingsButton onClick={() => setSettingsOpen(true)} compact={isMobile} />
        ) : (
          <QuitChallengeButton compact={isMobile} />
        )}
        <ProfileButton onClick={() => setProfileOpen(true)} compact={isMobile} />
        <LeaderboardButton onClick={() => setLeaderboardOpen(true)} compact={isMobile} />
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
        onOpenProfile={() => setProfileOpen(true)}
        onPlayAgain={resetGame}
        onViewLeaderboard={() => setLeaderboardOpen(true)}
        onStartFreePlay={startFreePlay}
      />

      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default GameContent;
