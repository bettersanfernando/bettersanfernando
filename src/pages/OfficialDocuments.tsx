import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  ExternalLink,
  FileText,
  FolderKanban,
  Landmark,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent } from '@bettergov/kapwa/card';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getOfficialDocuments,
  getOfficialDocumentsMetadata,
  OfficialDocumentStatus,
  OfficialDocumentType,
  type OfficialDocument,
} from '../data/civic/officialDocuments';
import { formatIsoDate, titleCaseEnum } from '../lib/utils';

const GROUPS: ReadonlyArray<{
  title: string;
  types: readonly OfficialDocument['document_type'][];
}> = [
  {
    title: 'Citizen’s Charters',
    types: ['CITIZENS_CHARTER'],
  },
  {
    title: 'Business Forms',
    types: ['BUSINESS_FORM'],
  },
  {
    title: 'Privacy Documents',
    types: ['PRIVACY_MANUAL', 'PRIVACY_POLICY', 'PRIVACY_NOTICE'],
  },
];

const RELATED_RECORDS = [
  {
    title: 'Laws and issuances',
    description: 'Browse verified executive orders and ordinances.',
    links: [{ label: 'Browse legislation', href: '/legislation' }],
    icon: Landmark,
  },
  {
    title: 'Full Disclosure reports',
    description:
      'Review the bounded collection of published disclosure reports.',
    links: [
      {
        label: 'Browse Full Disclosure',
        href: '/transparency/full-disclosure',
      },
    ],
    icon: FileText,
  },
  {
    title: 'Procurement and project records',
    description: 'Explore procurement records and their linked city projects.',
    links: [
      { label: 'Browse procurement', href: '/procurement' },
      { label: 'Browse projects', href: '/projects' },
    ],
    icon: FolderKanban,
  },
  {
    title: 'City services and Charter procedures',
    description:
      'Find reviewed service requirements, steps, fees, and offices.',
    links: [{ label: 'Browse city services', href: '/services' }],
    icon: ShieldCheck,
  },
] as const;

