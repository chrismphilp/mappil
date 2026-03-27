'use client';

import React, { FC, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getGeometryTierForExperience,
  loadWorldGeometry,
  loadWorldMeta,
} from '../../data/maps';
import {
  ChallengeType,
  ContinentFilter,
  Difficulty,
  ExperienceMode,
  GameMode,
} from '../../types/game.types';
import LoadingOverlay from '../../components/app/LoadingOverlay';
import GameContent, { preloadGlobe } from '../../components/game/GameContent';
import { getDailyChallengeConfig } from '../../lib/dailyChallenge';
import type { FriendChallenge } from '../../lib/friendChallenge';
import { SUPABASE_UNAVAILABLE_MESSAGE } from '../../lib/supabaseConfig';

interface PlayPageProps {
  continent?: ContinentFilter;
  difficulty?: Difficulty;
  gameMode?: GameMode;
  dailyChallenge?: boolean;
  suppressSEO?: boolean;
  experience: ExperienceMode;
}

type StartupStage =
  | 'loading_challenge'
  | 'loading_regions'
  | 'loading_globe'
  | 'finalizing_interaction';

const STARTUP_STAGE_LABELS: Record<StartupStage, string> = {
  loading_challenge: 'Loading challenge',
  loading_regions: 'Loading region data',
  loading_globe: 'Loading globe',
  finalizing_interaction: 'Finalizing interaction',
};

const PlayPage: FC<PlayPageProps> = ({
  continent,
  difficulty,
  gameMode,
  dailyChallenge = false,
  suppressSEO = false,
  experience,
}) => {
  const searchParams = useSearchParams();
  const isDaily = dailyChallenge || searchParams?.get('daily') === 'true';
  const challengeParam = searchParams?.get('challenge') ?? null;
  const geometryTier = useMemo(
    () => getGeometryTierForExperience(experience),
    [experience],
  );
  const requiresMeta = experience === 'preview';

  const dailyConfig = useMemo(() => isDaily ? getDailyChallengeConfig() : null, [isDaily]);

  const [friendConfig, setFriendConfig] = useState<FriendChallenge | null>(null);
  const [friendConfigLoading, setFriendConfigLoading] = useState(!!challengeParam);
  const [friendChallengeError, setFriendChallengeError] = useState<string | null>(null);

  useEffect(() => {
    if (!challengeParam) {
      setFriendConfig(null);
      setFriendConfigLoading(false);
      setFriendChallengeError(null);
      return;
    }

    let active = true;
    setFriendConfigLoading(true);

    void import('../../lib/friendChallenge')
      .then(({ getFriendChallenge }) => getFriendChallenge(challengeParam))
        .then((config) => {
          if (active) {
            setFriendConfig(config);
            setFriendChallengeError(null);
          }
        })
        .catch((error: any) => {
          if (active) {
            console.error(error);
            setFriendChallengeError(error?.message ?? 'Unable to load this challenge.');
          }
        })
        .finally(() => {
          if (active) {
            setFriendConfigLoading(false);
          }
        });

    return () => {
      active = false;
    };
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

  const [metaLoaded, setMetaLoaded] = useState(false);
  const [geometryLoaded, setGeometryLoaded] = useState(false);
  const [globeModuleLoaded, setGlobeModuleLoaded] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const globeReadyRef = useRef(false);

  useEffect(() => {
    let active = true;
    globeReadyRef.current = false;
    setMetaLoaded(false);
    setGeometryLoaded(false);
    setGlobeModuleLoaded(false);
    setGlobeReady(false);

    void preloadGlobe().then(() => {
      if (active) {
        setGlobeModuleLoaded(true);
      }
    });

    if (requiresMeta) {
      void loadWorldMeta().then(() => {
        if (active) {
          setMetaLoaded(true);
        }
      });
    }

    void loadWorldGeometry(geometryTier).then(() => {
      if (active) {
        setGeometryLoaded(true);
      }
    });

    return () => {
      active = false;
    };
  }, [geometryTier, requiresMeta]);

  const handleGlobeReady = useCallback(() => {
    if (!globeReadyRef.current) {
      globeReadyRef.current = true;
      setGlobeReady(true);
    }
  }, []);

  const dataLoaded = requiresMeta ? metaLoaded : geometryLoaded;
  const onlineFeaturesUnavailable =
    friendChallengeError === SUPABASE_UNAVAILABLE_MESSAGE;

  const loadingState = useMemo<{ label: string; progress?: number } | null>(() => {
    if (friendConfigLoading) {
      return {
        label: STARTUP_STAGE_LABELS.loading_challenge,
      };
    }

    if (!dataLoaded) {
      return {
        label: STARTUP_STAGE_LABELS.loading_regions,
      };
    }

    if (globeReady) {
      return null;
    }

    if (!globeModuleLoaded || !geometryLoaded) {
      return {
        label: STARTUP_STAGE_LABELS.loading_globe,
      };
    }

    return {
      label: STARTUP_STAGE_LABELS.finalizing_interaction,
    };
  }, [dataLoaded, friendConfigLoading, geometryLoaded, globeModuleLoaded, globeReady]);

  const isLoading = loadingState !== null;

  if (challengeParam && !friendConfig && !friendConfigLoading) {
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
          experience={experience}
          geometryReady={geometryLoaded}
        />
      )}
      {isLoading && loadingState && (
        <LoadingOverlay
          label={loadingState.label}
          progress={loadingState.progress}
        />
      )}
    </>
  );
};

export default PlayPage;
