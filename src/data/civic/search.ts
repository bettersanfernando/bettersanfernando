import MiniSearch from 'minisearch';
import { aliasesFor } from './searchAliases.ts';
import { stripStopWords } from './searchNormalization.ts';
import { getBarangays } from './demographics.ts';
import { getAwardAndContractRecords } from './contracts.ts';
import { getBidResultEvidence } from './bidResults.ts';
import { getFinanceReports } from './finance.ts';
import { getFullDisclosureRecords } from './fullDisclosure.ts';
import { getCityOffices } from './government.ts';
import { getGovernmentHotlines } from './governmentHotlines.ts';
import {
  getExecutiveOrders,
  getOrdinances,
  getResolutions,
  hasLegislationFullText,
  type LegislationRecord,
} from './legislation.ts';
import {
  getOfficialDocuments,
  type OfficialDocument,
} from './officialDocuments.ts';
import {
  getAllProjectEvidence,
  getProjectById,
  getProjects,
} from './projects.ts';
import { getServiceCategory, getServiceHref, getServices } from './services.ts';

// Resident-understandable top-level domains (see docs/SITE-ARCHITECTURE.md
// for the routes these correspond to). 'public-records' is deliberately an
// umbrella over several finer record types — legislation, procurement,
// Full Disclosure, official documents, and project evidence/sources — each
// still distinguishable via a document's own `kind`. A future UI can group
// or further split that umbrella without changing this domain contract.
export const CIVIC_SEARCH_DOMAINS = [
  'services',
  'projects',
  'government',
  'barangays',
  'public-records',
  'pages',
] as const;

export type CivicSearchDomain = (typeof CIVIC_SEARCH_DOMAINS)[number];

export type CivicSearchDocument = Readonly<{
  id: string;
  domain: CivicSearchDomain;
  kind: string;
  title: string;
  description: string;
  href: string;
  metadata: string;
  /** Alternate phrases (acronyms, common names) — see searchAliases.ts. */
  aliases: string;
  /** Controlled category/keyword text (e.g. a service category name). */
  category: string;
  titleText: string;
  identifiers: string;
  descriptionText: string;
  location: string;
  searchableText: string;
}>;

export type CivicSearchResult = Pick<
  CivicSearchDocument,
  'id' | 'domain' | 'kind' | 'title' | 'description' | 'href' | 'metadata'
>;

export type CivicSearchResponse = Readonly<{
  results: readonly CivicSearchResult[];
  total: number;
  /** Result counts per domain, over the full (pre-`limit`) match set. */
  domainCounts: Readonly<Record<CivicSearchDomain, number>>;
}>;

function titleCase(value: string) {
  return value
    .toLocaleLowerCase('en-PH')
    .split('_')
    .map(word => word.charAt(0).toLocaleUpperCase('en-PH') + word.slice(1))
    .join(' ');
}

function legislationTitle(record: LegislationRecord) {
  return (
    record.title ??
    record.official_title ??
    record.official_alias ??
    `${titleCase(record.document_type)} ${record.document_number}`
  );
}

// Resident-facing labels for OfficialDocument.document_type — deliberately
// never the literal internal "Citizen's Charter" phrase (kept out of every
// indexed field; see the smoke-search.ts guard).
const OFFICIAL_DOCUMENT_KIND: Record<
  OfficialDocument['document_type'],
  string
> = {
  BUSINESS_FORM: 'Business Form',
  CITIZENS_CHARTER: 'Service Reference Document',
  PRIVACY_MANUAL: 'Privacy Manual',
  PRIVACY_NOTICE: 'Privacy Notice',
  PRIVACY_POLICY: 'Privacy Policy',
};

function freezeDocument(
  document: Omit<CivicSearchDocument, 'searchableText'>
): CivicSearchDocument {
  return Object.freeze({
    ...document,
    searchableText: [
      document.titleText,
      document.identifiers,
      document.aliases,
      document.category,
      document.descriptionText,
      document.location,
      document.metadata,
    ]
      .filter(Boolean)
      .join(' '),
  });
}

