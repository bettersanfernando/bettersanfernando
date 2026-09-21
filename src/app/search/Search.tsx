'use client';

import { useMemo, useRef } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
  X,
} from 'lucide-react';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import {
  CIVIC_SEARCH_DOMAINS,
  searchCivicRecordsDetailed,
  type CivicSearchDomain,
  type CivicSearchResult,
} from '../../data/civic/search';

type VisibleSearchFilter =
  | 'all'
  | 'services'
  | 'projects'
  | 'government'
  | 'barangays'
  | 'public-records';

const VISIBLE_FILTERS: ReadonlyArray<{
  value: VisibleSearchFilter;
  label: string;
}> = [
  { value: 'all', label: 'All' },
  { value: 'services', label: 'Services' },
  { value: 'projects', label: 'Projects' },
  { value: 'government', label: 'Government' },
  { value: 'barangays', label: 'Barangays' },
  { value: 'public-records', label: 'Public Records' },
];

const PAGE_SIZE = 10;

const DISCOVERY_SUGGESTIONS: ReadonlyArray<{
  category: string;
  label: string;
  query: string;
}> = [
  { category: 'SERVICE', label: 'Business permit', query: 'Business permit' },
  { category: 'OFFICE', label: 'CHO', query: 'CHO' },
  { category: 'PLACE', label: 'Sindalan', query: 'Sindalan' },
  { category: 'TOPIC', label: 'Population', query: 'Population' },
];

function isSearchFilter(
  value: string
): value is VisibleSearchFilter | CivicSearchDomain {
  return (
    value === 'all' || CIVIC_SEARCH_DOMAINS.includes(value as CivicSearchDomain)
  );
}

