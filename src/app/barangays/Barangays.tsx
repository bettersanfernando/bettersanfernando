'use client';

import { useMemo } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderKanban,
  Hash,
  RotateCcw,
  Search,
  Users,
} from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';
import Link from 'next/link';

import Breadcrumbs from '../../components/ui/Breadcrumbs';
import {
  filterAndSortBarangays,
  type BarangayDirectoryClassification,
  type BarangayDirectorySort,
} from '../../data/civic/barangayDirectory';
import {
  getBarangays,
  getCityDemographicsSource,
  getCityTotalPopulation,
} from '../../data/civic/demographics';
import { aggregatePopulationStatistics } from '../../data/civic/populationStatistics';
import { formatIsoDate } from '../../lib/utils';

const numberFormatter = new Intl.NumberFormat('en-PH');
const percentFormatter = new Intl.NumberFormat('en-PH', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const statistics = aggregatePopulationStatistics(
  getBarangays(),
  getCityTotalPopulation()
);
const source = getCityDemographicsSource();

const PAGE_SIZE = 10;

function isClassification(
  value: string
): value is BarangayDirectoryClassification {
  return value === 'All' || value === 'Urban' || value === 'Rural';
}

function isSort(value: string): value is BarangayDirectorySort {
  return (
    value === 'name-asc' ||
    value === 'name-desc' ||
    value === 'population-desc' ||
    value === 'population-asc' ||
    value === 'share-desc'
  );
}

export default function Barangays() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [classificationValue, setClassification] = useQueryState('type', {
    defaultValue: 'All',
  });
  const [sortValue, setSort] = useQueryState('sort', {
    defaultValue: 'name-asc',
  });
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const classification = isClassification(classificationValue)
    ? classificationValue
    : 'All';
  const sort = isSort(sortValue) ? sortValue : 'name-asc';

  const hasFilters = Boolean(
    query.trim() ||
    classification !== 'All' ||
    sort !== 'name-asc' ||
    page !== 1
  );

  const visibleBarangays = useMemo(
    () =>
      filterAndSortBarangays(statistics.rankedBarangays, {
        query,
        classification,
        sort,
      }),
    [query, classification, sort]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(visibleBarangays.length / PAGE_SIZE)
  );
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedBarangays = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return visibleBarangays.slice(start, start + PAGE_SIZE);
  }, [visibleBarangays, currentPage]);

  const startCount =
    visibleBarangays.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endCount = Math.min(currentPage * PAGE_SIZE, visibleBarangays.length);
  const isFiltered = Boolean(query.trim() || classification !== 'All');

  function handleQueryChange(val: string) {
    void setQuery(val || null);
    void setPage(1);
  }

  function handleClassificationChange(val: string) {
    void setClassification(val === 'All' ? null : val);
    void setPage(1);
  }

  function handleSortChange(val: string) {
    void setSort(val === 'name-asc' ? null : val);
    void setPage(1);
  }

  function resetDirectory() {
    void Promise.all([
      setQuery(null),
      setClassification(null),
      setSort(null),
      setPage(1),
    ]);
  }

  return (
    <main className="flex-grow bg-white">
      {/* 1. EDITORIAL HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[{ label: 'Home', href: '/' }, { label: 'Barangays' }]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                CITY DIRECTORY · BARANGAYS
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                Barangay Directory
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                Find all 35 barangays in the City of San Fernando and review
                their published population, classification, PSGC identity, and
                related project records.
              </p>

              {/* CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#directory"
                  className="inline-flex items-center gap-2 rounded-sm bg-[#0066EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  <span>Browse Barangays</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>

                <Link
                  href="/statistics/population"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC]"
                >
                  <span>View Population Statistics</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* RIGHT-SIDE SCOPE MODULE */}
            <aside
              aria-label="Directory scope"
              className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                DIRECTORY SCOPE
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-950 sm:text-lg">
                {statistics.barangayCount} Published Barangays
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Barangay names, PSGC identity, population, and classification
                use the current published civic datasets.
              </p>

              <div className="mt-4 border-t border-gray-200/80 pt-3">
                <p className="text-xs font-medium text-gray-500">
                  {source.census} ·{' '}
                  {numberFormatter.format(statistics.totalPopulation)} City
                  Population
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 2. WHAT YOU CAN FIND HERE (ORIENTATION GUIDE) */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12"
        aria-labelledby="guide-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">DIRECTORY GUIDE</p>
            <h2
              id="guide-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              What You Can Find Here
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Column 1: PSGC Identity */}
            <div className="space-y-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#F3F6FB] text-[#0066EB]">
                <Hash className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3 className="pt-2 text-sm font-bold text-gray-950 sm:text-base">
                PSGC Identity
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                Official geographic identifier and published barangay name.
              </p>
            </div>

            {/* Column 2: Population */}
            <div className="space-y-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#F3F6FB] text-[#0066EB]">
                <Users className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3 className="pt-2 text-sm font-bold text-gray-950 sm:text-base">
                Population
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                2024 POPCEN population and share of San Fernando’s published
                city total.
              </p>
            </div>

            {/* Column 3: Classification */}
            <div className="space-y-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#F3F6FB] text-[#0066EB]">
                <Building2 className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3 className="pt-2 text-sm font-bold text-gray-950 sm:text-base">
                Classification
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                Published Urban or Rural classification.
              </p>
            </div>

            {/* Column 4: Related Projects */}
            <div className="space-y-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#F3F6FB] text-[#0066EB]">
                <FolderKanban className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3 className="pt-2 text-sm font-bold text-gray-950 sm:text-base">
                Related Projects
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                Published BetterSanFernando project records attributed to the
                barangay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BROWSE ALL BARANGAYS (MAIN DIRECTORY) */}
      <section
        id="directory"
        className="bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="directory-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">BARANGAY DIRECTORY</p>
            <h2
              id="directory-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              Browse All Barangays
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Search, filter, and sort all 35 published barangays.
            </p>
          </div>

          {/* 4. REDESIGNED TOOLBAR */}
          <div className="mt-6 rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_13rem_15rem_auto] lg:items-end">
              {/* Search */}
              <div>
                <label
                  htmlFor="barangay-search"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700"
                >
                  Search Barangays
                </label>
                <div className="relative mt-1.5">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="barangay-search"
                    type="search"
                    value={query}
                    onChange={event => handleQueryChange(event.target.value)}
                    placeholder="Search barangay name…"
                    className="h-10 w-full rounded-sm border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                  />
                </div>
              </div>

              {/* Classification */}
              <div>
                <label
                  htmlFor="barangay-classification"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700"
                >
                  Classification
                </label>
                <select
                  id="barangay-classification"
                  value={classification}
                  onChange={event =>
                    handleClassificationChange(event.target.value)
                  }
                  className="mt-1.5 h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="All">All Classifications</option>
                  <option value="Urban">Urban</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label
                  htmlFor="barangay-sort"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700"
                >
                  Sort By
                </label>
                <select
                  id="barangay-sort"
                  value={sort}
                  onChange={event => handleSortChange(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="name-asc">Barangay: A–Z</option>
                  <option value="name-desc">Barangay: Z–A</option>
                  <option value="population-desc">
                    Population: High to Low
                  </option>
                  <option value="population-asc">
                    Population: Low to High
                  </option>
                  <option value="share-desc">City Share: High to Low</option>
                </select>
              </div>

              {/* Reset */}
              {hasFilters && (
                <div>
                  <button
                    type="button"
                    onClick={resetDirectory}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-4 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Reset</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 5. RESULT STATUS */}
          <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm">
            <p className="font-semibold text-gray-800" aria-live="polite">
              {visibleBarangays.length === 0
                ? 'No matching barangays'
                : isFiltered
                  ? `Showing ${startCount}–${endCount} of ${visibleBarangays.length} matching barangays`
                  : `Showing ${startCount}–${endCount} of ${visibleBarangays.length} barangays`}
            </p>
            <p className="text-gray-500">2024 POPCEN Population Reference</p>
          </div>

          {/* 7 & 12. DIRECTORY ROWS */}
          {paginatedBarangays.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
              {/* Desktop Column Header */}
              <div className="hidden border-b border-gray-200 bg-gray-50/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,2.2fr)_minmax(0,2fr)_auto] lg:items-center lg:gap-4 sm:px-5">
                <span>Identity</span>
                <span>Population</span>
                <span>Classification</span>
                <span className="text-right">Action</span>
              </div>

              {/* Rows */}
              <ol className="divide-y divide-gray-200">
                {paginatedBarangays.map(barangay => (
                  <li
                    key={barangay.psgc_code}
                    className="group px-4 py-4 transition-colors hover:bg-[#F3F6FB] sm:px-5"
                  >
                    {/* Desktop Layout */}
                    <div className="hidden lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,2.2fr)_minmax(0,2fr)_auto] lg:items-center lg:gap-4">
                      {/* Identity */}
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-950">
                          {barangay.name}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-gray-500">
                          PSGC {barangay.psgc_code}
                        </p>
                      </div>

                      {/* Population */}
                      <div>
                        <p className="text-sm font-bold tabular-nums text-gray-950">
                          {numberFormatter.format(barangay.population)}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {percentFormatter.format(barangay.share)} of City
                          Population
                        </p>
                      </div>

                      {/* Classification */}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {barangay.classification}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Population Rank #{barangay.rank}
                        </p>
                      </div>

                      {/* Action */}
                      <div className="text-right">
                        <Link
                          href={`/projects/city-projects?barangay=${encodeURIComponent(barangay.psgc_code)}`}
                          aria-label={`Browse projects for ${barangay.name}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                        >
                          <span>Browse Projects</span>
                          <ArrowRight
                            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    </div>

                    {/* Mobile / Tablet Layout */}
                    <div className="space-y-3 lg:hidden">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-base font-bold text-gray-950">
                          {barangay.name}
                        </h3>
                        <span className="text-xs font-medium text-gray-500">
                          PSGC {barangay.psgc_code}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs sm:text-sm">
                        <div>
                          <span className="text-base font-bold tabular-nums text-gray-950">
                            {numberFormatter.format(barangay.population)}
                          </span>{' '}
                          <span className="text-gray-500">Population</span>
                        </div>
                        <div className="text-gray-500">
                          {percentFormatter.format(barangay.share)} of City
                          Population
                        </div>
                      </div>

                      <div className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-900">
                          {barangay.classification}
                        </span>
                        <span className="mx-1.5 text-gray-300">·</span>
                        <span>Population Rank #{barangay.rank}</span>
                      </div>

                      <div className="pt-1">
                        <Link
                          href={`/projects/city-projects?barangay=${encodeURIComponent(barangay.psgc_code)}`}
                          aria-label={`Browse projects for ${barangay.name}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                        >
                          <span>Browse Projects</span>
                          <ArrowRight
                            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="mt-6 rounded-sm border border-gray-200 bg-white px-5 py-12 text-center">
              <Search
                className="mx-auto h-7 w-7 text-gray-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 text-base font-bold text-gray-950">
                No barangays match these filters
              </h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-gray-600 sm:text-sm">
                Check the spelling or reset the directory to show all 35
                barangays.
              </p>
              <button
                type="button"
                onClick={resetDirectory}
                className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-[#0066EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Show all barangays</span>
              </button>
            </div>
          )}

          {/* 6. PAGINATION */}
          {totalPages > 1 && (
            <nav
              aria-label="Barangay directory pagination"
              className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-6"
            >
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => void setPage(currentPage - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  pageNum => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => void setPage(pageNum)}
                      aria-current={
                        pageNum === currentPage ? 'page' : undefined
                      }
                      className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-sm border px-2.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] ${
                        pageNum === currentPage
                          ? 'border-[#0066EB] bg-[#0066EB] text-white'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-[#F3F6FB]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => void setPage(currentPage + 1)}
                className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      </section>

      {/* 13. SOURCE & SCOPE (PROVENANCE) */}
      <section
        className="border-t border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="source-scope-heading"
      >
        <div className="container mx-auto px-4">
          <p className="text-eyebrow text-[#0066EB]">PROVENANCE</p>
          <h2
            id="source-scope-heading"
            className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
          >
            Source &amp; Scope
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            {/* Left: Population & Classification */}
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                Population &amp; Classification
              </p>
              <h3 className="mt-1 text-base font-bold text-gray-950">
                {source.publisher}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{source.census}</p>
              <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span>Last Verified: {formatIsoDate(source.lastVerified)}</span>
              </div>
              <div className="mt-4">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                >
                  <span>View Official PSA Source</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Right: What This Directory Represents */}
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Directory Scope
              </p>
              <h3 className="mt-1 text-base font-bold text-gray-950">
                What This Directory Represents
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                BetterSanFernando’s currently published 35-barangay directory.
                Population, classification, PSGC identity, and related project
                records keep their own source boundaries.
              </p>
              <div className="mt-4 border-t border-gray-100 pt-3">
                <p className="text-xs leading-relaxed text-gray-500">
                  Project links show published records attributed to a barangay;
                  they do not establish exact project coordinates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 14. KEEP EXPLORING */}
      <section
        className="border-t border-gray-200 bg-white py-10 pb-16 sm:py-12 sm:pb-24 lg:py-14 lg:pb-28"
        aria-labelledby="keep-exploring-heading"
      >
        <div className="container mx-auto px-4">
          <p className="text-eyebrow text-[#0066EB]">RELATED INFORMATION</p>
          <h2
            id="keep-exploring-heading"
            className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
          >
            Keep Exploring
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/statistics/population"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  Population Statistics
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Detailed demographic breakdown, population distribution, and
                  city trends.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>View population statistics</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/statistics/city-profile"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  City Profile
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Verified civic profile, governance facts, and citywide
                  overview.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>View city profile</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/projects/map"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  Project Distribution Map
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Geographic distribution of published city infrastructure and
                  civil projects.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>Explore project distribution</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/government/barangay-contacts"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  Barangay Contacts
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Hall locations and official contact information for all 35
                  barangays.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>Browse barangay contacts</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
