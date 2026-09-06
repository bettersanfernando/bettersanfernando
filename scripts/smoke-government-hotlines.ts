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

// 1. Exactly the eleven owner-approved contacts (original 6 + 2026-09-06
// expansion of 5), no more, no less.
assert.equal(contacts.length, 11, 'exactly 11 owner-approved contacts');
const originalSixNumbers = [
  '911',
  '961-4357',
  '649-6076',
  '409-6750',
  '649-8080',
  '0919-078-8456',
];
const expansionFiveNumbers = [
  '0939-936-2423',
  '0967-889-4569',
  '0998-598-5465',
  '0956-820-5255',
  '0923-235-9725',
];
const expectedNumbers = [...originalSixNumbers, ...expansionFiveNumbers];
assert.deepEqual(
  contacts.map(contact => contact.number).sort(),
  [...expectedNumbers].sort(),
  'rendered numbers must exactly match the approved eleven'
);
assert.equal(
  new Set(contacts.map(contact => contact.number)).size,
  11,
  'no duplicate contact numbers'
);
for (const number of originalSixNumbers) {
  assert.ok(
    contacts.some(contact => contact.number === number),
    `original approved contact must remain present: ${number}`
  );
}
for (const number of expansionFiveNumbers) {
  assert.ok(
    contacts.some(contact => contact.number === number),
    `approved expansion contact must be present: ${number}`
  );
}

// 1b. The original six contacts' reviewed fields must remain byte-for-byte
// unchanged by the expansion sync.
const originalSixExpected: Record<
  string,
  { organization: string; limitation_note: string; operating_scope: string }
> = {
  '911': {
    organization: 'National Emergency Hotline',
    limitation_note:
      'National number, included for context; not a City-specific line.',
    operating_scope:
      'National service. City-specific 911 implementation and whether CDRRMO runs a local 911 center are both NOT_VERIFIED; the City does not own the 911 number.',
  },
  '961-4357': {
    organization:
      'City Disaster Risk Reduction and Management Office (CDRRMO) – Command Center',
    limitation_note:
      "Listed in the 2026 Citizen's Charter and the City's Contact page; not independently call-tested by this project.",
    operating_scope:
      '24/7 for emergency call reception and dispatch only; not a claim about general CDRRMO administrative office hours.',
  },
  '649-6076': {
    organization: 'CDRRMO – Command Center',
    limitation_note:
      "Listed in the 2026 Citizen's Charter; not independently call-tested.",
    operating_scope:
      'Not documented as a distinct 24/7 line on its own; published as one directory row together with 961-4357 and 409-6750 for the CDRRMO Command Center.',
  },
  '409-6750': {
    organization: 'CDRRMO – Command Center',
    limitation_note:
      "Listed under the CDRRMO Command Center in the 2026 Citizen's Charter's official Directory of Offices. Not independently call-tested; no claim is made that the number is currently reachable.",
    operating_scope: 'Not documented as a distinct 24/7 line on its own.',
  },
  '649-8080': {
    organization: 'CDRRMO – San Fernando Rescue Unit (SAFRU)',
    limitation_note:
      "Listed in the 2026 Citizen's Charter's Heroes Hall directory table; not independently call-tested.",
    operating_scope:
      "Not documented as 24/7; this is the shared Heroes Hall trunk line (with a SAFRU extension), distinct from the Command Center's own direct emergency numbers.",
  },
  '0919-078-8456': {
    organization:
      'City Health Office – Health Emergency Management Staff (HEMS)',
    limitation_note:
      "Listed in the 2026 Citizen's Charter's Heroes Hall directory table; not independently call-tested. Not documented as the citizen-facing emergency-dispatch number for HEMS response; that routes through the CDRRMO command center per the Charter's own service procedure.",
    operating_scope:
      "This is a City Health Office/HEMS office contact at Heroes Hall. For emergency ambulance requests, the 2026 Citizen's Charter directs residents to the C3 Command Center. This office number is not documented as a 24/7 emergency dispatch line.",
  },
};
for (const [number, expected] of Object.entries(originalSixExpected)) {
  const contact = contacts.find(c => c.number === number);
  assert.ok(contact, `original contact must be present: ${number}`);
  assert.equal(
    contact?.organization,
    expected.organization,
    `${number} organization must be unchanged`
  );
  assert.equal(
    contact?.limitation_note,
    expected.limitation_note,
    `${number} limitation_note must be unchanged`
  );
  assert.equal(
    contact?.operating_scope,
    expected.operating_scope,
    `${number} operating_scope must be unchanged`
  );
}

