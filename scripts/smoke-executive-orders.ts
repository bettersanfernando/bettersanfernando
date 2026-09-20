#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readNextRoute } from './smoke-next-route.ts';
import {
  getExecutiveOrders,
  getExecutiveOrdersMetadata,
  getLegislationTitle,
  hasLegislationFullText,
} from '../src/data/civic/legislation.ts';

const orders = getExecutiveOrders();
const metadata = getExecutiveOrdersMetadata();

// 1. Data Counts & Derived Metrics
assert.equal(orders.length, 13, 'expected 13 verified Executive Order records');
assert.equal(metadata.recordCount, 13);
assert.equal(metadata.lastVerified, '2026-09-12');
assert.ok(
  metadata.sourceArchiveUrl.startsWith('https://cityofsanfernando.gov.ph'),
  'valid source archive URL'
);

const fullTextRecords = orders.filter(
  o => o.full_text_available && Boolean(o.official_pdf_url)
);
assert.equal(
  fullTextRecords.length,
  11,
  'expected 11 records with official full text'
);

const subjectVerifiedRecords = orders.filter(
  o => o.verification_level === 'SUBJECT_VERIFIED'
);
assert.equal(
  subjectVerifiedRecords.length,
  2,
  'expected 2 subject-verified records'
);

// 2. Identification and Integrity
assert.equal(
  new Set(orders.map(o => o.id)).size,
  13,
  'every order id must be unique'
);
assert.equal(
  new Set(orders.map(o => o.document_number)).size,
  13,
  'every document number must be unique'
);

// 3. Complete records vs. Subject-verified records
for (const completeOrder of fullTextRecords) {
  const formalTitle = getLegislationTitle(completeOrder);
  assert.ok(
    formalTitle,
    `complete order ${completeOrder.document_number} must have a formal title`
  );
  assert.equal(
    hasLegislationFullText(completeOrder),
    true,
    `${completeOrder.document_number} must report full text availability`
  );
  assert.ok(
    completeOrder.official_pdf_url,
    `${completeOrder.document_number} must have an official PDF URL`
  );
  assert.ok(
    completeOrder.official_page_url,
    `${completeOrder.document_number} must have an official page URL`
  );
}

for (const subjectOrder of subjectVerifiedRecords) {
  const formalTitle = getLegislationTitle(subjectOrder);
  assert.equal(
    formalTitle,
    null,
    `subject-verified order ${subjectOrder.document_number} must have no formal title`
  );
  assert.ok(
    subjectOrder.subject,
    `subject-verified order ${subjectOrder.document_number} must carry a descriptive subject`
  );
  assert.ok(
    subjectOrder.reference_url,
    `subject-verified order ${subjectOrder.document_number} must have an official reference URL`
  );
  assert.equal(
    subjectOrder.full_text_available,
    false,
    'subject-verified order must not claim full text availability'
  );
}

// 4. Year-only date precision verification
const yearOnlyOrder = orders.find(o => o.date_precision === 'year');
assert.ok(
  yearOnlyOrder,
  'expected at least one record with year-only precision'
);
assert.equal(
  yearOnlyOrder?.date_issued,
  null,
  'year-only precision record must not fabricate an exact date'
);
assert.equal(yearOnlyOrder?.year, 2023);

// 5. Functional Search, Filtering, and Sorting logic
function matchesQuery(order: (typeof orders)[number], query: string): boolean {
  const normalizedQuery = query.toLowerCase();
  return [
    order.document_number,
    order.title,
    order.official_title,
    order.subject,
    order.issuer_name,
    order.issuer_title,
    order.issuing_body,
  ].some(value => value?.toLowerCase().includes(normalizedQuery));
}

// Search by document number
const searchByDoc = orders.filter(o => matchesQuery(o, 'CMO2013-027'));
assert.equal(searchByDoc.length, 1);

// Search by subject
const searchBySubject = orders.filter(o => matchesQuery(o, 'bottled water'));
assert.equal(searchBySubject.length, 1);
assert.equal(searchBySubject[0].document_number, 'CMO2023-026');

// Search by issuer
const searchByIssuer = orders.filter(o => matchesQuery(o, 'Santiago'));
assert.equal(searchByIssuer.length, 11);

// Year filtering
const orders2023 = orders.filter(o => o.year === 2023);
assert.equal(orders2023.length, 2);
const orders2013 = orders.filter(o => o.year === 2013);
assert.equal(orders2013.length, 11);

// Status filtering
const fullOfficial = orders.filter(
  o => o.verification_level !== 'SUBJECT_VERIFIED'
);
assert.equal(fullOfficial.length, 11);
const subjectOnly = orders.filter(
  o => o.verification_level === 'SUBJECT_VERIFIED'
);
assert.equal(subjectOnly.length, 2);

// Document availability filtering
const withPdf = orders.filter(
  o => o.full_text_available && Boolean(o.official_pdf_url)
);
assert.equal(withPdf.length, 11);
const withoutPdf = orders.filter(
  o => !o.full_text_available || !o.official_pdf_url
);
assert.equal(withoutPdf.length, 2);

// Pagination math: 13 records at 10/page produces 2 pages
const PAGE_SIZE = 10;
const totalPages = Math.ceil(orders.length / PAGE_SIZE);
assert.equal(totalPages, 2, '13 orders at 10/page must produce 2 pages');
assert.equal(orders.slice(0, 10).length, 10, 'page 1 must contain 10 orders');
assert.equal(orders.slice(10, 13).length, 3, 'page 2 must contain 3 orders');

// 6. Page Source and Rendered Semantics
const pageSource = readNextRoute('/legislation/executive-orders');

// State hooks and pagination
assert.match(
  pageSource,
  /useQueryState/,
  'page must support URL-backed query state'
);
assert.match(pageSource, /PAGE_SIZE = 10/, 'page must use 10 records per page');
assert.match(
  pageSource,
  /setPage\(1\)/,
  'filter/sort changes must reset pagination to page 1'
);

// Date precision handling
assert.match(
  pageSource,
  /Exact issue date not recovered/,
  'year-only precision records must explicitly display fallback text rather than artificial dates'
);

// Clarification for subject-verified records
assert.match(
  pageSource,
  /Formal title and full text have not been recovered/,
  'subject-verified records must include quiet clarification'
);
assert.match(
  pageSource,
  /Verified subject/,
  'subject-verified records must display a dedicated subject label'
);

// External links
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

// Check that legacy styling patterns are removed
for (const legacyPattern of [
  'Coverage of this collection',
  'rounded-xl border border-primary-200 bg-primary-50',
  'Source and document availability',
]) {
  assert.ok(
    !pageSource.includes(legacyPattern),
    `page source must not include legacy pattern: ${legacyPattern}`
  );
}

// Related navigation routes
for (const route of [
  '/legislation',
  '/legislation/ordinances',
  '/legislation/resolutions',
  '/government/links',
]) {
  assert.ok(
    pageSource.includes(route),
    `page must link to related route: ${route}`
  );
}

console.log('[smoke-executive-orders] OK');
console.log(
  `  orders: ${orders.length}; full text: ${fullTextRecords.length}; subject-verified: ${subjectVerifiedRecords.length}`
);
