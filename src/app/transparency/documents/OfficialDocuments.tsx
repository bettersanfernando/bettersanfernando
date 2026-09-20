'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Search,
  SearchX,
  ShieldCheck,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getOfficialDocuments,
  getOfficialDocumentsMetadata,
  OfficialDocumentStatus,
  OfficialDocumentType,
  type OfficialDocument,
} from '../../../data/civic/officialDocuments';
import { formatIsoDate, titleCaseEnum } from '../../../lib/utils';

const eyebrowTracking = { letterSpacing: '0.08em' };

const selectClass =
  'h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20';

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
  },
  {
    title: 'Procurement and project records',
    description: 'Explore procurement records and their linked city projects.',
    links: [
      { label: 'Browse procurement', href: '/procurement' },
      { label: 'Browse projects', href: '/projects' },
    ],
  },
  {
    title: 'City services and Charter procedures',
    description:
      'Find reviewed service requirements, steps, fees, and offices.',
    links: [{ label: 'Browse city services', href: '/services' }],
  },
] as const;

function formatVerifiedDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`));
}

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

  const privacyDocCount =
    (metadata.documentTypeBreakdown['PRIVACY_MANUAL'] ?? 0) +
    (metadata.documentTypeBreakdown['PRIVACY_POLICY'] ?? 0) +
    (metadata.documentTypeBreakdown['PRIVACY_NOTICE'] ?? 0);

  return (
    <main className="flex-grow bg-white">
      {/* 1. Editorial Hero & Collection Scope Intro */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Transparency', href: '/transparency' },
              { label: 'Official Documents' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                TRANSPARENCY · OFFICIAL DOCUMENTS
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl">
                Official Documents
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
                Browse a verified, bounded collection of City Government
                documents with direct links to official pages and available
                files.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href="#document-library"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition hover:bg-[#0052BC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB]"
                >
                  <span>Browse document library</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/transparency"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition hover:text-[#0052BC] hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  <span>Transparency overview</span>
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                COLLECTION SCOPE
              </p>
              <h2 className="mt-1 text-sm font-bold text-gray-950">
                Verified, bounded index
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                BetterSanFernando currently publishes {metadata.recordCount}{' '}
                verified document records across selected City document
                collections. Related legislation, Full Disclosure, procurement,
                projects, and services remain in their own canonical sections.
              </p>
              <p className="mt-3 border-t border-gray-200/80 pt-2 text-[11px] text-gray-500">
                Independent and community-run. Not an official City Government
                website.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-12 px-4 pb-20 sm:space-y-16 sm:pb-24 lg:pb-28">
        {/* 2. Collection Snapshot */}
        <section aria-labelledby="snapshot-heading" className="pt-8 sm:pt-10">
          <h2 id="snapshot-heading" className="sr-only">
            Collection snapshot
          </h2>
          <dl className="grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 py-6 sm:grid-cols-2 sm:divide-y-0 sm:gap-6 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:py-7">
            <div className="pb-4 sm:pb-0 lg:pr-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Published documents
              </dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {metadata.recordCount}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Verified official records
              </p>
            </div>

            <div className="py-4 sm:py-0 lg:px-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Citizen’s Charters
              </dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {metadata.documentTypeBreakdown['CITIZENS_CHARTER'] ?? 0}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Current &amp; reference editions
              </p>
            </div>

            <div className="py-4 sm:py-0 lg:px-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Business Forms
              </dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {metadata.documentTypeBreakdown['BUSINESS_FORM'] ?? 0}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Permit &amp; renewal templates
              </p>
            </div>

            <div className="pt-4 sm:pt-0 lg:pl-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Privacy documents
              </dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {privacyDocCount}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Manual, policy &amp; notice
              </p>
            </div>
          </dl>
          <p className="mt-3 text-xs text-gray-500 sm:text-sm">
            Last verified: {formatVerifiedDate(metadata.lastVerified)}
          </p>
        </section>

        {/* 3. Collection Scope Explanation */}
        <section aria-labelledby="scope-explanation-heading">
          <div className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              COLLECTION SCOPE
            </p>
            <h2
              id="scope-explanation-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Understanding this collection
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  What belongs here
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  This index contains selected standalone official documents
                  issued by City Government offices, including Citizen’s
                  Charters, business licensing forms, and data privacy
                  instruments.
                </p>
              </div>

              <div className="md:border-l md:border-gray-200 md:pl-8">
                <h3 className="text-base font-bold text-gray-950">
                  What stays elsewhere
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Laws and issuances, Full Disclosure filings, procurement and
                  contract awards, project observations, and city service
                  catalogs remain in their canonical BetterSanFernando sections
                  rather than being duplicated here.
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200/80 pt-4 text-xs leading-relaxed text-gray-500 sm:text-sm">
              <p className="font-semibold text-gray-700">
                Document provenance note:
              </p>
              <p className="mt-1">{metadata.overallPublicLimitation}</p>
            </div>
          </div>
        </section>

        {/* 4. Document Library Toolbar and Results Count */}
        <section id="document-library" aria-labelledby="library-heading">
          <div className="mb-3">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              DOCUMENT LIBRARY
            </p>
            <h2 id="library-heading" className="sr-only">
              Browse official documents
            </h2>
          </div>

          <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_14rem_12rem_auto] md:items-end">
              <div>
                <label
                  htmlFor="documents-search"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Search documents
                </label>
                <div className="relative mt-1.5">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="documents-search"
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Search title, type, office, collection, edition..."
                    className="h-10 w-full rounded-sm border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="document-type-select"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Document type
                </label>
                <div className="mt-1.5">
                  <select
                    id="document-type-select"
                    value={type}
                    onChange={event => setType(event.target.value)}
                    className={selectClass}
                  >
                    <option value="ALL">All document types</option>
                    {OfficialDocumentType.options.map(option => (
                      <option key={option} value={option}>
                        {titleCaseEnum(option)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="status-select"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Status
                </label>
                <div className="mt-1.5">
                  <select
                    id="status-select"
                    value={status}
                    onChange={event => setStatus(event.target.value)}
                    className={selectClass}
                  >
                    <option value="ALL">All statuses</option>
                    {OfficialDocumentStatus.options.map(option => (
                      <option key={option} value={option}>
                        {titleCaseEnum(option)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasFilters}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-4 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB] disabled:cursor-not-allowed disabled:opacity-45 md:w-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-600 sm:text-sm" aria-live="polite">
              Showing {filtered.length} of {metadata.recordCount} documents
            </p>
          </div>
        </section>

        {/* 5. Document Groups */}
        <section aria-labelledby="groups-list-heading">
          <h2 id="groups-list-heading" className="sr-only">
            Official document groups
          </h2>

          {filtered.length === 0 ? (
            <div className="rounded-sm border border-dashed border-gray-300 bg-white p-8 text-center sm:p-12">
              <SearchX
                className="mx-auto h-8 w-8 text-gray-400"
                aria-hidden="true"
              />
              <p className="mt-2 text-base font-semibold text-gray-950">
                No documents match these filters
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Try another search or reset the filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-12 sm:space-y-16">
              {GROUPS.map(group => {
                const groupRecords = filtered.filter(record =>
                  group.types.includes(record.document_type)
                );
                if (groupRecords.length === 0) return null;

                return (
                  <div
                    key={group.title}
                    aria-labelledby={`group-${group.types[0]}`}
                  >
                    {/* Group Header */}
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex items-baseline justify-between">
                        <h3
                          id={`group-${group.types[0]}`}
                          className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl"
                        >
                          {group.title}
                        </h3>
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gray-500 sm:text-sm">
                          {groupRecords.length}{' '}
                          {groupRecords.length === 1 ? 'document' : 'documents'}
                        </span>
                      </div>
                      {group.types[0] === 'CITIZENS_CHARTER' && (
                        <p className="mt-1.5 text-xs text-gray-600 sm:text-sm">
                          The 2026 2nd Edition is the current published Charter.
                          Earlier editions are retained for reference and marked
                          superseded.
                        </p>
                      )}
                    </div>

                    {/* Group Flat List */}
                    <ol className="divide-y divide-gray-200 border-b border-gray-200 bg-white sm:border-x sm:rounded-sm">
                      {groupRecords.map(record => {
                        const statedDate =
                          record.publication_date ?? record.document_date;

                        return (
                          <li
                            key={record.id}
                            id={record.slug}
                            className="scroll-mt-24 p-5 transition-colors hover:bg-[#F3F6FB]/50 sm:p-6"
                          >
                            <article aria-labelledby={`${record.id}-title`}>
                              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
                                {/* Main Document Content */}
                                <div className="min-w-0">
                                  {/* Header: Type + Status */}
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700">
                                      {titleCaseEnum(record.document_type)}
                                    </span>
                                    {record.status === 'CURRENT' ? (
                                      <span className="inline-flex items-center gap-1 rounded-xs bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                        <ShieldCheck
                                          className="h-3.5 w-3.5 text-emerald-600"
                                          aria-hidden="true"
                                        />
                                        Current
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-xs bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                        Superseded &middot; Reference only
                                      </span>
                                    )}
                                  </div>

                                  {/* Document Title */}
                                  <h4
                                    id={`${record.id}-title`}
                                    className="mt-2 text-base font-bold leading-snug text-gray-950 sm:text-lg"
                                  >
                                    {record.title}
                                  </h4>

                                  {/* Issuing Office */}
                                  <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                                    {record.issuing_office}
                                  </p>

                                  {/* Structured Metadata */}
                                  <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs sm:text-sm">
                                    {record.edition && (
                                      <div>
                                        <dt className="text-gray-500">
                                          Edition
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                          {record.edition}
                                        </dd>
                                      </div>
                                    )}
                                    {record.revision && (
                                      <div>
                                        <dt className="text-gray-500">
                                          Revision
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                          {record.revision}
                                        </dd>
                                      </div>
                                    )}
                                    <div>
                                      <dt className="text-gray-500">Date</dt>
                                      <dd className="font-medium text-gray-900">
                                        {statedDate
                                          ? formatIsoDate(statedDate)
                                          : 'Date not stated'}
                                      </dd>
                                    </div>
                                    {record.covered_year && (
                                      <div>
                                        <dt className="text-gray-500">
                                          Covered year
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                          {record.covered_year}
                                        </dd>
                                      </div>
                                    )}
                                    {record.document_number && (
                                      <div>
                                        <dt className="text-gray-500">
                                          Document number
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                          {record.document_number}
                                        </dd>
                                      </div>
                                    )}
                                  </dl>
                                </div>

                                {/* Right Rail: Source & Document */}
                                <div className="border-t border-gray-200 pt-4 text-xs sm:text-sm lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    SOURCE &amp; DOCUMENT
                                  </p>
                                  <p className="mt-1.5 text-gray-700">
                                    <span className="text-gray-500">
                                      Collection:
                                    </span>{' '}
                                    {titleCaseEnum(record.source_collection)}
                                  </p>
                                  <p className="mt-0.5 text-gray-600">
                                    <span className="text-gray-500">
                                      File format:
                                    </span>{' '}
                                    {record.file_type}
                                  </p>

                                  <div className="mt-3.5 flex flex-col items-start gap-2 font-semibold">
                                    <a
                                      href={record.official_page_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={`View the official page for ${record.title} (opens in a new tab)`}
                                      className="inline-flex items-center gap-1 text-[#0066EB] hover:text-[#0052BC] hover:underline"
                                    >
                                      View official page
                                      <ExternalLink
                                        className="h-3.5 w-3.5 shrink-0"
                                        aria-hidden="true"
                                      />
                                    </a>
                                    {record.official_attachment_url && (
                                      <a
                                        href={record.official_attachment_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Open official ${record.file_type} for ${record.title} (opens in a new tab)`}
                                        className="inline-flex items-center gap-1 text-[#0066EB] hover:text-[#0052BC] hover:underline"
                                      >
                                        Open official {record.file_type}
                                        <ExternalLink
                                          className="h-3.5 w-3.5 shrink-0"
                                          aria-hidden="true"
                                        />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </article>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 6. Closing Provenance Section */}
        <section
          aria-labelledby="about-index-heading"
          className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            ABOUT THIS INDEX
          </p>
          <h2
            id="about-index-heading"
            className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
          >
            How to read this document library
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-3 md:gap-8">
            <div>
              <h3 className="text-base font-bold text-gray-950">
                Verification
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Each published document is directly tied to an official City
                Government webpage and verified source attachment file.
              </p>
            </div>

            <div className="md:border-l md:border-gray-200 md:pl-8">
              <h3 className="text-base font-bold text-gray-950">Coverage</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                This index is intentionally bounded to standalone reference
                documents and does not duplicate records cataloged in other
                BetterSanFernando archives.
              </p>
            </div>

            <div className="md:border-l md:border-gray-200 md:pl-8">
              <h3 className="text-base font-bold text-gray-950">Currency</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Documents marked CURRENT reflect the in-effect editions in this
                dataset. Superseded documents are retained for reference where
                officially accessible.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Keep Exploring (Moved from top to bottom) */}
        <section aria-labelledby="keep-exploring-heading">
          <div className="border-t border-gray-200 pt-10 sm:pt-12">
            <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
              KEEP EXPLORING
            </p>
            <h2
              id="keep-exploring-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Related public records
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {RELATED_RECORDS.map(item => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
                >
                  <div>
                    <h3 className="text-sm font-bold text-gray-950">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {item.links.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] hover:underline"
                      >
                        <span>{link.label}</span>
                        <ArrowRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
