#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getProcurementStatistics } from '../src/data/civic/procurementStatistics.ts';

const first = getProcurementStatistics();
const second = getProcurementStatistics();

assert.deepEqual(first, second, 'procurement statistics must be deterministic');
assert.equal(first.projects.total, 239);
assert.equal(first.evidence.total, 334);
assert.deepEqual(first.projects.lifecycle, [
  { key: 'PLANNED', count: 2, denominator: 239, percentage: 0.8 },
  { key: 'PROCUREMENT', count: 3, denominator: 239, percentage: 1.3 },
  { key: 'AWARDED', count: 228, denominator: 239, percentage: 95.4 },
  { key: 'CONTRACTED', count: 6, denominator: 239, percentage: 2.5 },
]);
assert.equal(
  first.projects.lifecycle.reduce((sum, item) => sum + item.count, 0),
  first.projects.total
);
assert.deepEqual(
  Object.fromEntries(
    first.projects.fieldCoverage.map(item => [item.key, item.count])
  ),
  {
    approvedBudgetAbc: 228,
    winningBidAmount: 231,
    contractAmount: 8,
    contractNumber: 6,
  }
);
assert.ok(
  first.projects.fieldCoverage.every(
    item => item.denominator === first.projects.total
  )
);
assert.equal(first.bidResults.total, 233);
assert.equal(first.bidResults.projectsRepresented, 233);
assert.deepEqual(
  Object.fromEntries(
    first.bidResults.fieldCoverage.map(item => [item.key, item.count])
  ),
  {
    approvedBudgetAbc: 225,
    winningBidAmount: 233,
    winningBidder: 233,
    attachment: 233,
  }
);
assert.ok(
  first.bidResults.fieldCoverage.every(
    item => item.denominator === first.bidResults.total
  )
);
assert.equal(
  first.bidResults.byDocumentYear.reduce(
    (sum, item) => sum + item.count,
    first.bidResults.unknownDocumentDate
  ),
  first.bidResults.total
);
assert.equal(first.bidResults.unknownDocumentDate, 10);
assert.equal(first.awardsAndContracts.awarded, 228);
assert.equal(first.awardsAndContracts.contracted, 6);
assert.equal(first.awardsAndContracts.withContractAmount, 8);
assert.equal(first.awardsAndContracts.withContractNumber, 6);

const pageSource = readFileSync('src/pages/ProcurementStatistics.tsx', 'utf8');
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
assert.ok(!pageSource.includes('evidence.facts'));
assert.doesNotMatch(pageSource, /savings|money saved|efficiency score/i);
assert.doesNotMatch(
  pageSource,
  /total abc|total winning bid|total contract amount/i
);
assert.match(
  pageSource,
  /Actual expenditure is not currently available in the\s+published procurement dataset\./
);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(appSource, /path="\/statistics\/procurement"/);

console.log('[smoke-procurement-statistics] OK');
console.log(
  `  projects: ${first.projects.total}; evidence: ${first.evidence.total}; bid results: ${first.bidResults.total}; awarded: ${first.awardsAndContracts.awarded}; contracted: ${first.awardsAndContracts.contracted}`
);