// Important navigational/statistical destinations, curated deliberately —
// not every route (that would let generic pages overwhelm civic records;
// see the ranking notes below). Titles match each route's own <title>.
const SITE_DESTINATIONS: readonly {
  href: string;
  title: string;
  description: string;
  keywords: string;
}[] = [
  {
    href: '/services',
    title: 'Services',
    description: 'Browse City service guidance by need.',
    keywords: 'services directory',
  },
  {
    href: '/projects',
    title: 'Projects',
    description: 'City infrastructure and public-works projects hub.',
    keywords: 'projects hub infrastructure',
  },
  {
    href: '/government',
    title: 'Government',
    description: 'City Government offices, contacts, and legislation.',
    keywords: 'government hub',
  },
  {
    href: '/barangays',
    title: 'Barangay directory',
    description: 'All 35 barangays with population and classification.',
    keywords: 'barangay list directory',
  },
  {
    href: '/legislation',
    title: 'Legislation',
    description: 'Executive Orders, Ordinances, and Resolutions hub.',
    keywords: 'legislation hub',
  },
  {
    href: '/transparency',
    title: 'Transparency',
    description: 'Published-record inventory, sources, and methodology.',
    keywords: 'transparency hub',
  },
  {
    href: '/statistics',
    title: 'Statistics',
    description:
      'Population, project, procurement, and city-profile statistics.',
    keywords: 'statistics hub',
  },
  {
    href: '/statistics/population',
    title: 'Population Statistics',
    description: 'PSA population baseline compared across all 35 barangays.',
    keywords: 'population census demographics',
  },
  {
    href: '/statistics/demographics',
    title: 'Demographics',
    description:
      'Household population, age/sex structure, and poverty estimates.',
    keywords: 'demographics age sex poverty',
  },
  {
    href: '/statistics/project-spending',
    title: 'Project Cost & Utilization',
    description: 'Source-reported project cost-utilization observations.',
    keywords: 'project spending budget utilization cost',
  },
  {
    href: '/statistics/projects',
    title: 'Project Statistics',
    description: 'Descriptive snapshot of the published project collection.',
    keywords: 'project statistics counts',
  },
  {
    href: '/statistics/procurement',
    title: 'Procurement Statistics',
    description: 'Descriptive statistics for published procurement records.',
    keywords: 'procurement statistics counts',
  },
  {
    href: '/statistics/government',
    title: 'Government Statistics',
    description: 'Verified, partial City Government entity summary.',
    keywords: 'government statistics organizational',
  },
  {
    href: '/transparency/finance',
    title: 'City Finances',
    description: 'Aggregate revenue, budget, and expenditure reports.',
    keywords: 'finance budget revenue expenditure',
  },
  {
    href: '/transparency/sources',
    title: 'Transparency Sources',
    description: "BetterSanFernando's published evidence and source inventory.",
    keywords: 'sources evidence provenance',
  },
  {
    href: '/transparency/methodology',
    title: 'How We Publish Data',
    description: 'Verification standards and publication methodology.',
    keywords: 'methodology verification publication approach',
  },
] as const;

