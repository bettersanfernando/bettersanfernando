import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  filterAndSortGovernmentContacts,
  getGovernmentContactRecords,
  getGovernmentContactSummary,
} from '../src/data/civic/governmentContacts.ts';
import {
  getCityOfficeById,
  getCityOffices,
} from '../src/data/civic/government.ts';
import {
  getGovernmentHotlines,
  type HotlineContact,
} from '../src/data/civic/governmentHotlines.ts';
import { mainNavigation } from '../src/data/navigation.ts';

// 1. Data-layer regression: the underlying government contacts projection is
// unchanged even though the page no longer renders it as a full directory.
const contacts = getGovernmentContactRecords();
const offices = getCityOffices();
const summary = getGovernmentContactSummary();

assert.equal(contacts.length, offices.length);
assert.equal(summary.total, contacts.length);
assert.equal(summary.withPhone, contacts.filter(record => record.phone).length);
assert.equal(
  summary.withEmail,
  contacts.filter(record => record.emails.length).length
);
assert.equal(
  summary.withBoth,
  contacts.filter(record => record.phone && record.emails.length).length
);
assert.equal(
  summary.withAddress,
  contacts.filter(record => record.address).length
);

for (const contact of contacts) {
  const office = getCityOfficeById(contact.officeId);
  assert.ok(
    office,
    `${contact.officeId} must resolve to a public office record`
  );
  assert.equal(contact.officeName, office.office_name);
  assert.equal(contact.phone, office.primary_phone ?? null);
  assert.equal(contact.address, office.physical_address ?? null);
  assert.ok(contact.sourceUrls.length > 0);
  contact.sourceUrls.forEach(url => assert.doesNotThrow(() => new URL(url)));

  assert.deepEqual(
    Object.keys(contact).sort(),
    [
      'acronym',
      'address',
      'emails',
      'lastVerifiedAt',
      'officeId',
      'officeName',
      'phone',
      'phoneExtensions',
      'sourceUrls',
    ].sort(),
    'the contact projection must remain institutional and frontend-safe'
  );
}

const all = filterAndSortGovernmentContacts(contacts, {
  query: '',
  availability: 'all',
  sort: 'name-asc',
});
assert.equal(all.length, contacts.length);

// 2. Emergency contacts are resolved from stable dataset IDs, not
// hardcoded numbers, and their required fields exist in the reviewed export.
const hotlines = getGovernmentHotlines();
const hotlineById = new Map(hotlines.map(contact => [contact.id, contact]));

const expectedEmergencyContacts: Record<
  string,
  { organizationMatch: RegExp; number: string }
> = {
  'national-911': {
    organizationMatch: /National Emergency Hotline/,
    number: '911',
  },
  'cdrrmo-command-center-help-line': {
    organizationMatch: /City Disaster Risk Reduction and Management Office/,
    number: '961-4357',
  },
  'san-fernando-police-station-primary-hotline': {
    organizationMatch: /City of San Fernando Police Station/,
    number: '0998-598-5465',
  },
  'san-fernando-fire-station-hotline': {
    organizationMatch: /Bureau of Fire Protection/,
    number: '0923-235-9725',
  },
};

for (const [id, expected] of Object.entries(expectedEmergencyContacts)) {
  const contact = hotlineById.get(id);
  assert.ok(contact, `required emergency contact must exist in dataset: ${id}`);
  assert.match(contact.organization, expected.organizationMatch);
  assert.equal(contact.number, expected.number);
}
assert.equal(
  hotlineById.get('san-fernando-police-station-primary-hotline')
    ?.alternate_official_label,
  'City of San Fernando Police Headquarters',
  'the police primary contact must carry its Police Headquarters alternate label'
);

