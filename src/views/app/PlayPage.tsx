'use client';

import React, { FC, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loadGeoJson } from '../../data/maps';
import { ContinentFilter, Difficulty, GameMode, ChallengeType } from '../../types/game.types';
import LoadingOverlay from '../../components/app/LoadingOverlay';
import GameContent, { preloadGlobe } from '../../components/game/GameContent';
import { getDailyChallengeConfig } from '../../lib/dailyChallenge';
import { getFriendChallenge, FriendChallenge } from '../../lib/friendChallenge';
import { SUPABASE_UNAVAILABLE_MESSAGE } from '../../lib/supabase';

interface PlayPageProps {
  continent?: ContinentFilter;
  difficulty?: Difficulty;
  gameMode?: GameMode;
  dailyChallenge?: boolean;
  suppressSEO?: boolean;
}

const PlayPage: FC<PlayPageProps> = ({
  continent,
  difficulty,
  gameMode,
  dailyChallenge = false,
  suppressSEO = false,
}) => {
  const searchParams = useSearchParams();
  const isDaily = dailyChallenge || searchParams?.get('daily') === 'true';
  const challengeParam = searchParams?.get('challenge') ?? null;

  const dailyConfig = useMemo(() => isDaily ? getDailyChallengeConfig() : null, [isDaily]);

  const [friendConfig, setFriendConfig] = useState<FriendChallenge | null>(null);
  const [friendConfigLoading, setFriendConfigLoading] = useState(!!challengeParam);
  const [friendChallengeError, setFriendChallengeError] = useState<string | null>(null);

  useEffect(() => {
    if (challengeParam) {
      getFriendChallenge(challengeParam)
        .then((config) => {
          setFriendConfig(config);
          setFriendChallengeError(null);
        })
        .catch((error: any) => {
          console.error(error);
          setFriendChallengeError(error?.message ?? 'Unable to load this challenge.');
        })
        .finally(() => {
          setFriendConfigLoading(false);
        });
    }
  }, [challengeParam]);

  const initialContinent = useMemo(() => {
    if (friendConfig) return friendConfig.continent;
    if (dailyConfig) return dailyConfig.continent;
    if (continent) return continent;
    const p = searchParams?.get('continent');
    if (p && Object.values(ContinentFilter).includes(p as ContinentFilter)) {
      return p as ContinentFilter;
    }
    return ContinentFilter.WORLD;
  }, [searchParams, continent, dailyConfig, friendConfig]);

  const initialDifficulty = useMemo(() => {
    if (friendConfig) return friendConfig.difficulty;
    if (dailyConfig) return dailyConfig.difficulty;
    if (difficulty) return difficulty;
    const p = searchParams?.get('difficulty');
    if (p && Object.values(Difficulty).includes(p as Difficulty)) {
      return p as Difficulty;
    }
    return Difficulty.MEDIUM;
  }, [searchParams, difficulty, dailyConfig, friendConfig]);

  const initialGameMode = useMemo(() => {
    if (friendConfig) return friendConfig.game_mode;
    if (dailyConfig) return dailyConfig.gameMode;
    if (gameMode) return gameMode;
    const p = searchParams?.get('mode');
    if (p && Object.values(GameMode).includes(p as GameMode)) {
      return p as GameMode;
    }
    return GameMode.QUICK;
  }, [searchParams, gameMode, dailyConfig, friendConfig]);

  const [dataProgress, setDataProgress] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const globeReadyRef = useRef(false);

  useEffect(() => {
    let active = true;
    let frameId = 0;

    void preloadGlobe();

    loadGeoJson((fraction) => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (active) {
          setDataProgress(fraction);
        }
      });
    }).then(() => {
      if (active) {
        setDataLoaded(true);
      }
    });

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, []);

  const handleGlobeReady = useCallback(() => {
    if (!globeReadyRef.current) {
      globeReadyRef.current = true;
      setGlobeReady(true);
    }
  }, []);

  const totalProgress = dataLoaded
    ? 0.9 + (globeReady ? 0.1 : 0)
    : dataProgress * 0.9;

  if (challengeParam && !friendConfig && !friendConfigLoading) {
    const onlineFeaturesUnavailable =
      friendChallengeError === SUPABASE_UNAVAILABLE_MESSAGE;

    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 p-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {onlineFeaturesUnavailable ? 'Online Features Unavailable' : 'Challenge Not Found'}
        </h2>
        <p className="text-slate-400 mb-6">
          {onlineFeaturesUnavailable
            ? friendChallengeError
            : 'This challenge link might be invalid or has expired.'}
        </p>
        <Link href="/" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  const isLoading = !globeReady || friendConfigLoading;

  return (
    <>
      {dataLoaded && !friendConfigLoading && (
        <GameContent 
          onGlobeReady={handleGlobeReady} 
          initialContinent={initialContinent}
          initialDifficulty={initialDifficulty}
          initialGameMode={initialGameMode}
          challengeId={friendConfig ? friendConfig.id : dailyConfig?.challengeId}
          challengeType={friendConfig ? ChallengeType.FRIEND : (dailyConfig ? ChallengeType.DAILY : undefined)}
          seed={friendConfig ? friendConfig.seed : dailyConfig?.seed}
          isDailyChallenge={!!dailyConfig}
        />
      )}
      {isLoading && <LoadingOverlay progress={totalProgress} />}
    </>
  );
};

export default PlayPage;
