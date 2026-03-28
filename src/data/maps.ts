import { Difficulty, ContinentFilter } from '../types/game.types';

let desktopGeoJsonData: any = null;
let mobileGeoJsonData: any = null;
let landMaskData: any = null;

type GeoJsonVariant = 'desktop' | 'mobile';

function getPreferredGeoJsonVariant(): GeoJsonVariant {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'desktop';
  }

  return window.matchMedia('(pointer: coarse)').matches ? 'mobile' : 'desktop';
}

function getGeoJsonUrl(variant: GeoJsonVariant): string {
  return variant === 'mobile' ? '/data/world.mobile.geo.json' : '/data/world.optimized.geo.json';
}

function getCachedGeoJsonData(variant: GeoJsonVariant): any {
  return variant === 'mobile' ? mobileGeoJsonData : desktopGeoJsonData;
}

function setCachedGeoJsonData(variant: GeoJsonVariant, data: any) {
  if (variant === 'mobile') {
    mobileGeoJsonData = data;
    return;
  }

  desktopGeoJsonData = data;
}

export type GeoJsonLoadStage = 'loading' | 'parsing' | 'ready';

export interface GeoJsonLoadState {
  stage: GeoJsonLoadStage;
  fraction?: number;
}

export async function loadGeoJson(
  onStateChange?: (state: GeoJsonLoadState) => void,
): Promise<any> {
  const variant = getPreferredGeoJsonVariant();
  const cachedGeoJsonData = getCachedGeoJsonData(variant);
  const needsLandMask = variant === 'desktop';

  if (cachedGeoJsonData && (!needsLandMask || landMaskData)) {
    onStateChange?.({ stage: 'ready', fraction: 1 });
    return cachedGeoJsonData;
  }

  onStateChange?.({ stage: 'loading', fraction: 0 });
  const landMaskPromise = needsLandMask
    ? landMaskData
      ? Promise.resolve(landMaskData)
      : fetch('/data/world.landmask.geo.json').then(async (response) => {
          landMaskData = await response.json();
          return landMaskData;
        })
    : Promise.resolve(null);

  const response = await fetch(getGeoJsonUrl(variant));
  const contentLength = response.headers.get('Content-Length');

  if (!contentLength || !response.body) {
    const text = await response.text();
    onStateChange?.({ stage: 'parsing' });
    const parsedData = JSON.parse(text);
    setCachedGeoJsonData(variant, parsedData);
    if (needsLandMask) {
      await landMaskPromise;
    }
    onStateChange?.({ stage: 'ready', fraction: 1 });
    return parsedData;
  }

  const total = parseInt(contentLength, 10);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onStateChange?.({ stage: 'loading', fraction: received / total });
  }

  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  onStateChange?.({ stage: 'parsing' });
  const parsedData = JSON.parse(new TextDecoder().decode(merged));
  setCachedGeoJsonData(variant, parsedData);
  if (needsLandMask) {
    await landMaskPromise;
  }
  onStateChange?.({ stage: 'ready', fraction: 1 });
  return parsedData;
}

export function getGeoJsonData(): any {
  const variant = getPreferredGeoJsonVariant();

  if (variant === 'mobile') {
    return mobileGeoJsonData ?? desktopGeoJsonData;
  }

  return desktopGeoJsonData ?? mobileGeoJsonData;
}

export function getLandMaskData(): any {
  return landMaskData;
}

const POPULATION_THRESHOLDS: Record<Difficulty, number> = {
  [Difficulty.EASY]: 50_000_000,
  [Difficulty.MEDIUM]: 25_000_000,
  [Difficulty.HARD]: 10_000,
};

export function getFilteredRegions(difficulty: Difficulty, continent?: ContinentFilter): string[] {
  const geoJsonData = getGeoJsonData();
  if (!geoJsonData?.features) {
    return [];
  }

  const threshold = POPULATION_THRESHOLDS[difficulty];
  let features = geoJsonData.features;

  if (continent && continent !== ContinentFilter.WORLD) {
    features = features.filter((f: any) => f.properties.continent === continent);
  }

  const filtered = features
    .filter((f: any) => f.properties.pop_est > threshold)
    .map((f: any) => f.properties.name_long);

  // Fallback: if continent filter + difficulty leaves fewer than 2 countries,
  // return all countries for that continent regardless of population
  if (filtered.length < 2 && continent && continent !== ContinentFilter.WORLD) {
    return features.map((f: any) => f.properties.name_long);
  }

  return filtered;
}
