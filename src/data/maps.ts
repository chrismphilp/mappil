import { Difficulty, ContinentFilter } from '../types/game.types';

let geoJsonData: any = null;

export async function loadGeoJson(
  onProgress?: (fraction: number) => void,
): Promise<any> {
  if (geoJsonData) {
    onProgress?.(1);
    return geoJsonData;
  }

  const response = await fetch(`${process.env.PUBLIC_URL}/data/world.geo.json`);
  const contentLength = response.headers.get('Content-Length');

  if (!contentLength || !response.body) {
    geoJsonData = await response.json();
    onProgress?.(1);
    return geoJsonData;
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
    onProgress?.(received / total);
  }

  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  geoJsonData = JSON.parse(new TextDecoder().decode(merged));
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

export function getFilteredRegions(difficulty: Difficulty, continent?: ContinentFilter): string[] {
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
