#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getTransparencySourceInventory } from '../src/data/civic/transparencySources.ts';

const inventory = getTransparencySourceInventory();

assert.equal(inventory.release.exportVersion, 'v0.1.0');
assert.equal(inventory.release.sourceDataVersion, 'v0.1.1');
assert.equal(inventory.release.datasetCount, 9);
assert.equal(inventory.publishedDomains.length, 7);
assert.deepEqual(
  inventory.publishedDomains.map(domain => domain.id),
  [
    'projects',
    'project-evidence',
    'population',
    'geography',
    'city-offices',
    'executive-orders',
    'ordinances',
  ]
);

const expectedRecordCounts = {
  projects: 239,
  'project-evidence': 334,
  population: 35,
  geography: 36,
  'city-offices': 22,
  'executive-orders': 11,
  ordinances: 6,
};
for (const domain of inventory.publishedDomains) {
  assert.equal(domain.recordCount, expectedRecordCounts[domain.id]);
  assert.ok(domain.datasetPaths.length > 0);
  for (const datasetPath of domain.datasetPaths) {
    assert.ok(
      inventory.release.datasetNames.includes(datasetPath),
      `${datasetPath} must be declared by the public manifest`
    );
  }
}

const geography = inventory.publishedDomains.find(
  domain => domain.id === 'geography'
);
assert.ok(geography);
assert.match(geography.authority, /Community-maintained/);
assert.doesNotMatch(geography.authority, /^Philippine Statistics Authority$/);
assert.equal(geography.links.length, 2);

assert.deepEqual(
  inventory.unavailableDomains.map(domain => [domain.id, domain.status]),
  [
    ['finance', 'NOT_EXPORTED'],
    ['full-disclosure', 'NOT_EXPORTED'],
    ['person-directories', 'NOT_EXPORTED'],
    ['resolutions', 'NOT_VERIFIED'],
  ]
);

const pageSource = readFileSync('src/pages/TransparencySources.tsx', 'utf8');
for (const privateField of [
  'sha256',
  'source_commit',
  'generated_from',
  'recovery-queue',
  'source-manifest',
]) {
  assert.ok(
    !pageSource.includes(privateField),
    `${privateField} must not be surfaced by the page`
  );
}

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(appSource, /path="\/transparency\/sources"/);

console.log('[smoke-transparency-sources] OK');
console.log(
  `  ${inventory.release.datasetCount} datasets · ${inventory.publishedDomains.length} published domains`
);
