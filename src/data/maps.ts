import { Difficulty, ContinentFilter } from '../types/game.types';

let geoJsonData: any = null;

export type GeoJsonLoadStage = 'loading' | 'parsing' | 'ready';

export interface GeoJsonLoadState {
  stage: GeoJsonLoadStage;
  fraction?: number;
}

export async function loadGeoJson(
  onStateChange?: (state: GeoJsonLoadState) => void,
): Promise<any> {
  if (geoJsonData) {
    onStateChange?.({ stage: 'ready', fraction: 1 });
    return geoJsonData;
  }

  onStateChange?.({ stage: 'loading', fraction: 0 });

  const response = await fetch('/data/world.optimized.geo.json');
  const contentLength = response.headers.get('Content-Length');

  if (!contentLength || !response.body) {
    const text = await response.text();
    onStateChange?.({ stage: 'parsing' });
    geoJsonData = JSON.parse(text);
    onStateChange?.({ stage: 'ready', fraction: 1 });
    return geoJsonData;
  }

  const total = Number.parseInt(contentLength, 10);
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
  geoJsonData = JSON.parse(new TextDecoder().decode(merged));
  onStateChange?.({ stage: 'ready', fraction: 1 });
  return geoJsonData;
}

export function getGeoJsonData(): any {
  return geoJsonData;
}

const POPULATION_THRESHOLDS: Record<Difficulty, number> = {
  [Difficulty.EASY]: 50_000_000,
  [Difficulty.MEDIUM]: 25_000_000,
  [Difficulty.HARD]: 10_000,
};

export function getFilteredRegions(
  difficulty: Difficulty,
  continent?: ContinentFilter,
): string[] {
  const threshold = POPULATION_THRESHOLDS[difficulty];
  let features = geoJsonData.features;

  if (continent && continent !== ContinentFilter.WORLD) {
    features = features.filter((feature: any) => feature.properties.continent === continent);
  }

  const filtered = features
    .filter((feature: any) => feature.properties.pop_est > threshold)
    .map((feature: any) => feature.properties.name_long);

  if (filtered.length < 2 && continent && continent !== ContinentFilter.WORLD) {
    return features.map((feature: any) => feature.properties.name_long);
  }

  return filtered;
}
