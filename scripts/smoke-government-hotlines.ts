import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getGovernmentHotlineGroups,
  getGovernmentHotlines,
  getGovernmentHotlinesMetadata,
} from '../src/data/civic/governmentHotlines.ts';
import { getServices } from '../src/data/civic/services.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const contacts = getGovernmentHotlines();
const groups = getGovernmentHotlineGroups();
const metadata = getGovernmentHotlinesMetadata();

// 1. Exactly the six owner-approved contacts, no more, no less.
assert.equal(contacts.length, 6, 'exactly 6 owner-approved contacts');
const expectedNumbers = [
  '911',
  '961-4357',
  '649-6076',
  '409-6750',
  '649-8080',
  '0919-078-8456',
];
assert.deepEqual(
  contacts.map(contact => contact.number).sort(),
  [...expectedNumbers].sort(),
  'rendered numbers must exactly match the approved set'
);

// 2. Held/excluded contacts must never surface anywhere in this dataset.
const heldOrExcludedNumbers = ['0939-936-2423'];
for (const number of heldOrExcludedNumbers) {
  assert.ok(
    !contacts.some(contact => contact.number === number),
    `held contact must not be exported: ${number}`
  );
}
// The synchronized public dataset itself (not just the React page) must never
// carry private-authoring/reconciliation content: person-level identifiers,
// private repository paths, internal review filenames, or internal
// reconciliation field names. This is the actual publication boundary — the
// generated JSON ships to every visitor regardless of what the page renders.
const serializedDataset = JSON.stringify(contacts);
for (const forbidden of ['Barangay Secretary', 'BHERT', 'CPOSCO']) {
  assert.ok(
    !serializedDataset.includes(forbidden),
    `person-level or out-of-scope identifier leaked into the public dataset: ${forbidden}`
  );
}
for (const forbidden of [
  'cdrrmo-emergency-freshness-enrichment.json',
  'charter-2026-2e-city-health-office-external-57',
  'publication-reviewed and exported',
  'business masterlist',
  'conflicting_assignments',
  'superseded_evidence',
  'held_decision',
]) {
  assert.ok(
    !serializedDataset.includes(forbidden),
    `private authoring/reconciliation content leaked into the public dataset: ${forbidden}`
  );
}
for (const pattern of [
  /(^|[^a-z0-9_./-])data\//i,
  /(^|[^a-z0-9_./-])scripts\//i,
  /(^|[^a-z0-9_./-])exports\//i,
  /(^|[^a-z0-9_./-])src\//i,
  /[A-Za-z]:\\/,
  /\/home\/|\/Users\//,
]) {
  assert.ok(
    !pattern.test(serializedDataset),
    `a repository-relative or absolute filesystem path leaked into the public dataset: ${pattern}`
  );
}

// 2b. The two publication-review corrections must be present verbatim in the
// synchronized public data.
const command409 = contacts.find(contact => contact.number === '409-6750');
assert.equal(
  command409?.limitation_note,
  "Listed under the CDRRMO Command Center in the 2026 Citizen's Charter's official Directory of Offices. Not independently call-tested; no claim is made that the number is currently reachable.",
  '409-6750 limitation_note must carry the corrected, public-safe wording'
);
const hems = contacts.find(contact => contact.number === '0919-078-8456');
assert.equal(
  hems?.operating_scope,
  "This is a City Health Office/HEMS office contact at Heroes Hall. For emergency ambulance requests, the 2026 Citizen's Charter directs residents to the C3 Command Center. This office number is not documented as a 24/7 emergency dispatch line.",
  'HEMS operating_scope must carry the corrected, public-safe wording'
);

// 3. Approved presentation groups are preserved exactly.
assert.deepEqual(
  groups.map(group => group.groupId),
  [
    'EMERGENCY_NUMBERS',
    'CDRRMO_COMMAND_CENTER_CONTACTS',
    'RELATED_EMERGENCY_SERVICE_OFFICE_CONTACTS',
  ],
  'the three approved presentation groups must be preserved in order'
);
assert.equal(
  groups.reduce((sum, group) => sum + group.contacts.length, 0),
  6,
  'every contact must belong to exactly one group'
);

// 4. Only 961-4357 may carry the positive, scoped 24/7 claim.
const positiveTwentyFourSeven = contacts.filter(contact =>
  /^24\/7\b/.test(contact.operating_scope)
);
assert.equal(
  positiveTwentyFourSeven.length,
  1,
  'exactly one contact may assert a positive 24/7 claim'
);
assert.equal(positiveTwentyFourSeven[0]?.number, '961-4357');
assert.match(
  positiveTwentyFourSeven[0]?.operating_scope ?? '',
  /emergency call reception and dispatch/i,
  '24/7 must be scoped to call reception/dispatch, not general office hours'
);
for (const contact of contacts) {
  if (contact.number === '961-4357') continue;
  assert.ok(
    !/^24\/7\b/.test(contact.operating_scope),
    `${contact.number} must not assert an unscoped 24/7 claim`
  );
}
const national911 = contacts.find(contact => contact.number === '911');
assert.ok(national911);
assert.ok(
  !/24\/7/.test(national911.operating_scope),
  '911 must not carry a local 24/7 claim'
);

// 5. The not-call-tested / bounded-subset limitation is available to the page.
assert.match(metadata.overallPublicLimitation, /official sources/i);
assert.match(
  metadata.overallPublicLimitation,
  /not independently call-tested/i
);
assert.match(metadata.overallPublicLimitation, /not a guarantee|reachable/i);
assert.equal(metadata.route, '/government/hotlines');

// 6. Existing 113 published services must remain unchanged by this addition.
assert.equal(getServices().length, 113);

// 7. Route and navigation: the planned-page entry is gone, the route is real.
assert.ok(
  !plannedPages.some(page => page.path === '/government/hotlines'),
  'the planned-page entry for /government/hotlines must be removed'
);
const megaMenus = mainNavigation.filter(item => item.sections);
const hotlinesDestination = megaMenus
  .flatMap(menu => menu.sections!.flatMap(section => section.items))
  .find(item => item.href === '/government/hotlines');
assert.ok(hotlinesDestination, 'navigation must still point at the route');
assert.equal(
  hotlinesDestination?.kind,
  'real',
  'navigation must present the route as real, not planned'
);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/government\/hotlines"[\s\S]{0,80}element={<GovernmentHotlines \/>}/,
  '/government/hotlines must be a real <Route>, not routed through PlannedPage'
);

const pageSource = readFileSync('src/pages/GovernmentHotlines.tsx', 'utf8');
for (const forbidden of [
  '0939-936-2423',
  'Barangay Secretary',
  'BHERT',
  'CPOSCO',
  'business masterlist',
]) {
  assert.ok(
    !pageSource.includes(forbidden),
    `${forbidden} must not be surfaced on the page`
  );
}
// The publication-review source has since been corrected (see section 2b
// above), so limitation_note is no longer inherently unsafe; the page is free
// to render it or not. The actual publication boundary is enforced at the
// data layer (section 2), which is authoritative regardless of what the page
// chooses to present.
assert.match(
  pageSource,
  /not independently call-tested|overallPublicLimitation/
);

console.log('[smoke-government-hotlines] OK');
console.log(
  `  contacts: ${contacts.length}; groups: ${groups.length}; services unchanged: ${getServices().length}`
);