function searchableText(record: OfficialDocument) {
  return [
    record.title,
    record.document_type,
    record.issuing_office,
    record.source_collection,
    record.edition,
    record.revision,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase();
}

function DocumentCard({ record }: { record: OfficialDocument }) {
  const statedDate = record.publication_date ?? record.document_date;

  return (
    <article id={record.slug} className="scroll-mt-24">
      <Card className="h-full">
        <CardContent className="flex h-full flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-800">
              {titleCaseEnum(record.document_type)}
            </span>
            <span className="rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs font-bold text-gray-800">
              {record.status}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-bold leading-6 text-gray-900">
            {record.title}
          </h3>

          <dl className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
            {record.edition && (
              <div>
                <dt className="font-semibold text-gray-900">Edition</dt>
                <dd>{record.edition}</dd>
              </div>
            )}
            {record.revision && (
              <div>
                <dt className="font-semibold text-gray-900">Revision</dt>
                <dd>{record.revision}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold text-gray-900">Date</dt>
              <dd>
                {statedDate ? formatIsoDate(statedDate) : 'Date not stated'}
              </dd>
            </div>
            {record.covered_year && (
              <div>
                <dt className="font-semibold text-gray-900">Covered year</dt>
                <dd>{record.covered_year}</dd>
              </div>
            )}
            {record.document_number && (
              <div>
                <dt className="font-semibold text-gray-900">Document number</dt>
                <dd>{record.document_number}</dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="font-semibold text-gray-900">Issuing office</dt>
              <dd>{record.issuing_office}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-gray-900">Source collection</dt>
              <dd>{titleCaseEnum(record.source_collection)}</dd>
            </div>
          </dl>

          <div className="mt-auto flex flex-wrap gap-3 pt-5">
            <a
              href={record.official_page_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View the official page for ${record.title} (opens in a new tab)`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary-300 px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              View official page
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            {record.official_attachment_url && (
              <a
                href={record.official_attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${record.title} (opens in a new tab)`}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-700 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                Open document
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </article>
  );
}

export default function OfficialDocuments() {
  const records = getOfficialDocuments();
  const metadata = getOfficialDocumentsMetadata();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return records.filter(
      record =>
        (!normalizedQuery ||
          searchableText(record).includes(normalizedQuery)) &&
        (type === 'ALL' || record.document_type === type) &&
        (status === 'ALL' || record.status === status)
    );
  }, [query, records, status, type]);

  const hasFilters = Boolean(query || type !== 'ALL' || status !== 'ALL');

  function resetFilters() {
    setQuery('');
    setType('ALL');
    setStatus('ALL');
  }

  return (
    <>
      <SEO
        title="Official Documents"
        description="A verified partial collection of official City Government documents, with links to related public-record collections."
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Transparency', href: '/transparency' },
                { label: 'Official Documents' },
              ]}
            />
            <h1 className="text-3xl font-bold tracking-[-0.02em] text-gray-900 md:text-5xl">
              Official Documents
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-7 text-gray-700">
              A verified partial collection of official City Government
              documents, organized alongside links to related public records.
            </p>
            <div className="mt-6 max-w-4xl rounded-xl border border-warning-200 bg-warning-50 p-5 text-sm leading-6 text-warning-950">
              <p className="font-bold">Collection limitation</p>
              <p className="mt-1">{metadata.overallPublicLimitation}</p>
            </div>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-10"
          aria-labelledby="related-heading"
        >
          <h2 id="related-heading" className="text-2xl font-bold text-gray-900">
            Browse related public records
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
            These records remain in their existing canonical collections.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {RELATED_RECORDS.map(item => (
              <Card key={item.title} className="h-full">
                <CardContent>
                  <item.icon
                    className="h-5 w-5 text-primary-700"
                    aria-hidden="true"
                  />
                  <h3 className="mt-3 font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-700">
                    {item.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4">
                    {item.links.map(link => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section
          className="border-t border-gray-200 bg-white"
          aria-labelledby="library-heading"
        >
          <div className="container mx-auto px-4 py-10 md:py-14">
            <h2
              id="library-heading"
              className="text-2xl font-bold text-gray-900"
            >
              Document library
            </h2>
            <div className="mt-5 grid gap-4 rounded-xl bg-primary-900 p-4 text-white md:grid-cols-[minmax(15rem,1fr)_14rem_12rem_auto] md:items-end">
              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Search documents
                </span>
                <span className="relative block">
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    className="min-h-11 w-full rounded-lg bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                  />
                </span>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Document type
                </span>
                <select
                  value={type}
                  onChange={event => setType(event.target.value)}
                  className="min-h-11 w-full rounded-lg bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                >
                  <option value="ALL">All document types</option>
                  {OfficialDocumentType.options.map(option => (
                    <option key={option} value={option}>
                      {titleCaseEnum(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">Status</span>
                <select
                  value={status}
                  onChange={event => setStatus(event.target.value)}
                  className="min-h-11 w-full rounded-lg bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                >
                  <option value="ALL">All statuses</option>
                  {OfficialDocumentStatus.options.map(option => (
                    <option key={option} value={option}>
                      {titleCaseEnum(option)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasFilters}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary-400 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
              </button>
            </div>
            <p
              className="mt-4 text-sm font-semibold text-gray-800"
              aria-live="polite"
            >
              Showing {filtered.length} of {metadata.recordCount} documents
            </p>

            {filtered.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-5 py-12 text-center">
                <p className="font-semibold text-gray-900">
                  No documents match these filters
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Try another search or reset the filters.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-12">
                {GROUPS.map(group => {
                  const groupRecords = filtered.filter(record =>
                    group.types.includes(record.document_type)
                  );
                  if (groupRecords.length === 0) return null;
                  return (
                    <section
                      key={group.title}
                      aria-labelledby={`group-${group.types[0]}`}
                    >
                      <h2
                        id={`group-${group.types[0]}`}
                        className="text-2xl font-bold text-gray-900"
                      >
                        {group.title}
                      </h2>
                      {group.types[0] === 'CITIZENS_CHARTER' && (
                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          The 2026 2nd Edition is current. Earlier editions
                          below are clearly marked superseded.
                        </p>
                      )}
                      <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        {groupRecords.map(record => (
                          <DocumentCard key={record.id} record={record} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
