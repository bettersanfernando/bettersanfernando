#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

assert.equal(allEvidence.length, 334);
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

const pageSource = readFileSync('src/pages/BidResults.tsx', 'utf8');
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
assert.match(pageSource, /Winning bid amount/);
assert.match(pageSource, /slice\(0, visibleCount\)/);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(appSource, /path="\/procurement\/bid-results"/);

console.log('[smoke-bid-results] OK');
console.log(
  `  bid results: ${summary.totalRecords}; projects: ${summary.projectsRepresented}; ABC: ${summary.withApprovedBudget}; winning bids: ${summary.withWinningBid}; bidders: ${summary.withWinningBidder}; attachments: ${summary.withAttachment}`
);
