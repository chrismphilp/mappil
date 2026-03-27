const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const INPUT_PATH = path.resolve(ROOT_DIR, 'data-src/world.geo.json');
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'public/data');
const META_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'world.meta.json');
const PREVIEW_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'world.preview.geo.json');
const FULL_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'world.full.geo.json');
const LEGACY_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'world.optimized.geo.json');

const PREVIEW_SIMPLIFY_TOLERANCE = 0.12;
const FULL_SIMPLIFY_TOLERANCE = 0.035;
const PREVIEW_DECIMALS = 3;
const FULL_DECIMALS = 4;

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

function roundNumber(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getSqDist(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}

function getSqSegDist(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = end[0];
      y = end[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = point[0] - x;
  dy = point[1] - y;

  return dx * dx + dy * dy;
}

function simplifyDouglasPeucker(points, sqTolerance) {
  const last = points.length - 1;
  const simplified = [points[0]];

  function simplifyStep(first, lastIndex) {
    let maxSqDist = sqTolerance;
    let index = -1;

    for (let i = first + 1; i < lastIndex; i += 1) {
      const sqDist = getSqSegDist(points[i], points[first], points[lastIndex]);

      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (index > -1) {
      if (index - first > 1) {
        simplifyStep(first, index);
      }

      simplified.push(points[index]);

      if (lastIndex - index > 1) {
        simplifyStep(index, lastIndex);
      }
    }
  }

  simplifyStep(0, last);
  simplified.push(points[last]);

  return simplified;
}

function simplifyLine(points, tolerance, decimals) {
  if (points.length <= 4) {
    return points.map((point) => [
      roundNumber(point[0], decimals),
      roundNumber(point[1], decimals),
    ]);
  }

  const sqTolerance = tolerance * tolerance;
  const simplified = simplifyDouglasPeucker(points, sqTolerance);

  return simplified.map((point) => [
    roundNumber(point[0], decimals),
    roundNumber(point[1], decimals),
  ]);
}

function simplifyRing(ring, tolerance, decimals) {
  const hasClosedRing =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1];
  const openRing = hasClosedRing ? ring.slice(0, -1) : ring.slice();
  const simplifiedOpenRing = simplifyLine(openRing, tolerance, decimals);

  const fallbackRing = openRing
    .slice(0, Math.min(openRing.length, 4))
    .map((point) => [roundNumber(point[0], decimals), roundNumber(point[1], decimals)]);

  const nextOpenRing =
    simplifiedOpenRing.length >= 3 ? simplifiedOpenRing : fallbackRing;

  return [...nextOpenRing, nextOpenRing[0]];
}

function simplifyGeometry(geometry, tolerance, decimals) {
  if (geometry.type === 'Polygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((ring) =>
        simplifyRing(ring, tolerance, decimals),
      ),
    };
  }

  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) =>
        polygon.map((ring) => simplifyRing(ring, tolerance, decimals)),
      ),
    };
  }

  return geometry;
}

function featureCentroid(feature) {
  const coords = [];

  function collectCoords(geometry) {
    if (!geometry) return;

    if (geometry.type === 'Polygon') {
      geometry.coordinates[0].forEach((coordinate) => coords.push(coordinate));
      return;
    }

    if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach((polygon) =>
        polygon[0].forEach((coordinate) => coords.push(coordinate)),
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
    lat: roundNumber(latSum / coords.length, 4),
    lng: roundNumber(lngSum / coords.length, 4),
  };
}

function createMetaEntries(data) {
  return data.features.map((feature) => ({
    id: feature.properties.name_long,
    name: feature.properties.name_long,
    continent: feature.properties.continent,
    population: feature.properties.pop_est,
    centroid: featureCentroid(feature),
  }));
}

function createGeometryOutput(data, tolerance, decimals) {
  return {
    type: 'FeatureCollection',
    features: data.features.map((feature) => ({
      type: 'Feature',
      properties: {
        name_long: feature.properties.name_long,
      },
      geometry: simplifyGeometry(feature.geometry, tolerance, decimals),
    })),
  };
}

function ensureInputExists() {
  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(`GeoJSON source not found at ${INPUT_PATH}`);
  }
}

function main() {
  ensureInputExists();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const inputData = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));

  fs.writeFileSync(META_OUTPUT_PATH, JSON.stringify(createMetaEntries(inputData)));
  fs.writeFileSync(
    PREVIEW_OUTPUT_PATH,
    JSON.stringify(
      createGeometryOutput(
        inputData,
        PREVIEW_SIMPLIFY_TOLERANCE,
        PREVIEW_DECIMALS,
      ),
    ),
  );
  fs.writeFileSync(
    FULL_OUTPUT_PATH,
    JSON.stringify(
      createGeometryOutput(
        inputData,
        FULL_SIMPLIFY_TOLERANCE,
        FULL_DECIMALS,
      ),
    ),
  );

  if (fs.existsSync(LEGACY_OUTPUT_PATH)) {
    fs.unlinkSync(LEGACY_OUTPUT_PATH);
  }

  console.log(
    JSON.stringify(
      {
        input: path.relative(ROOT_DIR, INPUT_PATH),
        outputs: {
          meta: {
            path: path.relative(ROOT_DIR, META_OUTPUT_PATH),
            bytes: fs.statSync(META_OUTPUT_PATH).size,
          },
          preview: {
            path: path.relative(ROOT_DIR, PREVIEW_OUTPUT_PATH),
            ...readStats(PREVIEW_OUTPUT_PATH),
          },
          full: {
            path: path.relative(ROOT_DIR, FULL_OUTPUT_PATH),
            ...readStats(FULL_OUTPUT_PATH),
          },
        },
        previewSimplifyTolerance: PREVIEW_SIMPLIFY_TOLERANCE,
        fullSimplifyTolerance: FULL_SIMPLIFY_TOLERANCE,
      },
      null,
      2,
    ),
  );
}

main();
