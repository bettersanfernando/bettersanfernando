#!/usr/bin/env -S node --experimental-strip-types
/**
 * Smoke check for the typed civic-data access layer (src/data/civic/).
 *
 * Runs the layer's own Zod-validated loaders/access functions and asserts
 * the data-integrity invariants from the task brief. No test framework —
 * this repo has none yet; assertions throw on failure (non-zero exit).
 *
 * Usage: node --experimental-strip-types scripts/smoke-civic-data-layer.ts
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
// Import directly from the domain modules needed (not the index.ts barrel):
// the barrel also re-exports geography.ts, which loads .geojson files via
// Vite's `?raw` import convention — a Vite-only specifier Node's native
// loader can't resolve outside a bundler. geography.schemas.ts has the same
// Zod schemas with no Vite-specific import, so it's reused here directly
// against the files on disk instead of duplicating the validation logic.
import {
  getProjects,
  getAllProjectEvidence,
} from '../src/data/civic/projects.ts';
import {
  getBarangays,
  getCityTotalPopulation,
} from '../src/data/civic/demographics.ts';
import {
  CityGeojsonSchema,
  BarangaysGeojsonSchema,
} from '../src/data/civic/geography.schemas.ts';
import { getExecutiveOrders } from '../src/data/civic/legislation.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Smoke check failed: ${message}`);
  }
}

const projects = getProjects();
assert(
  projects.length === 239,
  `expected 239 projects, got ${projects.length}`
);

const projectIds = new Set(projects.map(p => p.id));
assert(projectIds.size === projects.length, 'duplicate project IDs found');

const evidence = getAllProjectEvidence();
assert(
  evidence.length === 334,
  `expected 334 evidence records, got ${evidence.length}`
);

const orphanEvidence = evidence.filter(e => !projectIds.has(e.project_id));
assert(
  orphanEvidence.length === 0,
  `${orphanEvidence.length} evidence record(s) reference unknown project_id`
);

const bidResults = evidence.filter(e => e.stage === 'BID_RESULTS');
assert(
  bidResults.length === 233,
  `expected 233 BID_RESULTS evidence records, got ${bidResults.length}`
);

const bidResultsWithoutSource = bidResults.filter(
  e => !e.page_url && !e.attachment_url
);
assert(
  bidResultsWithoutSource.length === 0,
  `${bidResultsWithoutSource.length} BID_RESULTS record(s) have neither page_url nor attachment_url`
);

const barangays = getBarangays();
assert(
  barangays.length === 35,
  `expected 35 barangays, got ${barangays.length}`
);

const population = getCityTotalPopulation();
assert(
  population === 377534,
  `expected total population 377534, got ${population}`
);

const summedPopulation = barangays.reduce((sum, b) => sum + b.population, 0);
assert(
  summedPopulation === population,
  `barangay population sum (${summedPopulation}) does not match total_population (${population})`
);

const genDir = fileURLToPath(
  new URL('../src/data/generated/civic/geography/', import.meta.url)
);
const cityGeojson = CityGeojsonSchema.parse(
  JSON.parse(readFileSync(genDir + 'city.geojson', 'utf8'))
);
const barangaysGeojson = BarangaysGeojsonSchema.parse(
  JSON.parse(readFileSync(genDir + 'barangays.geojson', 'utf8'))
);
assert(
  cityGeojson.features.length === 1,
  `expected 1 city feature, got ${cityGeojson.features.length}`
);
assert(
  barangaysGeojson.features.length === 35,
  `expected 35 barangay features, got ${barangaysGeojson.features.length}`
);
const samplePsgc = barangaysGeojson.features[0].properties.psgc_code;
const sampleFeature = barangaysGeojson.features.find(
  f => f.properties.psgc_code === samplePsgc
);
assert(
  sampleFeature !== undefined,
  `expected to find barangay boundary for PSGC ${samplePsgc}`
);
let rejectedMalformed = false;
try {
  CityGeojsonSchema.parse({
    type: 'FeatureCollection',
    features: [{ type: 'Feature' }],
  });
} catch {
  rejectedMalformed = true;
}
assert(rejectedMalformed, 'expected schema to reject a malformed feature');

const executiveOrders = getExecutiveOrders();
assert(
  executiveOrders.length === 11,
  `expected 11 Executive Orders, got ${executiveOrders.length}`
);
assert(
  executiveOrders.every(order => order.document_type === 'Executive Order'),
  'Executive Orders collection contains another document type'
);
assert(
  executiveOrders.every(order =>
    order.full_text_available ? Boolean(order.official_pdf_url) : true
  ),
  'an Executive Order marked as full-text available has no official PDF URL'
);

console.log('[smoke-civic-data-layer] OK');
console.log(`  projects: ${projects.length} (unique IDs: ${projectIds.size})`);
console.log(
  `  evidence: ${evidence.length} (orphans: ${orphanEvidence.length})`
);
console.log(
  `  BID_RESULTS evidence: ${bidResults.length} (missing source: ${bidResultsWithoutSource.length})`
);
console.log(
  `  barangays: ${barangays.length}, total population: ${population}`
);
console.log(
  `  geography: city features ${cityGeojson.features.length}, barangay features ${barangaysGeojson.features.length}, malformed shape rejected: ${rejectedMalformed}`
);
console.log(`  Executive Orders: ${executiveOrders.length}`);
