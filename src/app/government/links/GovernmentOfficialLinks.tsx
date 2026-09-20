'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQueryState, parseAsInteger } from 'nuqs';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Info,
  RotateCcw,
  Search,
  SearchX,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getOfficialLinks,
  getOfficialLinksMetadata,
  type OfficialLink,
} from '../../../data/civic/governmentOfficialLinks';

type DestinationTypeFilter =
  'all' | 'OFFICIAL_WEBSITE' | 'OFFICIAL_DIGITAL_SERVICE';
type SortOption = 'name-asc' | 'recently-verified' | 'entity-asc';

const PAGE_SIZE = 10;
const eyebrowTracking = { letterSpacing: '0.08em' };

const allLinks = getOfficialLinks();
const metadata = getOfficialLinksMetadata();

// UI publication scope: Exclude OFFICIAL_FACEBOOK_PAGE
const visibleLinks = allLinks.filter(
  link => link.channel_type !== 'OFFICIAL_FACEBOOK_PAGE'
);

const websiteCount = visibleLinks.filter(
  link => link.channel_type === 'OFFICIAL_WEBSITE'
).length;

const digitalServiceCount = visibleLinks.filter(
  link => link.channel_type === 'OFFICIAL_DIGITAL_SERVICE'
).length;

const TYPE_OPTIONS: Array<{ value: DestinationTypeFilter; label: string }> = [
  { value: 'all', label: 'All destinations' },
  { value: 'OFFICIAL_WEBSITE', label: 'Official websites' },
  { value: 'OFFICIAL_DIGITAL_SERVICE', label: 'Digital services' },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'name-asc', label: 'A–Z' },
  { value: 'recently-verified', label: 'Recently verified' },
  { value: 'entity-asc', label: 'Owning entity A–Z' },
];

