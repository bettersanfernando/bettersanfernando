#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
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

assert.equal(projects.length, 239);
assert.equal(evidence.length, 334);
assert.equal(evidence.filter(item => item.stage === 'BID_RESULTS').length, 233);
assert.deepEqual(ProjectLifecycleStatus.options, [
  'PLANNED',
  'PROCUREMENT',
  'AWARDED',
  'CONTRACTED',
]);
assert.ok(!ProjectLifecycleStatus.options.includes('ONGOING' as never));
assert.ok(ProjectEvidenceStage.options.includes('BID_RESULTS'));
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

const pageSource = readFileSync('src/pages/ProjectMethodology.tsx', 'utf8');
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

console.log('[smoke-project-methodology] OK');
console.log(
  `  public dataset: ${projects.length} projects, ${evidence.length} evidence records`
);
console.log(`  lifecycle states: ${ProjectLifecycleStatus.options.join(', ')}`);
console.log(
  '  geography: 1 city boundary, 35 barangay polygons, 0 project points'
);
