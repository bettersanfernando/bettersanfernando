import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getOfficialLinks,
  getOfficialLinksMetadata,
} from '../src/data/civic/governmentOfficialLinks.ts';
import { getBarangayContactGroups } from '../src/data/civic/governmentBarangayContacts.ts';
import { getGovernmentHotlines } from '../src/data/civic/governmentHotlines.ts';
import { getServices } from '../src/data/civic/services.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const links = getOfficialLinks();
const metadata = getOfficialLinksMetadata();

// 1. Exact count and channel breakdown.
assert.equal(links.length, 35, 'exactly 35 approved links');
assert.equal(metadata.recordCount, 35);
const byType = links.reduce<Record<string, number>>((counts, link) => {
  counts[link.channel_type] = (counts[link.channel_type] ?? 0) + 1;
  return counts;
}, {});
assert.equal(byType.OFFICIAL_WEBSITE, 30, 'exactly 30 OFFICIAL_WEBSITE links');
assert.equal(
  byType.OFFICIAL_DIGITAL_SERVICE,
  2,
  'exactly 2 OFFICIAL_DIGITAL_SERVICE links'
);
assert.equal(
  byType.OFFICIAL_FACEBOOK_PAGE,
  3,
  'exactly 3 OFFICIAL_FACEBOOK_PAGE links'
);

// 2. Unique IDs and unique canonical URLs.
assert.equal(new Set(links.map(l => l.id)).size, 35, 'link ids must be unique');
assert.equal(
  new Set(links.map(l => l.url)).size,
  35,
  'link urls must be unique — no duplicate public cards'
);

// 3. All links resolve to a valid, recognized channel type.
const validChannelTypes = new Set([
  'OFFICIAL_WEBSITE',
  'OFFICIAL_DIGITAL_SERVICE',
  'OFFICIAL_FACEBOOK_PAGE',
]);
for (const link of links) {
  assert.ok(
    validChannelTypes.has(link.channel_type),
    `${link.id} has an unrecognized channel_type: ${link.channel_type}`
  );
  assert.match(
    link.url,
    /^https?:\/\//,
    `${link.id} must use an exported public URL`
  );
}

// 4. No phone numbers, addresses, personal accounts, repository paths,
// internal IDs, or publication-workflow language.
const serializedDataset = JSON.stringify(links);
const phoneShaped = /\(?0\d{2,3}\)?[-\s]?\d{3,4}[-\s]?\d{3,4}/;
assert.ok(
  !phoneShaped.test(serializedDataset.replace(/0305416\d{3}/g, '')),
  'no phone-number-shaped string may appear in the public official-links dataset'
);
for (const forbidden of [
  'data/',
  'scripts/',
  'exports/',
  'src/',
  'publication-review',
  'held_or_excluded',
  'conflicting_assignments',
  'superseded_evidence',
  'AWAITING_OWNER_APPROVAL',
  'recovery-queue',
]) {
  assert.ok(
    !serializedDataset.includes(forbidden),
    `private/internal or workflow content leaked into the public dataset: ${forbidden}`
  );
}
assert.ok(
  !/[A-Za-z]:\\|\/home\/|\/Users\//.test(serializedDataset),
  'no absolute filesystem path may appear in the public dataset'
);

// 5. CDRRMO Facebook: present, narrowly scoped, no 24/7 or dispatch claim.
const cdrrmo = links.find(
  l => l.url === 'https://www.facebook.com/cdrrmo.csfp.official'
);
assert.ok(cdrrmo, 'the approved CDRRMO Facebook destination must be present');
assert.equal(cdrrmo?.channel_type, 'OFFICIAL_FACEBOOK_PAGE');
assert.match(
  cdrrmo?.public_purpose ?? '',
  /official CDRRMO information and regular weather updates/i,
  'CDRRMO Facebook must carry its approved narrow purpose'
);
assert.ok(
  !/24\/7/i.test(cdrrmo?.public_purpose ?? ''),
  'CDRRMO Facebook purpose must not claim 24/7 monitoring'
);
assert.ok(
  !/emergency dispatch/i.test(cdrrmo?.public_purpose ?? ''),
  'CDRRMO Facebook purpose must not claim to be an emergency-dispatch destination'
);

// 6. The excluded Citizen's Charter 1st Edition is absent; no duplicate
// Citizens Portal cards.
assert.ok(
  !links.some(
    l => /1st edition/i.test(l.label) || /1st edition/i.test(l.public_purpose)
  ),
  "the excluded Citizen's Charter 1st Edition must not appear"
);
const citizensPortalCards = links.filter(l => /citizens portal/i.test(l.label));
assert.ok(
  citizensPortalCards.length <= 1,
  'the Citizens Portal must not be duplicated into multiple cards'
);

// 7. Route and navigation: real, not planned.
assert.ok(
  !plannedPages.some(page => page.path === '/government/links'),
  '/government/links must no longer be registered as a planned page'
);
const megaMenus = mainNavigation.filter(item => item.sections);
const officialLinksDestination = megaMenus
  .flatMap(menu => menu.sections!.flatMap(section => section.items))
  .find(item => item.href === '/government/links');
assert.ok(
  officialLinksDestination,
  'navigation must include an Official Government Links destination'
);
assert.equal(officialLinksDestination?.kind, 'real');

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/government\/links"[\s\S]{0,80}element={<GovernmentOfficialLinks \/>}/,
  '/government/links must be a real <Route>'
);

// 8. External links use safe target/rel attributes.
const pageSource = readFileSync(
  'src/pages/GovernmentOfficialLinks.tsx',
  'utf8'
);
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
  /useMemo|useState/,
  'the page must support local filtering'
);
assert.match(
  pageSource,
  /government\/hotlines/,
  'the page must link to Government Hotlines for contact needs'
);
assert.match(
  pageSource,
  /government\/barangay-contacts/,
  'the page must link to Barangay Contacts for contact needs'
);
assert.match(
  pageSource,
  /government\/offices/,
  'the page must link to Government Offices for contact needs'
);

// 9. Existing datasets remain unchanged.
assert.equal(
  getGovernmentHotlines().length,
  11,
  'Government Hotlines must remain exactly 11 contacts'
);
const barangayContactTotal = getBarangayContactGroups().reduce(
  (sum, group) => sum + group.contacts.length,
  0
);
assert.equal(
  barangayContactTotal,
  324,
  'Barangay Contacts must remain exactly 324 records'
);
assert.equal(
  getServices().length,
  154,
  'existing services must remain unchanged (137 plus 15 Civil Registry plus 2 Senior Citizens records)'
);

console.log('[smoke-government-official-links] OK');
console.log(
  `  links: ${links.length}; websites: ${byType.OFFICIAL_WEBSITE}; digital services: ${byType.OFFICIAL_DIGITAL_SERVICE}; facebook pages: ${byType.OFFICIAL_FACEBOOK_PAGE}`
);
