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
import { stripStopWords } from '../src/data/civic/searchNormalization.ts';
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

// Regression: CASSO is the City Assessor's Office and CAVO is the City
// Agriculture and Veterinary Office in San Fernando, Pampanga.
const assessorGovResults = searchCivicRecords('city assessor', 'government');
assert.ok(
  assessorGovResults.some(
    result => /Assessor/i.test(result.title) || /CASSO/i.test(result.metadata)
  ),
  '"city assessor" must surface the City Assessor\'s Office (CASSO)'
);
assert.ok(
  !assessorGovResults.some(result => /Veterinary|CAVO/i.test(result.title)),
  '"city assessor" must not misroute to CAVO'
);

const veterinaryGovResults = searchCivicRecords(
  'veterinary office',
  'government'
);
assert.ok(
  veterinaryGovResults.some(
    result => /Veterinary/i.test(result.title) || /CAVO/i.test(result.metadata)
  ),
  '"veterinary office" must surface the City Agriculture and Veterinary Office (CAVO)'
);
assert.ok(
  !veterinaryGovResults.some(result => /Assessor|CASSO/i.test(result.title)),
  '"veterinary office" must not misroute to CASSO'
);

const communityTaxCertificateId =
  'service:charter-2026-2e-city-treasurers-office-external-15';
const cavoAnimalVaccinationId =
  'service:charter-2026-2e-city-agriculture-and-veterinary-office-external-04';
const humanAntiRabiesId =
  'service:charter-2026-2e-city-health-office-external-10';
const burialPermitId = 'service:charter-2026-2e-city-health-office-external-17';
const cippesoOfficeId = 'office:cippeso-cpeso';
const tourismOfficeId = 'office:city-tourism-investment-promotion';

assert.ok(
  !searchCivicRecords('city assessor', 'services', getServices().length).some(
    result =>
      result.id.startsWith('service:charter-2026-2e-city-treasurers-office-')
  ),
  '"city assessor" must not match unrelated Treasurer services through their category'
);

for (const term of ['cedula', 'sedula', 'community tax certificate']) {
  const results = searchCivicRecords(term, 'services', getServices().length);
  assert.equal(
    results[0]?.id,
    communityTaxCertificateId,
    `"${term}" must rank the Community Tax Certificate service first`
  );
  assert.ok(
    !results.some(result => result.id.includes('city-assessors-office')),
    `"${term}" must not match City Assessor services`
  );
}

for (const term of [
  'treasurer',
  'cedula',
  'sedula',
  'tax payment',
  'community tax certificate',
  'amilyar',
  'bayad buwis',
]) {
  assert.ok(
    !searchCivicRecords(term, 'government', documents.length).some(
      result => result.id === tourismOfficeId
    ),
    `Tourism must not inherit Treasurer aliases for "${term}"`
  );
}

assert.equal(
  searchCivicRecords('treasurer')[0]?.id,
  'office:city-treasurers-office',
  '"treasurer" must rank the City Treasurer\'s Office first'
);

assert.equal(
  searchCivicRecords('cpeso', 'government')[0]?.id,
  cippesoOfficeId,
  '"cpeso" must rank the CIPPESO / CPESO office first'
);
assert.equal(
  searchCivicRecords('obra', 'government')[0]?.id,
  cippesoOfficeId,
  '"obra" must resolve through the CIPPESO / CPESO composite alias'
);

const workingPermitResults = searchCivicRecords(
  'working permit',
  'services',
  getServices().length
);
assert.equal(
  workingPermitResults[0]?.id,
  'service:charter-2026-2e-city-investment-promotions-and-public-employment-services-office-external-05',
  '"working permit" must rank its CIPPESO service first'
);
assert.ok(
  !workingPermitResults.some(result =>
    /Business License/i.test(result.metadata)
  ),
  '"working permit" must not match BLPD services'
);

const antiRabiesResults = searchCivicRecords(
  'anti-rabies',
  'services',
  getServices().length
);
assert.deepEqual(
  antiRabiesResults.map(result => result.id),
  [humanAntiRabiesId, cavoAnimalVaccinationId],
  '"anti-rabies" must rank the human and CAVO animal services without unrelated CAVO matches'
);

