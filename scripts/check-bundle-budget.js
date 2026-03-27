const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const BUDGET_PATH = path.resolve(ROOT_DIR, 'bundle-budgets.json');

function loadBudget() {
  return JSON.parse(fs.readFileSync(BUDGET_PATH, 'utf8'));
}

function loadMetrics() {
  const result = spawnSync(process.execPath, [path.resolve(__dirname, 'bundle-metrics.js')], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Failed to collect bundle metrics.');
  }

  return JSON.parse(result.stdout);
}

function main() {
  const budget = loadBudget();
  const metrics = loadMetrics();
  const failures = [];

  for (const [route, maxBytes] of Object.entries(budget.routeEntryMaxBytes)) {
    const routeMetrics = metrics.routeEntryMetrics.find((entry) => entry.route === route);

    if (!routeMetrics) {
      failures.push(`Missing route metrics for ${route}.`);
      continue;
    }

    if (routeMetrics.entryBytes > maxBytes) {
      failures.push(
        `${route} entry JS is ${routeMetrics.entryBytes} bytes, above budget ${maxBytes}.`,
      );
    }

    if (routeMetrics.forbiddenReferences.length > 0) {
      failures.push(
        `${route} manifest still references forbidden modules: ${routeMetrics.forbiddenReferences.join(', ')}.`,
      );
    }
  }

  if (metrics.publicData.totalBytes > budget.publicDataMaxBytes) {
    failures.push(
      `public/data total is ${metrics.publicData.totalBytes} bytes, above budget ${budget.publicDataMaxBytes}.`,
    );
  }

  for (const requiredFile of budget.requiredPublicDataFiles) {
    if (!(requiredFile in metrics.publicData.files)) {
      failures.push(`Missing required public data file: ${requiredFile}.`);
    }
  }

  for (const forbiddenFile of budget.forbiddenPublicDataFiles) {
    if (forbiddenFile in metrics.publicData.files) {
      failures.push(`Forbidden public data file still present: ${forbiddenFile}.`);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL: ${failure}`);
    }
    process.exit(1);
  }

  console.log('Bundle budgets passed.');
}

main();
