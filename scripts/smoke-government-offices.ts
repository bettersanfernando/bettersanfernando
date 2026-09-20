#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readNextRoute } from './smoke-next-route.ts';
import {
  getCityOffices,
  getCityOfficesMetadata,
  getParentOffice,
  type CityOffice,
} from '../src/data/civic/government.ts';

const offices = getCityOffices();
const metadata = getCityOfficesMetadata();

// 1. Data Counts & Derived Metrics
assert.equal(offices.length, 44);
assert.equal(metadata.officeCount, 44);
assert.equal(metadata.lastVerified, '2026-09-01');

function getEmails(office: CityOffice): string[] {
  return Array.from(
    new Set(
      [
        office.institutional_email,
        office.operational_email,
        ...(office.additional_emails ?? []),
      ].filter((email): email is string => Boolean(email))
    )
  );
}

const withContact = offices.filter(o =>
  Boolean(
    o.primary_phone ||
    o.institutional_email ||
    o.operational_email ||
    (o.additional_emails && o.additional_emails.length > 0) ||
    (o.emergency_hotlines && o.emergency_hotlines.length > 0)
  )
);
assert.equal(
  withContact.length,
  31,
  'expected 31 offices with public contact details'
);

const withOfficialPage = offices.filter(o => Boolean(o.official_page_url));
assert.equal(
  withOfficialPage.length,
  27,
  'expected 27 offices with official office pages'
);

const withPhone = offices.filter(o => Boolean(o.primary_phone));
assert.equal(withPhone.length, 24);

const withEmail = offices.filter(o => getEmails(o).length > 0);
assert.equal(withEmail.length, 29);

const withHotline = offices.filter(o =>
  Boolean(o.emergency_hotlines && o.emergency_hotlines.length > 0)
);
assert.equal(withHotline.length, 2);

const verifiedSubunits = offices.filter(o => Boolean(o.parent_office_id));
assert.equal(verifiedSubunits.length, 7);

const standaloneOffices = offices.filter(o => !o.parent_office_id);
assert.equal(standaloneOffices.length, 37);
assert.equal(
  verifiedSubunits.length + standaloneOffices.length,
  offices.length
);

// 2. Behavioral verification of parent links
for (const subunit of verifiedSubunits) {
  const parent = getParentOffice(subunit);
  assert.ok(
    parent,
    `subunit ${subunit.office_id} must resolve its parent office`
  );
  assert.equal(parent.office_id, subunit.parent_office_id);
}

// 3. Search coverage
const cdrrmoMatches = offices.filter(o =>
  [o.office_name, o.acronym, o.physical_address, ...(o.alternate_names ?? [])]
    .filter(Boolean)
    .some(v => v!.toLowerCase().includes('cdrrmo'))
);
assert.ok(
  cdrrmoMatches.length >= 1,
  'Search for CDRRMO must return at least 1 match'
);
assert.ok(cdrrmoMatches.some(o => o.office_id === 'cdrrmo'));

// 4. Pagination math (10 per page)
const PAGE_SIZE = 10;
const totalPages = Math.ceil(offices.length / PAGE_SIZE);
assert.equal(totalPages, 5, '44 offices at 10/page must produce 5 pages');
const page1 = offices.slice(0, 10);
const page5 = offices.slice(40, 44);
assert.equal(page1.length, 10);
assert.equal(page5.length, 4);

// 5. Page Source & Rendered Semantics
const pageSource = readNextRoute('/government/offices');

// Check that legacy styling patterns are removed
for (const legacyPattern of [
  'rounded-xl bg-primary-700',
  'shadow-[0_8px_28px',
  'rounded-full bg-primary-50 px-2.5',
  'bg-error-50 p-4 text-error-900',
]) {
  assert.ok(
    !pageSource.includes(legacyPattern),
    `page source must not include legacy pattern: ${legacyPattern}`
  );
}

// Check key section headings
for (const heading of [
  'City offices and public contact information',
  'Bounded civic directory',
  'Find an office',
  'How to read these records',
  'Explore more government information',
  'Government Overview',
  'Contact the City',
]) {
  assert.ok(
    pageSource.includes(heading),
    `page source must include heading: "${heading}"`
  );
}

// Check related resources links
for (const href of [
  '/government',
  '/government/contact',
  '/government/hotlines',
  '/government/barangay-contacts',
  '/government/links',
  '/statistics/government',
]) {
  assert.ok(
    pageSource.includes(href),
    `page must link to destination: ${href}`
  );
}

// Check presence of tel: and mailto: and office detail link patterns
assert.ok(
  pageSource.includes('tel:'),
  'page source must include telephone link support'
);
assert.ok(
  pageSource.includes('mailto:'),
  'page source must include mailto link support'
);
assert.ok(
  pageSource.includes('/government/offices/'),
  'page source must link to office detail routes'
);

console.log('[smoke-government-offices] OK');
console.log(`  total offices: ${offices.length}`);
console.log(`  with public contact: ${withContact.length}/${offices.length}`);
console.log(
  `  with official page: ${withOfficialPage.length}/${offices.length}`
);
console.log(`  verified subunits: ${verifiedSubunits.length}`);
console.log(`  pages (at 10/page): ${totalPages}`);