const RELATED_RESOURCES = [
  {
    title: 'Government Hotlines',
    description:
      'Find citywide emergency, disaster-response, police, fire, and related institutional numbers.',
    href: '/government/hotlines',
  },
  {
    title: 'Barangay Contacts',
    description:
      'Find published Barangay Secretary and BHERT contacts across San Fernando.',
    href: '/government/barangay-contacts',
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function matchesQuery(link: OfficialLink, query: string): boolean {
  const normalized = query.toLowerCase();
  return [
    link.owning_entity,
    link.office_acronym,
    link.label,
    link.public_purpose,
    link.url,
    hostnameOf(link.url),
  ]
    .filter((value): value is string => Boolean(value))
    .some(value => value.toLowerCase().includes(normalized));
}

function getPageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const keep = new Set<number>([1, total, current - 1, current, current + 1]);
  const pages = [...keep]
    .filter(p => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result: (number | '…')[] = [];
  let previous = 0;
  for (const p of pages) {
    if (previous && p - previous > 1) result.push('…');
    result.push(p);
    previous = p;
  }
  return result;
}

function DestinationRow({ link }: { link: OfficialLink }) {
  const isDigitalService = link.channel_type === 'OFFICIAL_DIGITAL_SERVICE';
  const hasConflict =
    link.verification_status ===
    'CURRENT_VERIFIED_NAMING_OR_REORG_CONFLICT_UNRESOLVED';

  const typeLabel = isDigitalService ? 'DIGITAL SERVICE' : 'OFFICIAL WEBSITE';
  const actionLabel = isDigitalService
    ? 'Open digital service'
    : 'Open official website';

  return (
    <div className="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-[#F3F6FB] sm:gap-6 sm:p-5 lg:flex-row lg:items-center">
      <div className="min-w-0 max-w-3xl">
        <p
          className={`text-eyebrow ${isDigitalService ? 'text-[#002EAC]' : 'text-[#0066EB]'}`}
          style={eyebrowTracking}
        >
          {typeLabel}
        </p>
        <h3 className="mt-1 text-base font-bold text-gray-950 sm:text-lg">
          {link.label}
        </h3>
        <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
          {link.owning_entity}
          {link.office_acronym && (
            <>
              {' · '}
              <span className="font-semibold text-gray-700">
                {link.office_acronym}
              </span>
            </>
          )}
        </p>

        <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
          {link.public_purpose}
        </p>

        {hasConflict && (
          <div className="mt-2.5 flex items-start gap-1.5 text-xs text-gray-600">
            <Info
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500"
              aria-hidden="true"
            />
            <span>
              <strong className="font-semibold text-gray-700">
                Naming note:
              </strong>{' '}
              Current source naming differs across published references.
            </span>
          </div>
        )}

        {link.limitation_note && !hasConflict && (
          <p className="mt-2 text-xs italic text-gray-500">
            {link.limitation_note}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-start gap-2 pt-2 sm:pt-0 lg:items-end">
        <div className="text-left text-xs text-gray-500 lg:text-right">
          <p className="font-mono">{hostnameOf(link.url)}</p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Verified {formatDate(link.verified_at)}
          </p>
        </div>

        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${actionLabel}: ${link.label} (opens in a new tab)`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] underline underline-offset-4 hover:text-[#002EAC] sm:text-sm"
        >
          {actionLabel}
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export default function GovernmentOfficialLinks() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [typeFilter, setTypeFilter] = useQueryState('type', {
    defaultValue: 'all',
  });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'name-asc',
  });
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const hasActiveFilters = Boolean(
    query.trim() || typeFilter !== 'all' || sort !== 'name-asc'
  );

  const filteredLinks = useMemo(() => {
    const normalizedQuery = query.trim();

    const result = visibleLinks.filter(link => {
      if (typeFilter !== 'all' && link.channel_type !== typeFilter) {
        return false;
      }
      if (normalizedQuery && !matchesQuery(link, normalizedQuery)) {
        return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      if (sort === 'recently-verified') {
        const dateA = a.verified_at;
        const dateB = b.verified_at;
        const cmp = dateB.localeCompare(dateA);
        if (cmp !== 0) return cmp;
      }
      if (sort === 'entity-asc') {
        const cmp = a.owning_entity.localeCompare(b.owning_entity, 'en-PH');
        if (cmp !== 0) return cmp;
      }
      return a.label.localeCompare(b.label, 'en-PH');
    });
  }, [query, typeFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredLinks.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedLinks = useMemo(
    () =>
      filteredLinks.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
      ),
    [currentPage, filteredLinks]
  );

  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredLinks.length);

  const resetFilters = () => {
    void Promise.all([
      setQuery(null),
      setTypeFilter(null),
      setSort(null),
      setPage(1),
    ]);
  };

  return (
    <main className="bg-white text-gray-900">
      {/* 1. Header / Editorial Intro */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Government', href: '/government' },
              { label: 'Official Government Links' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                OFFICIAL GOVERNMENT LINKS
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl">
                Official City websites and online services
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
                Find verified City Government websites and digital-service
                portals without having to search across multiple sources.
              </p>
            </div>

            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                ABOUT THIS DIRECTORY
              </p>
              <h2 className="mt-1 text-sm font-bold text-gray-950">
                Verified official destinations
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                BetterSanFernando organizes official City Government web
                destinations for easier access. Each link opens an external
                government-operated destination.
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
        {/* 2. Top Summary Metrics */}
        <section aria-labelledby="metrics-heading" className="pt-8 sm:pt-10">
          <h2 id="metrics-heading" className="sr-only">
            Official links overview
          </h2>
          <div className="grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 py-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-7">
            <div className="pb-4 sm:pb-0 sm:pr-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Verified online destinations
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {visibleLinks.length}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Websites and digital-service portals
              </p>
            </div>

            <div className="py-4 sm:py-0 sm:px-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Official websites
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {websiteCount}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Office and department sites
              </p>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Digital services
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {digitalServiceCount}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Citizen transaction portals
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 sm:text-sm">
            Last verified: {formatDate(metadata.lastVerified)}
          </p>
        </section>

        {/* 3. What You'll Find */}
        <section aria-labelledby="what-youll-find-heading">
          <div className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              WHAT YOU’LL FIND
            </p>
            <h2
              id="what-youll-find-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Two kinds of official destinations
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 md:gap-8">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-[#F3F6FB] text-[#0066EB]">
                  <Globe className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    Official websites
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    Office and institutional websites published for City
                    Government departments and units.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-[#F3F6FB] text-[#002EAC]">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    Digital services
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    Online portals used to access City Government services or
                    transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Find an Official Destination — Primary Interaction */}
        <section aria-labelledby="directory-heading" className="space-y-6">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              OFFICIAL DIRECTORY
            </p>
            <h2
              id="directory-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Find an official destination
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Search verified websites and online services by office, acronym,
              service, purpose, or web address.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_14rem_13rem_auto] md:items-center">
              {/* Search */}
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={e => {
                    void setQuery(e.target.value || null);
                    void setPage(1);
                  }}
                  placeholder="Search office, acronym, website, service, or purpose..."
                  className="h-10 w-full rounded-sm border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                />
              </div>

              {/* Destination Type Select */}
              <div>
                <label htmlFor="destination-type-select" className="sr-only">
                  Filter by destination type
                </label>
                <select
                  id="destination-type-select"
                  value={typeFilter}
                  onChange={e => {
                    void setTypeFilter(
                      e.target.value === 'all'
                        ? null
                        : (e.target.value as DestinationTypeFilter)
                    );
                    void setPage(1);
                  }}
                  className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  {TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Select */}
              <div>
                <label htmlFor="sort-select" className="sr-only">
                  Sort destinations
                </label>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={e => {
                    void setSort(
                      e.target.value === 'name-asc'
                        ? null
                        : (e.target.value as SortOption)
                    );
                    void setPage(1);
                  }}
                  className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <div>
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary Counter */}
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 sm:text-sm">
            <p aria-live="polite">
              {filteredLinks.length === 0
                ? 'Showing 0 destinations'
                : filteredLinks.length === 1
                  ? 'Showing 1 of 1 destination'
                  : `Showing ${startIndex}–${endIndex} of ${filteredLinks.length} destinations`}
            </p>
          </div>

          {/* Results List / Empty State */}
          {filteredLinks.length === 0 ? (
            <div className="rounded-sm border border-gray-200 bg-white px-6 py-12 text-center sm:py-16">
              <SearchX
                className="mx-auto h-10 w-10 text-gray-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 text-base font-bold text-gray-950">
                No matching destinations
              </h3>
              <p className="mt-1.5 text-sm text-gray-600">
                Try another office, acronym, service, or website name.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-9 items-center justify-center rounded-sm border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 border-y border-gray-200 bg-white sm:rounded-sm sm:border">
              {paginatedLinks.map(link => (
                <DestinationRow key={link.id} link={link} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Official links directory pagination"
              className="flex items-center justify-between gap-4 border-t border-gray-200 pt-5"
            >
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </button>

              {/* Desktop Page Window */}
              <div className="hidden items-center gap-1.5 sm:flex">
                {getPageWindow(currentPage, totalPages).map((item, index) =>
                  item === '…' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-9 min-w-9 items-center justify-center text-sm text-gray-400"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      aria-current={item === currentPage ? 'page' : undefined}
                      className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-sm border px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] ${
                        item === currentPage
                          ? 'border-[#0066EB] bg-[#0066EB] text-white'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-[#F3F6FB]'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              {/* Mobile Page Indicator */}
              <p className="text-sm font-medium text-gray-700 sm:hidden">
                Page {currentPage} of {totalPages}
              </p>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>

        {/* 5. Source and Coverage */}
        <section aria-labelledby="source-coverage-heading">
          <div className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              SOURCE AND COVERAGE
            </p>
            <h2
              id="source-coverage-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              About these links
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  What is verified
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Each displayed destination was reviewed against the official
                  sources recorded by BetterSanFernando.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-950">
                  What this does not mean
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  The directory does not guarantee that every City office has
                  its own website or that every government web destination has
                  already been identified.
                </p>
              </div>
            </div>

            <p className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500 sm:text-sm">
              A missing office or service does not prove that an official online
              destination does not exist.
            </p>
          </div>
        </section>

        {/* 6. Keep Exploring */}
        <section aria-labelledby="keep-exploring-heading" className="space-y-8">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              KEEP EXPLORING
            </p>
            <h2
              id="keep-exploring-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Find another government channel
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  City Offices
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Find office phone numbers, email addresses, locations, and
                  official pages.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/government/offices"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066EB] hover:text-[#002EAC]"
                >
                  Browse City Offices
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Contact the City
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Start with general City Government contact routes.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/government/contact"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066EB] hover:text-[#002EAC]"
                >
                  Contact the City
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              RELATED RESOURCES
            </p>
            <div className="mt-3 divide-y divide-gray-200 border-y border-gray-200 bg-white sm:rounded-sm sm:border">
              {RELATED_RESOURCES.map(resource => (
                <div
                  key={resource.href}
                  className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5"
                >
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 sm:text-base">
                      {resource.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                      {resource.description}
                    </p>
                  </div>
                  <Link
                    href={resource.href}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#002EAC] sm:text-sm"
                  >
                    View directory
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
