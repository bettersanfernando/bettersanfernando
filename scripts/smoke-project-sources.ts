#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getAllProjectEvidence,
  getProjectById,
  getProjects,
} from '../src/data/civic/projects.ts';
import {
  countProjectEvidenceByStage,
  filterProjectEvidence,
  resolveProjectEvidence,
} from '../src/data/civic/projectSources.ts';
import {
  getEvidenceSourceUrl,
  hasAttachment,
  isPrimaryOfficialSource,
} from '../src/data/civic/sources.ts';

const evidence = getAllProjectEvidence();
const projects = getProjects();
const records = resolveProjectEvidence(evidence);
const counts = countProjectEvidenceByStage(evidence);

assert.equal(evidence.length, 334);
assert.equal(projects.length, 239);
assert.equal(counts.BID_RESULTS, 233);
assert.equal(records.length, evidence.length, 'no evidence may be orphaned');
assert.equal(new Set(evidence.map(item => item.project_id)).size, 239);

for (const item of evidence) {
  assert.ok(
    getProjectById(item.project_id),
    `${item.id} must resolve to a project`
  );
  assert.equal(isPrimaryOfficialSource(item), true);
  assert.equal(hasAttachment(item), item.attachment_url !== null);
  assert.equal(
    getEvidenceSourceUrl(item),
    item.attachment_url ?? item.page_url ?? null
  );
}

assert.equal(
  filterProjectEvidence(records, { stage: 'APP' }).length,
  counts.APP
);
assert.equal(
  filterProjectEvidence(records, { authority: 'PRIMARY_OFFICIAL' }).length,
  20
);
assert.equal(
  filterProjectEvidence(records, { query: evidence[0].source_identifier })[0]
    .evidence.id,
  evidence[0].id
);
assert.deepEqual(
  filterProjectEvidence(records, { sort: 'identifier-asc' }).map(
    item => item.evidence.id
  ),
  filterProjectEvidence(records, { sort: 'identifier-asc' }).map(
    item => item.evidence.id
  ),
  'sorting must be deterministic'
);

const pageSource = readFileSync('src/pages/ProjectSources.tsx', 'utf8');
for (const privateField of [
  'source_sha256',
  'retrieval_status',
  'archive_path',
  'research_queue',
]) {
  assert.ok(
    !pageSource.includes(privateField),
    `${privateField} must not be surfaced by the page`
  );
}
assert.ok(!/\b(?:item|evidence)\.facts\b/.test(pageSource));

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(appSource, /path="\/projects\/sources"/);
assert.match(
  appSource,
  /path="\/projects\/data-sources"[\s\S]*to="\/projects\/sources"/
);

console.log('[smoke-project-sources] OK');
console.log(`  evidence: ${evidence.length}; projects: ${projects.length}`);
console.log(
  `  stages: ${Object.entries(counts)
    .map(([stage, count]) => `${stage}=${count}`)
    .join(', ')}`
);
