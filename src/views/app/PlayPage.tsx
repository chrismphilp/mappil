'use client';

import React, { FC, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loadGeoJson, type GeoJsonLoadStage } from '../../data/maps';
import { ContinentFilter, Difficulty, GameMode, ChallengeType } from '../../types/game.types';
import LoadingOverlay from '../../components/app/LoadingOverlay';
import PerformanceDebugPanel, {
  type PerformanceSample,
  type PerformanceTimings,
} from '../../components/app/PerformanceDebugPanel';
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

type StartupStage =
  | 'loading_challenge'
  | 'loading_regions'
  | 'preparing_regions'
  | 'loading_globe'
  | 'finalizing_interaction';

const STARTUP_STAGE_LABELS: Record<StartupStage, string> = {
  loading_challenge: 'Loading challenge',
  loading_regions: 'Loading region data',
  preparing_regions: 'Preparing regions',
  loading_globe: 'Loading globe',
  finalizing_interaction: 'Finalizing interaction',
};

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
  const perfEnabled = searchParams?.get('perf') === '1';

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

  const [dataProgress, setDataProgress] = useState<number | null>(0);
  const [geoJsonStage, setGeoJsonStage] = useState<GeoJsonLoadStage>('loading');
  const [globeModuleLoaded, setGlobeModuleLoaded] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const globeReadyRef = useRef(false);
  const perfStartRef = useRef<number | null>(null);
  const [perfTimings, setPerfTimings] = useState<PerformanceTimings>({
    challengeResolvedMs: null,
    dataReadyMs: null,
    geometryReadyMs: null,
    globeModuleReadyMs: null,
    interactiveMs: null,
  });
  const [fpsSample, setFpsSample] = useState<PerformanceSample | null>(null);
  const dataLoaded = geoJsonStage === 'ready';

  const recordPerfTiming = useCallback(
    (key: keyof PerformanceTimings) => {
      if (!perfEnabled || perfStartRef.current === null) {
        return;
      }

      setPerfTimings((current) => {
        if (current[key] !== null) {
          return current;
        }

        return {
          ...current,
          [key]: performance.now() - perfStartRef.current!,
        };
      });
    },
    [perfEnabled],
  );

  useEffect(() => {
    if (!perfEnabled) {
      return;
    }

    perfStartRef.current = performance.now();
    setPerfTimings({
      challengeResolvedMs: challengeParam ? null : 0,
      dataReadyMs: null,
      geometryReadyMs: null,
      globeModuleReadyMs: null,
      interactiveMs: null,
    });
    setFpsSample(null);
  }, [challengeParam, perfEnabled]);

  useEffect(() => {
    let active = true;
    let frameId = 0;

    void preloadGlobe().then(() => {
      if (active) {
        setGlobeModuleLoaded(true);
      }
    });

    loadGeoJson((state) => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (active) {
          setGeoJsonStage(state.stage);

          if (state.stage === 'loading') {
            setDataProgress(state.fraction ?? null);
          } else if (state.stage === 'ready') {
            setDataProgress(1);
          } else {
            setDataProgress(null);
          }
        }
      });
    });

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!friendConfigLoading) {
      recordPerfTiming('challengeResolvedMs');
    }
  }, [friendConfigLoading, recordPerfTiming]);

  useEffect(() => {
    if (geoJsonStage === 'ready') {
      recordPerfTiming('dataReadyMs');
      recordPerfTiming('geometryReadyMs');
    }
  }, [geoJsonStage, recordPerfTiming]);

  useEffect(() => {
    if (globeModuleLoaded) {
      recordPerfTiming('globeModuleReadyMs');
    }
  }, [globeModuleLoaded, recordPerfTiming]);

  const handleGlobeReady = useCallback(() => {
    if (!globeReadyRef.current) {
      globeReadyRef.current = true;
      setGlobeReady(true);
    }
  }, []);

  useEffect(() => {
    if (globeReady) {
      recordPerfTiming('interactiveMs');
    }
  }, [globeReady, recordPerfTiming]);

  useEffect(() => {
    if (!perfEnabled || !globeReady) {
      return;
    }

    let frameCount = 0;
    let rafId = 0;
    const sampleStart = performance.now();

    const tick = (now: number) => {
      frameCount += 1;

      if (now - sampleStart >= 2000) {
        const durationMs = now - sampleStart;
        setFpsSample({
          avgFps: (frameCount * 1000) / durationMs,
          durationMs,
          frames: frameCount,
        });
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [globeReady, perfEnabled]);

  const onlineFeaturesUnavailable =
    friendChallengeError === SUPABASE_UNAVAILABLE_MESSAGE;

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

  const loadingState = useMemo(() => {
    if (friendConfigLoading) {
      return {
        label: STARTUP_STAGE_LABELS.loading_challenge,
      };
    }

    if (geoJsonStage === 'loading') {
      return {
        label: STARTUP_STAGE_LABELS.loading_regions,
        progress: dataProgress ?? undefined,
      };
    }

    if (geoJsonStage === 'parsing') {
      return {
        label: STARTUP_STAGE_LABELS.preparing_regions,
      };
    }

    if (globeReady) {
      return null;
    }

    if (!globeModuleLoaded) {
      return {
        label: STARTUP_STAGE_LABELS.loading_globe,
      };
    }

    return {
      label: STARTUP_STAGE_LABELS.finalizing_interaction,
    };
  }, [dataProgress, friendConfigLoading, geoJsonStage, globeModuleLoaded, globeReady]);

  const isLoading = loadingState !== null;

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
      {isLoading && loadingState && (
        <LoadingOverlay
          label={loadingState.label}
          progress={loadingState.progress}
        />
      )}
      {perfEnabled && (
        <PerformanceDebugPanel
          experienceLabel="full"
          geometryTierLabel="full"
          hasChallenge={!!challengeParam}
          timings={perfTimings}
          fpsSample={fpsSample}
        />
      )}
    </>
  );
};

export default PlayPage;
