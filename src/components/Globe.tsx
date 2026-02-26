import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GlobeGL from 'react-globe.gl';
import { getGeoJsonData } from '../data/maps';

interface GlobeProps {
  regionsFound: string[];
  flyToRegion: string | null;
  onRegionClick: (region: string) => void;
  onReady?: () => void;
}

// Compute centroid lat/lng from a GeoJSON feature
function featureCentroid(feature: any): { lat: number; lng: number } | null {
  const coords: number[][] = [];

  function collectCoords(geometry: any) {
    if (!geometry) return;
    if (geometry.type === 'Polygon') {
      geometry.coordinates[0].forEach((c: number[]) => coords.push(c));
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach((poly: number[][][]) =>
        poly[0].forEach((c: number[]) => coords.push(c))
      );
    }
  }

  collectCoords(feature.geometry);
  if (coords.length === 0) return null;

  let lngSum = 0;
  let latSum = 0;
  for (const [lng, lat] of coords) {
    lngSum += lng;
    latSum += lat;
  }
  return { lat: latSum / coords.length, lng: lngSum / coords.length };
}

// Lazy-init centroid lookup — computed once on first access
let centroidMap: Map<string, { lat: number; lng: number }> | null = null;
function getCentroidMap(): Map<string, { lat: number; lng: number }> {
  if (centroidMap) return centroidMap;
  centroidMap = new Map();
  const data = getGeoJsonData();
  if (data) {
    for (const feature of data.features) {
      const name = (feature as any).properties.name_long;
      const centroid = featureCentroid(feature);
      if (name && centroid) centroidMap.set(name, centroid);
    }
  }
  return centroidMap;
}

const Globe: FC<GlobeProps> = ({ regionsFound, flyToRegion, onRegionClick, onReady }) => {
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const geoJsonData = getGeoJsonData();
  const regionsFoundSet = useMemo(() => new Set(regionsFound), [regionsFound]);

  useEffect(() => {
    const onResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Configure controls — reduce sensitivity so small movements
  // during a click don't get swallowed as drags/scrolls
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableDamping = true;
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 0.6;

      globeRef.current.renderer().setPixelRatio(Math.min(window.devicePixelRatio, 2));
      onReady?.();
    }
  }, [onReady]);

  // Stop auto-rotate when zoomed in
  const AUTO_ROTATE_ALTITUDE = 1.8;
  const handleZoom = useCallback((pov: { altitude: number }) => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = pov.altitude >= AUTO_ROTATE_ALTITUDE;
    }
  }, []);

  // Fly to skipped region on 3rd strike
  useEffect(() => {
    if (flyToRegion && globeRef.current) {
      const target = getCentroidMap().get(flyToRegion);
      if (target) {
        globeRef.current.pointOfView(
          { lat: target.lat, lng: target.lng, altitude: 1.5 },
          1000
        );
      }
    }
  }, [flyToRegion]);

  const handleClick = useCallback(
    (polygon: any, _event: MouseEvent) => {
      if (polygon) {
        onRegionClick(polygon.properties.name_long);
      }
    },
    [onRegionClick]
  );

  const getCapColor = useCallback(
    (d: any) => {
      const name = d.properties.name_long;
      if (flyToRegion && name === flyToRegion) return 'rgba(251, 191, 36, 0.85)';
      if (regionsFoundSet.has(name)) return 'rgba(52, 211, 153, 0.85)';
      return 'rgba(71, 85, 105, 0.6)';
    },
    [regionsFoundSet, flyToRegion]
  );

  const getSideColor = useCallback(
    (d: any) => {
      const name = d.properties.name_long;
      if (regionsFoundSet.has(name)) return 'rgba(16, 185, 129, 0.6)';
      return 'rgba(51, 65, 85, 0.3)';
    },
    [regionsFoundSet]
  );

  const getAltitude = useCallback(
    (d: any) => {
      const name = d.properties.name_long;
      if (regionsFoundSet.has(name)) return 0.03;
      return 0.01;
    },
    [regionsFoundSet]
  );

  // Only show label for already-found countries
  const getLabel = useCallback(
    (d: any) => {
      const name = d.properties.name_long;
      if (regionsFoundSet.has(name)) {
        return `<span style="color: #34d399; font-family: Inter, sans-serif; font-size: 13px;">${name} ✓</span>`;
      }
      return '';
    },
    [regionsFoundSet]
  );

  const getStrokeColor = useCallback(() => 'rgba(148, 163, 184, 0.2)', []);

  return (
    <GlobeGL
      ref={globeRef}
      rendererConfig={{ antialias: false, alpha: true }}
      animateIn={false}
      width={dimensions.width}
      height={dimensions.height}
      backgroundColor="rgba(0,0,0,0)"
      showAtmosphere={true}
      atmosphereColor="#3b82f6"
      atmosphereAltitude={0.2}
      polygonsData={geoJsonData?.features}
      polygonCapColor={getCapColor}
      polygonSideColor={getSideColor}
      polygonStrokeColor={getStrokeColor}
      polygonAltitude={getAltitude}
      polygonCapCurvatureResolution={3}
      polygonLabel={getLabel}
      onPolygonClick={handleClick}
      onZoom={handleZoom}
      polygonsTransitionDuration={150}
    />
  );
};

export default Globe;
