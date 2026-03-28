const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const INPUT_PATH = path.resolve(ROOT_DIR, 'public/data/world.geo.json');
const OUTPUT_PATH = path.resolve(ROOT_DIR, 'public/data/world.optimized.geo.json');
const LANDMASK_OUTPUT_PATH = path.resolve(ROOT_DIR, 'public/data/world.landmask.geo.json');
const CLEANED_INPUT_PATH = path.resolve(ROOT_DIR, 'public/data/.world.cleaned.tmp.geo.json');
const TEMP_OUTPUT_PATH = path.resolve(ROOT_DIR, 'public/data/.world.optimized.tmp.geo.json');
const TEMP_LANDMASK_PATH = path.resolve(ROOT_DIR, 'public/data/.world.landmask.tmp.geo.json');
const RETAIN_PERCENTAGE = '50%';
const LANDMASK_RETAIN_PERCENTAGE = '15%';
const PRESERVE_ORIGINAL_GEOMETRY = new Set([
  'Argentina',
  'Antarctica',
  'Algeria',
  'Australia',
  'Bolivia',
  'Brazil',
  'Canada',
  'Cameroon',
  'Chad',
  'China',
  'Chile',
  'Egypt',
  'Greenland',
  'India',
  'Kazakhstan',
  'Kenya',
  'Kyrgyzstan',
  'Libya',
  'Lesotho',
  'Malawi',
  'Maldives',
  'Mongolia',
  'Mozambique',
  'Niger',
  'Nigeria',
  'Norway',
  'Paraguay',
  'Russian Federation',
  'San Marino',
  'South Africa',
  'Sri Lanka',
  'Sudan',
  'Tajikistan',
  'Tanzania',
  'United States',
  'Uganda',
  'Italy',
  'Uruguay',
  'Uzbekistan',
  'Vatican',
]);

function countPoints(geometry) {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.reduce((sum, ring) => sum + ring.length, 0);
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.reduce(
      (sum, polygon) => sum + polygon.reduce((polygonSum, ring) => polygonSum + ring.length, 0),
      0
    );
  }

  return 0;
}

function readStats(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = JSON.parse(buffer);
  const pointCount = data.features.reduce((sum, feature) => sum + countPoints(feature.geometry), 0);

  return {
    featureCount: data.features.length,
    pointCount,
    bytes: buffer.length,
  };
}

function flattenGeometries(node) {
  if (!node) return [];

  if (node.type === 'FeatureCollection') {
    return node.features.flatMap((feature) => flattenGeometries(feature));
  }

  if (node.type === 'Feature') {
    return flattenGeometries(node.geometry);
  }

  if (node.type === 'GeometryCollection') {
    return node.geometries.flatMap((geometry) => flattenGeometries(geometry));
  }

  return [node];
}

function stripInteriorRings(geometry) {
  if (geometry.type === 'Polygon') {
    return {
      ...geometry,
      coordinates: [geometry.coordinates[0]],
    };
  }

  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) => [polygon[0]]),
    };
  }

  return geometry;
}

function normalizeLandMaskData(rawData) {
  const geometries = flattenGeometries(rawData).map(stripInteriorRings);

  return {
    type: 'FeatureCollection',
    features: geometries.map((geometry, index) => ({
      type: 'Feature',
      geometry,
      properties: {
        name_long: `__landmask_${index}`,
        __landMask: true,
      },
    })),
  };
}

function mergeOriginalGeometry(originalData, optimizedData) {
  const originalByName = new Map(
    originalData.features.map((feature) => [feature.properties.name_long, feature])
  );

  return {
    ...optimizedData,
    features: optimizedData.features.map((feature) => {
      const name = feature.properties.name_long;
      if (!PRESERVE_ORIGINAL_GEOMETRY.has(name)) {
        return feature;
      }

      const originalFeature = originalByName.get(name);
      if (!originalFeature) {
        return feature;
      }

      return {
        ...feature,
        geometry: originalFeature.geometry,
      };
    }),
  };
}

function main() {
  execFileSync(
    'npx',
    [
      'mapshaper',
      INPUT_PATH,
      '-clean',
      '-o',
      'format=geojson',
      'gj2008',
      'force',
      CLEANED_INPUT_PATH,
    ],
    { stdio: 'inherit' }
  );

  execFileSync(
    'npx',
    [
      'mapshaper',
      CLEANED_INPUT_PATH,
      '-simplify',
      'weighted',
      RETAIN_PERCENTAGE,
      'keep-shapes',
      '-o',
      'format=geojson',
      'gj2008',
      'force',
      TEMP_OUTPUT_PATH,
    ],
    { stdio: 'inherit' }
  );

  execFileSync(
    'npx',
    [
      'mapshaper',
      CLEANED_INPUT_PATH,
      '-dissolve2',
      '-simplify',
      'weighted',
      LANDMASK_RETAIN_PERCENTAGE,
      'keep-shapes',
      '-o',
      'format=geojson',
      'gj2008',
      'force',
      TEMP_LANDMASK_PATH,
    ],
    { stdio: 'inherit' }
  );

  try {
    const originalData = JSON.parse(fs.readFileSync(CLEANED_INPUT_PATH, 'utf8'));
    const optimizedData = JSON.parse(fs.readFileSync(TEMP_OUTPUT_PATH, 'utf8'));
    const rawLandMaskData = JSON.parse(fs.readFileSync(TEMP_LANDMASK_PATH, 'utf8'));
    const mergedData = mergeOriginalGeometry(originalData, optimizedData);
    const landMaskData = normalizeLandMaskData(rawLandMaskData);

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mergedData));
    fs.writeFileSync(LANDMASK_OUTPUT_PATH, JSON.stringify(landMaskData));
  } finally {
    if (fs.existsSync(CLEANED_INPUT_PATH)) {
      fs.unlinkSync(CLEANED_INPUT_PATH);
    }
    if (fs.existsSync(TEMP_OUTPUT_PATH)) {
      fs.unlinkSync(TEMP_OUTPUT_PATH);
    }
    if (fs.existsSync(TEMP_LANDMASK_PATH)) {
      fs.unlinkSync(TEMP_LANDMASK_PATH);
    }
  }

  const before = readStats(INPUT_PATH);
  const after = readStats(OUTPUT_PATH);
  const pointReduction = ((1 - after.pointCount / before.pointCount) * 100).toFixed(1);
  const byteReduction = ((1 - after.bytes / before.bytes) * 100).toFixed(1);

  console.log(
    JSON.stringify(
      {
        input: path.relative(ROOT_DIR, INPUT_PATH),
        output: path.relative(ROOT_DIR, OUTPUT_PATH),
        retainPercentage: RETAIN_PERCENTAGE,
        beforeFeatures: before.featureCount,
        afterFeatures: after.featureCount,
        beforePoints: before.pointCount,
        afterPoints: after.pointCount,
        pointReduction: `${pointReduction}%`,
        beforeBytes: before.bytes,
        afterBytes: after.bytes,
        byteReduction: `${byteReduction}%`,
        preservedOriginalGeometry: Array.from(PRESERVE_ORIGINAL_GEOMETRY),
      },
      null,
      2
    )
  );
}

main();