function getPaginationItems(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

function ResultRow({ result }: { result: CivicSearchResult }) {
  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <Link
        href={result.href}
        className="group flex items-start justify-between gap-4 rounded-sm px-2.5 py-3.5 transition-colors hover:bg-[#F3F6FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:px-3 sm:py-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0066EB]">
              {result.kind}
            </span>
            {result.metadata && (
              <>
                <span className="text-gray-300" aria-hidden="true">
                  •
                </span>
                <span className="font-mono text-[11px] text-gray-500">
                  {result.metadata}
                </span>
              </>
            )}
          </div>
          <h3 className="mt-1 text-sm font-bold text-gray-950 transition-colors group-hover:text-[#0066EB] sm:text-base">
            {result.title}
          </h3>
          {result.description && (
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-gray-600 sm:text-sm">
              {result.description}
            </p>
          )}
        </div>
        <div className="shrink-0 pt-1">
          <ArrowRight
            className="h-4 w-4 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#0066EB]"
            aria-hidden="true"
          />
        </div>
      </Link>
    </li>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const items = getPaginationItems(currentPage, totalPages);

  return (
    <nav
      aria-label="Search results pagination"
      className="mt-6 border-t border-gray-100 pt-5 sm:mt-8 sm:pt-6"
    >
      {/* Mobile Pagination */}
      <div className="flex items-center justify-between sm:hidden">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-[#F3F6FB] hover:text-[#0066EB] disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Previous</span>
        </button>

        <span className="font-mono text-xs text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-[#F3F6FB] hover:text-[#0066EB] disabled:pointer-events-none disabled:opacity-30"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden items-center justify-between sm:flex">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-[#F3F6FB] hover:text-[#0066EB] disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {items.map((item, index) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-8 items-center justify-center font-mono text-xs text-gray-400"
                >
                  …
                </span>
              );
            }

            const isCurrent = item === currentPage;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-sm font-mono text-xs transition-colors ${
                  isCurrent
                    ? 'bg-[#0066EB] font-bold text-white'
                    : 'text-gray-700 hover:bg-[#F3F6FB] hover:text-[#0066EB]'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-[#F3F6FB] hover:text-[#0066EB] disabled:pointer-events-none disabled:opacity-30"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

export default function Search() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [filterValue, setFilter] = useQueryState('domain', {
    defaultValue: 'all',
  });
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const resultsHeadingRef = useRef<HTMLDivElement>(null);

  const filter = isSearchFilter(filterValue) ? filterValue : 'all';
  const normalizedQuery = query.trim();
  const queryIsTooShort = normalizedQuery.length === 1;
  const hasSearchQuery = normalizedQuery.length >= 2;

  // Retrieve matching ranked results across all documents
  const { allResults, domainCounts, totalAll } = useMemo(() => {
    if (!hasSearchQuery) {
      return { allResults: [], domainCounts: null, totalAll: 0 };
    }
    const detailed = searchCivicRecordsDetailed(normalizedQuery, 'all', 2000);
    return {
      allResults: detailed.results,
      domainCounts: detailed.domainCounts,
      totalAll: detailed.total,
    };
  }, [hasSearchQuery, normalizedQuery]);

  // Filter results according to active domain
  const activeResults = useMemo(() => {
    if (!hasSearchQuery) return [];
    if (filter === 'all') return allResults;
    return allResults.filter(result => result.domain === filter);
  }, [hasSearchQuery, filter, allResults]);

  const activeTotal =
    filter === 'all'
      ? totalAll
      : (domainCounts?.[filter as CivicSearchDomain] ?? 0);

  const totalPages = Math.max(1, Math.ceil(activeTotal / PAGE_SIZE));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedResults = activeResults.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );
  const showingStart = activeTotal === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + PAGE_SIZE, activeTotal);

  const handleQueryChange = (newQuery: string) => {
    void setQuery(newQuery || null);
    void setPage(null);
  };

  const handleFilterChange = (newFilter: string) => {
    void setFilter(newFilter === 'all' ? null : newFilter);
    void setPage(null);
  };

  const clearSearch = () => {
    void Promise.all([setQuery(null), setFilter(null), setPage(null)]);
  };

  const handleExampleClick = (exampleTerm: string) => {
    void setQuery(exampleTerm);
    void setFilter(null);
    void setPage(null);
  };

  const handlePageChange = (newPage: number) => {
    const targetPage = Math.max(1, Math.min(newPage, totalPages));
    void setPage(targetPage === 1 ? null : targetPage);
    resultsHeadingRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <main className="flex-grow bg-white">
      <div className="container mx-auto px-4 pt-6 pb-[104px] sm:pt-8 sm:pb-[116px] lg:pb-32">
        {/* 1. Breadcrumbs (Aligned to container) */}
        <Breadcrumbs
          className="mb-7 sm:mb-8"
          items={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
        />

        {/* Centered Intro Column */}
        <header className="mx-auto max-w-[780px] text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
            SEARCH
          </p>
          <h1 className="mt-2 text-[32px] font-bold tracking-[-0.02em] text-gray-950 sm:text-[38px] lg:text-[44px] lg:leading-[1.15]">
            Find public information across <br className="hidden sm:inline" />
            San Fernando
          </h1>
          <p className="mx-auto mt-2.5 max-w-[620px] text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
            Search published civic records across services, projects, government
            offices, barangays, and public records.
          </p>
        </header>

        {/* 2. Centered Primary Search Input */}
        <div className="mx-auto mt-6 max-w-[740px]">
          <label htmlFor="civic-search" className="sr-only">
            Search published civic records
          </label>
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-5"
              aria-hidden="true"
            />
            <input
              id="civic-search"
              type="text"
              role="searchbox"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={query}
              onChange={event => handleQueryChange(event.target.value)}
              placeholder="Search services, projects, offices, barangays, or public records…"
              className="h-[58px] w-full rounded-sm border border-gray-300 bg-white pl-12 pr-12 text-base text-gray-950 placeholder:text-gray-400 outline-none transition focus:border-[#0066EB] focus:ring-1 focus:ring-[#0066EB] sm:h-[60px] sm:pl-14"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB]"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="mt-2.5 text-center text-xs text-gray-500">
            Try a service, office acronym, barangay, project, document number,
            or topic.
          </p>
        </div>

        {/* 3. Empty / Discovery State */}
        {!normalizedQuery && (
          <div className="mx-auto mt-6 max-w-[780px] sm:mt-7">
            <div className="rounded-sm bg-[#F3F6FB] p-6 sm:p-7 lg:p-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[4fr_6fr] md:items-center md:gap-7 lg:gap-8">
                {/* Left 40%: Editorial Discovery Intro */}
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                    SEARCH BY WHAT YOU KNOW
                  </p>
                  <h2 className="mt-2 text-base font-bold tracking-tight text-gray-950 sm:text-lg lg:text-xl lg:leading-snug">
                    Start with one detail you already have
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                    Search by service, office, barangay, project, document
                    number, or topic.
                    {/* Start with a name, title, location, or identifier */}
                  </p>
                </div>

                {/* Right 60%: 2x2 Navigation Grid */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {DISCOVERY_SUGGESTIONS.map(item => (
                    <button
                      key={item.query}
                      type="button"
                      onClick={() => handleExampleClick(item.query)}
                      className="group flex w-full items-center justify-between rounded-sm border border-gray-200/50 bg-white/40 px-3.5 py-2.5 text-left transition-colors hover:border-gray-200/90 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB]"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          {item.category}
                        </span>
                        <span className="block truncate text-xs font-semibold text-gray-900 transition-colors group-hover:text-[#0066EB] sm:text-sm">
                          {item.label}
                        </span>
                      </div>
                      <ArrowRight
                        className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State B: Query is 1 character */}
        {queryIsTooShort && (
          <div className="mx-auto mt-8 max-w-[740px] py-6 text-center">
            <p className="text-sm font-semibold text-gray-900">
              Enter at least 2 characters to search.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              A slightly longer query keeps typo-tolerant results relevant.
            </p>
          </div>
        )}

        {/* State C: Valid query with 0 results */}
        {hasSearchQuery && activeTotal === 0 && (
          <div className="mx-auto mt-8 max-w-[740px] py-8 text-center">
            <h2 className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
              No published BetterSanFernando records matched &ldquo;
              {normalizedQuery}&rdquo;
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-gray-600 sm:text-sm">
              Check the spelling, try fewer words, or switch to All domains. You
              can also explore directories directly:
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold sm:text-sm">
              <Link
                href="/services"
                className="inline-flex items-center gap-1 text-[#0066EB] hover:underline"
              >
                <span>Services</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-[#0066EB] hover:underline"
              >
                <span>Projects</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/government"
                className="inline-flex items-center gap-1 text-[#0066EB] hover:underline"
              >
                <span>Government</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/legislation"
                className="inline-flex items-center gap-1 text-[#0066EB] hover:underline"
              >
                <span>Public Records</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        {/* State D: Valid query with results (Standard 2-column scanning layout, not centered) */}
        {hasSearchQuery && activeTotal > 0 && (
          <div className="mt-8 sm:mt-10">
            {/* Tablet & Mobile Filter Rail */}
            <div className="mb-5 lg:hidden">
              <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-gray-400">
                FILTER RESULTS
              </p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {VISIBLE_FILTERS.map(item => {
                  const selected = item.value === filter;
                  const count =
                    item.value === 'all'
                      ? totalAll
                      : (domainCounts?.[item.value as CivicSearchDomain] ?? 0);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleFilterChange(item.value)}
                      aria-pressed={selected}
                      className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs transition-colors ${
                        selected
                          ? 'border border-[#0066EB] bg-[#F3F6FB] font-semibold text-[#0066EB]'
                          : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`font-mono text-[11px] tabular-nums ${
                          selected
                            ? 'font-bold text-[#0066EB]'
                            : 'text-gray-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Two-Column Layout */}
            <div className="flex items-start gap-8 xl:gap-12">
              {/* Left Sidebar Filters (Clean background highlight, NO left accent stripe) */}
              <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
                <div className="sticky top-20">
                  <h2 className="mb-3 px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    FILTER RESULTS
                  </h2>
                  <nav
                    aria-label="Filter results by domain"
                    className="space-y-1"
                  >
                    {VISIBLE_FILTERS.map(item => {
                      const selected = item.value === filter;
                      const count =
                        item.value === 'all'
                          ? totalAll
                          : (domainCounts?.[item.value as CivicSearchDomain] ??
                            0);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => handleFilterChange(item.value)}
                          aria-pressed={selected}
                          className={`group flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors ${
                            selected
                              ? 'bg-[#F3F6FB] font-semibold text-[#0066EB]'
                              : 'font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-950'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span
                            className={`font-mono text-xs tabular-nums ${
                              selected
                                ? 'font-bold text-[#0066EB]'
                                : 'text-gray-400 group-hover:text-gray-600'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </aside>

              {/* Right Results Column */}
              <div className="min-w-0 flex-1" ref={resultsHeadingRef}>
                <div className="flex flex-col gap-1 border-b border-gray-200 pb-3.5 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h2
                      id="search-results-heading"
                      className="text-lg font-bold tracking-tight text-gray-950 sm:text-xl"
                    >
                      Search Results
                    </h2>
                    <p
                      className="mt-1 text-xs text-gray-600 sm:text-sm"
                      aria-live="polite"
                    >
                      <span className="font-semibold text-gray-900">
                        {activeTotal}
                      </span>{' '}
                      {activeTotal === 1
                        ? 'matching record'
                        : 'matching records'}{' '}
                      for{' '}
                      <span className="font-semibold text-gray-900">
                        &ldquo;{normalizedQuery}&rdquo;
                      </span>
                      {filter !== 'all' && (
                        <span className="text-gray-500">
                          {' '}
                          in{' '}
                          {VISIBLE_FILTERS.find(f => f.value === filter)?.label}
                        </span>
                      )}
                    </p>
                  </div>

                  <p className="font-mono text-xs tabular-nums text-gray-500">
                    Showing {showingStart}–{showingEnd} of {activeTotal}
                  </p>
                </div>

                <ul className="mt-1 divide-y divide-gray-100">
                  {paginatedResults.map(result => (
                    <ResultRow key={result.id} result={result} />
                  ))}
                </ul>

                {activeTotal > PAGE_SIZE && (
                  <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5, 6, 7. Redesigned "About Search Coverage" Informational Panel */}
        <div className="mt-10 sm:mt-12">
          <div className="rounded-sm border border-gray-200/80 bg-[#F3F6FB] p-5 sm:p-7 lg:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[7fr_3fr] lg:items-center lg:gap-8">
              {/* Left 70%: Eyebrow and Copy */}
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                  ABOUT SEARCH COVERAGE
                </p>
                <p className="mt-2 text-xs leading-relaxed text-gray-900 sm:text-sm sm:leading-6">
                  Search covers public information currently published by
                  BetterSanFernando across services, projects, government
                  offices, barangays, and official records.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  A missing result does not mean the City Government record does
                  not exist.
                  {/* Absence from search does not mean a City record, office, or document does not exist. */}
                </p>
              </div>

              {/* Right 30%: Actions */}
              <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:gap-4 lg:flex-col lg:items-end lg:gap-2">
                <Link
                  href="/transparency/sources"
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                >
                  <span>Explore Sources</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href="/transparency/methodology"
                  className="group inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-gray-950 sm:text-sm"
                >
                  <span>How We Publish Data</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-gray-700"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
