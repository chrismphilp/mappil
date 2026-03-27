import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GlobeGL from 'react-globe.gl';
import {
  getRegionCentroid,
  getWorldGeometry,
  type WorldGeometryTier,
} from '../../data/maps';

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
  geometryTier: WorldGeometryTier;
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

const Globe: FC<GlobeProps> = ({
  regionsFound,
  flyToRegion,
  onRegionClick,
  onReady,
  geometryTier,
}) => {
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState(getViewportDimensions);

  const geoJsonData = getWorldGeometry(geometryTier);
  const regionsFoundSet = useMemo(() => new Set(regionsFound), [regionsFound]);
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

  const blueTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a'; // A slightly blue, deep dark color to serve as oceans
      ctx.fillRect(0, 0, 2, 2);
    }
    return canvas.toDataURL('image/png');
  }, []);

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
      const target = getRegionCentroid(flyToRegion);
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

  const handlePolygonHover = useCallback((polygon: any) => {
    hoveredPolygonRef.current = polygon;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
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
  }, [onRegionClick]);

  const patchPolygonMaterials = useCallback(() => {
    const scene = globeRef.current?.scene?.();
    if (!scene) return;

    scene.traverse((obj: any) => {
      if (obj?.__globeObjType !== 'polygon') return;

      const conicObj = obj.children?.[0];
      const strokeObj = obj.children?.[1];
      const conicMaterials = Array.isArray(conicObj?.material)
        ? conicObj.material
        : conicObj?.material
          ? [conicObj.material]
          : [];
      const capMaterial = conicMaterials[conicMaterials.length - 1];

      if (capMaterial) {
        capMaterial.depthWrite = false;
        capMaterial.side = 2;
        capMaterial.polygonOffset = true;
        capMaterial.polygonOffsetFactor = -1;
        capMaterial.polygonOffsetUnits = -1;
        capMaterial.needsUpdate = true;
      }

      if (strokeObj?.material) {
        strokeObj.material.depthWrite = false;
        strokeObj.material.needsUpdate = true;
      }
    });
  }, []);

  useEffect(() => {
    let frameId = requestAnimationFrame(() => {
      patchPolygonMaterials();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [patchPolygonMaterials, geoJsonData, regionsFound, flyToRegion]);

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
      return '';
    },
    [regionsFoundSet]
  );

  const getAltitude = useCallback(
    (d: any) => {
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
      const name = d.properties.name_long;
      if (regionsFoundSet.has(name)) {
        return `<span style="color: #34d399; font-family: Inter, sans-serif; font-size: 13px;">${name} ✓</span>`;
      }
      return '';
    },
    [regionsFoundSet]
  );

  const getStrokeColor = useCallback(() => 'rgba(148, 163, 184, 0.2)', []);
  const getCapCurvatureResolution = useCallback((d: any) => {
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
      onPointerUpCapture={handlePointerUp}
    >
      <GlobeGL
        ref={globeRef}
        globeImageUrl={blueTexture}
        rendererConfig={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        animateIn={false}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeCurvatureResolution={4}
        showAtmosphere={true}
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.2}
        onGlobeReady={handleGlobeReady}
        polygonsData={geoJsonData?.features}
        polygonCapColor={getCapColor}
        polygonSideColor={getSideColor}
        polygonStrokeColor={getStrokeColor}
        polygonAltitude={getAltitude}
        polygonCapCurvatureResolution={getCapCurvatureResolution}
        polygonLabel={getLabel}
        onPolygonHover={handlePolygonHover}
        onZoom={handleZoom}
        polygonsTransitionDuration={0}
      />
    </div>
  );
};

export default memo(Globe);
