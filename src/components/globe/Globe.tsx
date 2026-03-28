import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GlobeGL from 'react-globe.gl';
import { getGeoJsonData, getLandMaskData } from '../../data/maps';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import {
  createOceanTextureDataUrl,
  GLOBE_THEME,
  getFoundCountryLabelHtml,
  getPolygonCapColor,
  getPolygonSideColor,
  getPolygonStrokeColor,
} from './globeTheme';

const HIGH_PRECISION_CAP_COUNTRIES = new Set([
  'Algeria',
  'Brazil',
  'Canada',
  'Chad',
  'Kazakhstan',
  'Mongolia',
  'Djibouti',
  'Egypt',
  'Eritrea',
  'Niger',
  'Norway',
  'Oman',
  'Paraguay',
  'Russian Federation',
  'Saudi Arabia',
  'Sudan',
  'United States',
  'Uruguay',
  'Yemen',
]);
const ULTRA_PRECISION_CAP_COUNTRIES = new Set([
  'Argentina',
  'Antarctica',
  'Australia',
  'Bolivia',
  'Chile',
  'China',
  'Greenland',
  'Libya',
  'Somalia',
]);

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

function getViewportDimensions() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function getTargetPixelRatio() {
  const hasCoarsePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;
  const maxPixelRatio = window.innerWidth < 768 || hasCoarsePointer ? 1 : 1.5;

  return Math.min(window.devicePixelRatio || 1, maxPixelRatio);
}

function isPolygonPointerTarget(obj: any): boolean {
  let current = obj;

  while (current) {
    if (current.__globeObjType === 'polygon') return true;
    current = current.parent;
  }

  return false;
}

function isLandMaskFeature(feature: any): boolean {
  return Boolean(feature?.properties?.__landMask);
}

