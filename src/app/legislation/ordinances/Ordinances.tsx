'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import {
  ArrowDown,
  ArrowRight,
  ExternalLink,
  FileCheck2,
  FileText,
  RotateCcw,
  Search,
  SearchX,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getLegislationSourceUrl,
  getOrdinances,
  getOrdinancesMetadata,
  hasLegislationFullText,
  type LegislationRecord,
} from '../../../data/civic/legislation';

type AvailabilityFilter = 'all' | 'full-text' | 'reference-only';
type SortOrder = 'newest' | 'oldest' | 'identifier';

const eyebrowTracking = { letterSpacing: '0.08em' };

const selectClass =
  'h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20';

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

function getDisplayTitle(ordinance: LegislationRecord): string | null {
  return ordinance.official_title ?? ordinance.official_alias ?? null;
}

function matchesQuery(ordinance: LegislationRecord, query: string): boolean {
  const normalizedQuery = query.toLowerCase();

  return [
    ordinance.document_number,
    ordinance.official_title,
    ordinance.official_alias,
    ordinance.described_context,
    ordinance.described_subject,
    ordinance.year.toString(),
  ].some(value => value?.toLowerCase().includes(normalizedQuery));
}

function getSourceAuthorityLabel(ordinance: LegislationRecord): string {
  return ordinance.source_authority === 'PRIMARY_OFFICIAL'
    ? 'Primary official source'
    : 'Secondary official source';
}

const ordinances = getOrdinances();
const metadata = getOrdinancesMetadata();
const fullTextCount = ordinances.filter(hasLegislationFullText).length;
const referenceOnlyCount = ordinances.length - fullTextCount;