function composeSearchDocuments(): CivicSearchDocument[] {
  const services = getServices().map(service => {
    const category = getServiceCategory(service);
    return freezeDocument({
      id: `service:${service.id}`,
      domain: 'services',
      kind: 'Service',
      title: service.title,
      description: service.description,
      href: getServiceHref(service),
      metadata: service.office.name,
      titleText: service.title,
      identifiers: [service.id, service.office.acronym].join(' '),
      aliases: aliasesFor(service.office.acronym, category),
      category,
      descriptionText: [
        service.description,
        service.who_may_avail,
        service.office.name,
      ].join(' '),
      location: '',
    });
  });

  const projects = getProjects().map(project => {
    const identifiers = Object.values(project.identifiers)
      .filter((value): value is string => Boolean(value))
      .join(' ');
    const projectType = titleCase(project.project_type);
    const lifecycle = titleCase(project.lifecycle_status);

    return freezeDocument({
      id: `project:${project.id}`,
      domain: 'projects',
      kind: 'Project',
      title: project.project_name,
      description: `${projectType} project${project.barangay ? ` in ${project.barangay}` : ''}.`,
      href: `/projects/${project.id}`,
      metadata: [project.year, lifecycle, identifiers]
        .filter(Boolean)
        .join(' · '),
      titleText: project.project_name,
      identifiers: [project.id, identifiers].filter(Boolean).join(' '),
      // A project's own name essentially never contains the literal word
      // "project" — an intentional alias keyword lets "road project
      // sindalan" find real project records, the same way an office
      // acronym helps find its office, without the earlier bug's shortcut
      // of putting a generic word into `category` (which then exact-
      // matched every record sharing that category, regardless of topic).
      aliases: 'project',
      category: projectType,
      descriptionText: [projectType, lifecycle, project.funding_source]
        .filter(Boolean)
        .join(' '),
      location: project.barangay ?? '',
    });
  });

  const barangays = getBarangays().map(barangay =>
    freezeDocument({
      id: `barangay:${barangay.psgc_code}`,
      domain: 'barangays',
      kind: 'Barangay',
      title: barangay.name,
      description: `${barangay.classification} barangay in the City of San Fernando, Pampanga.`,
      href: `/barangays?q=${encodeURIComponent(barangay.name)}`,
      metadata: `PSGC ${barangay.psgc_code}`,
      titleText: barangay.name,
      identifiers: barangay.psgc_code,
      aliases: '',
      category: barangay.classification,
      descriptionText: `${barangay.classification} barangay`,
      location: 'City of San Fernando Pampanga',
    })
  );

  const offices = getCityOffices().map(office =>
    freezeDocument({
      id: `office:${office.office_id}`,
      domain: 'government',
      kind: 'Government office',
      title: office.office_name,
      description: office.physical_address ?? 'Published office record.',
      href: `/government/offices/${office.office_id}`,
      metadata: office.acronym ?? 'Published office record',
      titleText: [office.office_name, ...(office.alternate_names ?? [])].join(
        ' '
      ),
      identifiers: [office.office_id, office.acronym].filter(Boolean).join(' '),
      aliases: aliasesFor(office.acronym),
      category: 'Government office',
      descriptionText: 'government city office institutional directory',
      location: office.physical_address ?? '',
    })
  );

  const hotlines = getGovernmentHotlines().map(hotline =>
    freezeDocument({
      id: `hotline:${hotline.id}`,
      domain: 'government',
      kind: 'Hotline',
      title: hotline.label ?? hotline.organization,
      description: hotline.public_purpose,
      href: '/government/hotlines',
      metadata: hotline.number,
      titleText: [hotline.organization, hotline.label]
        .filter(Boolean)
        .join(' '),
      identifiers: [hotline.id, hotline.number].join(' '),
      aliases: aliasesFor(hotline.organization),
      category: titleCase(hotline.classification),
      descriptionText: [hotline.public_purpose, hotline.organization].join(' '),
      location: hotline.address ?? '',
    })
  );

  const executiveOrders = getExecutiveOrders().map(record =>
    freezeDocument({
      id: `executive-order:${record.id}`,
      domain: 'public-records',
      kind: 'Executive Order',
      title: legislationTitle(record),
      description: `Executive Order ${record.document_number}, published in BetterSanFernando's bounded collection.`,
      href: `/legislation/executive-orders?q=${encodeURIComponent(record.document_number)}`,
      metadata: `${record.document_number} · ${record.year}`,
      titleText: legislationTitle(record),
      identifiers: [
        record.id,
        record.document_number,
        `EO ${record.document_number}`,
        `Executive Order ${record.document_number}`,
      ].join(' '),
      aliases: '',
      category: 'Executive Order',
      descriptionText: [record.issuing_body, record.issuer_title]
        .filter(Boolean)
        .join(' '),
      location: '',
    })
  );

  const ordinances = getOrdinances().map(record =>
    freezeDocument({
      id: `ordinance:${record.id}`,
      domain: 'public-records',
      kind: 'Ordinance',
      title: legislationTitle(record),
      description: `Ordinance ${record.document_number}; ${hasLegislationFullText(record) ? 'full text available' : 'reference record only'}.`,
      href: `/legislation/ordinances?q=${encodeURIComponent(record.document_number)}`,
      metadata: `${record.document_number} · ${record.year} · ${hasLegislationFullText(record) ? 'Full text available' : 'Reference only'}`,
      titleText: legislationTitle(record),
      identifiers: [
        record.id,
        record.document_number,
        `Ordinance ${record.document_number}`,
      ].join(' '),
      aliases: '',
      category: 'Ordinance',
      descriptionText: [
        record.official_alias,
        record.described_context,
        record.described_subject,
        record.issuing_body,
      ]
        .filter(Boolean)
        .join(' '),
      location: '',
    })
  );

  const resolutions = getResolutions().map(record =>
    freezeDocument({
      id: `resolution:${record.id}`,
      domain: 'public-records',
      kind: 'Resolution',
      title: legislationTitle(record),
      description: `Resolution ${record.document_number}, subject-verified in BetterSanFernando's bounded collection.`,
      // No per-record query filter exists on /legislation/resolutions yet,
      // so this links to the collection page rather than a deep link.
      href: '/legislation/resolutions',
      metadata: `${record.document_number} · ${record.year}`,
      titleText: legislationTitle(record),
      identifiers: [
        record.id,
        record.document_number,
        `Resolution ${record.document_number}`,
      ].join(' '),
      aliases: '',
      category: 'Resolution',
      descriptionText: [
        record.official_alias,
        record.described_context,
        record.described_subject,
        record.issuing_body,
      ]
        .filter(Boolean)
        .join(' '),
      location: '',
    })
  );

  const bidResults = getBidResultEvidence().map(record =>
    freezeDocument({
      id: `bid-result:${record.evidence.id}`,
      domain: 'public-records',
      kind: 'Bid Result',
      title: record.project.project_name,
      description: `Bid result for ${record.project.project_name}.`,
      href: `/procurement/bid-results?q=${encodeURIComponent(record.project.id)}`,
      metadata: [record.facts.reportYear, record.facts.winningBidder]
        .filter(Boolean)
        .join(' · '),
      titleText: record.project.project_name,
      identifiers: [
        record.project.id,
        record.evidence.id,
        record.evidence.source_identifier,
        record.facts.bacReference,
      ]
        .filter(Boolean)
        .join(' '),
      aliases: '',
      category: 'Procurement',
      descriptionText: [record.facts.winningBidder, record.facts.location]
        .filter(Boolean)
        .join(' '),
      location: record.project.barangay ?? record.facts.location ?? '',
    })
  );

  const contracts = getAwardAndContractRecords().map(record =>
    freezeDocument({
      id: `contract:${record.project.id}`,
      domain: 'public-records',
      kind: 'Contract',
      title: record.project.project_name,
      description: `Award and contract record for ${record.project.project_name}.`,
      href: `/procurement/contracts?q=${encodeURIComponent(record.project.id)}`,
      metadata: [record.project.year, record.project.contractor]
        .filter(Boolean)
        .join(' · '),
      titleText: record.project.project_name,
      identifiers: [
        record.project.id,
        record.project.identifiers.contract_number,
        record.project.identifiers.philgeps_reference,
      ]
        .filter((value): value is string => Boolean(value))
        .join(' '),
      aliases: '',
      category: 'Procurement',
      descriptionText: [record.project.contractor, record.project.barangay]
        .filter((value): value is string => Boolean(value))
        .join(' '),
      location: record.project.barangay ?? '',
    })
  );

  const fullDisclosure = getFullDisclosureRecords().map(record =>
    freezeDocument({
      id: `full-disclosure:${record.id}`,
      domain: 'public-records',
      kind: 'Full Disclosure Report',
      title: record.title,
      description: `${record.report_type}, ${record.reporting_year}${record.quarter ? ` ${record.quarter}` : ''}.`,
      // No per-record query filter exists on this page yet.
      href: '/transparency/full-disclosure',
      metadata: [record.reporting_year, record.quarter]
        .filter(Boolean)
        .join(' · '),
      titleText: record.title,
      identifiers: [record.id].join(' '),
      aliases: '',
      category: record.report_type,
      descriptionText: [record.report_type, record.publishing_agency].join(' '),
      location: '',
    })
  );

  const officialDocuments = getOfficialDocuments().map(document =>
    freezeDocument({
      id: `document:${document.id}`,
      domain: 'public-records',
      kind: OFFICIAL_DOCUMENT_KIND[document.document_type],
      title: document.title,
      description: `${OFFICIAL_DOCUMENT_KIND[document.document_type]} published by ${document.issuing_office}.`,
      // No per-record query filter exists on this page yet.
      href: '/transparency/documents',
      metadata: [document.covered_year, document.covered_period]
        .filter(Boolean)
        .join(' · '),
      titleText: document.title,
      identifiers: [document.id, document.document_number ?? '']
        .filter(Boolean)
        .join(' '),
      aliases: '',
      category: OFFICIAL_DOCUMENT_KIND[document.document_type],
      descriptionText: document.issuing_office,
      location: '',
    })
  );

  const financeReports = getFinanceReports().map(report =>
    freezeDocument({
      id: `finance:${report.id}`,
      domain: 'public-records',
      kind: 'Finance Report',
      title: report.report_title_exact,
      description: `${titleCase(report.fund_type)} report, ${report.reporting_year}${report.quarter ? ` Q${report.quarter}` : ''}.`,
      // No per-record query filter exists on this page yet.
      href: '/transparency/finance',
      metadata: [report.reporting_year, report.quarter && `Q${report.quarter}`]
        .filter(Boolean)
        .join(' · '),
      titleText: report.report_title_exact,
      identifiers: [report.id].join(' '),
      aliases: '',
      category: titleCase(report.fund_type),
      descriptionText: [titleCase(report.fund_type), report.responsible_office]
        .filter((value): value is string => Boolean(value))
        .join(' '),
      location: '',
    })
  );

  const sources = getAllProjectEvidence().flatMap(evidence => {
    const project = getProjectById(evidence.project_id);
    if (!project) return [];

    const stage = titleCase(evidence.stage);
    return [
      freezeDocument({
        id: `source:${evidence.id}`,
        domain: 'public-records',
        kind: 'Project source',
        title: evidence.source_identifier,
        description: `${stage} evidence for ${project.project_name}.`,
        href: `/projects/sources?project=${encodeURIComponent(project.id)}`,
        metadata: [stage, evidence.document_date ?? project.year]
          .filter(Boolean)
          .join(' · '),
        titleText: evidence.source_identifier,
        identifiers: [
          evidence.id,
          evidence.source_identifier,
          project.id,
          ...Object.values(project.identifiers).filter(
            (value): value is string => Boolean(value)
          ),
        ].join(' '),
        aliases: '',
        // Deliberately the evidence stage (e.g. "Bid Results"), not a
        // generic "Project evidence" label — a generic label containing
        // the bare word "project" would exact-match this category field
        // for every one of these 563 records on any query containing
        // "project", regardless of actual topical relevance.
        category: stage,
        descriptionText: [stage, project.project_name].join(' '),
        location: project.barangay ?? '',
      }),
    ];
  });

  const pages = SITE_DESTINATIONS.map(destination =>
    freezeDocument({
      id: `page:${destination.href}`,
      domain: 'pages',
      kind: 'Site page',
      title: destination.title,
      description: destination.description,
      href: destination.href,
      metadata: '',
      titleText: destination.title,
      identifiers: '',
      aliases: destination.keywords,
      category: 'Site page',
      descriptionText: destination.description,
      location: '',
    })
  );

  return [
    ...services,
    ...projects,
    ...barangays,
    ...offices,
    ...hotlines,
    ...executiveOrders,
    ...ordinances,
    ...resolutions,
    ...bidResults,
    ...contracts,
    ...fullDisclosure,
    ...officialDocuments,
    ...financeReports,
    ...sources,
    ...pages,
  ];
}

