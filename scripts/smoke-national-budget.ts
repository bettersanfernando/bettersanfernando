import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getNationalBudgetMetadata,
  getNationalBudgetRecords,
} from '../src/data/civic/nationalBudget.ts';
import { getProjects } from '../src/data/civic/projects.ts';
import { mainNavigation } from '../src/data/navigation.ts';

const records = getNationalBudgetRecords();
const metadata = getNationalBudgetMetadata();

const EXPECTED_IDS = [
  'house-reading:7757',
  'house-reading:12396',
  'house-reading:12422',
  'house-reading:8004',
  'house-reading:7959',
  'house-reading:16225',
];
const HELD_IDS = ['house-reading:12536', 'pair:nep-nia-p29-y606:ib:p939:r13'];

// 1. Exactly the six verified rows; held rows never published.
assert.equal(records.length, 6, 'exactly 6 public records');
assert.equal(metadata.recordCount, 6);
assert.equal(new Set(records.map(r => r.id)).size, 6, 'unique ids');
assert.deepEqual(
  records.map(r => r.bettergov_record_id).sort(),
  [...EXPECTED_IDS].sort()
);
for (const held of HELD_IDS) {
  assert.ok(
    !records.some(r => r.bettergov_record_id === held),
    `${held} must stay unpublished`
  );
}

// 2. Amounts: versions stay separate.
const withNep = records.filter(r => r.nep_amount_php !== null);
assert.equal(withNep.length, 2, 'NEP exists on exactly 2 rows');
assert.equal(
  withNep.reduce((sum, r) => sum + (r.nep_amount_php ?? 0), 0),
  67_000_000
);
assert.equal(
  records.reduce((sum, r) => sum + (r.house_amount_php ?? 0), 0),
  316_246_000
);

// 3. Status counts and per-status explanatory amounts.
const count = (status: string) =>
  records.filter(r => r.comparison_status === status).length;
assert.equal(count('SAME_AMOUNT_IN_BOTH'), 2);
assert.equal(count('HOUSE_BILL_ONLY_CANDIDATE'), 4);
assert.deepEqual(metadata.statusSummaries.SAME_AMOUNT_IN_BOTH, {
  count: 2,
  nepAmountPhp: 67_000_000,
  houseAmountPhp: 67_000_000,
});
assert.deepEqual(metadata.statusSummaries.HOUSE_BILL_ONLY_CANDIDATE, {
  count: 4,
  nepAmountPhp: 0,
  houseAmountPhp: 249_246_000,
});

// 4. Provenance: House page always present; NEP source iff NEP amount.
for (const record of records) {
  assert.ok(
    record.house_source && record.house_source.page > 0,
    `${record.id} has a House page`
  );
  assert.ok(record.house_source.url.startsWith('https://'));
  assert.equal(
    record.nep_amount_php === null,
    record.nep_source === null,
    `${record.id}: NEP amount and NEP source are both present or both null`
  );
  assert.ok(record.location_evidence.length > 0);
}

// 5. No private/checksum fields anywhere in the public export.
const raw = readFileSync(
  new URL(
    '../src/data/generated/civic/transparency/national-budget-fy2027.json',
    import.meta.url
  ),
  'utf8'
);
assert.ok(!/sha256|checksum|confidence|reviewer|match_/i.test(raw));

// 6. Separation from local projects: no proj- linkage, no combined totals.
assert.ok(!/proj-/.test(raw), 'no local project linkage');
assert.equal(getProjects().length, 303, 'local project count unchanged');
for (const key of Object.keys(metadata)) {
  assert.ok(
    !/total|combined|difference|delta|increase/i.test(key),
    `metadata key ${key} must not imply cross-version arithmetic`
  );
}

// 7. Page source never computes cross-version arithmetic.
const view = readFileSync(
  new URL(
    '../src/app/[locale]/transparency/2027-budget/NationalBudget.tsx',
    import.meta.url
  ),
  'utf8'
);
assert.ok(
  !/nep\w*\s*[-+]\s*\w*house|house\w*\s*[-+]\s*\w*nep/i.test(view),
  'view must not add or subtract NEP and House amounts'
);

// 8. Navigation: permanent item directly after City Finances, no badge.
const transparency = mainNavigation.find(item => item.id === 'transparency');
const items = transparency?.sections?.[0]?.items ?? [];
const hrefs = items.map(item => item.href);
assert.equal(
  hrefs.indexOf('/transparency/2027-budget'),
  hrefs.indexOf('/transparency/finance') + 1,
  '2027 budget sits directly after City Finances'
);

console.log(
  'National budget smoke passed: 6 verified records, held rows absent, no cross-version totals, 303 local projects unchanged.'
);
