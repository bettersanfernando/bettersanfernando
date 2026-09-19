#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readNextRoute } from './smoke-next-route.ts';
import {
  getLegislationSourceUrl,
  getOrdinances,
  hasLegislationFullText,
} from '../src/data/civic/legislation.ts';

const ordinances = getOrdinances();
const fullTextRecords = ordinances.filter(hasLegislationFullText);
const referenceOnlyRecords = ordinances.filter(
  ordinance => !hasLegislationFullText(ordinance)
);

assert.equal(ordinances.length, 11);
assert.equal(fullTextRecords.length, 2);
assert.equal(referenceOnlyRecords.length, 9);
assert.equal(new Set(ordinances.map(item => item.id)).size, ordinances.length);
assert.equal(
  new Set(ordinances.map(item => item.document_number)).size,
  ordinances.length
);

for (const ordinance of ordinances) {
  assert.equal(ordinance.document_type, 'Ordinance');
  assert.ok(getLegislationSourceUrl(ordinance));
  assert.equal(
    hasLegislationFullText(ordinance),
    ordinance.full_text_available && Boolean(ordinance.official_pdf_url)
  );
}

const pageSource = readNextRoute('/legislation/ordinances');
for (const privateField of [
  'sha256',
  'source_commit',
  'recovery-queue',
  'archive_path',
  'research_notes',
]) {
  assert.ok(
    !pageSource.includes(privateField),
    `${privateField} must not be surfaced by the page`
  );
}
assert.match(pageSource, /getOrdinances\(\)/);
assert.match(pageSource, /Reference record only/);

console.log('[smoke-ordinances] OK');
console.log(
  `  ordinances: ${ordinances.length}; full text: ${fullTextRecords.length}; reference only: ${referenceOnlyRecords.length}`
);
