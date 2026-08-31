#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import {
  getBarangays,
  getCityDemographicsSource,
  getCityTotalPopulation,
} from '../src/data/civic/demographics.ts';
import { aggregatePopulationStatistics } from '../src/data/civic/populationStatistics.ts';

const barangays = getBarangays();
const totalPopulation = getCityTotalPopulation();
const source = getCityDemographicsSource();
const statistics = aggregatePopulationStatistics(barangays, totalPopulation);

assert.equal(statistics.barangayCount, 35);
assert.equal(statistics.totalPopulation, 377534);
assert.equal(
  barangays.reduce((sum, barangay) => sum + barangay.population, 0),
  377534,
  'all barangay populations must sum to the published city total'
);
assert.equal(statistics.urbanBarangayCount, 34);
assert.equal(statistics.ruralBarangayCount, 1);
assert.deepEqual(
  statistics.ruralBarangays.map(barangay => barangay.name),
  ['Lourdes']
);

const psgcCodes = barangays.map(barangay => barangay.psgc_code);
assert.equal(new Set(psgcCodes).size, 35, 'PSGC codes must be unique');
assert.equal(statistics.rankedBarangays.length, 35);
assert.deepEqual(
  new Set(statistics.rankedBarangays.map(barangay => barangay.psgc_code)),
  new Set(psgcCodes),
  'ranking must preserve every barangay exactly once'
);
assert.equal(statistics.largestBarangay?.name, 'Calulut');
assert.equal(statistics.largestBarangay?.population, 44659);
assert.equal(statistics.smallestBarangay?.name, 'Santo Rosario');
assert.equal(statistics.smallestBarangay?.population, 822);
assert.equal(source.census, '2024 POPCEN');
assert.equal(source.referenceYear, 2024);

for (const barangay of statistics.rankedBarangays) {
  assert.equal(
    barangay.share,
    barangay.population / 377534,
    `${barangay.name}'s share must use the 377,534 denominator`
  );
}

console.log('[smoke-population-statistics] OK');
console.log(
  `  barangays: ${statistics.barangayCount}, population: ${statistics.totalPopulation}`
);
console.log(
  `  classification: ${statistics.urbanBarangayCount} urban, ${statistics.ruralBarangayCount} rural (${statistics.ruralBarangays[0]?.name})`
);
console.log(
  `  range: ${statistics.largestBarangay?.name} ${statistics.largestBarangay?.population} to ${statistics.smallestBarangay?.name} ${statistics.smallestBarangay?.population}`
);