const searchDocuments = Object.freeze(composeSearchDocuments());
const documentById = new Map(
  searchDocuments.map(document => [document.id, document])
);

const searchIndex = new MiniSearch<CivicSearchDocument>({
  fields: [
    'titleText',
    'identifiers',
    'aliases',
    'category',
    'location',
    'descriptionText',
    'metadata',
  ],
  idField: 'id',
  searchOptions: {
    boost: {
      identifiers: 9,
      titleText: 8,
      aliases: 6,
      category: 3,
      location: 3,
      metadata: 2,
      descriptionText: 1,
    },
    // A pure fuzzy match (no exact/prefix hit anywhere) is scored well below
    // an exact or prefix match — otherwise a coincidental edit-distance-2
    // collision (e.g. "test" ~ "trust", both real words 2 substitutions
    // apart) scores high enough to rank alongside genuine matches. Prefix
    // is left at MiniSearch's own default; only fuzzy is tightened.
    weights: { fuzzy: 0.2, prefix: 0.375 },
    combineWith: 'AND',
    prefix: true,
  },
});

searchIndex.addAll(searchDocuments);

export function getSearchDocuments(): readonly CivicSearchDocument[] {
  return searchDocuments;
}

// Length-aware typo tolerance. A single fractional `fuzzy` value can't serve
// both short acronyms/identifiers (which need to stay precise — a 3-letter
// office acronym should never fuzzy-match an unrelated word) and longer
// resident-typed words (where even a common transposition typo, e.g.
// "raod" for "road", is edit-distance 2 and needs more room than a fraction
// of a short word's length allows). Terms of 3 characters or fewer get no
// fuzzy matching; 4-5 character terms get a fixed edit distance of 2;
// longer terms scale proportionally via MiniSearch's fractional fuzzy.
function fuzzyForTerm(term: string): number | false {
  if (term.length <= 3) return false;
  if (term.length <= 5) return 2;
  return 0.2;
}