// 2. Held/excluded contacts must never surface anywhere in this dataset.
const heldOrExcludedNumbers = [
  '(045) 961-2313',
  '(045) 961-2331',
  '0917-547-5243',
  '0999-882-7763',
];
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
for (const forbidden of ['Barangay Secretary', 'BHERT']) {
  assert.ok(
    !serializedDataset.includes(forbidden),
    `person-level identifier leaked into the public dataset: ${forbidden}`
  );
}
for (const forbidden of [
  'cdrrmo-emergency-freshness-enrichment.json',
  'hotlines-expansion-review.json',
  'hotlines-publication-review.json',
  'charter-2026-2e-city-health-office-external-57',
  'publication-reviewed and exported',
  'business masterlist',
  'conflicting_assignments',
  'superseded_evidence',
  'held_decision',
  'held_or_excluded',
  'AWAITING_OWNER_APPROVAL',
  'APPROVED_AND_MERGED',
  'evidence_strength',
  'expansion_candidates',
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

// 2b. The two prior publication-review corrections must still be present
// verbatim in the synchronized public data (covered again by 1b above; kept
// here as an explicit historical regression guard).
const command409 = contacts.find(contact => contact.number === '409-6750');
assert.equal(
  command409?.organization,
  'CDRRMO – Command Center',
  '409-6750 must remain attributed to the CDRRMO Command Center'
);

// 3. Approved presentation groups are preserved exactly, and every group's
// candidate_ids resolve to an actual contact.
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
  11,
  'every contact must belong to exactly one group'
);
for (const group of groups) {
  for (const contact of group.contacts) {
    assert.ok(
      contact,
      `every candidate_id in group ${group.groupId} must resolve to a real contact`
    );
  }
}
const emergencyNumbersGroup = groups.find(
  group => group.groupId === 'EMERGENCY_NUMBERS'
);
assert.deepEqual(
  emergencyNumbersGroup?.contacts.map(contact => contact.number).sort(),
  ['0939-936-2423', '911', '961-4357'].sort(),
  'Emergency numbers group must contain 911, 961-4357, and the newly approved SAFRU mobile'
);
const relatedGroup = groups.find(
  group => group.groupId === 'RELATED_EMERGENCY_SERVICE_OFFICE_CONTACTS'
);
assert.deepEqual(
  relatedGroup?.contacts.map(contact => contact.number).sort(),
  [
    '649-8080',
    '0919-078-8456',
    '0967-889-4569',
    '0998-598-5465',
    '0956-820-5255',
    '0923-235-9725',
  ].sort(),
  'Related emergency-service office contacts group must contain the four newly approved office/public-safety contacts alongside the two existing Heroes Hall lines'
);

// 4. Only 961-4357 and 0939-936-2423 may carry the positive, scoped 24/7 claim.
const positiveTwentyFourSeven = contacts.filter(contact =>
  /^24\/7\b/.test(contact.operating_scope)
);
assert.equal(
  positiveTwentyFourSeven.length,
  2,
  'exactly two contacts may assert a positive 24/7 claim'
);
assert.deepEqual(
  positiveTwentyFourSeven.map(contact => contact.number).sort(),
  ['0939-936-2423', '961-4357'].sort(),
  'only 961-4357 and 0939-936-2423 may carry a positive 24/7 claim'
);
const help961 = contacts.find(contact => contact.number === '961-4357');
assert.match(
  help961?.operating_scope ?? '',
  /emergency call reception and dispatch/i,
  '961-4357 24/7 must be scoped to call reception/dispatch, not general office hours'
);
const safruMobile = contacts.find(
  contact => contact.number === '0939-936-2423'
);
assert.match(
  safruMobile?.operating_scope ?? '',
  /SAFRU rescue and emergency-response/i,
  '0939-936-2423 24/7 must be scoped to SAFRU rescue/emergency-response, not general office hours'
);
for (const contact of contacts) {
  if (contact.number === '961-4357' || contact.number === '0939-936-2423') {
    continue;
  }
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
// The four other expansion additions must explicitly state 24/7/dispatch is
// not established, never merely omit the claim.
for (const number of [
  '0967-889-4569',
  '0998-598-5465',
  '0956-820-5255',
  '0923-235-9725',
]) {
  const contact = contacts.find(c => c.number === number);
  assert.match(
    contact?.operating_scope ?? '',
    /not established/i,
    `${number} must explicitly state that 24/7/dispatch is not established`
  );
}

// 4b. alternate_official_label is preserved for the Police primary contact
// only, and is a clearly secondary, optional field elsewhere.
const policePrimary = contacts.find(
  contact => contact.number === '0998-598-5465'
);
assert.equal(
  policePrimary?.alternate_official_label,
  'City of San Fernando Police Headquarters',
  'Police primary contact must preserve its Citizens Portal alternate label'
);
const contactsWithAlternateLabel = contacts.filter(
  contact => contact.alternate_official_label !== undefined
);
assert.deepEqual(
  contactsWithAlternateLabel.map(contact => contact.number),
  ['0998-598-5465'],
  'alternate_official_label must be present only on the Police primary contact'
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
assert.equal(getServices().length, 127);

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
  '(045) 961-2313',
  '(045) 961-2331',
  '0917-547-5243',
  '0999-882-7763',
  'Barangay Secretary',
  'BHERT',
  'business masterlist',
]) {
  assert.ok(
    !pageSource.includes(forbidden),
    `${forbidden} must not be surfaced on the page`
  );
}
assert.match(
  pageSource,
  /not independently call-tested|overallPublicLimitation/
);

console.log('[smoke-government-hotlines] OK');
console.log(
  `  contacts: ${contacts.length}; groups: ${groups.length}; positive 24/7: ${positiveTwentyFourSeven.length}; services unchanged: ${getServices().length}`
);
