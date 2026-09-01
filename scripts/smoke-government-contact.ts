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
import { mainNavigation } from '../src/data/navigation.ts';

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
assert.deepEqual(
  all,
  filterAndSortGovernmentContacts(contacts, {
    query: '',
    availability: 'all',
    sort: 'name-asc',
  })
);
assert.equal(
  filterAndSortGovernmentContacts(contacts, {
    query: '',
    availability: 'both',
    sort: 'name-asc',
  }).length,
  summary.withBoth
);
const contactWithEmail = contacts.find(contact => contact.emails.length > 0);
assert.ok(contactWithEmail);
assert.ok(
  filterAndSortGovernmentContacts(contacts, {
    query: contactWithEmail.emails[0],
    availability: 'all',
    sort: 'name-asc',
  }).some(record => record.officeId === contactWithEmail.officeId)
);

assert.equal(mainNavigation.length, 7);

const pageSource = readFileSync('src/pages/GovernmentContact.tsx', 'utf8');
for (const privateField of [
  'head_of_office',
  'emergency_hotlines',
  'social_accounts',
  'BHERT',
  'barangay secretary',
]) {
  assert.ok(
    !pageSource.includes(privateField),
    `${privateField} must not be surfaced`
  );
}
assert.match(pageSource, /Not currently available in BetterSanFernando/);
assert.match(pageSource, /not the official City\s+Government website/i);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(appSource, /path="\/government\/contact"/);

console.log('[smoke-government-contact] OK');
console.log(
  `  offices: ${summary.total}; phone: ${summary.withPhone}; email: ${summary.withEmail}; both: ${summary.withBoth}; address: ${summary.withAddress}`
);
