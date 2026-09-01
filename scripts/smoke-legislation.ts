import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getExecutiveOrders,
  getOrdinances,
  getResolutions,
  hasLegislationFullText,
} from '../src/data/civic/legislation.ts';
import { getLegislationSummary } from '../src/data/civic/legislationSummary.ts';
import { mainNavigation } from '../src/data/navigation.ts';

const summary = getLegislationSummary();
const executiveOrders = getExecutiveOrders();
const ordinances = getOrdinances();
const resolutions = getResolutions();

assert.equal(summary.executiveOrders.total, executiveOrders.length);
assert.equal(
  summary.executiveOrders.withFullText,
  executiveOrders.filter(hasLegislationFullText).length
);
assert.equal(summary.ordinances.total, ordinances.length);
assert.equal(
  summary.ordinances.withFullText,
  ordinances.filter(hasLegislationFullText).length
);
assert.equal(
  summary.ordinances.referenceOnly,
  ordinances.filter(record => !hasLegislationFullText(record)).length
);
assert.equal(summary.resolutions.total, resolutions.length);
assert.equal(summary.resolutions.total, 0);
assert.ok(summary.executiveOrders.preview.length <= 3);
assert.ok(summary.ordinances.preview.length <= 3);
assert.deepEqual(
  getLegislationSummary(),
  summary,
  'summary output must be deterministic'
);

for (const record of [
  ...summary.executiveOrders.preview,
  ...summary.ordinances.preview,
]) {
  assert.deepEqual(
    Object.keys(record).sort(),
    [
      'date',
      'documentNumber',
      'fullTextAvailable',
      'id',
      'title',
      'year',
    ].sort(),
    'hub previews must expose only the bounded display projection'
  );
}

assert.equal(mainNavigation.length, 7);

const pageSource = readFileSync('src/pages/Legislation.tsx', 'utf8');
assert.doesNotMatch(pageSource, /17 total laws|total laws/i);
assert.doesNotMatch(pageSource, /no resolutions exist|City Council passed no/i);
assert.doesNotMatch(pageSource, /legislation\/resolutions/);
for (const privateTerm of [
  'resolution recovery queue',
  'collision notes',
  'wrong-jurisdiction',
  'candidate resolution',
  'private source path',
]) {
  assert.ok(!pageSource.toLowerCase().includes(privateTerm));
}
assert.match(pageSource, /View all Executive Orders/);
assert.match(pageSource, /View all Ordinances/);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(appSource, /path="\/legislation"/);

console.log('[smoke-legislation] OK');
console.log(
  `  executive orders: ${summary.executiveOrders.total}; ordinances: ${summary.ordinances.total} (${summary.ordinances.withFullText} full text, ${summary.ordinances.referenceOnly} reference only); resolutions: ${summary.resolutions.total}`
);
