import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';
import { getStatisticsSummary } from '../src/data/civic/statisticsSummary.ts';

const summary = getStatisticsSummary();
const appSource = readFileSync('src/App.tsx', 'utf8');
const pageSource = readFileSync('src/pages/Statistics.tsx', 'utf8');

assert.match(appSource, /path="\/statistics" element={<Statistics \/>}/);
assert.match(
  appSource,
  /path="\/government\/reports-and-statistics"[\s\S]*?<Navigate to="\/statistics" replace \/>/
);
assert.ok(!plannedPages.some(page => page.path === '/statistics'));
assert.equal(mainNavigation.length, 7);

assert.deepEqual(summary.population, {
  total: 377_534,
  referenceYear: 2024,
  census: '2024 POPCEN',
  barangays: 35,
  urbanBarangays: 34,
  ruralBarangays: 1,
});
assert.equal(summary.projects.total, 239);
assert.deepEqual(summary.projects.lifecycle, {
  PLANNED: 2,
  PROCUREMENT: 3,
  AWARDED: 228,
  CONTRACTED: 6,
});
assert.equal(summary.projects.attributedToBarangay, 214);
assert.equal(summary.projects.unattributed, 25);
assert.equal(summary.procurement.evidence, 334);
assert.equal(summary.procurement.bidResults, 233);
assert.equal(summary.procurement.bidResultProjects, 233);
assert.equal(summary.government.officeRecords, 22);
assert.equal(summary.geography.cityBoundaries, 1);
assert.equal(summary.geography.barangayBoundaries, 35);

for (const href of [
  '/statistics/population',
  '/statistics/projects',
  '/statistics/procurement',
  '/statistics/city-profile',
]) {
  assert.match(pageSource, new RegExp(`href: ["']${href}["']`));
}

for (const plannedHref of [
  '/statistics/demographics',
  '/statistics/project-spending',
  '/statistics/public-records',
]) {
  assert.doesNotMatch(
    pageSource,
    new RegExp(`(?:to|href)=["']${plannedHref}["']`)
  );
}

assert.doesNotMatch(
  pageSource,
  /total spending|actual expenditure[^<]*(?:PHP|\u20b1|[0-9])|savings|transparency score|city score|completeness score|data-health score/i
);
assert.doesNotMatch(
  pageSource,
  /BHERT|raw finance|private file|recovery queue|hash|internal audit/i
);

console.log('Statistics hub smoke checks passed.');
