import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';
import { getTransparencySummary } from '../src/data/civic/transparencySummary.ts';
import { getTransparencySourceInventory } from '../src/data/civic/transparencySources.ts';

const summary = getTransparencySummary();
const inventory = getTransparencySourceInventory();
const appSource = readFileSync('src/App.tsx', 'utf8');
const pageSource = readFileSync('src/pages/Transparency.tsx', 'utf8');

assert.match(appSource, /path="\/transparency" element={<Transparency \/>}/);
assert.ok(!plannedPages.some(page => page.path === '/transparency'));
assert.equal(mainNavigation.length, 7);

assert.equal(summary.release.datasetFiles, inventory.release.datasetCount);
assert.equal(
  summary.release.publishedDomains,
  inventory.publishedDomains.length
);
assert.equal(summary.projects.total, 239);
assert.equal(summary.projects.evidence, 334);
assert.equal(summary.projects.bidResults, 233);
assert.equal(summary.projects.awarded, 228);
assert.equal(summary.projects.contracted, 6);
assert.equal(summary.government.officeRecords, 22);
assert.equal(summary.legislation.executiveOrders, 11);
assert.equal(summary.legislation.ordinances, 6);
assert.equal(summary.legislation.resolutions, 0);
assert.equal(summary.population.total, 377_534);
assert.equal(summary.population.census, '2024 POPCEN');
assert.equal(summary.population.barangays, 35);
assert.equal(summary.population.urbanBarangays, 34);
assert.equal(summary.population.ruralBarangays, 1);
assert.equal(summary.geography.cityBoundaries, 1);
assert.equal(summary.geography.barangayBoundaries, 35);

for (const id of ['finance', 'full-disclosure'] as const) {
  assert.equal(
    summary.unavailable.find(domain => domain.id === id)?.status,
    'NOT_EXPORTED'
  );
}
assert.equal(
  summary.unavailable.find(domain => domain.id === 'resolutions')?.status,
  'NOT_VERIFIED'
);

for (const plannedHref of [
  '/transparency/finance',
  '/transparency/full-disclosure',
  '/transparency/documents',
  '/legislation/resolutions',
]) {
  assert.doesNotMatch(
    pageSource,
    new RegExp(`(?:to|href)=["']${plannedHref}["']`)
  );
}

assert.doesNotMatch(pageSource, /data does not exist|City has no resolutions/i);
assert.doesNotMatch(
  pageSource,
  /BHERT.*(?:name|phone|email)|raw source path|hash|recovery queue/i
);

console.log('Transparency smoke checks passed.');
