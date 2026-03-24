import React, { FC, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadGeoJson } from '../../data/maps';
import { ContinentFilter, Difficulty, GameMode, ChallengeType } from '../../types/game.types';
import LoadingOverlay from '../../components/app/LoadingOverlay';
import GameContent, { preloadGlobe } from '../../components/game/GameContent';
import { SEO } from '../../components/app/SEO';
import { getDailyChallengeConfig } from '../../lib/dailyChallenge';
import { getFriendChallenge, FriendChallenge } from '../../lib/friendChallenge';

interface PlayPageProps {
  continent?: ContinentFilter;
  difficulty?: Difficulty;
  gameMode?: GameMode;
  suppressSEO?: boolean;
}

const PlayPage: FC<PlayPageProps> = ({ continent, difficulty, gameMode, suppressSEO = false }) => {
  const [searchParams] = useSearchParams();
  const isDaily = searchParams.get('daily') === 'true';
  const challengeParam = searchParams.get('challenge');

  const dailyConfig = useMemo(() => isDaily ? getDailyChallengeConfig() : null, [isDaily]);

  const [friendConfig, setFriendConfig] = useState<FriendChallenge | null>(null);
  const [friendConfigLoading, setFriendConfigLoading] = useState(!!challengeParam);

  useEffect(() => {
    if (challengeParam) {
      getFriendChallenge(challengeParam)
        .then((config) => {
          setFriendConfig(config);
        })
        .catch(console.error)
        .finally(() => {
          setFriendConfigLoading(false);
        });
    }
  }, [challengeParam]);

  const initialContinent = useMemo(() => {
    if (friendConfig) return friendConfig.continent;
    if (dailyConfig) return dailyConfig.continent;
    if (continent) return continent;
    const p = searchParams.get('continent');
    if (p && Object.values(ContinentFilter).includes(p as ContinentFilter)) {
      return p as ContinentFilter;
    }
    return ContinentFilter.WORLD;
  }, [searchParams, continent, dailyConfig, friendConfig]);

  const initialDifficulty = useMemo(() => {
    if (friendConfig) return friendConfig.difficulty;
    if (dailyConfig) return dailyConfig.difficulty;
    if (difficulty) return difficulty;
    const p = searchParams.get('difficulty');
    if (p && Object.values(Difficulty).includes(p as Difficulty)) {
      return p as Difficulty;
    }
    return Difficulty.MEDIUM;
  }, [searchParams, difficulty, dailyConfig, friendConfig]);

  const initialGameMode = useMemo(() => {
    if (friendConfig) return friendConfig.game_mode;
    if (dailyConfig) return dailyConfig.gameMode;
    if (gameMode) return gameMode;
    const p = searchParams.get('mode');
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
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 p-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Challenge Not Found</h2>
        <p className="text-slate-400 mb-6">This challenge link might be invalid or has expired.</p>
        <a href="/" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold transition-colors">
          Return Home
        </a>
      </div>
    );
  }

  const isLoading = !globeReady || friendConfigLoading;

  return (
    <>
      {!suppressSEO && (
        <SEO
          title={isDaily ? 'Daily Challenge - Mappil' : friendConfig ? `Challenge from ${friendConfig.created_by_username} - Mappil` : `Play Mappil - ${initialContinent} Map Quiz`}
          description="Test your geography knowledge with Mappil. Identify countries and regions on an interactive 3D globe."
          canonicalUrl="https://mappil.com/play"
        />
      )}
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
