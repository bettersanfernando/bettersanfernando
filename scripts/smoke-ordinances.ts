#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

assert.equal(ordinances.length, 6);
assert.equal(fullTextRecords.length, 2);
assert.equal(referenceOnlyRecords.length, 4);
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

const pageSource = readFileSync('src/pages/Ordinances.tsx', 'utf8');
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

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(appSource, /path="\/legislation\/ordinances"/);

console.log('[smoke-ordinances] OK');
console.log(
  `  ordinances: ${ordinances.length}; full text: ${fullTextRecords.length}; reference only: ${referenceOnlyRecords.length}`
);
