import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CityOfficesFileSchema,
  getCityOfficeById,
  getCityOffices,
} from '../src/data/civic/government.ts';
import cityOfficesJson from '../src/data/generated/civic/directories/city-offices.json' with { type: 'json' };
import { getGovernmentSummary } from '../src/data/civic/governmentSummary.ts';
import {
  getExecutiveOrders,
  getOrdinances,
} from '../src/data/civic/legislation.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const offices = getCityOffices();
const summary = getGovernmentSummary();
const pageSource = readFileSync('src/pages/Government.tsx', 'utf8');
const normalizedPageSource = pageSource.replace(/\s+/g, ' ');
const appSource = readFileSync('src/App.tsx', 'utf8');

assert.equal(summary.officeRecords, offices.length);
assert.equal(summary.executiveOrders, getExecutiveOrders().length);
assert.equal(summary.ordinances, getOrdinances().length);
assert.equal(summary.officeRecords, 44);
assert.equal(summary.executiveOrders, 11);
assert.equal(summary.ordinances, 6);
assert.deepEqual(
  getGovernmentSummary(),
  summary,
  'summary must be deterministic'
);

const officeIds = new Set(offices.map(office => office.office_id));
assert.equal(officeIds.size, 44, 'office IDs must be unique');

const relationships = offices.filter(office => office.parent_office_id);
assert.equal(relationships.length, 7);
assert.ok(
  relationships.every(office => officeIds.has(office.parent_office_id!)),
  'every parent reference must resolve'
);
assert.ok(
  offices.every(office =>
    office.child_office_ids.every(childId => officeIds.has(childId))
  ),
  'every child reference must resolve'
);
assert.equal(
  offices.reduce((total, office) => total + office.child_office_ids.length, 0),
  7
);
for (const office of offices) {
  for (const url of [office.official_page_url, ...office.source_urls].filter(
    (value): value is string => Boolean(value)
  )) {
    assert.equal(new URL(url).protocol, 'https:');
    assert.equal(new URL(url).hostname, 'cityofsanfernando.gov.ph');
  }
}

for (const office of offices) {
  const visited = new Set<string>();
  let current = office;
  while (current.parent_office_id) {
    assert.ok(
      !visited.has(current.office_id),
      'office hierarchy must be acyclic'
    );
    visited.add(current.office_id);
    current = offices.find(
      candidate => candidate.office_id === current.parent_office_id
    )!;
  }
}

const blpd = offices.find(
  office => office.office_id === 'business-license-permit-division'
);
assert.equal(blpd?.parent_office_id, 'city-administrators-office');
assert.equal(
  offices.find(office => office.office_id === blpd?.parent_office_id)
    ?.office_name,
  "City Administrator's Office"
);
assert.ok(
  offices.some(office => office.office_id === 'office-of-the-city-vice-mayor')
);
assert.ok(
  offices.some(
    office => office.office_id === 'office-of-the-sangguniang-panlungsod'
  )
);
assert.ok(
  !offices.some(
    office => office.office_id === 'vice-mayor-sangguniang-panlungsod'
  )
);
assert.equal(
  offices.filter(office => office.office_id === 'cippeso-cpeso').length,
  1
);
assert.equal(
  offices.find(
    office => office.office_id === 'city-tourism-investment-promotion'
  )?.organization_status,
  'possible_reorganization'
);
assert.equal(
  offices.find(office => office.office_id === 'rhu-iv-san-agustin')
    ?.primary_phone,
  '(045) 281-6563'
);
assert.equal(
  offices.find(office => office.office_id === 'rhu-iv-san-agustin')
    ?.emergency_hotlines,
  undefined
);
assert.equal(
  offices.find(office => office.office_id === 'cdrrmo')?.social_accounts.length,
  0
);
for (const officeId of ['city-information-office', 'cicto']) {
  assert.equal(
    offices.find(office => office.office_id === officeId)?.social_accounts[0]
      ?.platform,
    'Facebook'
  );
}

assert.match(appSource, /path="\/government" element={<Government \/>}/);
assert.match(
  appSource,
  /path="\/government\/offices\/:officeId"[\s\S]*element={<GovernmentOfficeDetail \/>}/
);
assert.ok(!plannedPages.some(page => page.path === '/government'));
assert.ok(!plannedPages.some(page => page.path === '/government/structure'));
assert.equal(mainNavigation.length, 7);

for (const href of [
  '/government/offices',
  '/government/contact',
  '/legislation',
  '/statistics',
  '/transparency',
]) {
  assert.match(pageSource, new RegExp(`href: ["']${href}["']`));
}

for (const href of ['/transparency/sources', '/transparency/methodology']) {
  assert.match(pageSource, new RegExp(`to=["']${href}["']`));
}

assert.doesNotMatch(pageSource, /to=["']\/government\/structure["']/);
assert.doesNotMatch(pageSource, /22 City Government offices/i);
assert.match(pageSource, /published office records/i);
assert.match(pageSource, /not (?:an|the) official City\s+Government website/i);
assert.match(
  normalizedPageSource,
  /not asserted to represent the complete City organizational structure/i
);
assert.match(pageSource, /not a\s+complete City legislative archive/i);

const governmentNavigation = mainNavigation.find(
  item => item.id === 'government'
);
assert.ok(
  !governmentNavigation?.sections
    ?.flatMap(section => section.items)
    .some(item => item.href === '/government/structure')
);

const officeRoutes = offices.map(
  office => `/government/offices/${office.office_id}`
);
assert.equal(officeRoutes.length, 44);
assert.equal(new Set(officeRoutes).size, 44);
assert.ok(
  offices.every(office => getCityOfficeById(office.office_id) === office)
);

type MutableExport = Record<string, unknown> & {
  offices: Array<Record<string, unknown>>;
};

function rejectsMalformed(mutator: (file: MutableExport) => void) {
  const file = structuredClone(cityOfficesJson) as MutableExport;
  mutator(file);
  assert.equal(CityOfficesFileSchema.safeParse(file).success, false);
}

rejectsMalformed(file => {
  file.offices[1].office_id = file.offices[0].office_id;
});
rejectsMalformed(file => {
  file.offices[0].parent_office_id = 'missing-office';
});
rejectsMalformed(file => {
  file.offices[0].child_office_ids = ['missing-office'];
});
rejectsMalformed(file => {
  file.offices[0].parent_office_id = file.offices[0].office_id;
});
rejectsMalformed(file => {
  const firstId = file.offices[0].office_id;
  const secondId = file.offices[1].office_id;
  file.offices[0].parent_office_id = secondId;
  file.offices[0].child_office_ids = [secondId];
  file.offices[1].parent_office_id = firstId;
  file.offices[1].child_office_ids = [firstId];
});
rejectsMalformed(file => {
  file.offices[0].source_urls = ['file:///private/research.json'];
});
rejectsMalformed(file => {
  file.offices[0].institutional_email = 'not-an-email';
});
rejectsMalformed(file => {
  file.offices[0].social_accounts = [
    { platform: 'Facebook', url: 'javascript:alert(1)' },
  ];
});

console.log('[smoke-government] OK');
console.log(
  `  office records: ${summary.officeRecords}; executive orders: ${summary.executiveOrders}; ordinances: ${summary.ordinances}`
);
