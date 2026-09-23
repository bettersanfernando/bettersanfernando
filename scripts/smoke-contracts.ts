#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { assertNextRedirect, readNextRoute } from './smoke-next-route.ts';
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

assert.equal(projects.length, 306);
assert.equal(records.length, 234);
assert.equal(summary.awarded, 228);
assert.equal(summary.contracted, 6);
assert.equal(summary.withContractAmount, 10);
assert.equal(summary.withContractNumber, 8);
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
assert.equal(amountWithoutContractedLifecycle.length, 4);
assert.equal(
  amountWithoutContractedLifecycle.filter(
    record => !hasContractNumber(record.project)
  ).length,
  2
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
  10
);
assert.equal(
  filterAndSortContractRecords(records, { contractNumber: 'available' }).length,
  8
);
assert.ok(
  records
    .filter(record => !hasContractAmount(record.project))
    .every(record => record.project.contract_amount === null)
);

const sampleBarangay = records.find(r => r.project.barangay)?.project.barangay;
if (sampleBarangay) {
  const filteredBarangay = filterAndSortContractRecords(records, {
    barangay: sampleBarangay,
  });
  assert.ok(filteredBarangay.length > 0);
  assert.ok(filteredBarangay.every(r => r.project.barangay === sampleBarangay));
}

const sampleFunding = records.find(r => r.project.funding_source)?.project
  .funding_source;
if (sampleFunding) {
  const filteredFunding = filterAndSortContractRecords(records, {
    funding: sampleFunding,
  });
  assert.ok(filteredFunding.length > 0);
  assert.ok(
    filteredFunding.every(r => r.project.funding_source === sampleFunding)
  );
}

const pageSource = readNextRoute('/procurement/contracts');
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
assert.match(pageSource, /PAGE_SIZE = 10/);
assert.match(pageSource, /getPageWindow/);
assert.match(pageSource, /Award and contract evidence by document year/);
assert.match(pageSource, /Current contract evidence snapshot/);
assert.match(pageSource, /QUICK READ/);
assert.match(pageSource, /What the documentary timeline shows/);
assert.match(
  pageSource,
  /document\s+years\s+include\s+Contracted-status\s+records/
);
assert.match(pageSource, /EVIDENCE COVERAGE/);
assert.match(pageSource, /What is available for the Contracted projects/);
assert.match(pageSource, /include a published contract number/);
assert.match(pageSource, /include a published contract amount/);
assert.match(pageSource, /include contract-related official evidence/);
assert.match(
  pageSource,
  /does\s+not\s+represent\s+actual\s+expenditure,\s+payment,\s+or\s+savings/
);
assert.ok(
  !pageSource.match(/\b(total|estimated|projected|generated)\s+savings\b/i),
  'Must not claim or label differences as savings'
);
assert.ok(
  !pageSource.toLowerCase().includes('underspending'),
  'Must not label differences as underspending'
);

await assertNextRedirect('/transparency/contracts', '/procurement/contracts');

console.log('[smoke-contracts] OK');
console.log(
  `  projects: ${summary.totalPublishedProjects}; awarded: ${summary.awarded}; contracted: ${summary.contracted}; contract amounts: ${summary.withContractAmount}; contract numbers: ${summary.withContractNumber}`
);
