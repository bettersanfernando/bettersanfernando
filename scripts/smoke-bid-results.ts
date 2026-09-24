#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readNextRoute } from './smoke-next-route.ts';
import { getAllProjectEvidence } from '../src/data/civic/projects.ts';
import {
  BID_RESULT_SORTS,
  filterAndSortBidResults,
  getBidResultEvidence,
  getBidResultsSummary,
} from '../src/data/civic/bidResults.ts';

const allEvidence = getAllProjectEvidence();
const records = getBidResultEvidence();
const summary = getBidResultsSummary(records);

assert.equal(allEvidence.length, 602);
assert.equal(records.length, 233);
assert.equal(summary.totalRecords, records.length);
assert.equal(summary.projectsRepresented, 233);
assert.equal(summary.withApprovedBudget, 225);
assert.equal(summary.withWinningBid, 233);
assert.equal(summary.withWinningBidder, 233);
assert.equal(summary.withAttachment, 233);
assert.ok(records.every(record => record.evidence.stage === 'BID_RESULTS'));
assert.ok(
  records.every(record => record.project.id === record.evidence.project_id)
);
assert.equal(
  new Set(records.map(record => record.evidence.id)).size,
  records.length
);

for (const record of records) {
  assert.notEqual(record.project.id, record.evidence.id);
  assert.ok(record.facts.winningBidAmount !== null);
  assert.ok(record.facts.winningBidder);
  assert.notEqual(
    'approvedBudgetAbc',
    'winningBidAmount',
    'ABC and winning bid must remain separate fields'
  );
}

const missingAbc = records.filter(
  record => record.facts.approvedBudgetAbc === null
);
assert.equal(missingAbc.length, 8);
assert.ok(missingAbc.every(record => record.facts.approvedBudgetAbc !== 0));

for (const sort of BID_RESULT_SORTS) {
  const first = filterAndSortBidResults(records, { sort }).map(
    record => record.evidence.id
  );
  const second = filterAndSortBidResults(records, { sort }).map(
    record => record.evidence.id
  );
  assert.deepEqual(first, second, `${sort} sorting must be deterministic`);
}

assert.equal(
  filterAndSortBidResults(records, { query: records[0].project.id }).length,
  1
);
assert.equal(
  filterAndSortBidResults(records, { attachment: 'available' }).length,
  records.length
);

assert.equal(
  filterAndSortBidResults(records, { approvedBudget: 'available' }).length,
  225
);
assert.equal(
  filterAndSortBidResults(records, { approvedBudget: 'unavailable' }).length,
  8
);
const sampleBarangay = records.find(r => r.project.barangay)?.project.barangay;
if (sampleBarangay) {
  const filteredBarangay = filterAndSortBidResults(records, {
    barangay: sampleBarangay,
  });
  assert.ok(filteredBarangay.length > 0);
  assert.ok(filteredBarangay.every(r => r.project.barangay === sampleBarangay));
}

const pageSource = readNextRoute('/procurement/bid-results');
for (const privateField of [
  'source_sha256',
  'retrieval_status',
  'excel_row',
  'column_swap_suspected',
  'research_queue',
  'archive_path',
]) {
  assert.ok(
    !pageSource.includes(privateField),
    `${privateField} must not be surfaced by the page`
  );
}
assert.ok(!pageSource.includes('evidence.facts'));
assert.match(pageSource, /Approved Budget for the Contract \(ABC\)/);
assert.match(pageSource, /Winning bid/);
assert.match(pageSource, /Published bid-result evidence/);
assert.match(pageSource, /Bid-result records by document year/);
assert.match(pageSource, /How winning bids compare with ABC/);
assert.match(pageSource, /PAGE_SIZE = 10/);
assert.match(pageSource, /getPageWindow/);
assert.match(
  pageSource,
  /does\s+not\s+represent\s+actual\s+expenditure\s+or\s+project\s+savings/
);
assert.ok(
  !pageSource.match(/\b(total|estimated|projected|generated)\s+savings\b/i),
  'Must not claim or label differences as savings'
);
assert.ok(
  !pageSource.toLowerCase().includes('underspending'),
  'Must not label ABC differences as underspending'
);

console.log('[smoke-bid-results] OK');
console.log(
  `  bid results: ${summary.totalRecords}; projects: ${summary.projectsRepresented}; ABC: ${summary.withApprovedBudget}; winning bids: ${summary.withWinningBid}; bidders: ${summary.withWinningBidder}; attachments: ${summary.withAttachment}`
);
