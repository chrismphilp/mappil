import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { loadGeoJson } from './data/maps';
import LoadingOverlay from './components/LoadingOverlay';
import GameContent, { preloadGlobe } from './components/GameContent';

const App: FC = () => {
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

  // 0–90% = GeoJSON download, 90–100% = Globe init
  const totalProgress = dataLoaded
    ? 0.9 + (globeReady ? 0.1 : 0)
    : dataProgress * 0.9;

  return (
    <>
      {dataLoaded && <GameContent onGlobeReady={handleGlobeReady} />}
      {!globeReady && <LoadingOverlay progress={totalProgress} />}
    </>
  );
};

export default App;
