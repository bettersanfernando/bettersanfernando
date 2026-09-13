import { z } from 'zod';
import manifestJson from '../generated/civic/manifest.json' with { type: 'json' };
import demographicsJson from '../generated/civic/demographics/barangays.json' with { type: 'json' };
import officesJson from '../generated/civic/directories/city-offices.json' with { type: 'json' };
import executiveOrdersJson from '../generated/civic/legislation/executive-orders.json' with { type: 'json' };
import ordinancesJson from '../generated/civic/legislation/ordinances.json' with { type: 'json' };
import resolutionsJson from '../generated/civic/legislation/resolutions.json' with { type: 'json' };
import { getAllProjectEvidence, getProjects } from './projects.ts';
import { getFullDisclosureMetadata } from './fullDisclosure.ts';
import { getOfficialDocumentsMetadata } from './officialDocuments.ts';
import { getProjectCostUtilizationMetadata } from './projectCostUtilization.ts';
import { getFinanceMetadata, getFinanceReports } from './finance.ts';

const DatasetPath = z.enum([
  'demographics/barangays.json',
  'demographics/demographic-profile.json',
  'directories/city-offices.json',
  'directories/government-structure-summary.json',
  'geography/barangays.geojson',
  'geography/city.geojson',
  'government/barangay-contacts.json',
  'government/hotlines.json',
  'government/official-links.json',
  'legislation/executive-orders.json',
  'legislation/ordinances.json',
  'legislation/resolutions.json',
  'finance/finance-reports.json',
  'finance/finance-observations.json',
  'projects/city-projects.json',
  'projects/project-cost-utilization.json',
  'projects/project-evidence.json',
  'services/services.json',
  'services/utilities-water-resources.json',
  'statistics/public-records-coverage.json',
  'transparency/full-disclosure.json',
  'transparency/official-documents.json',
]);

export const ManifestSchema = z
  .object({
    completeness_note: z.string(),
    datasets: z.record(
      DatasetPath,
      z
        .object({
          record_count: z.number().int().nonnegative(),
          schema_version: z.number().int(),
          sha256: z.string(),
        })
        .strict()
    ),
    export_version: z.string(),
    generated_from: z.array(z.string()),
    jurisdiction: z
      .object({
        name: z.string(),
        province: z.string(),
        psgc_code: z.string(),
      })
      .strict(),
    not_exported_in_this_release: z.array(z.string()),
    source_commit: z.string(),
    source_data_version: z.string(),
    sources: z.array(
      z
        .object({
          applies_to: z.array(z.string()),
          id: z.string(),
          name: z.string(),
          publisher: z.string(),
          reference_note: z.string(),
          url: z.url(),
        })
        .strict()
    ),
  })
  .strict();

const manifest = ManifestSchema.parse(manifestJson);
const demographics = z
  .object({
    source_publisher: z.string(),
    source_url: z.url(),
    census: z.string(),
    last_verified: z.string(),
  })
  .parse(demographicsJson);
const offices = z
  .object({
    last_verified: z.string(),
    offices: z.array(z.object({ source_urls: z.array(z.url()) })),
  })
  .parse(officesJson);
const executiveOrders = z
  .object({
    last_verified: z.string(),
    source_archive_url: z.url(),
  })
  .parse(executiveOrdersJson);
const ordinances = z
  .object({
    last_verified: z.string(),
    ordinances: z.array(
      z.object({
        official_page_url: z.url().optional(),
        reference_url: z.url().optional(),
      })
    ),
  })
  .parse(ordinancesJson);
const resolutions = z
  .object({
    last_verified: z.string(),
    resolutions: z.array(z.object({ reference_url: z.url().optional() })),
  })
  .parse(resolutionsJson);

export type TransparencySourceLink = Readonly<{
  label: string;
  url: string;
  type: 'internal' | 'official' | 'community';
}>;

export type PublishedSourceDomain = Readonly<{
  id:
    | 'projects'
    | 'project-evidence'
    | 'population'
    | 'geography'
    | 'city-offices'
    | 'executive-orders'
    | 'ordinances'
    | 'resolutions'
    | 'finance'
    | 'full-disclosure'
    | 'official-documents'
    | 'project-cost-utilization';
  name: string;
  description: string;
  authority: string;
  referencePeriod: string;
  lastVerified: string | null;
  recordCount: number;
  recordLabel: string;
  datasetPaths: readonly z.infer<typeof DatasetPath>[];
  links: readonly TransparencySourceLink[];
  coverageNote: string;
}>;

