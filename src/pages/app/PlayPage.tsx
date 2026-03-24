import React, { FC, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadGeoJson } from '../../data/maps';
import { ContinentFilter, Difficulty, GameMode } from '../../types/game.types';
import LoadingOverlay from '../../components/app/LoadingOverlay';
import GameContent, { preloadGlobe } from '../../components/game/GameContent';
import { SEO } from '../../components/app/SEO';
import { getDailyChallengeConfig } from '../../lib/dailyChallenge';

interface PlayPageProps {
  continent?: ContinentFilter;
  difficulty?: Difficulty;
  gameMode?: GameMode;
}

const PlayPage: FC<PlayPageProps> = ({ continent, difficulty, gameMode }) => {
  const [searchParams] = useSearchParams();
  const isDaily = searchParams.get('daily') === 'true';

  const dailyConfig = useMemo(() => isDaily ? getDailyChallengeConfig() : null, [isDaily]);

  const initialContinent = useMemo(() => {
    if (dailyConfig) return dailyConfig.continent;
    if (continent) return continent;
    const p = searchParams.get('continent');
    if (p && Object.values(ContinentFilter).includes(p as ContinentFilter)) {
      return p as ContinentFilter;
    }
    return ContinentFilter.WORLD;
  }, [searchParams, continent, dailyConfig]);

  const initialDifficulty = useMemo(() => {
    if (dailyConfig) return dailyConfig.difficulty;
    if (difficulty) return difficulty;
    const p = searchParams.get('difficulty');
    if (p && Object.values(Difficulty).includes(p as Difficulty)) {
      return p as Difficulty;
    }
    return Difficulty.MEDIUM;
  }, [searchParams, difficulty, dailyConfig]);

  const initialGameMode = useMemo(() => {
    if (dailyConfig) return dailyConfig.gameMode;
    if (gameMode) return gameMode;
    const p = searchParams.get('mode');
    if (p && Object.values(GameMode).includes(p as GameMode)) {
      return p as GameMode;
    }
    return GameMode.QUICK;
  }, [searchParams, gameMode, dailyConfig]);

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

  return (
    <>
      <SEO 
        title={isDaily ? 'Daily Challenge - Mappil' : `Play Mappil - ${initialContinent} Map Quiz`} 
        description="Test your geography knowledge with Mappil. Identify countries and regions on an interactive 3D globe." 
        canonicalUrl="https://mappil.com/play"
      />
      {dataLoaded && (
        <GameContent 
          onGlobeReady={handleGlobeReady} 
          initialContinent={initialContinent}
          initialDifficulty={initialDifficulty}
          initialGameMode={initialGameMode}
          challengeId={dailyConfig?.challengeId}
          seed={dailyConfig?.seed}
          isDailyChallenge={dailyConfig?.isDailyChallenge}
        />
      )}
      {!globeReady && <LoadingOverlay progress={totalProgress} />}
    </>
  );
};

export default PlayPage;
