import assert from 'node:assert/strict';
import { readNextRoute } from './smoke-next-route.ts';
import { getAwardAndContractRecords } from '../src/data/civic/contracts.ts';
import { getBidResultEvidence } from '../src/data/civic/bidResults.ts';
import { getBarangays } from '../src/data/civic/demographics.ts';
import { getFinanceReports } from '../src/data/civic/finance.ts';
import { getFullDisclosureRecords } from '../src/data/civic/fullDisclosure.ts';
import { getCityOffices } from '../src/data/civic/government.ts';
import { getGovernmentHotlines } from '../src/data/civic/governmentHotlines.ts';
import {
  getExecutiveOrders,
  getOrdinances,
  getResolutions,
} from '../src/data/civic/legislation.ts';
import { getOfficialDocuments } from '../src/data/civic/officialDocuments.ts';
import {
  getAllProjectEvidence,
  getProjects,
} from '../src/data/civic/projects.ts';
import { getServices } from '../src/data/civic/services.ts';
import {
  getSearchDocuments,
  isSingleTransposition,
  searchCivicRecords,
  searchCivicRecordsDetailed,
  type CivicSearchDomain,
} from '../src/data/civic/search.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const pageSource = readNextRoute('/search');
const documents = getSearchDocuments();

assert.ok(!plannedPages.some(page => page.path === '/search'));
assert.equal(mainNavigation.length, 7);
assert.ok(!mainNavigation.some(item => item.href === '/search'));

// 1. Every domain's document count matches its own civic accessor exactly —
// the unified index must never drift from what's actually published.
const domainCounts = documents.reduce(
  (counts, document) => {
    counts[document.domain] += 1;
    return counts;
  },
  {
    services: 0,
    projects: 0,
    government: 0,
    barangays: 0,
    'public-records': 0,
    pages: 0,
  } satisfies Record<CivicSearchDomain, number>
);

const expectedPublicRecords =
  getExecutiveOrders().length +
  getOrdinances().length +
  getResolutions().length +
  getBidResultEvidence().length +
  getAwardAndContractRecords().length +
  getFullDisclosureRecords().length +
  getOfficialDocuments().length +
  getFinanceReports().length +
  getAllProjectEvidence().length;

assert.deepEqual(domainCounts, {
  services: getServices().length,
  projects: getProjects().length,
  government: getCityOffices().length + getGovernmentHotlines().length,
  barangays: getBarangays().length,
  'public-records': expectedPublicRecords,
  pages: domainCounts.pages, // curated static list — see search.ts's own count assertion below
});
assert.ok(
  domainCounts.pages >= 14 && domainCounts.pages <= 20,
  'the curated site-destination list should stay small and deliberate, not enumerate every route'
);

// 2. Real-record relevance scenarios (§14). Every fixture below is drawn
// from the actual published dataset, never invented.

// service exact title
const service = getServices()[0];
assert.equal(
  searchCivicRecords(service.title)[0]?.id,
  `service:${service.id}`,
  'an exact service title must rank that service first'
);

// office acronym — "CHO" must rank City Health Office prominently
const cho = getCityOffices().find(office => office.acronym === 'CHO');
assert.ok(cho, 'fixture assumption: a CHO office record must exist');
assert.equal(
  searchCivicRecords('CHO')[0]?.id,
  `office:${cho!.office_id}`,
  'the exact office acronym "CHO" must rank City Health Office first'
);

// common service phrase / alias — "business permit" must surface a real
// BLPD business-permit service in the top results, not just a document.
const businessPermitResults = searchCivicRecords('business permit', 'services');
assert.ok(
  businessPermitResults.some(result =>
    /permit for business/i.test(result.title)
  ),
  'the "business permit" alias must surface a real BLPD business-permit service when scoped to services'
);

// barangay name — "Sindalan" must rank the barangay first globally, and a
// project-scoped query for the same name must return only projects.
const sindalan = getBarangays().find(barangay => barangay.name === 'Sindalan');
assert.ok(
  sindalan,
  'fixture assumption: Sindalan must be a published barangay'
);
const sindalanGlobal = searchCivicRecords('Sindalan');
assert.equal(
  sindalanGlobal[0]?.id,
  `barangay:${sindalan!.psgc_code}`,
  'a barangay name must rank the barangay record first in global search'
);
assert.ok(
  sindalanGlobal.length > 1,
  'global search for a barangay name should also surface related records (projects, public records)'
);
const sindalanProjectsOnly = searchCivicRecords('Sindalan', 'projects');
assert.ok(sindalanProjectsOnly.length > 0);
assert.ok(
  sindalanProjectsOnly.every(result => result.domain === 'projects'),
  'a project-scoped barangay-name query must return only project records'
);

// project name
const project = getProjects()[0];
assert.ok(
  searchCivicRecords(project.project_name).some(
    result => result.id === `project:${project.id}`
  )
);