export type UnavailableSourceDomain = Readonly<{
  id: 'person-directories';
  name: string;
  status: 'NOT_EXPORTED' | 'NOT_VERIFIED';
  note: string;
}>;

function recordCount(path: z.infer<typeof DatasetPath>) {
  return manifest.datasets[path].record_count;
}

function uniqueLinks(
  urls: readonly string[],
  label: string
): TransparencySourceLink[] {
  return [...new Set(urls)].map((url, index) => ({
    label: urls.length === 1 ? label : `${label} ${index + 1}`,
    url,
    type: 'official',
  }));
}

export function getTransparencySourceInventory() {
  const fullDisclosure = getFullDisclosureMetadata();
  const officialDocuments = getOfficialDocumentsMetadata();
  const projects = getProjects();
  const projectCostUtilization = getProjectCostUtilizationMetadata(
    projects.length
  );
  const projectEvidence = getAllProjectEvidence();
  const projectYears = projects.map(project => project.year);
  const projectStatusDates = projects
    .map(project => project.status_as_of)
    .sort();
  const psa = manifest.sources.find(source => source.id === 'psa-psgc');
  const geometry = manifest.sources.find(
    source => source.id === 'psgc-shapefiles-community'
  );

  if (!psa || !geometry) {
    throw new Error('Required public geography source metadata is missing');
  }

  const publishedDomains: readonly PublishedSourceDomain[] = [
    {
      id: 'projects',
      name: 'City projects',
      description:
        'A bounded infrastructure and public-works project collection with lifecycle, location, procurement, and amount fields.',
      authority:
        'Primary official records from the City Government of San Fernando and other named public authorities',
      referencePeriod: `${Math.min(...projectYears)}–${Math.max(...projectYears)}; status dates through ${projectStatusDates.at(-1)}`,
      lastVerified: null,
      recordCount: recordCount('projects/city-projects.json'),
      recordLabel: 'project records',
      datasetPaths: ['projects/city-projects.json'],
      links: [
        {
          label: 'Browse published projects',
          url: '/projects',
          type: 'internal',
        },
      ],
      coverageNote:
        'Covers the verified infrastructure and public-works subset, not every City project or all historical activity.',
    },
    {
      id: 'project-evidence',
      name: 'Project evidence',
      description:
        'Record-level evidence supporting published project facts, including APP, invitation, bid-result, award, and monitoring stages.',
      authority:
        'Record-specific primary official publishers identified on each evidence entry',
      referencePeriod: 'Evidence attached to the current project export',
      lastVerified: null,
      recordCount: recordCount('projects/project-evidence.json'),
      recordLabel: 'evidence records',
      datasetPaths: ['projects/project-evidence.json'],
      links: [
        {
          label: 'Inspect record-level project evidence',
          url: '/projects/sources',
          type: 'internal',
        },
      ],
      coverageNote:
        'Authorities and links vary by documentary stage. This inventory does not repeat all evidence records.',
    },
    {
      id: 'project-cost-utilization',
      name: 'Project cost and utilization',
      description:
        'Source-reported, year-to-date cost-utilization observations (Total Cost Incurred to Date and physical completion) for a bounded subset of published projects.',
      authority: 'City Government of San Fernando, Pampanga',
      referencePeriod: 'Year-to-date observations, 2022–2026',
      lastVerified: projectCostUtilization.lastVerified,
      recordCount: recordCount('projects/project-cost-utilization.json'),
      recordLabel: 'observation records',
      datasetPaths: ['projects/project-cost-utilization.json'],
      links: [
        {
          label: 'Browse Project Cost & Utilization',
          url: '/statistics/project-spending',
          type: 'internal',
        },
      ],
      coverageNote: projectCostUtilization.coverageLimitation,
    },
    {
      id: 'population',
      name: 'Population and barangay demographics',
      description:
        'Official city and barangay population, names, PSGC codes, and urban or rural classifications.',
      authority: demographics.source_publisher,
      referencePeriod: demographics.census,
      lastVerified: demographics.last_verified,
      recordCount: recordCount('demographics/barangays.json'),
      recordLabel: 'barangay records',
      datasetPaths: ['demographics/barangays.json'],
      links: [
        {
          label: 'View the official PSA population and PSGC source',
          url: demographics.source_url,
          type: 'official',
        },
        {
          label: 'Explore population statistics',
          url: '/statistics/population',
          type: 'internal',
        },
      ],
      coverageNote:
        'Uses the 2024 POPCEN baseline: 377,534 residents across all 35 barangays.',
    },
    {
      id: 'geography',
      name: 'City and barangay geography',
      description:
        'One city boundary and 35 barangay polygon boundaries matched to official PSGC identity records.',
      authority:
        'Community-maintained polygon geometry; Philippine Statistics Authority for PSGC identity',
      referencePeriod:
        'Polygon geometry as of 31 December 2023; PSGC identity current to the export',
      lastVerified: demographics.last_verified,
      recordCount:
        recordCount('geography/city.geojson') +
        recordCount('geography/barangays.geojson'),
      recordLabel: 'geographic features',
      datasetPaths: ['geography/city.geojson', 'geography/barangays.geojson'],
      links: [
        {
          label: 'View the community-maintained polygon source',
          url: geometry.url,
          type: 'community',
        },
        {
          label: 'View the official PSA identity source',
          url: psa.url,
          type: 'official',
        },
      ],
      coverageNote:
        'The polygon source is not an official PSA shapefile. PSA supports the codes, names, and classifications—not the polygon geometry.',
    },
    {
      id: 'city-offices',
      name: 'City offices',
      description:
        'Verified office identities, locations, institutional contacts, facilities, and record-specific public source links.',
      authority: 'City Government of San Fernando, Pampanga',
      referencePeriod: 'Current directory snapshot',
      lastVerified: offices.last_verified,
      recordCount: recordCount('directories/city-offices.json'),
      recordLabel: 'office records',
      datasetPaths: ['directories/city-offices.json'],
      links: [
        ...uniqueLinks(
          offices.offices.flatMap(office => office.source_urls),
          'View City Government office source'
        ),
        {
          label: 'Browse the verified office directory',
          url: '/government/offices',
          type: 'internal',
        },
      ],
      coverageNote:
        'A bounded directory of published office records; it is not presented as a complete organizational chart.',
    },
    {
      id: 'executive-orders',
      name: 'Executive orders',
      description:
        'Executive-order metadata and public links captured from the visible City Government archive.',
      authority: 'City Government of San Fernando, Pampanga',
      referencePeriod:
        '2013 archive entries visible in the audited source, plus 2 subject-verified 2023 cross-references',
      lastVerified: executiveOrders.last_verified,
      recordCount: recordCount('legislation/executive-orders.json'),
      recordLabel: 'executive orders',
      datasetPaths: ['legislation/executive-orders.json'],
      links: [
        {
          label: 'View the official executive-orders archive',
          url: executiveOrders.source_archive_url,
          type: 'official',
        },
        {
          label: 'Browse published executive orders',
          url: '/legislation/executive-orders',
          type: 'internal',
        },
      ],
      coverageNote:
        'Complete capture of the 11 entries visible in the audited archive, plus 2 subject-verified 2023 cross-references, not a claim of complete historical coverage.',
    },
    {
      id: 'ordinances',
      name: 'Ordinances',
      description:
        'Verified ordinance metadata with full text where an official document has been recovered.',
      authority:
        'City Government primary sources and record-specific secondary official references',
      referencePeriod: 'Verified records currently included in the export',
      lastVerified: ordinances.last_verified,
      recordCount: recordCount('legislation/ordinances.json'),
      recordLabel: 'ordinances',
      datasetPaths: ['legislation/ordinances.json'],
      links: uniqueLinks(
        ordinances.ordinances.flatMap(record =>
          [record.official_page_url, record.reference_url].filter(
            (url): url is string => Boolean(url)
          )
        ),
        'View public ordinance source'
      ),
      coverageNote:
        'Eleven verified records are published; two include full text and nine currently establish metadata or existence only.',
    },
    {
      id: 'resolutions',
      name: 'Resolutions',
      description:
        'A bounded, subject-verified resolution subset identified by official City cross-references, without full text or exact adoption dates.',
      authority: 'City Government primary official cross-references',
      referencePeriod:
        'Subject-verified records currently included in the export',
      lastVerified: resolutions.last_verified,
      recordCount: recordCount('legislation/resolutions.json'),
      recordLabel: 'resolutions',
      datasetPaths: ['legislation/resolutions.json'],
      links: [
        ...uniqueLinks(
          resolutions.resolutions
            .map(record => record.reference_url)
            .filter((url): url is string => Boolean(url)),
          'View public resolution cross-reference'
        ),
        {
          label: 'Browse published resolutions',
          url: '/legislation/resolutions',
          type: 'internal',
        },
      ],
      coverageNote:
        'Two subject-verified records only — never a claim of the number of resolutions the City has adopted.',
    },
    {
      id: 'finance',
      name: 'City Finances',
      description:
        'Selected official aggregate finance reports and their non-additive, source-reported observations.',
      authority: 'City Government of San Fernando, Pampanga',
      referencePeriod: `${Math.min(...getFinanceReports().map(report => report.reporting_year))}–${Math.max(...getFinanceReports().map(report => report.reporting_year))}`,
      lastVerified: getFinanceMetadata().lastVerified,
      recordCount: recordCount('finance/finance-reports.json'),
      recordLabel: 'finance reports',
      datasetPaths: [
        'finance/finance-reports.json',
        'finance/finance-observations.json',
      ],
      links: [
        {
          label: 'Browse City Finances',
          url: '/transparency/finance',
          type: 'internal',
        },
      ],
      coverageNote: getFinanceMetadata().overallPublicLimitation,
    },
    {
      id: 'full-disclosure',
      name: 'Full Disclosure Policy reports',
      description:
        'Individually verified Full Disclosure Policy report metadata: Annual Procurement Plans, Procurement Monitoring Reports, and Trust Fund and Special Education Fund utilization reports.',
      authority: 'City Government of San Fernando, Pampanga',
      referencePeriod: '2023–2026',
      lastVerified: fullDisclosure.lastVerified,
      recordCount: recordCount('transparency/full-disclosure.json'),
      recordLabel: 'report records',
      datasetPaths: ['transparency/full-disclosure.json'],
      links: [
        {
          label: 'Browse Full Disclosure Reports',
          url: '/transparency/full-disclosure',
          type: 'internal',
        },
      ],
      coverageNote: fullDisclosure.overallPublicLimitation,
    },
    {
      id: 'official-documents',
      name: 'Official documents',
      description:
        'A bounded index of Citizen’s Charters, business forms, and privacy documents from verified official sources.',
      authority: 'City Government of San Fernando, Pampanga',
      referencePeriod:
        'Current and superseded documents in the reviewed export',
      lastVerified: officialDocuments.lastVerified,
      recordCount: recordCount('transparency/official-documents.json'),
      recordLabel: 'official documents',
      datasetPaths: ['transparency/official-documents.json'],
      links: [
        {
          label: 'Browse Official Documents',
          url: '/transparency/documents',
          type: 'internal',
        },
      ],
      coverageNote: officialDocuments.overallPublicLimitation,
    },
  ];

  if (projects.length !== publishedDomains[0].recordCount) {
    throw new Error('Project accessor and public manifest counts do not match');
  }
  if (projectEvidence.length !== publishedDomains[1].recordCount) {
    throw new Error(
      'Project evidence accessor and public manifest counts do not match'
    );
  }

  const unavailableDomains: readonly UnavailableSourceDomain[] = [
    {
      id: 'person-directories',
      name: 'BHERT and person-level directories',
      status: 'NOT_EXPORTED',
      note: 'Not currently included in the public frontend export.',
    },
  ];

  return Object.freeze({
    release: Object.freeze({
      exportVersion: manifest.export_version,
      sourceDataVersion: manifest.source_data_version,
      datasetCount: Object.keys(manifest.datasets).length,
      datasetNames: Object.freeze(Object.keys(manifest.datasets)),
      completenessNote: manifest.completeness_note,
    }),
    publishedDomains: Object.freeze(publishedDomains),
    unavailableDomains: Object.freeze(unavailableDomains),
  });
}