const dentalResults = searchCivicRecords(
  'dental',
  'services',
  getServices().length
);
assert.equal(
  dentalResults[0]?.id,
  'service:charter-2026-2e-city-college-of-san-fernando-pampanga-external-07',
  '"dental" must rank the exact dental service first'
);
assert.ok(
  dentalResults.some(result =>
    result.id.includes('city-health-office-external-02')
  ),
  '"dental" must retain the City Health Office dental service'
);
assert.ok(
  !dentalResults.some(result => result.id === burialPermitId),
  '"dental" must not match an unrelated burial permit'
);

const healthQueries = [
  [
    'medical consultation',
    'service:charter-2026-2e-city-college-of-san-fernando-pampanga-external-14',
  ],
  ['vaccination', 'service:charter-2026-2e-city-health-office-external-16'],
  ['laboratory', 'service:charter-2026-2e-city-health-office-external-01'],
  ['bakuna', 'service:charter-2026-2e-city-health-office-external-16'],
  [
    'health certificate',
    'service:charter-2026-2e-city-health-office-external-26',
  ],
  ['sanitary permit', 'service:charter-2026-2e-city-health-office-external-48'],
] as const;
for (const [query, expectedId] of healthQueries) {
  const results = searchCivicRecords(query, 'services', getServices().length);
  assert.ok(
    results.some(result => result.id === expectedId),
    `"${query}" must retain its relevant health service`
  );
  assert.ok(
    !results.some(result => result.id === burialPermitId),
    `"${query}" must not match the unrelated burial permit`
  );
}

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

assert.ok(
  searchCivicRecords('permit sa negosyo', 'services').some(result =>
    /permit for business/i.test(result.title)
  ),
  'the Filipino alias "permit sa negosyo" must surface a real BLPD business-permit service'
);

// C. "please find CHO" — request-phrasing filler ("please", "find") must
// not weaken the exact-acronym match; CHO must remain the top result.
assert.equal(
  searchCivicRecords('please find CHO')[0]?.id,
  `office:${cho!.office_id}`,
  '"please find CHO" must still rank City Health Office first'
);
assert.equal(
  searchCivicRecords('saan ang CHO')[0]?.id,
  `office:${cho!.office_id}`,
  '"saan ang CHO" must strip Filipino interrogative filler and rank CHO first'
);
assert.equal(
  searchCivicRecords('nukarin ing CHO')[0]?.id,
  `office:${cho!.office_id}`,
  '"nukarin ing CHO" must strip Kapampangan interrogative filler and rank CHO first'
);
assert.ok(
  searchCivicRecords('danum', 'services').some(
    result =>
      /CSFWD|water/i.test(result.title) || /CSFWD/i.test(result.metadata)
  ),
  'Kapampangan alias "danum" must surface CSFWD water services'
);
assert.ok(
  searchCivicRecords("paano kumuha ng mayor's permit", 'services').some(
    result => /permit for business/i.test(result.title)
  ),
  '"paano kumuha ng mayor\'s permit" must strip conversational filler and surface BLPD business-permit services'
);

// 2024–2026 CSFP civic entities & vernacular queries. Facility and program
// aliases are scoped to their actual records, rather than every service in an
// office or category.
const mayorPermitIds = new Set([
  'service:charter-2026-2e-business-license-and-permit-division-external-05',
  'service:charter-2026-2e-business-license-and-permit-division-external-06',
]);
for (const query of ['boss', 'business one stop shop', 'ebpls']) {
  const results = searchCivicRecords(query, 'services', getServices().length);
  assert.ok(mayorPermitIds.has(results[0]?.id ?? ''));
  assert.ok(
    results.every(result => mayorPermitIds.has(result.id)),
    `"${query}" must not match unrelated BLPD services`
  );
  assert.deepEqual(
    new Set(results.map(result => result.id)),
    mayorPermitIds,
    `"${query}" must retain both published Mayor's Permit services`
  );
}

const preHemodialysisId =
  'service:charter-2026-2e-city-health-office-external-32';
