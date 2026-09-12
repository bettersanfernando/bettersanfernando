#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getAgeBandPopulation2020,
  getAgeSexPopulation2020,
  getDemographicProfileMetadata,
  getDemographicProfileRecords,
  getHouseholdPopulation2024,
  getPovertyIncidence2023,
} from '../src/data/civic/demographicProfile.ts';
import { getCityTotalPopulation } from '../src/data/civic/demographics.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const records = getDemographicProfileRecords();
const metadata = getDemographicProfileMetadata();
const households2024 = getHouseholdPopulation2024();
const ageSex2020 = getAgeSexPopulation2020();
const ageBands2020 = getAgeBandPopulation2020();
const poverty2023 = getPovertyIncidence2023();

assert.equal(records.length, 136, '136 exported demographic records');
assert.equal(metadata.recordCount, 136);
assert.equal(households2024.barangayCount, 35, '35-barangay coverage');
assert.equal(households2024.cityHouseholdPopulation, 375498);
assert.equal(households2024.cityNumberOfHouseholds, 95139);

const male2020 = ageSex2020.find(
  r => r.sex === 'male' && r.category === 'all_ages'
);
const female2020 = ageSex2020.find(
  r => r.sex === 'female' && r.category === 'all_ages'
);
const both2020 = ageSex2020.find(
  r => r.sex === 'both' && r.category === 'all_ages'
);
assert.equal(male2020?.value, 178906);
assert.equal(female2020?.value, 173895);
assert.equal(both2020?.value, 352801);
assert.equal((male2020?.value ?? 0) + (female2020?.value ?? 0), 352801);

assert.ok(
  ageBands2020.every(record => record.is_derived === true),
  'every age band record must be labeled as derived'
);
assert.ok(
  ageBands2020.every(
    record => record.derivation && record.derivation.length > 0
  ),
  'every derived age band must carry a derivation explanation'
);

assert.equal(poverty2023?.dimension, 'poverty_incidence');
assert.equal(poverty2023?.reference_date, '2023-01-01');
assert.equal(poverty2023?.source_type, 'model_based_small_area_estimate');
assert.ok(poverty2023?.value !== undefined);

const comparabilityGroups = new Set(records.map(r => r.comparability_group));
assert.ok(comparabilityGroups.has('2024_POPCEN_household_population'));
assert.ok(comparabilityGroups.has('2020_CPH_household_population'));
assert.ok(
  comparabilityGroups.has('2020_CPH_household_population_derived_age_bands')
);
assert.ok(comparabilityGroups.has('2023_SAE_poverty_incidence'));
assert.equal(
  comparabilityGroups.size,
  4,
  '2020, 2023, and 2024 reference periods must never merge into one comparability group'
);

assert.ok(
  metadata.publicLimitations.some(l => l.includes('household population')),
  'limitations must distinguish household population from total population'
);
assert.equal(
  metadata.heldDimensions.some(h => h.dimension === 'population_density'),
  true,
  'population density must remain held, not published'
);

const forbiddenDimensions = [
  'civil_status',
  'education',
  'employment',
  'disability',
  'migration',
  'population_density',
  'average_household_size',
];
assert.ok(
  records.every(record => !forbiddenDimensions.includes(record.dimension)),
  'no excluded dimension may be published as a record'
);

const cityTotalPopulation = getCityTotalPopulation();
assert.equal(cityTotalPopulation, 377534);
assert.notEqual(
  cityTotalPopulation,
  households2024.cityHouseholdPopulation,
  'total population and household population must remain distinct measures'
);

const pageSource = readFileSync('src/pages/DemographicsStatistics.tsx', 'utf8');
assert.match(pageSource, /statistics\/population/);
assert.match(pageSource, /derived/i);
assert.match(pageSource, /Not available/);
assert.doesNotMatch(
  pageSource,
  /average household size:|household size is \d/i,
  'must not calculate or publish an average household size value'
);
assert.doesNotMatch(
  pageSource,
  /population density:|density of \d|\d+ per (square )?km/i,
  'must not calculate or publish a population density value'
);
assert.doesNotMatch(
  pageSource,
  /civil.status|education|employment|disability|migration/i
);

const demographicsDestinations = mainNavigation
  .flatMap(item => item.sections?.flatMap(section => section.items) ?? [])
  .filter(item => item.href === '/statistics/demographics');
assert.equal(demographicsDestinations.length, 1);
assert.equal(demographicsDestinations[0]?.kind, 'real');
assert.ok(!plannedPages.some(page => page.path === '/statistics/demographics'));

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/statistics\/demographics"[\s\S]{0,80}element={<DemographicsStatistics \/>}/
);

console.log('[smoke-demographics-statistics] OK');
console.log(
  `  records: 136; barangays: 35; 2024 hh pop: 375498; 2020 m+f=${(male2020?.value ?? 0) + (female2020?.value ?? 0)}`
);