// Explicit relevance tiers, applied on top of MiniSearch's own field-boosted
// BM25 score, so the priority order in docs/... (identifier > title > title
// prefix > alias/category > location/description) holds regardless of how
// MiniSearch's internal scoring happens to rank a given query. 'pages' is
// deliberately demoted by default — generic site destinations should not
// outrank civic records — unless the query is itself an exact or near-exact
// match for that page's title, in which case it still surfaces prominently.
// True single-transposition test ("raod" -> "road"): same length, exactly
// two character positions differ, and swapping those two characters makes
// the strings identical, with every other position already identical.
// Deliberately narrower than "same multiset of letters" (an anagram test),
// which would also accept unrelated same-letter reorderings like
// "stop"/"pots" or "angel"/"glean" — those have every position differ, not
// exactly two, and must not receive this bonus.
export function isSingleTransposition(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const diffPositions: number[] = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diffPositions.push(i);
    if (diffPositions.length > 2) return false;
  }
  if (diffPositions.length !== 2) return false;
  const [i, j] = diffPositions;
  return a[i] === b[j] && a[j] === b[i];
}

// A same-length word elsewhere in the title/identifiers that is a true
// single-character-swap transposition of the query ("raod" -> "road") is
// strong evidence of a genuine transposition typo, distinct from an
// incidental substitution collision ("raod" is also edit-distance-2 from
// "card" and "rape", but neither is a transposition of "raod" — every
// position differs between them, not exactly two).
function hasTransposedMatch(
  document: CivicSearchDocument,
  query: string
): boolean {
  if (query.length < 4) return false;
  const lowerQuery = query.toLocaleLowerCase('en-PH');
  const words = `${document.titleText} ${document.identifiers}`
    .toLocaleLowerCase('en-PH')
    .split(/[^\p{L}\p{N}]+/u);
  return words.some(word => isSingleTransposition(word, lowerQuery));
}