// 3. No unsupported 24/7 claims: only the CDRRMO primary emergency-dispatch
// contact among the four selected carries a positive scoped 24/7 claim.
function isPositiveTwentyFourSeven(contact: HotlineContact) {
  return /^24\/7\b/.test(contact.operating_scope);
}
const requiredIds = Object.keys(expectedEmergencyContacts);
const positiveTwentyFourSeven = requiredIds.filter(id =>
  isPositiveTwentyFourSeven(hotlineById.get(id)!)
);
assert.deepEqual(
  positiveTwentyFourSeven,
  ['cdrrmo-command-center-help-line'],
  'only the CDRRMO primary emergency-dispatch contact may carry a positive 24/7 claim among the selected emergency contacts'
);

// 4. General government contacts resolve to verified City Hall and Heroes
// Hall office records with their exact published number.
const cityHallOffice = getCityOfficeById('city-government-main');
const heroesHallOffice = getCityOfficeById('city-mayors-office');
assert.ok(cityHallOffice, 'City Hall general office record must exist');
assert.ok(heroesHallOffice, 'Heroes Hall general office record must exist');
assert.equal(cityHallOffice?.physical_address, 'City Hall, Brgy. Sto. Rosario');
assert.equal(cityHallOffice?.primary_phone, '(045) 649-8540');
assert.equal(
  heroesHallOffice?.physical_address,
  'Heroes Hall / Executive Building'
);
assert.equal(heroesHallOffice?.primary_phone, '(045) 649-8080');

// 5. Route and navigation.
assert.equal(mainNavigation.length, 7);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/government\/contact"[\s\S]{0,80}element={<GovernmentContact \/>}/,
  '/government/contact must remain a real <Route>'
);
assert.match(
  appSource,
  /path="\/contact"[\s\S]{0,80}to="\/government\/contact"[\s\S]{0,40}replace/,
  '/contact must permanently redirect to /government/contact with replace semantics'
);

const contactDestinations = mainNavigation.filter(
  item => item.href === '/government/contact'
);
assert.equal(
  contactDestinations.length,
  1,
  'exactly one top-level navigation item may point directly at /government/contact'
);
assert.equal(contactDestinations[0]?.id, 'contact');

// 6. Page content: emergency numbers, general offices, and the four required
// related-destination links are present; no contact form or personal-data
// collection; the independent-portal and call-testing limitations remain.
const pageSource = readFileSync('src/pages/GovernmentContact.tsx', 'utf8');

for (const requiredText of [
  'national-911',
  'cdrrmo-command-center-help-line',
  'san-fernando-police-station-primary-hotline',
  'san-fernando-fire-station-hotline',
  'city-government-main',
  'city-mayors-office',
  "'/government/hotlines'",
  "'/government/barangay-contacts'",
  "'/government/links'",
  "'/services'",
]) {
  assert.ok(
    pageSource.includes(requiredText),
    `page must reference ${requiredText}`
  );
}

for (const forbidden of [
  '<form',
  '<textarea',
  'type="email"',
  'type="text"',
  'head_of_office',
  'emergency_hotlines',
  'social_accounts',
]) {
  assert.ok(
    !pageSource.includes(forbidden),
    `${forbidden} must not appear on the page`
  );
}

assert.match(
  pageSource,
  /does\s+not\s+receive\s+or\s+forward\s+messages/i,
  'the page must make clear BetterSanFernando does not receive or forward government messages'
);
assert.match(pageSource, /not\s+the\s+official\s+City\s+Government\s+website/i);
assert.match(
  pageSource,
  /independently\s+call-tested/i,
  'the page must preserve the not-independently-call-tested limitation'
);
assert.match(
  pageSource,
  /overallPublicLimitation/,
  'the page must surface the reviewed hotlines coverage limitation'
);

console.log('[smoke-government-contact] OK');
console.log(
  `  offices: ${summary.total}; phone: ${summary.withPhone}; email: ${summary.withEmail}; both: ${summary.withBoth}; address: ${summary.withAddress}`
);
console.log(
  `  emergency contacts: ${requiredIds.length}; positive 24/7: ${positiveTwentyFourSeven.length}`
);
