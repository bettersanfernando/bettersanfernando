#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { filterAndSortBarangays } from '../src/data/civic/barangayDirectory.ts';
import {
  getBarangayByPsgc,
  getBarangays,
  getCityTotalPopulation,
} from '../src/data/civic/demographics.ts';
import { aggregatePopulationStatistics } from '../src/data/civic/populationStatistics.ts';

const barangays = getBarangays();
const statistics = aggregatePopulationStatistics(
  barangays,
  getCityTotalPopulation()
);
const allowedPublicFields = new Set([
  'psgc_code',
  'name',
  'classification',
  'population',
  'rank',
  'share',
]);

assert.equal(barangays.length, 35);
assert.equal(new Set(barangays.map(barangay => barangay.psgc_code)).size, 35);
assert.equal(getCityTotalPopulation(), 377534);
assert.equal(
  barangays.reduce((sum, barangay) => sum + barangay.population, 0),
  377534
);
assert.equal(statistics.urbanBarangayCount, 34);
assert.equal(statistics.ruralBarangayCount, 1);
assert.deepEqual(
  statistics.ruralBarangays.map(barangay => barangay.name),
  ['Lourdes']
);
assert.equal(statistics.rankedBarangays.length, 35);

for (const barangay of statistics.rankedBarangays) {
  assert.equal(getBarangayByPsgc(barangay.psgc_code)?.name, barangay.name);
  assert.equal(barangay.share, barangay.population / 377534);
  assert.ok(
    Object.keys(barangay).every(field => allowedPublicFields.has(field))
  );
}

const defaultOptions = {
  query: '',
  classification: 'All' as const,
  sort: 'name-asc' as const,
};
const alphabetical = filterAndSortBarangays(
  statistics.rankedBarangays,
  defaultOptions
);
assert.equal(alphabetical.length, 35);
assert.deepEqual(
  alphabetical.map(barangay => barangay.psgc_code),
  filterAndSortBarangays(statistics.rankedBarangays, defaultOptions).map(
    barangay => barangay.psgc_code
  ),
  'sorting must be deterministic'
);
assert.deepEqual(
  new Set(alphabetical.map(barangay => barangay.psgc_code)),
  new Set(barangays.map(barangay => barangay.psgc_code)),
  'every barangay must appear exactly once'
);

const largestFirst = filterAndSortBarangays(statistics.rankedBarangays, {
  ...defaultOptions,
  sort: 'population-desc',
});
const smallestFirst = filterAndSortBarangays(statistics.rankedBarangays, {
  ...defaultOptions,
  sort: 'population-asc',
});
assert.equal(largestFirst[0]?.name, 'Calulut');
assert.equal(smallestFirst[0]?.name, 'Santo Rosario');

const urban = filterAndSortBarangays(statistics.rankedBarangays, {
  ...defaultOptions,
  classification: 'Urban',
});
const rural = filterAndSortBarangays(statistics.rankedBarangays, {
  ...defaultOptions,
  classification: 'Rural',
});
assert.equal(urban.length, 34);
assert.deepEqual(
  rural.map(barangay => barangay.name),
  ['Lourdes']
);

const santoMatches = filterAndSortBarangays(statistics.rankedBarangays, {
  ...defaultOptions,
  query: 'santo',
});
assert.deepEqual(
  santoMatches.map(barangay => barangay.name),
  ['Santo Niño', 'Santo Rosario']
);

console.log('[smoke-barangays] OK');
console.log('  35 unique PSGC records, population 377534');
console.log('  34 Urban, 1 Rural (Lourdes)');
console.log(
  '  search, classification filters, and deterministic sorts verified'
);
