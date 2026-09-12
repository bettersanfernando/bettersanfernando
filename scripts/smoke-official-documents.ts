#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getOfficialDocuments,
  getOfficialDocumentsMetadata,
} from '../src/data/civic/officialDocuments.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const records = getOfficialDocuments();
const metadata = getOfficialDocumentsMetadata();
const expected = [
  [
    'official-document-charter-2026-2e',
    "City Government of San Fernando, Pampanga Citizen's Charter 2026, 2nd Edition",
  ],
  [
    'official-document-charter-2026-1e',
    "City Government of San Fernando, Pampanga Citizen's Charter 2026, 1st Edition",
  ],
  [
    'official-document-charter-2025-2e',
    "City Government of San Fernando, Pampanga Citizen's Charter 2025, 2nd Edition",
  ],
  ['official-document-blpd-application-r05', 'Application Form for Business'],
  ['official-document-blpd-renewal-r02', 'Business Permit Renewal Form'],
  ['official-document-blpd-request-form', 'Request Form'],
  [
    'official-document-privacy-manual-2024',
    'The City Government of San Fernando, Pampanga Privacy Manual',
  ],
  ['official-document-privacy-policy', 'Privacy Policy'],
  ['official-document-data-privacy-notice', 'Data Privacy Notice'],
] as const;

assert.equal(records.length, 9);
assert.equal(metadata.recordCount, 9);
assert.deepEqual(
  records.map(record => [record.id, record.title]),
  expected
);
assert.equal(records.filter(record => record.status === 'CURRENT').length, 7);
assert.equal(
  records.filter(record => record.status === 'SUPERSEDED').length,
  2
);
assert.equal(new Set(records.map(record => record.id)).size, 9);
assert.equal(new Set(records.map(record => record.slug)).size, 9);
assert.deepEqual(
  Object.fromEntries(
    Object.entries(metadata.documentTypeBreakdown).sort(([a], [b]) =>
      a.localeCompare(b)
    )
  ),
  {
    BUSINESS_FORM: 3,
    CITIZENS_CHARTER: 3,
    PRIVACY_MANUAL: 1,
    PRIVACY_NOTICE: 1,
    PRIVACY_POLICY: 1,
  }
);

const currentCharter = records.find(
  record =>
    record.document_type === 'CITIZENS_CHARTER' && record.status === 'CURRENT'
);
assert.equal(currentCharter?.id, 'official-document-charter-2026-2e');
assert.equal(currentCharter?.edition, '2nd Edition');
assert.ok(
  records
    .filter(
      record =>
        record.document_type === 'CITIZENS_CHARTER' &&
        record.id !== currentCharter?.id
    )
    .every(record => record.status === 'SUPERSEDED')
);

for (const record of records) {
  assert.ok(record.title && record.document_type && record.issuing_office);
  assert.ok(
    record.source_collection && (record.edition || record.revision || true)
  );
  for (const url of [
    record.official_page_url,
    record.official_attachment_url,
  ].filter(Boolean)) {
    assert.match(url!, /^https:\/\//);
    assert.doesNotMatch(url!, /[?#]|utm_|fbclid|gclid/i);
  }
}
assert.equal(
  records.find(record => record.id === 'official-document-blpd-request-form')
    ?.document_date,
  null
);
assert.equal(
  records.find(record => record.id === 'official-document-privacy-policy')
    ?.publication_date,
  null
);
assert.equal(
  records.find(record => record.id === 'official-document-data-privacy-notice')
    ?.document_date,
  null
);

const serialized = JSON.stringify(records);
for (const forbidden of [
  'source_sha256',
  'sha256',
  'local_path',
  'file_size',
  'reviewer',
  'review_notes',
  'inventory_disposition',
  'reconciliation',
  'applicant',
  'employee',
  'personnel',
  'Acknowledgement Receipt for Bulk Transaction',
  'Corrective Maintenance Request Form',
  'Final AIP 2025',
  'Final AIP 2026',
  'Corrective Maintenance',
])
  assert.ok(
    !serialized.includes(forbidden),
    `${forbidden} must remain unpublished`
  );

const pageSource = readFileSync('src/pages/OfficialDocuments.tsx', 'utf8');
assert.match(pageSource, /overallPublicLimitation/);
assert.match(pageSource, /target="_blank"/);
assert.match(pageSource, /rel="noopener noreferrer"/);
assert.match(pageSource, /opens in a new tab/);
assert.match(
  pageSource,
  /Showing \{filtered\.length\} of \{metadata\.recordCount\}/
);
assert.doesNotMatch(pageSource, /pagination/i);
for (const route of [
  '/legislation',
  '/transparency/full-disclosure',
  '/procurement',
  '/projects',
  '/services',
]) {
  assert.ok(
    pageSource.includes(`href: '${route}'`),
    `${route} must be linked from the related-record hub`
  );
}

const documentsDestinations = mainNavigation
  .flatMap(item => item.sections?.flatMap(section => section.items) ?? [])
  .filter(item => item.href === '/transparency/documents');
assert.equal(documentsDestinations.length, 1);
assert.equal(documentsDestinations[0]?.kind, 'real');
assert.ok(!plannedPages.some(page => page.path === '/transparency/documents'));

const english = JSON.parse(
  readFileSync('public/locales/en/common.json', 'utf8')
);
assert.equal(english.plannedPages?.pages?.transparencyDocuments, undefined);
assert.equal(english.navigation.items.officialDocuments, 'Official Documents');

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/transparency\/documents"[\s\S]{0,80}element={<OfficialDocuments \/>}/
);
assert.match(
  appSource,
  /path="\/government\/documents"[\s\S]{0,80}to="\/transparency\/documents"[\s\S]{0,40}replace/
);

console.log('[smoke-official-documents] OK');
console.log('  records: 9; current: 7; superseded: 2; groups: 3');
