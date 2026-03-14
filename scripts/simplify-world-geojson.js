const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const INPUT_PATH = path.resolve(ROOT_DIR, 'public/data/world.geo.json');
const OUTPUT_PATH = path.resolve(ROOT_DIR, 'public/data/world.optimized.geo.json');
const CLEANED_INPUT_PATH = path.resolve(ROOT_DIR, 'public/data/.world.cleaned.tmp.geo.json');
const TEMP_OUTPUT_PATH = path.resolve(ROOT_DIR, 'public/data/.world.optimized.tmp.geo.json');
const RETAIN_PERCENTAGE = '50%';
const PRESERVE_ORIGINAL_GEOMETRY = new Set([
  'Argentina',
  'Antarctica',
  'Algeria',
  'Australia',
  'Bolivia',
  'Brazil',
  'Canada',
  'Chad',
  'China',
  'Chile',
  'Egypt',
  'Greenland',
  'Kazakhstan',
  'Kyrgyzstan',
  'Libya',
  'Lesotho',
  'Malawi',
  'Mongolia',
  'Mozambique',
  'Niger',
  'Norway',
  'Paraguay',
  'Russian Federation',
  'San Marino',
  'South Africa',
  'Sudan',
  'Tajikistan',
  'United States',
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

  try {
    const originalData = JSON.parse(fs.readFileSync(CLEANED_INPUT_PATH, 'utf8'));
    const optimizedData = JSON.parse(fs.readFileSync(TEMP_OUTPUT_PATH, 'utf8'));
    const mergedData = mergeOriginalGeometry(originalData, optimizedData);

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mergedData));
  } finally {
    if (fs.existsSync(CLEANED_INPUT_PATH)) {
      fs.unlinkSync(CLEANED_INPUT_PATH);
    }
    if (fs.existsSync(TEMP_OUTPUT_PATH)) {
      fs.unlinkSync(TEMP_OUTPUT_PATH);
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
