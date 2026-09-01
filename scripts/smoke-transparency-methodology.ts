#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCityDemographicsSource } from '../src/data/civic/demographics.ts';
import { ProjectLifecycleStatus } from '../src/data/civic/projects.ts';
import { getTransparencySourceInventory } from '../src/data/civic/transparencySources.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const inventory = getTransparencySourceInventory();
const population = getCityDemographicsSource();

assert.equal(inventory.release.exportVersion, 'v0.1.0');
assert.equal(inventory.release.sourceDataVersion, 'v0.1.1');
assert.equal(inventory.publishedDomains.length, 7);
assert.deepEqual(ProjectLifecycleStatus.options, [
  'PLANNED',
  'PROCUREMENT',
  'AWARDED',
  'CONTRACTED',
]);
assert.equal(population.publisher, 'Philippine Statistics Authority');
assert.equal(population.census, '2024 POPCEN');

const geography = inventory.publishedDomains.find(
  domain => domain.id === 'geography'
);
assert.ok(geography);
assert.match(geography.authority, /Community-maintained/);
assert.doesNotMatch(geography.authority, /^Philippine Statistics Authority$/);

const transparencyMenu = mainNavigation.find(
  item => item.id === 'transparency'
);
const methodologyDestinations = transparencyMenu?.sections
  ?.flatMap(section => section.items)
  .filter(item => item.href.startsWith('/transparency/method'));
assert.equal(methodologyDestinations?.[0]?.kind, 'real');

for (const path of [
  '/transparency/methodology',
  '/transparency/verification',
  '/transparency/limitations',
]) {
  assert.ok(
    !plannedPages.some(page => page.path === path),
    `${path} must not remain a planned page`
  );
}

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(appSource, /path="\/transparency\/methodology"/);
assert.match(
  appSource,
  /path="\/transparency\/verification"[\s\S]*to="\/transparency\/methodology#verification"[\s\S]*replace/
);
assert.match(
  appSource,
  /path="\/transparency\/limitations"[\s\S]*to="\/transparency\/methodology#limitations"[\s\S]*replace/
);

const pageSource = readFileSync(
  'src/pages/TransparencyMethodology.tsx',
  'utf8'
);
assert.match(pageSource, /id="verification"/);
assert.match(pageSource, /id="limitations"/);
assert.match(pageSource, /getTransparencySourceInventory/);
assert.match(pageSource, /AWARDED.*CONTRACTED/s);
assert.match(
  pageSource,
  /ABC.*winning bid.*contract amount.*actual expenditure/s
);
assert.match(pageSource, /unknown.*zero/is);
assert.match(pageSource, /2024 POPCEN/);
assert.match(pageSource, /community-maintained/i);
assert.match(pageSource, /frontend-safe export/i);

for (const privateTerm of [
  'source_sha256',
  'source_commit',
  'generated_from',
  'project-recovery-queue',
  'collision-triage',
  'financial-privacy-analysis',
]) {
  assert.ok(
    !pageSource.includes(privateTerm),
    `${privateTerm} must not appear on the public methodology page`
  );
}

console.log('[smoke-transparency-methodology] OK');
console.log(
  `  release ${inventory.release.exportVersion} · source data ${inventory.release.sourceDataVersion}`
);
console.log('  canonical page with #verification and #limitations');
