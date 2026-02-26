import worldGeoJson from '../geojson/world.geo.json';
import { Difficulty } from '../types/game.types';

export const geoJsonData = worldGeoJson as any;

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