// project/procurement identifier — a contract number must find its project
const projectWithContract = getProjects().find(
  candidate => candidate.identifiers.contract_number
);
assert.ok(
  projectWithContract,
  'fixture assumption: at least one project must carry a contract number'
);
assert.ok(
  searchCivicRecords(projectWithContract!.identifiers.contract_number!).some(
    result => result.id === `project:${projectWithContract!.id}`
  ),
  'an exact contract number must find its project'
);

// Executive Order number — "EO <number>" must outrank incidental matches
const executiveOrder = getExecutiveOrders()[0];
const eoResults = searchCivicRecords(`EO ${executiveOrder.document_number}`);
assert.equal(
  eoResults[0]?.id,
  `executive-order:${executiveOrder.id}`,
  'an exact Executive Order number (with the "EO" prefix) must rank that order first'
);
assert.equal(
  searchCivicRecords('EO CMO2013-016')[0]?.id,
  'executive-order:eo-cmo2013-016',
  'the published EO identifier must remain an exact top result'
);

// Ordinance number
const ordinance = getOrdinances()[0];
assert.ok(
  searchCivicRecords(ordinance.document_number).some(
    result => result.id === `ordinance:${ordinance.id}`
  )
);

// procurement / public record — a bid result must be reachable and scoped
// correctly under the public-records umbrella
const bidResult = getBidResultEvidence()[0];
assert.ok(
  searchCivicRecords(bidResult.project.project_name, 'public-records').some(
    result => result.id === `bid-result:${bidResult.evidence.id}`
  )
);

// important statistics/destination page — civic records still outrank a
// loosely-matching page, but a close title match still surfaces the page.
const populationPage = searchCivicRecords('Population Statistics');
assert.equal(
  populationPage[0]?.id,
  'page:/statistics/population',
  'an exact/near-exact page title must still surface that page prominently'
);
const projectVsPageQuery = searchCivicRecords(project.project_name);
assert.notEqual(
  projectVsPageQuery[0]?.domain,
  'pages',
  'a civic record must outrank generic destination pages for a query that is not itself a page title'
);

// typo-tolerant query — a common transposition typo ("raod" for "road")
// must still find real project records without weakening exact-acronym
// precision elsewhere.
assert.ok(
  searchCivicRecords('raod').length > 0,
  'a common transposition typo must still return results'
);
assert.equal(
  searchCivicRecords('CHO').length > 0 &&
    searchCivicRecords('CHO')[0]!.id === `office:${cho!.office_id}`,
  true,
  'typo tolerance must not weaken exact short-acronym precision'
);

// Regression: "raod" is also genuinely edit-distance-2 from unrelated real
// words ("card", "rape"), and a document that happens to contain several
// such incidental collisions can outscore one with a single genuine
// transposition match — a real Solo Parent ID service (matching via "card"
// + "rape") previously ranked above every actual road record. Road-titled
// results must dominate the top of "raod", and that specific unrelated
// service must not appear anywhere near the top.
// 1. Genuine road records rank first.
const raodResults = searchCivicRecords('raod');
assert.ok(
  raodResults.slice(0, 5).every(result => /road/i.test(result.title)),
  'genuine road-title matches must dominate the top results for the "raod" typo'
);
// 2. The unrelated Solo Parent result stays out of the top 20.
const raodTop20Titles = raodResults.slice(0, 20).map(result => result.title);
assert.ok(
  !raodTop20Titles.some(title => /solo parent/i.test(title)),
  'the unrelated Solo Parent ID service (an incidental "card"/"rape" fuzzy collision) must not rank near the top of "raod"'
);

// Neutral, non-civic four-character strings previously admitted unrelated
// records through MiniSearch's generic distance-2 fuzzy matching. They must
// not populate either global search or the homepage's top-four autocomplete.
for (const query of ['mepo', 'lunq', 'zarn', 'plix']) {
  assert.deepEqual(
    searchCivicRecords(query),
    [],
    `a random short query (${query}) must not return fuzzy collisions`
  );
  assert.deepEqual(
    searchCivicRecordsDetailed(query, 'all', 4).results,
    [],
    `a random short query (${query}) must not occupy homepage suggestions`
  );
}
// 3. isSingleTransposition() itself: a true single-character-swap
// transposition qualifies, but an arbitrary same-letter reordering
// (an anagram where every position differs, not exactly two) must not.
assert.equal(isSingleTransposition('raod', 'road'), true);
assert.equal(isSingleTransposition('stop', 'pots'), false);
assert.equal(isSingleTransposition('angel', 'glean'), false);
assert.equal(
  isSingleTransposition('road', 'road'),
  false,
  'an identical pair has zero differing positions, not exactly two'
);
assert.equal(
  isSingleTransposition('road', 'roads'),
  false,
  'different lengths can never be a transposition'
);

// alias query — CDRRMO's real alias terms (disaster/emergency) must
// surface CDRRMO-related records.
assert.ok(
  searchCivicRecords('disaster', 'government').some(
    result => /CDRRMO/i.test(result.title) || /CDRRMO/i.test(result.metadata)
  ) ||
    searchCivicRecords('disaster', 'services').some(result =>
      /CDRRMO|disaster/i.test(result.description)
    ),
  'the CDRRMO alias ("disaster") must surface a CDRRMO-related record'
);

