import MiniSearch from 'minisearch';
import { getBarangays } from './demographics.ts';
import { getCityOffices } from './government.ts';
import {
  getExecutiveOrders,
  getOrdinances,
  hasLegislationFullText,
  type LegislationRecord,
} from './legislation.ts';
import {
  getAllProjectEvidence,
  getProjectById,
  getProjects,
} from './projects.ts';

export const CIVIC_SEARCH_DOMAINS = [
  'projects',
  'barangays',
  'government',
  'legislation',
  'sources',
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

function freezeDocument(
  document: Omit<CivicSearchDocument, 'searchableText'>
): CivicSearchDocument {
  return Object.freeze({
    ...document,
    searchableText: [
      document.titleText,
      document.identifiers,
      document.descriptionText,
      document.location,
      document.metadata,
    ]
      .filter(Boolean)
      .join(' '),
  });
}

function composeSearchDocuments(): CivicSearchDocument[] {
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
      descriptionText: 'government city office institutional directory',
      location: office.physical_address ?? '',
    })
  );

  const executiveOrders = getExecutiveOrders().map(record =>
    freezeDocument({
      id: `executive-order:${record.id}`,
      domain: 'legislation',
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
      descriptionText: [record.issuing_body, record.issuer_title]
        .filter(Boolean)
        .join(' '),
      location: '',
    })
  );

  const ordinances = getOrdinances().map(record =>
    freezeDocument({
      id: `ordinance:${record.id}`,
      domain: 'legislation',
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

  const sources = getAllProjectEvidence().flatMap(evidence => {
    const project = getProjectById(evidence.project_id);
    if (!project) return [];

    const stage = titleCase(evidence.stage);
    return [
      freezeDocument({
        id: `source:${evidence.id}`,
        domain: 'sources',
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
        descriptionText: [stage, project.project_name].join(' '),
        location: project.barangay ?? '',
      }),
    ];
  });

  return [
    ...projects,
    ...barangays,
    ...offices,
    ...executiveOrders,
    ...ordinances,
    ...sources,
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
    'location',
    'descriptionText',
    'metadata',
  ],
  idField: 'id',
  searchOptions: {
    boost: {
      titleText: 6,
      identifiers: 7,
      location: 3,
      descriptionText: 1,
      metadata: 2,
    },
    combineWith: 'AND',
    prefix: true,
  },
});

searchIndex.addAll(searchDocuments);

export function getSearchDocuments(): readonly CivicSearchDocument[] {
  return searchDocuments;
}

export function searchCivicRecords(
  query: string,
  domain?: CivicSearchDomain | 'all',
  limit = 50
): CivicSearchResult[] {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return [];

  return searchIndex
    .search(normalizedQuery, {
      fuzzy: normalizedQuery.length >= 4 ? 0.15 : false,
      filter: result => {
        const document = documentById.get(String(result.id));
        return !domain || domain === 'all' || document?.domain === domain;
      },
    })
    .slice(0, limit)
    .flatMap(result => {
      const document = documentById.get(String(result.id));
      if (!document) return [];
      const {
        id,
        domain: resultDomain,
        kind,
        title,
        description,
        href,
        metadata,
      } = document;
      return [
        {
          id,
          domain: resultDomain,
          kind,
          title,
          description,
          href,
          metadata,
        },
      ];
    });
}
