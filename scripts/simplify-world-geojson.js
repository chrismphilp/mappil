const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_PATH = path.resolve(ROOT_DIR, 'data-src/world.optimized.geo.json');
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'public/data');
const OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'world.optimized.geo.json');
const STALE_OUTPUTS = [
  path.resolve(OUTPUT_DIR, 'world.full.geo.json'),
  path.resolve(OUTPUT_DIR, 'world.meta.json'),
  path.resolve(OUTPUT_DIR, 'world.preview.geo.json'),
];

function countPoints(geometry) {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.reduce((sum, ring) => sum + ring.length, 0);
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.reduce(
      (sum, polygon) =>
        sum + polygon.reduce((polygonSum, ring) => polygonSum + ring.length, 0),
      0,
    );
  }

  return 0;
}

function readStats(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = JSON.parse(buffer);
  const pointCount = data.features.reduce(
    (sum, feature) => sum + countPoints(feature.geometry),
    0,
  );

  return {
    featureCount: data.features.length,
    pointCount,
    bytes: buffer.length,
  };
}

function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`Optimized GeoJSON source not found at ${SOURCE_PATH}`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.copyFileSync(SOURCE_PATH, OUTPUT_PATH);

  for (const filePath of STALE_OUTPUTS) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  console.log(
    JSON.stringify(
      {
        input: path.relative(ROOT_DIR, SOURCE_PATH),
        output: {
          path: path.relative(ROOT_DIR, OUTPUT_PATH),
          ...readStats(OUTPUT_PATH),
        },
        removed: STALE_OUTPUTS
          .filter((filePath) => !fs.existsSync(filePath))
          .map((filePath) => path.relative(ROOT_DIR, filePath)),
      },
      null,
      2,
    ),
  );
}

main();
