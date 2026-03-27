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

export interface WorldGeometryProperties {
  name_long: string;
  continent?: ContinentFilter;
  pop_est?: number;
  [key: string]: unknown;
}

export interface WorldGeometryFeature {
  type: 'Feature';
  properties: WorldGeometryProperties;
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
  const contentLength = response.headers.get('Content-Length');

  if (!contentLength || !response.body) {
    const text = await response.text();
    onStateChange?.({ stage: 'parsing' });
    const data = JSON.parse(text) as T;
    onStateChange?.({ stage: 'ready', fraction: 1 });
    return data;
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
  const data = JSON.parse(new TextDecoder().decode(merged)) as T;
  onStateChange?.({ stage: 'ready', fraction: 1 });
  return data;
}

function assertWorldMetaLoaded(): WorldRegionMeta[] {
  if (!worldMetaData) {
    throw new Error('World region metadata has not been loaded yet.');
  }

  return worldMetaData;
}

function assertFullGeometryLoaded(): WorldGeometryCollection {
  const fullGeometry = worldGeometryData.get('full');
  if (!fullGeometry) {
    throw new Error('World full geometry has not been loaded yet.');
  }

  return fullGeometry;
}

function roundCoordinate(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function featureCentroid(feature: WorldGeometryFeature): RegionCentroid | null {
  const coords: number[][] = [];

  function collectCoords(geometry: any) {
    if (!geometry) return;

    if (geometry.type === 'Polygon') {
      geometry.coordinates[0].forEach((coordinate: number[]) => coords.push(coordinate));
      return;
    }

    if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach((polygon: number[][][]) =>
        polygon[0].forEach((coordinate: number[]) => coords.push(coordinate)),
      );
    }
  }

  collectCoords(feature.geometry);

  if (coords.length === 0) {
    return null;
  }

  let lngSum = 0;
  let latSum = 0;

  for (const [lng, lat] of coords) {
    lngSum += lng;
    latSum += lat;
  }

  return {
    lat: roundCoordinate(latSum / coords.length),
    lng: roundCoordinate(lngSum / coords.length),
  };
}

function filterMetaEntries(
  entries: WorldRegionMeta[],
  difficulty: Difficulty,
  continent?: ContinentFilter,
): string[] {
  const threshold = POPULATION_THRESHOLDS[difficulty];
  let filteredEntries = entries;

  if (continent && continent !== ContinentFilter.WORLD) {
    filteredEntries = filteredEntries.filter((entry) => entry.continent === continent);
  }

  const filtered = filteredEntries
    .filter((entry) => entry.population > threshold)
    .map((entry) => entry.name);

  if (filtered.length < 2 && continent && continent !== ContinentFilter.WORLD) {
    return filteredEntries.map((entry) => entry.name);
  }

  return filtered;
}

function filterGeometryFeatures(
  features: WorldGeometryFeature[],
  difficulty: Difficulty,
  continent?: ContinentFilter,
): string[] {
  const threshold = POPULATION_THRESHOLDS[difficulty];
  let filteredFeatures = features;

  if (continent && continent !== ContinentFilter.WORLD) {
    filteredFeatures = filteredFeatures.filter(
      (feature) => feature.properties.continent === continent,
    );
  }

  const filtered = filteredFeatures
    .filter((feature) => Number(feature.properties.pop_est) > threshold)
    .map((feature) => feature.properties.name_long);

  if (filtered.length < 2 && continent && continent !== ContinentFilter.WORLD) {
    return filteredFeatures.map((feature) => feature.properties.name_long);
  }

  return filtered;
}

export function getGeometryTierForExperience(
  experience: ExperienceMode,
): WorldGeometryTier {
  return 'full';
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

export function getFilteredRegions(
  difficulty: Difficulty,
  continent?: ContinentFilter,
): string[] {
  if (worldMetaData) {
    return filterMetaEntries(assertWorldMetaLoaded(), difficulty, continent);
  }

  return filterGeometryFeatures(assertFullGeometryLoaded().features, difficulty, continent);
}

export function getRegionCentroid(name: string): RegionCentroid | null {
  const cached = centroidByRegion.get(name);
  if (cached) {
    return cached;
  }

  const geometry =
    worldGeometryData.get('full') ??
    worldGeometryData.get('preview') ??
    null;

  if (!geometry) {
    return null;
  }

  const feature = geometry.features.find(
    (entry) => entry.properties.name_long === name,
  );

  if (!feature) {
    return null;
  }

  const centroid = featureCentroid(feature);
  if (centroid) {
    centroidByRegion.set(name, centroid);
  }

  return centroid;
}