// 2b. Natural multi-word / conversational-phrasing queries (stop-word
// normalization). Every fixture is real, current data — see the audit
// report for how each result class was actually caused before the fix.

// A. "this is a test" — genuine test/testing records must rank at the top;
// filler words ("this", "is", "a") must never independently drive a match.
const thisIsATest = searchCivicRecords('this is a test');
assert.ok(
  thisIsATest.length > 0,
  'a real query term ("test") must still return results'
);
assert.ok(
  /test/i.test(thisIsATest[0]!.title),
  'the top result for "this is a test" must be a genuine test/testing record, not one admitted only by filler words'
);
assert.ok(
  thisIsATest
    .slice(0, 3)
    .some(
      result => /test/i.test(result.title) || /test/i.test(result.description)
    ),
  'genuine test/testing records must appear prominently for "this is a test"'
);
// The bare filler words must never independently return results once
// stripped — "a" and "is" alone carry no informative signal.
assert.deepEqual(searchCivicRecords('a'), []);

// B. "show me business permit" — request-phrasing filler ("show", "me")
// must not change the outcome from the bare "business permit" query.
assert.ok(
  searchCivicRecords('show me business permit', 'services').some(result =>
    /permit for business/i.test(result.title)
  ),
  '"show me business permit" must still surface a real BLPD business-permit service'
);

// C. "please find CHO" — request-phrasing filler ("please", "find") must
// not weaken the exact-acronym match; CHO must remain the top result.
assert.equal(
  searchCivicRecords('please find CHO')[0]?.id,
  `office:${cho!.office_id}`,
  '"please find CHO" must still rank City Health Office first'
);

// Regression: a natural three-word query combining a topic, the domain
// word "project", and a location must find the real matching projects —
// this previously broke because every "Project source" (evidence) record
// carried a generic `category: 'Project evidence'` label, which exact-
// matched the literal word "project" for all 564 of them regardless of
// topic. Fixed by using the evidence's own stage as its category instead,
// and giving real project records an explicit "project" alias keyword.
const roadProjectSindalan = searchCivicRecords('road project sindalan');
assert.ok(
  roadProjectSindalan.length > 0,
  '"road project sindalan" must return the real Sindalan road projects'
);
assert.ok(
  roadProjectSindalan.every(result => result.domain === 'projects'),
  '"road project sindalan" must return genuine project records, not generic evidence rows matched only via a shared category label'
);

// 3. Grouped counts / total (§12) are self-consistent.
const detailed = searchCivicRecordsDetailed(project.project_name, 'all', 3);
assert.ok(detailed.total >= detailed.results.length);
assert.equal(
  Object.values(detailed.domainCounts).reduce((sum, value) => sum + value, 0),
  detailed.total
);

// 4. Query-shape edge cases (unchanged behavior).
assert.deepEqual(searchCivicRecords(''), []);
assert.deepEqual(searchCivicRecords('x'), []);
assert.deepEqual(searchCivicRecords('no-matching-published-record-zzzz'), []);

// 5. Public-data boundary: no document ever leaks a planned/unpublished
// route, and internal bureaucratic terminology never leaks into *service*
// records specifically — a service's title/description must always read as
// a clean, resident-facing name, never cite its own source charter by that
// internal name. (An actual official document literally titled "...
// Citizen's Charter ..." is legitimately indexed under public-records by
// its real, correct name — that guard is about services, not every domain.)
const plannedPaths = new Set(plannedPages.map(page => page.path));
for (const document of documents) {
  assert.ok(!plannedPaths.has(document.href));
  if (document.domain === 'services') {
    assert.doesNotMatch(document.searchableText, /citizen.?s charter/i);
  }
  assert.match(
    document.href,
    /^\/projects\/[^/?#]+$|^\/barangays\?q=|^\/government\/offices\/[^/?#]+$|^\/government\/hotlines$|^\/legislation\/(?:executive-orders|ordinances)\?q=|^\/legislation\/resolutions$|^\/projects\/sources\?project=|^\/procurement\/(?:bid-results|contracts)\?q=|^\/transparency\/(?:full-disclosure|documents|finance)$|^\/services\/[^/?#]+\/[^/?#]+$|^\/(?:services|projects|government|barangays|legislation|transparency|statistics)(?:\/[a-z-]+)*$/
  );
}

assert.doesNotMatch(pageSource, /Citizen.?s Charter/i);
assert.match(pageSource, /Start with a name, title, location, or identifier/i);
assert.match(pageSource, /Enter at least 2 characters/i);
assert.match(pageSource, /No published BetterSanFernando records matched/i);
assert.match(pageSource, /Absence from search does not mean/i);

console.log('[smoke-search] OK');
console.log(`  indexed documents: ${documents.length}`);
console.log(`  by domain: ${JSON.stringify(domainCounts)}`);
