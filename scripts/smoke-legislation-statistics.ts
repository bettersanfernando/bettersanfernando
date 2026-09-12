#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getExecutiveOrders,
  getOrdinances,
  getResolutions,
} from '../src/data/civic/legislation.ts';
import { getPublicRecordsArchiveCoverage } from '../src/data/civic/publicRecordsCoverage.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

assert.equal(getExecutiveOrders().length, 13);
assert.equal(getOrdinances().length, 11);
assert.equal(getResolutions().length, 2);

const archiveRanges = getPublicRecordsArchiveCoverage().filter(entry =>
  [
    'resolution_archive_range',
    'ordinance_archive_range',
    'appropriation_ordinance_archive_range',
  ].includes(entry.record_type)
);
assert.ok(archiveRanges.length > 0, 'archive-range metadata must be present');
// Archive-range counts (e.g. 126, 264 resolution range positions) must never
// inflate the 2 individually published resolution records.
assert.ok(
  archiveRanges.every(entry => entry.count_basis === 'archive_range_only')
);

assert.ok(
  !plannedPages.some(page => page.path === '/statistics/legislation'),
  '/statistics/legislation must no longer be a planned page'
);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/statistics\/legislation"[\s\S]{0,40}element={<LegislationStatistics \/>}/
);

const pageSource = readFileSync('src/pages/LegislationStatistics.tsx', 'utf8');
assert.match(pageSource, /getExecutiveOrders\(\)/);
assert.match(pageSource, /getOrdinances\(\)/);
assert.match(pageSource, /getResolutions\(\)/);
assert.match(pageSource, /Archive-range/);
assert.match(pageSource, /not the complete legislative output/i);
assert.match(pageSource, /repeal status/i);
assert.match(pageSource, /legal effect/i);

console.log('[smoke-legislation-statistics] OK');
console.log(
  `  EO: ${getExecutiveOrders().length}; Ordinances: ${getOrdinances().length}; Resolutions: ${getResolutions().length}; archive-range entries: ${archiveRanges.length}`
);
