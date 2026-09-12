import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getFullDisclosureMetadata,
  getFullDisclosureRecords,
} from '../src/data/civic/fullDisclosure.ts';
import { getServices } from '../src/data/civic/services.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const records = getFullDisclosureRecords();
const metadata = getFullDisclosureMetadata();

// 1. Exact 10-record count and 4/2/2/2 report-type breakdown.
assert.equal(records.length, 10, 'exactly 10 owner-approved report records');
assert.equal(metadata.recordCount, 10);
const byType = records.reduce<Record<string, number>>((counts, record) => {
  counts[record.report_type] = (counts[record.report_type] ?? 0) + 1;
  return counts;
}, {});
assert.equal(byType['Annual Procurement Plan'], 4, 'exactly 4 APPs');
assert.equal(
  byType['Procurement Monitoring Report'],
  2,
  'exactly 2 Procurement Monitoring Reports'
);
assert.equal(
  byType['Trust Fund Utilization'],
  2,
  'exactly 2 Trust Fund Utilization reports'
);
assert.equal(
  byType['Special Education Fund Utilization'],
  2,
  'exactly 2 Special Education Fund Utilization reports'
);
assert.deepEqual(
  metadata.reportTypeBreakdown,
  {
    'Annual Procurement Plan': 4,
    'Procurement Monitoring Report': 2,
    'Trust Fund Utilization': 2,
    'Special Education Fund Utilization': 2,
  },
  'the exported report_type_breakdown must match the record-level counts'
);

// 2. Expected 2023-2026 coverage.
const years = new Set(records.map(record => record.reporting_year));
assert.deepEqual(
  [...years].sort(),
  [2023, 2024, 2025, 2026],
  'coverage must span exactly 2023-2026'
);

// 3. Unique IDs.
assert.equal(
  new Set(records.map(record => record.id)).size,
  10,
  'record ids must be unique'
);

// 4. Safe HTTPS URLs, no tracking parameters or fragments.
for (const record of records) {
  for (const url of [
    record.official_page_url,
    record.official_attachment_url,
  ]) {
    if (!url) continue;
    assert.match(url, /^https:\/\//, `${record.id} must use an HTTPS URL`);
    assert.ok(
      !url.includes('?'),
      `${record.id} URL must carry no tracking query parameters: ${url}`
    );
    assert.ok(
      !url.includes('#'),
      `${record.id} URL must carry no fragment: ${url}`
    );
  }
}

// 5. No private fields, financial amounts, or internal review content.
const serializedDataset = JSON.stringify(records);
for (const forbidden of [
  'amount',
  'disbursement',
  'line_item',
  'sha256',
  'byte_size',
  'reviewer',
  'held_or_excluded',
  'AWAITING_OWNER_APPROVAL',
  'recovery-queue',
]) {
  assert.ok(
    !serializedDataset.toLowerCase().includes(forbidden.toLowerCase()),
    `private/internal or financial content leaked into the public dataset: ${forbidden}`
  );
}
for (const pattern of [/[A-Za-z]:\\/, /\/home\/|\/Users\//]) {
  assert.ok(
    !pattern.test(serializedDataset),
    `an absolute filesystem path leaked into the public dataset: ${pattern}`
  );
}

// 6. The three held records must never appear.
for (const heldTitle of [
  'APP CY2021',
  'Indicative APP CY2021',
  'PMR 2nd Semester 2020',
]) {
  assert.ok(
    !records.some(record => record.title === heldTitle),
    `held record must not be exported: ${heldTitle}`
  );
}

// 7. Coverage limitation is available to the page.
assert.match(metadata.overallPublicLimitation, /not a complete/i);
assert.equal(metadata.route, '/transparency/full-disclosure');

// 8. Existing published services must remain unchanged.
assert.equal(getServices().length, 177);

// 9. Route and navigation: real, unique, planned-page entry removed.
assert.ok(
  !plannedPages.some(page => page.path === '/transparency/full-disclosure'),
  'the planned-page entry for /transparency/full-disclosure must be removed'
);
assert.ok(
  !plannedPages.some(page => page.path === '/transparency/documents'),
  '/transparency/documents must be implemented'
);
const megaMenus = mainNavigation.filter(item => item.sections);
const navigationDestinations = megaMenus.flatMap(menu =>
  menu.sections!.flatMap(section => section.items)
);
const fullDisclosureDestinations = navigationDestinations.filter(
  item => item.href === '/transparency/full-disclosure'
);
assert.equal(
  fullDisclosureDestinations.length,
  1,
  'exactly one navigation destination for Full Disclosure Reports'
);
assert.equal(fullDisclosureDestinations[0]?.kind, 'real');
const transparencyDocumentsDestination = navigationDestinations.find(
  item => item.href === '/transparency/documents'
);
assert.equal(
  transparencyDocumentsDestination?.kind,
  'real',
  'Transparency Documents must be implemented'
);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/transparency\/full-disclosure"[\s\S]{0,80}element={<FullDisclosure \/>}/,
  '/transparency/full-disclosure must be a real <Route>'
);
assert.match(
  appSource,
  /path="\/transparency\/archive"[\s\S]{0,80}to="\/transparency\/full-disclosure"[\s\S]{0,40}replace/,
  '/transparency/archive must permanently redirect to /transparency/full-disclosure'
);

// 10. External-link safety and filter/grouping behavior on the page.
const pageSource = readFileSync('src/pages/FullDisclosure.tsx', 'utf8');
assert.match(
  pageSource,
  /target="_blank"/,
  'external links must open in a new tab'
);
assert.match(
  pageSource,
  /rel="noopener noreferrer"/,
  'external links must carry rel="noopener noreferrer"'
);
assert.match(
  pageSource,
  /aria-label=\{`Open the official/,
  'external links must carry an accessible label stating their destination and that they open in a new tab'
);
assert.match(
  pageSource,
  /useMemo|useState/,
  'the page must support local filtering'
);
assert.match(
  pageSource,
  /reporting_year/,
  'the page must group by reporting year'
);
assert.match(
  pageSource,
  /\(a, b\) => b - a/,
  'years must be sorted newest first'
);
assert.match(
  pageSource,
  /overallPublicLimitation/,
  'the page must display the coverage limitation'
);
for (const forbidden of [
  'amount',
  'disbursement',
  'pagination',
  'Pagination',
]) {
  assert.ok(
    !pageSource.includes(forbidden),
    `${forbidden} must not appear on the page`
  );
}

console.log('[smoke-full-disclosure] OK');
console.log(
  `  records: ${records.length}; APP: ${byType['Annual Procurement Plan']}; PMR: ${byType['Procurement Monitoring Report']}; Trust Fund: ${byType['Trust Fund Utilization']}; SEF: ${byType['Special Education Fund Utilization']}; years: ${[...years].sort().join(', ')}`
);