function relevanceMultiplier(
  document: CivicSearchDocument,
  normalizedQuery: string
): number {
  const query = normalizedQuery.toLocaleLowerCase('en-PH');
  const title = document.titleText.toLocaleLowerCase('en-PH');
  const identifierTokens = document.identifiers
    .toLocaleLowerCase('en-PH')
    .split(/\s+/)
    .filter(Boolean);

  if (identifierTokens.includes(query)) return 14;
  if (title === query) return 10;
  if (title.startsWith(query)) return 4;
  // A single query term can coincidentally fall within fuzzy edit-distance
  // of several unrelated real words at once (e.g. "raod" is also 2
  // substitutions from "card" and from "rape"), and MiniSearch sums every
  // such candidate's contribution — a document that happens to contain
  // several weak coincidental collisions can outscore one with a single
  // genuine transposition match. This tier restores that priority without
  // touching fuzzy tolerance, matching, or MiniSearch's own scoring.
  if (hasTransposedMatch(document, query)) return 3;
  if (document.domain === 'pages') return 0.35;
  return 1;
}

/**
 * Searches BetterSanFernando's published holdings — a bounded, frontend-
 * safe corpus, never a search of every City Government record. Absence
 * from results must never be read as absence from reality.
 *
 * Global search: searchCivicRecords('sindalan')
 * Scoped search: searchCivicRecords('sindalan', 'projects')
 */
