import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getBarangayContactGroups,
  getBarangayContactsMetadata,
} from '../src/data/civic/governmentBarangayContacts.ts';
import { getGovernmentHotlines } from '../src/data/civic/governmentHotlines.ts';
import { getServices } from '../src/data/civic/services.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const groups = getBarangayContactGroups();
const metadata = getBarangayContactsMetadata();
const allContacts = groups.flatMap(group => group.contacts);

// 1. Exact counts.
assert.equal(groups.length, 35, 'exactly 35 barangays');
assert.equal(metadata.barangayCount, 35);
assert.equal(
  allContacts.filter(c => c.contact_type === 'BARANGAY_SECRETARY').length,
  35,
  'exactly 35 Barangay Secretary records'
);
assert.equal(
  allContacts.filter(c => c.contact_type === 'BHERT_MEMBER').length,
  289,
  'exactly 289 BHERT records'
);
assert.equal(allContacts.length, 324, 'exactly 324 total contact records');
assert.equal(metadata.recordCount, 324);

// 2. Unique record IDs.
assert.equal(
  new Set(allContacts.map(c => c.id)).size,
  324,
  'every contact id must be unique'
);

// 3. Every contact links to a valid barangay; all 35 barangays represented.
const barangayPsgcs = new Set(groups.map(g => g.barangayPsgc));
assert.equal(barangayPsgcs.size, 35);
for (const contact of allContacts) {
  assert.ok(
    barangayPsgcs.has(contact.barangay_psgc),
    `contact ${contact.id} references an unknown barangay: ${contact.barangay_psgc}`
  );
}
for (const group of groups) {
  assert.ok(
    group.contacts.every(c => c.barangay_psgc === group.barangayPsgc),
    `all contacts in ${group.barangayName} must reference that barangay`
  );
}

// 4. Secretary appears before BHERT contacts within each barangay group.
for (const group of groups) {
  const secretaryIndex = group.contacts.findIndex(
    c => c.contact_type === 'BARANGAY_SECRETARY'
  );
  const firstBhertIndex = group.contacts.findIndex(
    c => c.contact_type === 'BHERT_MEMBER'
  );
  assert.ok(
    secretaryIndex !== -1,
    `${group.barangayName} must have a Barangay Secretary record`
  );
  if (firstBhertIndex !== -1) {
    assert.ok(
      secretaryIndex < firstBhertIndex,
      `${group.barangayName}'s Secretary must be listed before its BHERT contacts`
    );
  }
}

// 5. Missing-data handling: preserved, not invented or silently dropped.
const noNumberContacts = allContacts.filter(
  c => c.contact_numbers.length === 0
);
assert.equal(
  noNumberContacts.length,
  2,
  'exactly 2 BHERT records with no printed number'
);
const noNameContacts = allContacts.filter(c => c.name === null);
assert.equal(
  noNameContacts.length,
  12,
  'exactly 12 BHERT records with no printed name'
);
const nonStandardNumbers = allContacts.filter(c =>
  c.contact_numbers.some(n => n.status === 'invalid_length')
);
assert.equal(
  nonStandardNumbers.length,
  5,
  'exactly 5 BHERT numbers with non-standard digit counts'
);
const landlineNumbers = allContacts.filter(c =>
  c.contact_numbers.some(n => n.status === 'non_mobile_published')
);
assert.equal(landlineNumbers.length, 2, 'exactly 2 published landline entries');

// 6. Non-standard numbers must remain exactly as published (their non-standard
// digit count preserved), never silently "corrected" to a standard 11-digit form.
for (const contact of nonStandardNumbers) {
  for (const entry of contact.contact_numbers.filter(
    n => n.status === 'invalid_length'
  )) {
    const digitCount = entry.number.replace(/\D/g, '').length;
    assert.notEqual(
      digitCount,
      11,
      `non-standard number for ${contact.id} was normalized to a standard 11-digit mobile length instead of preserved as published`
    );
  }
}

// 7. No unsupported 24/7 claims anywhere in the dataset.
const serializedDataset = JSON.stringify(allContacts);
assert.ok(
  !/24\/7/.test(serializedDataset),
  'barangay contacts must never carry a 24/7 availability claim'
);

