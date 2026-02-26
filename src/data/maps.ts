import { Difficulty } from '../types/game.types';

let geoJsonData: any = null;

export async function loadGeoJson(): Promise<any> {
  if (geoJsonData) return geoJsonData;
  const response = await fetch(`${process.env.PUBLIC_URL}/data/world.geo.json`);
  geoJsonData = await response.json();
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

export function getFilteredRegions(difficulty: Difficulty): string[] {
  const threshold = POPULATION_THRESHOLDS[difficulty];
  return geoJsonData.features
    .filter((f: any) => f.properties.pop_est > threshold)
    .map((f: any) => f.properties.name_long);
}
