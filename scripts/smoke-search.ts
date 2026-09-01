import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getAllProjectEvidence,
  getProjects,
} from '../src/data/civic/projects.ts';
import { getBarangays } from '../src/data/civic/demographics.ts';
import { getCityOffices } from '../src/data/civic/government.ts';
import {
  getExecutiveOrders,
  getOrdinances,
} from '../src/data/civic/legislation.ts';
import {
  getSearchDocuments,
  searchCivicRecords,
  type CivicSearchDomain,
} from '../src/data/civic/search.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const appSource = readFileSync('src/App.tsx', 'utf8');
const pageSource = readFileSync('src/pages/Search.tsx', 'utf8');
const documents = getSearchDocuments();

assert.match(appSource, /path="\/search" element={<Search \/>}/);
assert.ok(!plannedPages.some(page => page.path === '/search'));
assert.equal(mainNavigation.length, 7);
assert.ok(!mainNavigation.some(item => item.href === '/search'));

const domainCounts = documents.reduce(
  (counts, document) => {
    counts[document.domain] += 1;
    return counts;
  },
  {
    projects: 0,
    barangays: 0,
    government: 0,
    legislation: 0,
    sources: 0,
  } satisfies Record<CivicSearchDomain, number>
);

assert.deepEqual(domainCounts, {
  projects: getProjects().length,
  barangays: getBarangays().length,
  government: getCityOffices().length,
  legislation: getExecutiveOrders().length + getOrdinances().length,
  sources: getAllProjectEvidence().length,
});

const office = getCityOffices().find(record => record.acronym);
assert.ok(office?.acronym);
assert.equal(
  searchCivicRecords(office.acronym)[0]?.id,
  `office:${office.office_id}`,
  'an exact office acronym must rank its office first'
);

const executiveOrder = getExecutiveOrders()[0];
assert.ok(
  searchCivicRecords(executiveOrder.document_number).some(
    result => result.id === `executive-order:${executiveOrder.id}`
  )
);

const ordinance = getOrdinances()[0];
assert.ok(
  searchCivicRecords(ordinance.document_number).some(
    result => result.id === `ordinance:${ordinance.id}`
  )
);

const project = getProjects()[0];
assert.ok(
  searchCivicRecords(project.project_name).some(
    result => result.id === `project:${project.id}`
  )
);

const barangay = getBarangays()[0];
assert.ok(
  searchCivicRecords(barangay.name, 'barangays').some(
    result => result.id === `barangay:${barangay.psgc_code}`
  )
);

const evidence = getAllProjectEvidence()[0];
assert.ok(
  searchCivicRecords(evidence.source_identifier, 'sources').some(
    result => result.id === `source:${evidence.id}`
  )
);

assert.deepEqual(searchCivicRecords(''), []);
assert.deepEqual(searchCivicRecords('x'), []);
assert.deepEqual(searchCivicRecords('no-matching-published-record-zzzz'), []);

const plannedPaths = new Set(plannedPages.map(page => page.path));
for (const document of documents) {
  assert.ok(!plannedPaths.has(document.href));
  assert.doesNotMatch(document.id, /service|citizen|charter/i);
  assert.doesNotMatch(document.searchableText, /citizen.?s charter/i);
  assert.match(
    document.href,
    /^\/projects\/[^/?#]+$|^\/barangays\?q=|^\/government\/offices#|^\/legislation\/(?:executive-orders|ordinances)\?q=|^\/projects\/sources\?project=/
  );
}

assert.doesNotMatch(pageSource, /329 services|Citizen.?s Charter/i);
assert.match(pageSource, /Start with a name, title, location, or identifier/i);
assert.match(pageSource, /Enter at least 2 characters/i);
assert.match(pageSource, /No published BetterSanFernando records matched/i);
assert.match(pageSource, /Absence from search does not mean/i);

console.log('[smoke-search] OK');
console.log(`  indexed documents: ${documents.length}`);
