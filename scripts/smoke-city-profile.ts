#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  getBarangays,
  getCityDemographicsSource,
  getCityTotalPopulation,
} from '../src/data/civic/demographics.ts';
import {
  BarangaysGeojsonSchema,
  CityGeojsonSchema,
} from '../src/data/civic/geography.schemas.ts';
import { getGeographyMetadata } from '../src/data/civic/geographyMetadata.ts';
import { getCityOfficesMetadata } from '../src/data/civic/government.ts';
import { aggregatePopulationStatistics } from '../src/data/civic/populationStatistics.ts';

const cityPath = fileURLToPath(
  new URL('../src/data/generated/civic/geography/city.geojson', import.meta.url)
);
const barangaysPath = fileURLToPath(
  new URL(
    '../src/data/generated/civic/geography/barangays.geojson',
    import.meta.url
  )
);
const cityBoundaries = CityGeojsonSchema.parse(
  JSON.parse(readFileSync(cityPath, 'utf8'))
).features;
const barangayBoundaries = BarangaysGeojsonSchema.parse(
  JSON.parse(readFileSync(barangaysPath, 'utf8'))
).features;
const population = aggregatePopulationStatistics(
  getBarangays(),
  getCityTotalPopulation()
);
const source = getCityDemographicsSource();
const offices = getCityOfficesMetadata();
const geography = getGeographyMetadata();

assert.equal(population.totalPopulation, 377534);
assert.equal(population.barangayCount, 35);
assert.equal(population.urbanBarangayCount, 34);
assert.equal(population.ruralBarangayCount, 1);
assert.deepEqual(
  population.ruralBarangays.map(barangay => barangay.name),
  ['Lourdes']
);
assert.equal(source.referenceYear, 2024);
assert.equal(source.census, '2024 POPCEN');
assert.equal(cityBoundaries.length, 1);
assert.equal(cityBoundaries[0]?.properties.name, 'City of San Fernando');
assert.equal(cityBoundaries[0]?.properties.psgc_code, '0305416000');
assert.equal(barangayBoundaries.length, 35);
assert.equal(geography.cityBoundaryCount, cityBoundaries.length);
assert.equal(geography.barangayBoundaryCount, barangayBoundaries.length);
assert.equal(geography.cityName, 'City of San Fernando');
assert.equal(geography.province, 'Pampanga');
assert.equal(geography.cityPsgcCode, '0305416000');
assert.equal(
  new Set(barangayBoundaries.map(feature => feature.properties.psgc_code)).size,
  35
);
assert.equal(offices.officeCount, 22);
assert.equal(offices.cityName, 'City of San Fernando');
assert.equal(offices.province, 'Pampanga');

console.log('[smoke-city-profile] OK');
console.log('  City of San Fernando, Pampanga · PSGC 0305416000');
console.log('  population 377534 · 35 barangays · 34 Urban · 1 Rural');
console.log('  1 city boundary · 35 barangay boundaries · 22 office records');