// 8. Public limitation and source attribution present.
assert.match(
  metadata.overallPublicLimitation,
  /not independently call-tested/i
);
assert.match(metadata.overallPublicLimitation, /24\/7/i);
assert.match(metadata.overallPublicLimitation, /government\/hotlines/i);
for (const contact of allContacts) {
  assert.ok(contact.source?.url, `${contact.id} must carry source attribution`);
  assert.ok(
    contact.source?.publisher,
    `${contact.id} must carry a source publisher`
  );
}
assert.equal(metadata.route, '/government/barangay-contacts');

// 9. No internal/private fields or paths leak into the public dataset.
for (const forbidden of [
  'data/',
  'scripts/',
  'exports/',
  'src/',
  'hotlines-publication-review',
  'held_or_excluded',
  'conflicting_assignments',
  'superseded_evidence',
]) {
  assert.ok(
    !serializedDataset.includes(forbidden),
    `private/internal content leaked into the public dataset: ${forbidden}`
  );
}
assert.ok(
  !/[A-Za-z]:\\|\/home\/|\/Users\//.test(serializedDataset),
  'no absolute filesystem path may appear in the public dataset'
);

// 10. Route and navigation: a real route, not a planned one.
assert.ok(
  !plannedPages.some(page => page.path === '/government/barangay-contacts'),
  '/government/barangay-contacts must not be registered as a planned page'
);
const megaMenus = mainNavigation.filter(item => item.sections);
const barangayContactsDestination = megaMenus
  .flatMap(menu => menu.sections!.flatMap(section => section.items))
  .find(item => item.href === '/government/barangay-contacts');
assert.ok(
  barangayContactsDestination,
  'navigation must include a Barangay Contacts destination'
);
assert.equal(barangayContactsDestination?.kind, 'real');

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/government\/barangay-contacts"[\s\S]{0,80}element={<GovernmentBarangayContacts \/>}/,
  '/government/barangay-contacts must be a real <Route>'
);

// 11. The page renders search/filter, fallback text, and no call links for
// missing numbers, without hardcoding hidden dataset internals.
const pageSource = readFileSync(
  'src/pages/GovernmentBarangayContacts.tsx',
  'utf8'
);
assert.match(
  pageSource,
  /useQueryState/,
  'the page must support query-driven search/filtering'
);
assert.match(
  pageSource,
  /Name not published in the official source/,
  'the page must render a safe fallback for missing names'
);
assert.match(
  pageSource,
  /No contact number published in the official source/,
  'the page must render a safe fallback for missing numbers'
);
assert.match(
  pageSource,
  /contact_numbers\.length === 0/,
  'the page must explicitly branch on the no-number case rather than rendering an empty/broken call link'
);
assert.match(
  pageSource,
  /status !== 'invalid_length'/,
  'the page must withhold a call action for non-standard-length numbers'
);
assert.match(
  pageSource,
  /government\/hotlines/,
  'the page must link to Government Hotlines for citywide emergencies'
);

// 12. Held BFP/obsolete CDRRMO numbers must not have been introduced here.
for (const forbidden of [
  '961-2313',
  '961-2331',
  '0917-547-5243',
  '0999-882-7763',
]) {
  assert.ok(
    !serializedDataset.includes(forbidden),
    `a previously-held citywide hotline number must not appear in the barangay directory: ${forbidden}`
  );
}

// 13. Existing Government Hotlines and Services datasets remain unchanged.
assert.equal(
  getGovernmentHotlines().length,
  11,
  'Government Hotlines must remain exactly 11 contacts'
);
assert.equal(
  getServices().length,
  177,
  'existing services must remain unchanged (137 plus 15 Civil Registry plus 2 Senior Citizens plus 1 Infrastructure & Public Works plus 2 Housing & Land Use plus 9 Utilities & Water plus 8 City Assessor plus 3 City Treasurer records)'
);

console.log('[smoke-government-barangay-contacts] OK');
console.log(
  `  barangays: ${groups.length}; secretaries: 35; BHERT: 289; total: ${allContacts.length}`
);