export default function Ordinances() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [availability, setAvailability] = useQueryState('availability', {
    defaultValue: 'all' as AvailabilityFilter,
  });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'newest' as SortOrder,
  });

  const hasActiveFilters = Boolean(
    query.trim() || availability !== 'all' || sort !== 'newest'
  );

  const visibleOrdinances = useMemo(() => {
    const normalizedQuery = query.trim();
    const filtered = ordinances.filter(ordinance => {
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'full-text' && hasLegislationFullText(ordinance)) ||
        (availability === 'reference-only' &&
          !hasLegislationFullText(ordinance));

      return (
        matchesAvailability &&
        (!normalizedQuery || matchesQuery(ordinance, normalizedQuery))
      );
    });

    const sorted = [...filtered];
    sorted.sort((left, right) => {
      if (sort === 'identifier') {
        return left.document_number.localeCompare(right.document_number);
      }

      const direction = sort === 'oldest' ? 1 : -1;
      return (
        (left.date_adopted ?? `${left.year}`).localeCompare(
          right.date_adopted ?? `${right.year}`
        ) * direction
      );
    });

    return sorted;
  }, [availability, query, sort]);

  function resetFilters() {
    setQuery(null);
    setAvailability(null);
    setSort(null);
  }

  return (
    <main className="flex-grow bg-white">
      {/* 1. Editorial Header and Scope Intro */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Legislation', href: '/legislation' },
              { label: 'Ordinances' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                LEGISLATION · ORDINANCE ARCHIVE
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl">
                Ordinances
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
                Browse ordinance records BetterSanFernando has verified for
                public release, with official-source evidence and full text
                where available.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href="#archive-records"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition hover:bg-[#0052BC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB]"
                >
                  <span>Browse ordinance records</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/legislation"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition hover:text-[#0052BC] hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  <span>Legislation overview</span>
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                ABOUT THIS ARCHIVE
              </p>
              <h2 className="mt-1 text-sm font-bold text-gray-950">
                Verified, bounded collection
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                This archive contains ordinance records currently verified from
                official City sources. It is not a complete historical register,
                and an ordinance missing here may still have been enacted by the
                City.
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
        {/* 2. Archive Snapshot */}
        <section aria-labelledby="snapshot-heading" className="pt-8 sm:pt-10">
          <h2 id="snapshot-heading" className="sr-only">
            Archive snapshot
          </h2>
          <dl className="grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 py-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-7">
            <div className="pb-4 sm:pb-0 sm:pr-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Published records
              </dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {ordinances.length}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Verified City ordinance subset
              </p>
            </div>

            <div className="py-4 sm:py-0 sm:px-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Full text available
              </dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {fullTextCount}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Official PDF documents attached
              </p>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Reference record only
              </dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {referenceOnlyCount}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Official source references without text
              </p>
            </div>
          </dl>
          <p className="mt-3 text-xs text-gray-500 sm:text-sm">
            Last verified: {formatDate(metadata.lastVerified)}
          </p>
        </section>

        {/* 3. Evidence Levels Explainer */}
        <section aria-labelledby="evidence-levels-heading">
          <div className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              EVIDENCE LEVELS
            </p>
            <h2
              id="evidence-levels-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Two levels of published evidence
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 md:gap-8">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-[#F3F6FB] text-[#0066EB]">
                  <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    Full text available
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    An official PDF can be opened from the record.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:border-l md:border-gray-200 md:pl-8">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-gray-100 text-gray-600">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    Reference record only
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    An official source supports the record, but
                    BetterSanFernando does not currently publish/recover the
                    full ordinance text.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Search / Filter Toolbar and Results Count */}
        <section
          id="archive-records"
          aria-labelledby="directory-controls-heading"
        >
          <h2 id="directory-controls-heading" className="sr-only">
            Search and filter ordinances
          </h2>

          <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_13rem_12rem] md:items-end">
              <div>
                <label
                  htmlFor="ordinance-search"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Search records
                </label>
                <div className="relative mt-1.5">
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="ordinance-search"
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value || null)}
                    placeholder="Search number, title, subject, or year..."
                    className="h-10 w-full rounded-sm border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="availability-select"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Availability
                </label>
                <div className="mt-1.5">
                  <select
                    id="availability-select"
                    value={availability}
                    onChange={event =>
                      setAvailability(
                        (event.target.value as AvailabilityFilter) || null
                      )
                    }
                    className={selectClass}
                  >
                    <option value="all">All records</option>
                    <option value="full-text">Full text available</option>
                    <option value="reference-only">
                      Reference record only
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="sort-select"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Sort by
                </label>
                <div className="mt-1.5">
                  <select
                    id="sort-select"
                    value={sort}
                    onChange={event =>
                      setSort((event.target.value as SortOrder) || null)
                    }
                    className={selectClass}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="identifier">Ordinance number</option>
                  </select>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex items-center justify-end border-t border-gray-200/80 pt-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Reset filters
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-600 sm:text-sm" aria-live="polite">
              Showing {visibleOrdinances.length} of {ordinances.length}{' '}
              published records
            </p>
          </div>
        </section>

        {/* 5. Ordinance Record List or Empty State */}
        <section aria-labelledby="ordinance-list-heading">
          <h2 id="ordinance-list-heading" className="sr-only">
            Ordinance records list
          </h2>

          {visibleOrdinances.length === 0 ? (
            <div className="rounded-sm border border-dashed border-gray-300 bg-white p-8 text-center sm:p-12">
              <SearchX
                className="mx-auto h-8 w-8 text-gray-400"
                aria-hidden="true"
              />
              <p className="mt-2 text-base font-semibold text-gray-950">
                No ordinances found
              </p>
              <p className="mt-1 text-sm text-gray-600">
                No published ordinances matched your search or availability
                filter.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset search and filters
              </button>
            </div>
          ) : (
            <ol className="divide-y divide-gray-200 border-y sm:border border-gray-200 bg-white sm:rounded-sm">
              {visibleOrdinances.map(ordinance => {
                const title = getDisplayTitle(ordinance);
                const sourceUrl = getLegislationSourceUrl(ordinance);
                const hasFullText = hasLegislationFullText(ordinance);
                const description =
                  ordinance.described_context ?? ordinance.described_subject;

                return (
                  <li
                    key={ordinance.id}
                    className="p-5 transition-colors hover:bg-[#F3F6FB]/50 sm:p-6"
                  >
                    <article aria-labelledby={`${ordinance.id}-title`}>
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
                        {/* Main record content */}
                        <div className="min-w-0">
                          {/* Top row: Ordinance number + Evidence Status */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700">
                              ORDINANCE NO. {ordinance.document_number}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium ${
                                hasFullText
                                  ? 'text-emerald-700'
                                  : 'text-gray-500'
                              }`}
                            >
                              {hasFullText ? (
                                <FileCheck2
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              ) : (
                                <FileText
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              )}
                              {hasFullText
                                ? 'Full text available'
                                : 'Reference record only'}
                            </span>
                          </div>

                          {/* Formal Title */}
                          <h3
                            id={`${ordinance.id}-title`}
                            className="mt-2 text-base font-bold leading-snug text-gray-950 sm:text-lg"
                          >
                            {title ?? `Ordinance ${ordinance.document_number}`}
                          </h3>

                          {/* Description / Context when not duplicate */}
                          {description && description !== title && (
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">
                              {description}
                            </p>
                          )}

                          {/* Structured metadata: Date & Issuing body */}
                          <dl className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm">
                            <div>
                              <dt className="text-gray-500">
                                {ordinance.date_adopted
                                  ? 'Date adopted'
                                  : 'Year'}
                              </dt>
                              <dd className="font-medium text-gray-900">
                                {ordinance.date_adopted ? (
                                  <time dateTime={ordinance.date_adopted}>
                                    {formatDate(ordinance.date_adopted)}
                                  </time>
                                ) : (
                                  ordinance.year
                                )}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Issuing body</dt>
                              <dd className="font-medium text-gray-900">
                                {ordinance.issuing_body}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        {/* Source & Document Rail */}
                        <div className="border-t border-gray-200 pt-4 text-xs sm:text-sm lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            SOURCE &amp; DOCUMENT
                          </p>
                          <p className="mt-1.5 text-gray-700">
                            <span className="text-gray-500">Evidence:</span>{' '}
                            {getSourceAuthorityLabel(ordinance)}
                          </p>
                          <p className="mt-1 text-gray-600">
                            {hasFullText
                              ? 'Full text is available as an official PDF.'
                              : 'Full text is not currently available in BetterSanFernando.'}
                          </p>

                          <div className="mt-3 flex flex-col items-start gap-2">
                            {sourceUrl && (
                              <a
                                href={sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-[#0066EB] hover:text-[#0052BC] hover:underline"
                              >
                                View source evidence
                                <ExternalLink
                                  className="h-3.5 w-3.5 shrink-0"
                                  aria-hidden="true"
                                />
                              </a>
                            )}
                            {hasFullText && ordinance.official_pdf_url && (
                              <a
                                href={ordinance.official_pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-[#0066EB] hover:text-[#0052BC] hover:underline"
                              >
                                Read official PDF
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
          )}
        </section>

        {/* 6. Archive Coverage: Understanding this archive */}
        <section
          aria-labelledby="understanding-heading"
          className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            COVERAGE &amp; SCOPE
          </p>
          <h2
            id="understanding-heading"
            className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
          >
            Understanding this archive
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 md:gap-8">
            <div>
              <h3 className="text-base font-bold text-gray-950">
                What is included
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                This archive includes ordinance records that BetterSanFernando
                can currently verify and publish safely from official sources.
                It is not a complete history of City ordinances.
              </p>
            </div>

            <div className="md:border-l md:border-gray-200 md:pl-8">
              <h3 className="text-base font-bold text-gray-950">
                What absence means
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Absence from this archive does not prove that an ordinance does
                not exist. Some records have supporting official references
                without current full text in the public export.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Keep Exploring */}
        <section aria-labelledby="keep-exploring-heading">
          <div className="border-t border-gray-200 pt-10 sm:pt-12">
            <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
              KEEP EXPLORING
            </p>
            <h2
              id="keep-exploring-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Related legislative resources
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="/legislation"
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                    Legislation overview
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    City ordinances, executive orders, and legislative tracking.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>Browse overview</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              <Link
                href="/legislation/executive-orders"
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                    Executive Orders
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Verified mayoral and executive order records with source
                    documents.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>Browse Executive Orders</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              <Link
                href="/legislation/resolutions"
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                    Resolutions
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    City council resolutions and verified official source files.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>Browse Resolutions</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
