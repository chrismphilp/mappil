const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const ANALYZE_DIR = path.resolve(ROOT_DIR, '.next/diagnostics/analyze');
const PUBLIC_DATA_DIR = path.resolve(ROOT_DIR, 'public/data');

const ROUTE_MANIFESTS = [
  {
    route: '/',
    manifestPath: path.resolve(ROOT_DIR, '.next/server/app/page_client-reference-manifest.js'),
    manifestKey: '/page',
    entryKey: '[project]/src/app/page',
  },
  {
    route: '/map-game',
    manifestPath: path.resolve(
      ROOT_DIR,
      '.next/server/app/map-game/page_client-reference-manifest.js',
    ),
    manifestKey: '/map-game/page',
    entryKey: '[project]/src/app/map-game/page',
  },
  {
    route: '/play',
    manifestPath: path.resolve(
      ROOT_DIR,
      '.next/server/app/play/page_client-reference-manifest.js',
    ),
    manifestKey: '/play/page',
    entryKey: '[project]/src/app/play/page',
  },
  {
    route: '/[quizId]',
    manifestPath: path.resolve(
      ROOT_DIR,
      '.next/server/app/[quizId]/page_client-reference-manifest.js',
    ),
    manifestKey: '/[quizId]/page',
    entryKey: '[project]/src/app/[quizId]/page',
  },
];

const FORBIDDEN_MANIFEST_REFERENCES = [
  '@supabase/supabase-js',
  'src/components/settings/SettingsPanel',
  'src/components/game/GameCompleteModal',
  'src/components/leaderboard/LeaderboardModal',
  'src/components/profile/ProfilePanel',
];

function parseArgs(argv) {
  const options = {
    writePath: null,
    copyAnalyzePath: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--write') {
      options.writePath = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--copy-analyze') {
      options.copyAnalyzePath = argv[index + 1] ?? null;
      index += 1;
    }
  }

  return options;
}

function ensureFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected file not found: ${path.relative(ROOT_DIR, filePath)}`);
  }
}

function loadManifest(filePath, manifestKey) {
  ensureFileExists(filePath);
  const context = { globalThis: { __RSC_MANIFEST: {} } };
  vm.runInNewContext(fs.readFileSync(filePath, 'utf8'), context);
  return context.globalThis.__RSC_MANIFEST[manifestKey];
}

function getRouteMetrics() {
  return ROUTE_MANIFESTS.map((config) => {
    const manifest = loadManifest(config.manifestPath, config.manifestKey);
    const entryFiles = manifest.entryJSFiles[config.entryKey] ?? [];
    const entryBytes = entryFiles.reduce((sum, relativeFilePath) => {
      const absoluteFilePath = path.resolve(ROOT_DIR, '.next', relativeFilePath);
      ensureFileExists(absoluteFilePath);
      return sum + fs.statSync(absoluteFilePath).size;
    }, 0);
    const manifestSource = fs.readFileSync(config.manifestPath, 'utf8');
    const forbiddenReferences = FORBIDDEN_MANIFEST_REFERENCES.filter((value) =>
      manifestSource.includes(value),
    );

    return {
      route: config.route,
      entryBytes,
      entryFiles,
      forbiddenReferences,
    };
  });
}

function getPublicDataMetrics() {
  if (!fs.existsSync(PUBLIC_DATA_DIR)) {
    return {
      totalBytes: 0,
      files: {},
    };
  }

  const files = fs
    .readdirSync(PUBLIC_DATA_DIR)
    .sort()
    .reduce((accumulator, fileName) => {
      const absoluteFilePath = path.resolve(PUBLIC_DATA_DIR, fileName);
      if (fs.statSync(absoluteFilePath).isFile()) {
        accumulator[fileName] = fs.statSync(absoluteFilePath).size;
      }
      return accumulator;
    }, {});

  const totalBytes = Object.values(files).reduce((sum, size) => sum + size, 0);

  return { totalBytes, files };
}

function copyDirectory(sourceDir, destinationDir) {
  fs.rmSync(destinationDir, { recursive: true, force: true });
  fs.mkdirSync(destinationDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.resolve(sourceDir, entry.name);
    const destinationPath = path.resolve(destinationDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
      continue;
    }

    fs.copyFileSync(sourcePath, destinationPath);
  }
}

function buildMetrics() {
  return {
    generatedAt: new Date().toISOString(),
    routeEntryMetrics: getRouteMetrics(),
    publicData: getPublicDataMetrics(),
    analyzeDirExists: fs.existsSync(ANALYZE_DIR),
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const metrics = buildMetrics();
  const output = JSON.stringify(metrics, null, 2);

  if (options.writePath) {
    const absoluteWritePath = path.resolve(ROOT_DIR, options.writePath);
    fs.mkdirSync(path.dirname(absoluteWritePath), { recursive: true });
    fs.writeFileSync(absoluteWritePath, `${output}\n`);
  } else {
    process.stdout.write(`${output}\n`);
  }

  if (options.copyAnalyzePath && fs.existsSync(ANALYZE_DIR)) {
    copyDirectory(ANALYZE_DIR, path.resolve(ROOT_DIR, options.copyAnalyzePath));
  }
}

main();
