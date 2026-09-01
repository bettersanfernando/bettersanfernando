import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getGovernmentSummary } from '../src/data/civic/governmentSummary.ts';
import { getHomeSummary } from '../src/data/civic/homeSummary.ts';
import { getStatisticsSummary } from '../src/data/civic/statisticsSummary.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const appSource = readFileSync('src/App.tsx', 'utf8');
const pageSource = readFileSync('src/pages/Home.tsx', 'utf8');
const summary = getHomeSummary();
const statistics = getStatisticsSummary();
const government = getGovernmentSummary();

assert.match(appSource, /path="\/" element={<Home \/>}/);
assert.ok(!plannedPages.some(page => page.path === '/'));
assert.equal(mainNavigation.length, 7);

assert.deepEqual(summary.population, statistics.population);
assert.equal(summary.projects.total, statistics.projects.total);
assert.equal(summary.projects.evidence, statistics.procurement.evidence);
assert.equal(summary.projects.bidResults, statistics.procurement.bidResults);
assert.deepEqual(summary.government, government);
assert.equal(summary.population.total, 377_534);
assert.equal(summary.population.barangays, 35);
assert.equal(summary.projects.total, 239);
assert.equal(summary.projects.evidence, 334);
assert.equal(summary.government.officeRecords, 22);

assert.match(pageSource, /BetterSanFernando/);
assert.match(pageSource, /City of San Fernando, Pampanga/);
assert.match(pageSource, /not an official City\s+Government website/i);
assert.match(pageSource, /published project records/i);
assert.doesNotMatch(pageSource, /239 City projects/i);
assert.doesNotMatch(pageSource, /22 City Government offices/i);
assert.match(pageSource, /getSearchHref/);

for (const href of [
  '/projects',
  '/projects/map',
  '/projects/sources',
  '/procurement',
  '/government',
  '/government/offices',
  '/government/contact',
  '/legislation',
  '/statistics',
  '/barangays',
  '/transparency',
  '/transparency/sources',
  '/transparency/methodology',
  '/search',
]) {
  assert.match(pageSource, new RegExp(`["']${href}["']`));
}

for (const plannedPage of plannedPages) {
  assert.doesNotMatch(
    pageSource,
    new RegExp(`(?:to|href):?\\s*=[{]?["']${plannedPage.path}["']`)
  );
}

assert.doesNotMatch(
  pageSource,
  /329 services|Citizen.?s Charter|service requirements|BLPD enrichment/i
);
assert.doesNotMatch(
  pageSource,
  /source hash|private finance|recovery queue|extraction QA|government structure|unpublished resolutions/i
);
assert.doesNotMatch(pageSource, /complete transparency|all government data/i);

console.log('[smoke-home] OK');
console.log(
  `  population: ${summary.population.total}; barangays: ${summary.population.barangays}; projects: ${summary.projects.total}; evidence: ${summary.projects.evidence}; offices: ${summary.government.officeRecords}`
);
