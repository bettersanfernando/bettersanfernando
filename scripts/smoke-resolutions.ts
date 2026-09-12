#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getResolutions } from '../src/data/civic/legislation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const resolutions = getResolutions();

assert.equal(resolutions.length, 2, 'expected exactly 2 resolution records');
assert.equal(new Set(resolutions.map(r => r.id)).size, resolutions.length);
assert.equal(
  new Set(resolutions.map(r => r.document_number)).size,
  resolutions.length
);

for (const resolution of resolutions) {
  assert.equal(resolution.document_type, 'Resolution');
  assert.equal(resolution.title, null, 'resolutions must not carry a title');
  assert.ok(
    resolution.subject,
    'every resolution must carry a verified subject'
  );
  assert.equal(resolution.full_text_available, false);
  assert.equal(resolution.date_adopted, null, 'no exact adoption date exists');
  assert.equal(resolution.date_precision, 'year');
  assert.equal(resolution.verification_level, 'SUBJECT_VERIFIED');
}

assert.ok(
  !plannedPages.some(page => page.path === '/legislation/resolutions'),
  '/legislation/resolutions must no longer be a planned page'
);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/legislation\/resolutions"[\s\S]{0,40}element={<Resolutions \/>}/
);

const pageSource = readFileSync('src/pages/Resolutions.tsx', 'utf8');
assert.match(pageSource, /getResolutions\(\)/);
assert.match(pageSource, /resolution\.subject/);
assert.doesNotMatch(pageSource, /manufactured title|invented adoption date/i);
for (const privateTerm of [
  'sha256',
  'source_commit',
  'recovery-queue',
  'candidate resolution',
  'wrong-jurisdiction',
]) {
  assert.ok(
    !pageSource.toLowerCase().includes(privateTerm.toLowerCase()),
    `${privateTerm} must not be surfaced by the page`
  );
}

console.log('[smoke-resolutions] OK');
console.log(
  `  resolutions: ${resolutions.length}, all subject-verified year-precision records`
);