for (const query of ['dialysis', 'hemodialysis']) {
  assert.deepEqual(
    searchCivicRecords(query, 'services', getServices().length).map(
      result => result.id
    ),
    [preHemodialysisId],
    `"${query}" must only match the published pre-hemodialysis service`
  );
}
assert.equal(
  searchCivicRecords('gamot', 'services')[0]?.id,
  'service:charter-2026-2e-city-health-office-external-09',
  '"gamot" must rank the medicines service first'
);
for (const query of ['super health center', 'civic health', 'infirmary']) {
  assert.ok(
    !documents.some(
      document =>
        document.id.startsWith('service:') &&
        document.id !== preHemodialysisId &&
        document.aliases.includes(query)
    ),
    `"${query}" must not be an alias for unrelated CHO services`
  );
}
assert.equal(
  searchCivicRecords('super health center')[0]?.id,
  'office:san-fernando-super-health-center',
  '"super health center" must rank RHU VI – Super Health Center first'
);
for (const [query, officeId] of [
  ['rhu 1', 'rhu-i-dolores'],
  ['rhu 2', 'rhu-ii-sindalan'],
  ['rhu 3', 'rhu-iii-san-nicolas'],
  ['rhu 4', 'rhu-iv-san-agustin'],
  ['rhu 5', 'rhu-v-northville-calulut'],
  ['rhu 6', 'san-fernando-super-health-center'],
] as const) {
  assert.equal(searchCivicRecords(query)[0]?.id, `office:${officeId}`);
}
assert.equal(
  searchCivicRecords('atin super health center')[0]?.id,
  'office:san-fernando-super-health-center',
  '"atin super health center" must strip Kapampangan particle "atin" and rank Super Health Center first'
);

assert.equal(
  searchCivicRecords('961-help')[0]?.id,
  'hotline:cdrrmo-command-center-help-line',
  '"961-help" must resolve through the published HELP hotline data'
);
for (const query of ['baha', 'albug', 'flood']) {
  const results = searchCivicRecords(query, 'services', getServices().length);
  assert.ok(
    /Receiving of Emergency Call|Response for Emergency Call/.test(
      results[0]?.title ?? ''
    ),
    `"${query}" must rank an emergency-call service first`
  );
  assert.ok(
    results.some(result =>
      /Receiving of Emergency Call|Response for Emergency Call/.test(
        result.title
      )
    ),
    `"${query}" must surface emergency-call services`
  );
  assert.ok(
    !results.some(result => /CCTV|Thesis/.test(result.title)),
    `"${query}" must not match unrelated CDRRMO services`
  );
}
assert.ok(
  !searchCivicRecords('hems', 'services', getServices().length).some(result =>
    /City Disaster Risk Reduction/.test(result.metadata)
  ),
  '"hems" must not match CDRRMO services'
);
assert.ok(searchCivicRecords('drainage', 'services').length > 0);
assert.ok(searchCivicRecords('tulay', 'services').length > 0);
for (const query of ['rainwater park', 'retention basin']) {
  assert.ok(
    !searchCivicRecords(query, 'services').some(result =>
      /Compost Fertilizer/.test(result.title)
    ),
    `"${query}" must not match compost sales`
  );
}
for (const query of [
  'pumping station',
  'flood control',
  'idrr-cca',
  'nscr',
  'rainwater park',
  'lazatin flyover',
]) {
  assert.ok(
    !searchCivicRecords(query, 'services').some(result =>
      /Processing of Complaints/.test(result.title)
    ),
    `"${query}" must not resolve to the generic CAdminO complaints service`
  );
}

for (const word of [
  'ala',
  'atin',
  'ninu',
  'kapilan',
  'bakit',
  'obhetu',
  'bisa',
  'buri',
  'kanu',
  'ot',
]) {
  assert.equal(stripStopWords(`${word} CHO`), 'CHO');
  assert.equal(stripStopWords(word), word);
}
assert.equal(stripStopWords('atin-CHO'), 'atin-CHO');

