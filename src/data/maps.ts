import {
  ContinentFilter,
  Difficulty,
  type ExperienceMode,
} from '../types/game.types';

export type GeoJsonLoadStage = 'loading' | 'parsing' | 'ready';

export interface GeoJsonLoadState {
  stage: GeoJsonLoadStage;
  fraction?: number;
}

export interface RegionCentroid {
  lat: number;
  lng: number;
}

export interface WorldRegionMeta {
  id: string;
  name: string;
  continent: ContinentFilter;
  population: number;
  centroid: RegionCentroid | null;
}

export type WorldGeometryTier = 'preview' | 'full';

export interface WorldGeometryFeature {
  type: 'Feature';
  properties: {
    name_long: string;
  };
  geometry: any;
}

export interface WorldGeometryCollection {
  type: 'FeatureCollection';
  features: WorldGeometryFeature[];
}

const WORLD_META_URL = '/data/world.meta.json';
const WORLD_GEOMETRY_URL: Record<WorldGeometryTier, string> = {
  preview: '/data/world.preview.geo.json',
  full: '/data/world.full.geo.json',
};

let worldMetaData: WorldRegionMeta[] | null = null;
let worldMetaPromise: Promise<WorldRegionMeta[]> | null = null;
const worldGeometryData = new Map<WorldGeometryTier, WorldGeometryCollection>();
const worldGeometryPromises = new Map<WorldGeometryTier, Promise<WorldGeometryCollection>>();
let centroidByRegion = new Map<string, RegionCentroid>();

const POPULATION_THRESHOLDS: Record<Difficulty, number> = {
  [Difficulty.EASY]: 50_000_000,
  [Difficulty.MEDIUM]: 25_000_000,
  [Difficulty.HARD]: 10_000,
};

async function loadJson<T>(
  url: string,
  onStateChange?: (state: GeoJsonLoadState) => void,
): Promise<T> {
  onStateChange?.({ stage: 'loading', fraction: 0 });

  const response = await fetch(url);
  const text = await response.text();

  onStateChange?.({ stage: 'parsing' });
  const data = JSON.parse(text) as T;
  onStateChange?.({ stage: 'ready', fraction: 1 });

  return data;
}

function assertWorldMetaLoaded(): WorldRegionMeta[] {
  if (!worldMetaData) {
    throw new Error('World region metadata has not been loaded yet.');
  }

  return worldMetaData;
}

export function getGeometryTierForExperience(
  experience: ExperienceMode,
): WorldGeometryTier {
  return experience === 'preview' ? 'preview' : 'full';
}

export async function loadWorldMeta(
  onStateChange?: (state: GeoJsonLoadState) => void,
): Promise<WorldRegionMeta[]> {
  if (worldMetaData) {
    onStateChange?.({ stage: 'ready', fraction: 1 });
    return worldMetaData;
  }

  if (!worldMetaPromise) {
    worldMetaPromise = loadJson<WorldRegionMeta[]>(WORLD_META_URL, onStateChange).then(
      (data) => {
        worldMetaData = data;
        centroidByRegion = new Map(
          data
            .filter((entry) => entry.centroid)
            .map((entry) => [entry.name, entry.centroid as RegionCentroid]),
        );
        return data;
      },
    );
  } else {
    onStateChange?.({ stage: 'loading', fraction: 0 });
  }

  const data = await worldMetaPromise;
  onStateChange?.({ stage: 'ready', fraction: 1 });
  return data;
}

export async function loadWorldGeometry(
  tier: WorldGeometryTier,
  onStateChange?: (state: GeoJsonLoadState) => void,
): Promise<WorldGeometryCollection> {
  const cached = worldGeometryData.get(tier);
  if (cached) {
    onStateChange?.({ stage: 'ready', fraction: 1 });
    return cached;
  }

  if (!worldGeometryPromises.has(tier)) {
    worldGeometryPromises.set(
      tier,
      loadJson<WorldGeometryCollection>(WORLD_GEOMETRY_URL[tier], onStateChange).then(
        (data) => {
          worldGeometryData.set(tier, data);
          return data;
        },
      ),
    );
  } else {
    onStateChange?.({ stage: 'loading', fraction: 0 });
  }

  const data = await worldGeometryPromises.get(tier)!;
  onStateChange?.({ stage: 'ready', fraction: 1 });
  return data;
}

export function getWorldMeta(): WorldRegionMeta[] | null {
  return worldMetaData;
}

export function getWorldGeometry(
  tier: WorldGeometryTier,
): WorldGeometryCollection | null {
  return worldGeometryData.get(tier) ?? null;
}

export function getRegionCentroid(name: string): RegionCentroid | null {
  return centroidByRegion.get(name) ?? null;
}

export function getFilteredRegionsFromMeta(
  difficulty: Difficulty,
  continent?: ContinentFilter,
): string[] {
  const threshold = POPULATION_THRESHOLDS[difficulty];
  let entries = assertWorldMetaLoaded();

  if (continent && continent !== ContinentFilter.WORLD) {
    entries = entries.filter((entry) => entry.continent === continent);
  }

  const filtered = entries
    .filter((entry) => entry.population > threshold)
    .map((entry) => entry.name);

  if (filtered.length < 2 && continent && continent !== ContinentFilter.WORLD) {
    return entries.map((entry) => entry.name);
  }

  return filtered;
}
