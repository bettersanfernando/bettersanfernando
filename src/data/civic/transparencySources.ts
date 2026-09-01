import { z } from 'zod';
import manifestJson from '../generated/civic/manifest.json' with { type: 'json' };
import demographicsJson from '../generated/civic/demographics/barangays.json' with { type: 'json' };
import officesJson from '../generated/civic/directories/city-offices.json' with { type: 'json' };
import executiveOrdersJson from '../generated/civic/legislation/executive-orders.json' with { type: 'json' };
import ordinancesJson from '../generated/civic/legislation/ordinances.json' with { type: 'json' };
import { getAllProjectEvidence, getProjects } from './projects.ts';

const DatasetPath = z.enum([
  'demographics/barangays.json',
  'directories/city-offices.json',
  'geography/barangays.geojson',
  'geography/city.geojson',
  'legislation/executive-orders.json',
  'legislation/ordinances.json',
  'legislation/resolutions.json',
  'projects/city-projects.json',
  'projects/project-evidence.json',
]);

const ManifestSchema = z.object({
  completeness_note: z.string(),
  datasets: z.record(
    DatasetPath,
    z.object({ record_count: z.number().int().nonnegative() })
  ),
  export_version: z.string(),
  source_data_version: z.string(),
  sources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      publisher: z.string(),
      reference_note: z.string(),
      url: z.url(),
    })
  ),
});

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
    | 'ordinances';
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
  id: 'finance' | 'full-disclosure' | 'person-directories' | 'resolutions';
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
  const projects = getProjects();
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
      referencePeriod: '2013 archive entries visible in the audited source',
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
        'Complete capture of the 11 entries visible in the audited archive, not a claim of complete historical coverage.',
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
        'Six verified records are published; two include full text and four currently establish metadata or existence only.',
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
      id: 'finance',
      name: 'Finance aggregates',
      status: 'NOT_EXPORTED',
      note: 'Not currently included in the public frontend export.',
    },
    {
      id: 'full-disclosure',
      name: 'Full Disclosure archive',
      status: 'NOT_EXPORTED',
      note: 'Not currently included in the public frontend export.',
    },
    {
      id: 'person-directories',
      name: 'BHERT and person-level directories',
      status: 'NOT_EXPORTED',
      note: 'Not currently included in the public frontend export.',
    },
    {
      id: 'resolutions',
      name: 'Resolutions',
      status: 'NOT_VERIFIED',
      note: 'No individual resolution currently meets the publication standard for this frontend release.',
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
