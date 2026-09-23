#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readNextRoute } from './smoke-next-route.ts';
import { getProcurementStatistics } from '../src/data/civic/procurementStatistics.ts';

const first = getProcurementStatistics();
const second = getProcurementStatistics();

assert.deepEqual(first, second, 'procurement statistics must be deterministic');
assert.equal(first.projects.total, 306);
assert.equal(first.evidence.total, 570);
assert.deepEqual(first.projects.lifecycle, [
  { key: 'PLANNED', count: 2, denominator: 306, percentage: 0.7 },
  { key: 'PROCUREMENT', count: 3, denominator: 306, percentage: 1 },
  { key: 'AWARDED', count: 228, denominator: 306, percentage: 74.5 },
  { key: 'CONTRACTED', count: 6, denominator: 306, percentage: 2 },
  {
    key: 'IMPLEMENTATION_REPORTED',
    count: 67,
    denominator: 306,
    percentage: 21.9,
  },
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
    approvedBudgetAbc: 237,
    winningBidAmount: 232,
    contractAmount: 10,
    contractNumber: 8,
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
assert.equal(first.awardsAndContracts.withContractAmount, 10);
assert.equal(first.awardsAndContracts.withContractNumber, 8);

const pageSource = readNextRoute('/statistics/procurement');
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
  /Actual expenditure is not currently available in the\s+published\s+procurement dataset\./
);
assert.match(pageSource, /PROCUREMENT STATISTICS/);
assert.match(pageSource, /Published procurement evidence and coverage/);
assert.match(pageSource, /Two distinct denominators are used/);
assert.match(pageSource, /Current documentary status distribution/);
assert.match(pageSource, /What procurement fields are available\?/);
assert.match(pageSource, /Bid-result evidence completeness and timeline/);
assert.match(pageSource, /Award and contract evidence remain distinct/);
assert.match(pageSource, /How to interpret these statistics/);
assert.match(pageSource, /Explore procurement records and evidence/);

console.log('[smoke-procurement-statistics] OK');
console.log(
  `  projects: ${first.projects.total}; evidence: ${first.evidence.total}; bid results: ${first.bidResults.total}; awarded: ${first.awardsAndContracts.awarded}; contracted: ${first.awardsAndContracts.contracted}`
);