const Globe: FC<GlobeProps> = ({ regionsFound, flyToRegion, onRegionClick, onReady }) => {
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState(getViewportDimensions);
  const { isCoarsePointer } = useIsMobileViewport();

  const geoJsonData = getGeoJsonData();
  const landMaskData = getLandMaskData();
  const regionsFoundSet = useMemo(() => new Set(regionsFound), [regionsFound]);
  const globePolygons = useMemo(
    () =>
      isCoarsePointer
        ? [...(geoJsonData?.features ?? [])]
        : [...(landMaskData?.features ?? []), ...(geoJsonData?.features ?? [])],
    [geoJsonData, isCoarsePointer, landMaskData]
  );
  const updateCameraClipping = useCallback(() => {
    const globe = globeRef.current;
    const camera = globe?.camera?.();
    if (!camera) return;

    const globeRadius = globe?.getGlobeRadius?.() ?? 100;
    const visibleRadius = globeRadius * 1.35;
    const distance = camera.position.length();
    const nextNear = Math.max(0.05, distance - visibleRadius);
    const nextFar = distance + visibleRadius;

    if (Math.abs(camera.near - nextNear) > 0.01 || Math.abs(camera.far - nextFar) > 0.1) {
      camera.near = nextNear;
      camera.far = nextFar;
      camera.updateProjectionMatrix();
    }
  }, []);

  useEffect(() => {
    let frameId = 0;
    const onResize = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        setDimensions(getViewportDimensions());
        globeRef.current?.renderer()?.setPixelRatio(getTargetPixelRatio());
      });
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
    };
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

      globeRef.current.renderer().setPixelRatio(getTargetPixelRatio());
      updateCameraClipping();
    }
  }, [updateCameraClipping]);

  const globeTexture = useMemo(() => createOceanTextureDataUrl(), []);

  // Stop auto-rotate when zoomed in
  const AUTO_ROTATE_ALTITUDE = 1.8;
  const handleZoom = useCallback((pov: { altitude: number }) => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = pov.altitude >= AUTO_ROTATE_ALTITUDE;
    }
    updateCameraClipping();
  }, [updateCameraClipping]);

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

  const hoveredPolygonRef = useRef<any>(null);
  const pointerDownPos = useRef({ x: 0, y: 0, time: 0 });
  const touchGestureRef = useRef<{ activePointerIds: Set<number>; suppressClick: boolean }>({
    activePointerIds: new Set(),
    suppressClick: false,
  });

  const handlePolygonHover = useCallback((polygon: any) => {
    hoveredPolygonRef.current = isLandMaskFeature(polygon) ? null : polygon;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isCoarsePointer) return;

    if (e.pointerType === 'touch') {
      const touchGesture = touchGestureRef.current;
      touchGesture.activePointerIds.add(e.pointerId);

      if (touchGesture.activePointerIds.size > 1) {
        touchGesture.suppressClick = true;
        pointerDownPos.current = { x: 0, y: 0, time: 0 };
        return;
      }
    }

    pointerDownPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }, [isCoarsePointer]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isCoarsePointer) return;

    if (e.pointerType === 'touch') {
      const touchGesture = touchGestureRef.current;
      touchGesture.activePointerIds.delete(e.pointerId);

      if (touchGesture.suppressClick) {
        if (touchGesture.activePointerIds.size === 0) {
          touchGesture.suppressClick = false;
        }
        pointerDownPos.current = { x: 0, y: 0, time: 0 };
        return;
      }
    }

    // If OrbitControls or something swallowed pointerdown, default to current event
    const downTime = pointerDownPos.current.time || Date.now();
    const downX = pointerDownPos.current.time ? pointerDownPos.current.x : e.clientX;
    const downY = pointerDownPos.current.time ? pointerDownPos.current.y : e.clientY;

    const dx = e.clientX - downX;
    const dy = e.clientY - downY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = Date.now() - downTime;

    // Reset pointer down state
    pointerDownPos.current = { x: 0, y: 0, time: 0 };

    // Relaxed tolerance for jittery touches/clicks (distance < 20px, duration < 600ms)
    if (distance < 20 && duration < 600) {
      if (hoveredPolygonRef.current) {
        onRegionClick(hoveredPolygonRef.current.properties.name_long);
      } else {
        // Fallback for fast touch devices where hover state might lag by 1 frame
        setTimeout(() => {
          if (hoveredPolygonRef.current) {
            onRegionClick(hoveredPolygonRef.current.properties.name_long);
          }
        }, 50);
      }
    }
  }, [isCoarsePointer, onRegionClick]);

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    if (!isCoarsePointer || e.pointerType !== 'touch') return;

    const touchGesture = touchGestureRef.current;
    touchGesture.activePointerIds.delete(e.pointerId);
    if (touchGesture.activePointerIds.size === 0) {
      touchGesture.suppressClick = false;
    }
    pointerDownPos.current = { x: 0, y: 0, time: 0 };
  }, [isCoarsePointer]);

  const handlePolygonClick = useCallback((polygon: any) => {
    if (isCoarsePointer || isLandMaskFeature(polygon)) return;
    onRegionClick(polygon.properties.name_long);
  }, [isCoarsePointer, onRegionClick]);

  const patchPolygonMaterials = useCallback(() => {
    const scene = globeRef.current?.scene?.();
    if (!scene) return;

    scene.traverse((obj: any) => {
      if (obj?.__globeObjType !== 'polygon') return;
      const feature = obj.__data?.data;
      const landMask = isLandMaskFeature(feature);
      obj.renderOrder = landMask ? 0 : 1;

      const conicObj = obj.children?.[0];
      const strokeObj = obj.children?.[1];
      if (conicObj) {
        conicObj.renderOrder = obj.renderOrder;
      }
      if (strokeObj) {
        strokeObj.renderOrder = 2;
      }
      const conicMaterials = Array.isArray(conicObj?.material)
        ? conicObj.material
        : conicObj?.material
          ? [conicObj.material]
          : [];
      const capMaterial = conicMaterials[conicMaterials.length - 1];

      if (capMaterial) {
        if (isCoarsePointer) {
          capMaterial.depthWrite = false;
          capMaterial.side = 2;
          capMaterial.polygonOffset = true;
          capMaterial.polygonOffsetFactor = -1;
          capMaterial.polygonOffsetUnits = -1;
          capMaterial.needsUpdate = true;
        } else {
          capMaterial.depthWrite = landMask;
          capMaterial.side = landMask ? 2 : 0;
          capMaterial.polygonOffset = true;
          capMaterial.polygonOffsetFactor = landMask ? -1 : -2;
          capMaterial.polygonOffsetUnits = landMask ? -1 : -2;
          capMaterial.needsUpdate = true;
        }
      }

      if (strokeObj?.material) {
        strokeObj.material.depthWrite = false;
        strokeObj.material.needsUpdate = true;
      }
    });
  }, [isCoarsePointer]);

  useEffect(() => {
    let frameId = requestAnimationFrame(() => {
      patchPolygonMaterials();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [patchPolygonMaterials, geoJsonData, landMaskData, regionsFound, flyToRegion]);

  const getCapColor = useCallback(
    (d: any) => {
      if (isLandMaskFeature(d)) return GLOBE_THEME.countryLandMaskCap;
      const name = d.properties.name_long;
      return getPolygonCapColor({
        isFlyTo: flyToRegion === name,
        isFound: regionsFoundSet.has(name),
      });
    },
    [regionsFoundSet, flyToRegion]
  );

  const getSideColor = useCallback(
    (d: any) => {
      if (isLandMaskFeature(d)) return GLOBE_THEME.transparent;
      const name = d.properties.name_long;
      return getPolygonSideColor({ isFound: regionsFoundSet.has(name) });
    },
    [regionsFoundSet]
  );

  const getAltitude = useCallback(
    (d: any) => {
      if (isLandMaskFeature(d)) return 0.0006;
      const name = d.properties.name_long;
      if (regionsFoundSet.has(name)) return 0.02;
      if (ULTRA_PRECISION_CAP_COUNTRIES.has(name) || HIGH_PRECISION_CAP_COUNTRIES.has(name)) {
        return 0.0025;
      }
      return 0.0015;
    },
    [regionsFoundSet]
  );

  // Only show label for already-found countries
  const getLabel = useCallback(
    (d: any) => {
      if (isLandMaskFeature(d)) return '';
      const name = d.properties.name_long;
      return getFoundCountryLabelHtml(name, regionsFoundSet.has(name));
    },
    [regionsFoundSet]
  );

  const getStrokeColor = useCallback(
    (d: any) => (isLandMaskFeature(d) ? GLOBE_THEME.transparent : getPolygonStrokeColor()),
    []
  );
  const getCapCurvatureResolution = useCallback((d: any) => {
    if (isLandMaskFeature(d)) return 1;
    const name = d.properties.name_long;
    if (ULTRA_PRECISION_CAP_COUNTRIES.has(name)) return 1;
    if (HIGH_PRECISION_CAP_COUNTRIES.has(name)) return 2;
    return 5;
  }, []);
  const handleGlobeReady = useCallback(() => {
    globeRef.current?.renderer()?.setPixelRatio(getTargetPixelRatio());
    updateCameraClipping();
    requestAnimationFrame(() => {
      patchPolygonMaterials();
    });
    onReady?.();
  }, [onReady, patchPolygonMaterials, updateCameraClipping]);

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10 }}
      onPointerDownCapture={handlePointerDown}
      onPointerCancelCapture={handlePointerCancel}
      onPointerUpCapture={handlePointerUp}
    >
      <GlobeGL
        ref={globeRef}
        globeImageUrl={globeTexture}
        rendererConfig={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        animateIn={false}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeCurvatureResolution={4}
        showAtmosphere={true}
        atmosphereColor={GLOBE_THEME.atmosphereColor}
        atmosphereAltitude={GLOBE_THEME.atmosphereAltitude}
        pointerEventsFilter={isPolygonPointerTarget}
        onGlobeReady={handleGlobeReady}
        polygonsData={globePolygons}
        polygonCapColor={getCapColor}
        polygonSideColor={getSideColor}
        polygonStrokeColor={getStrokeColor}
        polygonAltitude={getAltitude}
        polygonCapCurvatureResolution={getCapCurvatureResolution}
        polygonLabel={getLabel}
        onPolygonHover={handlePolygonHover}
        onPolygonClick={handlePolygonClick}
        onZoom={handleZoom}
        polygonsTransitionDuration={0}
      />
    </div>
  );
};

export default memo(Globe);
