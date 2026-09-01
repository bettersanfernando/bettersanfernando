#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getProjects } from '../src/data/civic/projects.ts';
import {
  CONTRACT_RECORD_SORTS,
  filterAndSortContractRecords,
  getAwardAndContractRecords,
  getContractsSummary,
  hasContractAmount,
  hasContractNumber,
} from '../src/data/civic/contracts.ts';
import { getEvidenceSourceUrl } from '../src/data/civic/sources.ts';

const projects = getProjects();
const records = getAwardAndContractRecords();
const summary = getContractsSummary(records, projects.length);

assert.equal(projects.length, 239);
assert.equal(records.length, 234);
assert.equal(summary.awarded, 228);
assert.equal(summary.contracted, 6);
assert.equal(summary.withContractAmount, 8);
assert.equal(summary.withContractNumber, 6);
assert.ok(
  records.every(record =>
    ['AWARDED', 'CONTRACTED'].includes(record.project.lifecycle_status)
  )
);
assert.ok(
  records.every(record =>
    record.evidence.every(item => item.project_id === record.project.id)
  )
);
assert.ok(
  records
    .filter(record => record.project.lifecycle_status === 'AWARDED')
    .every(record => record.project.lifecycle_status !== 'CONTRACTED')
);

const amountWithoutContractedLifecycle = records.filter(
  record =>
    hasContractAmount(record.project) &&
    record.project.lifecycle_status === 'AWARDED'
);
assert.equal(amountWithoutContractedLifecycle.length, 2);
assert.ok(
  amountWithoutContractedLifecycle.every(
    record => !hasContractNumber(record.project)
  )
);
assert.ok(
  records
    .filter(record => record.project.lifecycle_status === 'CONTRACTED')
    .every(record => hasContractNumber(record.project))
);
assert.ok(
  records
    .filter(record => record.sourceEvidence)
    .every(record => getEvidenceSourceUrl(record.sourceEvidence!) !== null)
);

for (const sort of CONTRACT_RECORD_SORTS) {
  const first = filterAndSortContractRecords(records, { sort }).map(
    record => record.project.id
  );
  const second = filterAndSortContractRecords(records, { sort }).map(
    record => record.project.id
  );
  assert.deepEqual(first, second, `${sort} sorting must be deterministic`);
}
assert.equal(
  filterAndSortContractRecords(records, { lifecycle: 'CONTRACTED' }).length,
  6
);
assert.equal(
  filterAndSortContractRecords(records, { contractAmount: 'available' }).length,
  8
);
assert.equal(
  filterAndSortContractRecords(records, { contractNumber: 'available' }).length,
  6
);
assert.ok(
  records
    .filter(record => !hasContractAmount(record.project))
    .every(record => record.project.contract_amount === null)
);

const pageSource = readFileSync('src/pages/Contracts.tsx', 'utf8');
for (const privateField of [
  'source_sha256',
  'retrieval_status',
  'archive_path',
  'research_queue',
  'collision',
  'audit_notes',
]) {
  assert.ok(
    !pageSource.includes(privateField),
    `${privateField} must not be surfaced by the page`
  );
}
assert.match(pageSource, /Award does not equal contract/);
assert.match(pageSource, /Approved Budget for the Contract \(ABC\)/);
assert.match(pageSource, /Winning bid amount/);
assert.match(pageSource, /Contract amount/);
assert.match(pageSource, /slice\(0, visibleCount\)/);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(appSource, /path="\/procurement\/contracts"/);
assert.match(
  appSource,
  /path="\/transparency\/contracts"[\s\S]*to="\/procurement\/contracts"/
);

console.log('[smoke-contracts] OK');
console.log(
  `  projects: ${summary.totalPublishedProjects}; awarded: ${summary.awarded}; contracted: ${summary.contracted}; contract amounts: ${summary.withContractAmount}; contract numbers: ${summary.withContractNumber}`
);