// Legacy aliases that name a single published transaction stay scoped to that
// record; native title/description matches continue to cover related intent.
const aicsResults = searchCivicRecords(
  'aics',
  'services',
  getServices().length
);
assert.ok(
  aicsResults.length > 0 &&
    aicsResults.every(result => /E-AICS Social Case Study/.test(result.title)),
  '"aics" must not inherit onto unrelated social-welfare services'
);
assert.equal(
  searchCivicRecords('seedlings', 'services', getServices().length)[0]?.id,
  'service:charter-2026-2e-city-agriculture-and-veterinary-office-external-03',
  '"seedlings" must rank its published CAVO request service first'
);
assert.ok(
  (() => {
    const results = searchCivicRecords(
      'scholarship',
      'services',
      getServices().length
    );
    return (
      results.length > 0 &&
      results.every(result =>
        /Social Case Study|Certificate of Indigency/.test(result.title)
      )
    );
  })(),
  '"scholarship" must not make unrelated City College services match'
);
assert.ok(
  (() => {
    const results = searchCivicRecords(
      'college admission',
      'services',
      getServices().length
    );
    return (
      results.length > 0 &&
      results.every(result => /Admission|Entrance Test/.test(result.title))
    );
  })(),
  '"college admission" must retain its native City College matches'
);
assert.equal(
  searchCivicRecords('tree cutting', 'services').length,
  0,
  '"tree cutting" must not be inherited by the compost service'
);
assert.equal(
  searchCivicRecords('tree cutting')[0]?.id,
  'office:cenro',
  '"tree cutting" must still route to CENRO'
);

const civilCertificateResults = searchCivicRecords(
  'sertipiko ng kapanganakan',
  'services',
  getServices().length
);
assert.equal(
  civilCertificateResults[0]?.id,
  'service:charter-2026-2e-city-civil-registry-office-external-19',
  'a Filipino certificate query must rank the certified-copy service first'
);
const englishCivilCertificateResults = searchCivicRecords(
  'birth certificate',
  'services',
  getServices().length
);
assert.ok(
  englishCivilCertificateResults
    .slice(0, 3)
    .some(
      result =>
        result.id ===
        'service:charter-2026-2e-city-civil-registry-office-external-19'
    ),
  'an English certificate query must keep the certified-copy service prominent'
);
assert.deepEqual(
  documents
    .filter(
      document =>
        document.domain === 'services' &&
        document.aliases.includes('birth certificate')
    )
    .map(document => document.id),
  ['service:charter-2026-2e-city-civil-registry-office-external-19'],
  'only the certified-copy service may receive the exact birth-certificate alias'
);
assert.equal(
  searchCivicRecords('late registration', 'services')[0]?.id,
  'service:charter-2026-2e-city-civil-registry-office-external-12',
  '"late registration" must target the published delayed-live-birth service'
);
assert.equal(
  searchCivicRecords('senior citizen id', 'services', getServices().length)
    .length,
  2,
  '"senior citizen id" must return the two published issuance/replacement services'
);

assert.equal(
  searchCivicRecords('water billing', 'services')[0]?.id,
  'service:csfwd-charter-2025-1e-external-01',
  '"water billing" must rank bill payment first'
);
const waterReconnectionIds = new Set([
  'service:csfwd-charter-2025-1e-external-04',
  'service:csfwd-charter-2025-1e-external-05',
]);
assert.ok(
  (() => {
    const topResults = searchCivicRecords(
      'water reconnection',
      'services'
    ).slice(0, 2);
    return (
      topResults.length === 2 &&
      topResults.every(result => waterReconnectionIds.has(result.id))
    );
  })(),
  '"water reconnection" must prioritize the two reconnection services'
);
assert.ok(
  (() => {
    const results = searchCivicRecords(
      'tax map',
      'services',
      getServices().length
    );
    return (
      results.length > 0 &&
      results.every(result => /Tax Map|Tax Mapping/.test(result.title))
    );
  })(),
  '"tax map" must not inherit onto unrelated property-tax services'
);
assert.equal(
  searchCivicRecords('amilyar', 'services')[0]?.id,
  'service:charter-2026-2e-city-treasurers-office-external-10',
  '"amilyar" must rank real-property-tax payment first'
);
for (const query of ['building permit', 'occupancy permit']) {
  assert.equal(
    searchCivicRecords(query)[0]?.id,
    'office:office-of-the-city-building-official',
    `"${query}" must route to OCBO rather than unrelated published services`
  );
}
assert.equal(
  searchCivicRecords('cswdo', 'services', getServices().length).length,
  39
);
assert.equal(
  searchCivicRecords('ccro', 'services', getServices().length).length,
  15
);
assert.equal(
  searchCivicRecords('water district', 'services', getServices().length).length,
  9
);
assert.equal(
  searchCivicRecords('solo parent', 'services', getServices().length).length,
  14
);
assert.equal(
  searchCivicRecords('compost', 'services')[0]?.id,
  'service:charter-2026-2e-city-environment-and-natural-resources-office-external-03'
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
