#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readNextRoute } from './smoke-next-route.ts';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';
import {
  getAllProjectEvidence,
  getProjects,
  ProjectEvidenceStage,
  ProjectLifecycleStatus,
} from '../src/data/civic/projects.ts';
import {
  BarangaysGeojsonSchema,
  CityGeojsonSchema,
} from '../src/data/civic/geography.schemas.ts';

const projects = getProjects();
const evidence = getAllProjectEvidence();

assert.equal(projects.length, 307);
assert.equal(evidence.length, 563);
assert.equal(evidence.filter(item => item.stage === 'BID_RESULTS').length, 233);
assert.deepEqual(ProjectLifecycleStatus.options, [
  'PLANNED',
  'PROCUREMENT',
  'AWARDED',
  'CONTRACTED',
  'IMPLEMENTATION_REPORTED',
]);
assert.ok(!ProjectLifecycleStatus.options.includes('ONGOING' as never));
assert.ok(ProjectEvidenceStage.options.includes('BID_RESULTS'));
assert.ok(ProjectEvidenceStage.options.includes('NTA_UTILIZATION_REPORT'));
const cityPath = fileURLToPath(
  new URL('../src/data/generated/civic/geography/city.geojson', import.meta.url)
);
const barangaysPath = fileURLToPath(
  new URL(
    '../src/data/generated/civic/geography/barangays.geojson',
    import.meta.url
  )
);
assert.equal(
  CityGeojsonSchema.parse(JSON.parse(readFileSync(cityPath, 'utf8'))).features
    .length,
  1
);
assert.equal(
  BarangaysGeojsonSchema.parse(JSON.parse(readFileSync(barangaysPath, 'utf8')))
    .features.length,
  35
);
assert.ok(
  projects.every(project => !('coordinates' in project)),
  'published projects must not imply verified point coordinates'
);

const projectMenu = mainNavigation.find(item => item.id === 'projects');
const methodologyDestination = projectMenu?.sections
  ?.flatMap(section => section.items)
  .find(item => item.href === '/projects/methodology');
assert.equal(
  methodologyDestination?.kind,
  'real',
  'project methodology must be a real Projects destination'
);
assert.ok(
  !plannedPages.some(page => page.path === '/projects/methodology'),
  'project methodology must not remain a planned page'
);

const pageSource = readNextRoute('/projects/methodology');
for (const privateTerm of [
  'source_sha256',
  'recovery_queue',
  'collision-triage',
  'raw-source-manifest',
  'private filesystem',
]) {
  assert.ok(
    !pageSource.includes(privateTerm),
    `${privateTerm} must not appear on the public methodology page`
  );
}

// No stale "only the four states" claim — the schema has five.
assert.ok(
  !/only the four states/i.test(pageSource),
  'stale four-states claim must not remain on the methodology page'
);
// The page renders every lifecycle status by iterating the schema (via
// titleCaseEnum), so check the five keys are covered in LIFECYCLE_MEANINGS
// rather than the (runtime-only) rendered labels.
for (const status of ProjectLifecycleStatus.options) {
  assert.ok(
    pageSource.includes(`${status}:`),
    `lifecycle status "${status}" must have methodology copy on the page`
  );
}
assert.ok(
  pageSource.includes('ProjectLifecycleStatus.options.map'),
  'the page must render lifecycle statuses from the schema, not a hardcoded list'
);

// Financial-field terminology stays distinct.
for (const term of [
  'Estimated budget',
  'Approved Budget for the Contract (ABC)',
  'Winning bid amount',
  'Contract amount',
  'Fund utilization amount',
  'Actual expenditure',
]) {
  assert.ok(
    pageSource.includes(term),
    `financial field "${term}" must be represented on the methodology page`
  );
}

// Missing-data wording must not imply zero, and geography wording must not
// imply exact coordinates.
assert.ok(pageSource.includes('stays missing'));
assert.ok(pageSource.includes('not an exact project-location map'));

// Related-resource links resolve to real routes.
for (const href of [
  '/projects/map',
  '/procurement',
  '/statistics/projects',
  '/transparency/methodology',
  '/projects/sources',
  '/projects/city-projects',
]) {
  assert.ok(
    pageSource.includes(`href="${href}"`) || pageSource.includes(href),
    `related resource link "${href}" must appear on the methodology page`
  );
}

console.log('[smoke-project-methodology] OK');
console.log(
  `  public dataset: ${projects.length} projects, ${evidence.length} evidence records`
);
console.log(`  lifecycle states: ${ProjectLifecycleStatus.options.join(', ')}`);
console.log(
  '  geography: 1 city boundary, 35 barangay polygons, 0 project points'
);