export function searchCivicRecords(
  query: string,
  domain?: CivicSearchDomain | 'all',
  limit = 50
): readonly CivicSearchResult[] {
  return searchCivicRecordsDetailed(query, domain, limit).results;
}

/** Same matching as searchCivicRecords(), plus total/domain counts. */
export function searchCivicRecordsDetailed(
  query: string,
  domain?: CivicSearchDomain | 'all',
  limit = 50
): CivicSearchResponse {
  const emptyDomainCounts = Object.fromEntries(
    CIVIC_SEARCH_DOMAINS.map(value => [value, 0])
  ) as Record<CivicSearchDomain, number>;

  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) {
    return { results: [], total: 0, domainCounts: emptyDomainCounts };
  }

  // Strip filler words ("this is a test" -> "test") before this ever
  // reaches MiniSearch — combineWith: 'AND' requires every term to match
  // *something*, and a short/common filler word (especially a single
  // letter) prefix-matches enough of the corpus that keeping it as its own
  // AND-term lets coincidental intersections through. Ranking also uses
  // this stripped query, so an exact-identifier query like "please find
  // CHO" still gets the same exact-identifier bonus "CHO" alone would.
  const searchQuery = stripStopWords(normalizedQuery);

  const matches = searchIndex
    .search(searchQuery, {
      fuzzy: fuzzyForTerm,
      filter: result => {
        const document = documentById.get(String(result.id));
        return !domain || domain === 'all' || document?.domain === domain;
      },
    })
    .flatMap(result => {
      const document = documentById.get(String(result.id));
      return document ? [{ document, score: result.score }] : [];
    })
    .sort(
      (a, b) =>
        b.score * relevanceMultiplier(b.document, searchQuery) -
        a.score * relevanceMultiplier(a.document, searchQuery)
    );

  const domainCounts = matches.reduce((counts, { document }) => {
    counts[document.domain] += 1;
    return counts;
  }, emptyDomainCounts);

  const results = matches.slice(0, limit).map(({ document }) => {
    const {
      id,
      domain: resultDomain,
      kind,
      title,
      description,
      href,
      metadata,
    } = document;
    return {
      id,
      domain: resultDomain,
      kind,
      title,
      description,
      href,
      metadata,
    };
  });

  return { results, total: matches.length, domainCounts };
}
