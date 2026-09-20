'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueryState, parseAsInteger } from 'nuqs';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  FileSearch,
  HelpCircle,
  Info,
  RotateCcw,
  Scale,
  Search,
  SearchX,
  SlidersHorizontal,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  BID_RESULT_SORTS,
  filterAndSortBidResults,
  getBidResultEvidence,
  getBidResultsSummary,
  type BidResultSort,
} from '../../../data/civic/bidResults';
import { getEvidenceSourceUrl } from '../../../data/civic/sources';
import { formatIsoDate, formatPeso } from '../../../lib/utils';

const PAGE_SIZE = 10;
const eyebrowTracking = { letterSpacing: '0.14em' };

const RELATED_RESOURCES = [
  {
    title: 'Procurement overview',
    description:
      'Understand the procurement records and evidence available across BetterSanFernando.',
    href: '/procurement',
  },
  {
    title: 'City Projects',
    description: 'Browse the full published City project collection.',
    href: '/projects/city-projects',
  },
  {
    title: 'Project Evidence',
    description:
      'Inspect the official-source records used to establish project facts.',
    href: '/projects/sources',
  },
  {
    title: 'Project Methodology',
    description:
      'See how project records are collected, structured, and interpreted.',
    href: '/projects/methodology',
  },
] as const;

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
  for (const page of pages) {
    if (previous && page - previous > 1) result.push('…');
    result.push(page);
    previous = page;
  }
  return result;
}

export default function BidResults() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [year, setYear] = useQueryState('year', { defaultValue: '' });
  const [barangay, setBarangay] = useQueryState('barangay', {
    defaultValue: '',
  });
  const [approvedBudget, setApprovedBudget] = useQueryState('abc', {
    defaultValue: '',
  });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'date-desc',
  });
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const [activeChartYear, setActiveChartYear] = useState<number | null>(null);

  const records = useMemo(() => getBidResultEvidence(), []);
  const summary = useMemo(() => getBidResultsSummary(records), [records]);

  const years = useMemo(
    () =>
      [...new Set(records.map(record => record.facts.reportYear))].sort(
        (a, b) => b - a
      ),
    [records]
  );

  const barangays = useMemo(
    () =>
      [
        ...new Set(
          records
            .map(r => r.project.barangay)
            .filter((b): b is string => Boolean(b))
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [records]
  );

  const filtered = useMemo(
    () =>
      filterAndSortBidResults(records, {
        query,
        year,
        barangay,
        approvedBudget:
          approvedBudget === 'available' || approvedBudget === 'unavailable'
            ? approvedBudget
            : '',
        sort: BID_RESULT_SORTS.includes(sort as BidResultSort)
          ? (sort as BidResultSort)
          : 'date-desc',
      }),
    [approvedBudget, barangay, query, records, sort, year]
  );

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginatedRecords = useMemo(
    () =>
      filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, filtered]
  );

  const fromCount =
    filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const toCount = Math.min(currentPage * PAGE_SIZE, filtered.length);

  // Filters state
  const hasActiveFilters = Boolean(
    query ||
    year ||
    barangay ||
    approvedBudget ||
    (sort && sort !== 'date-desc')
  );

  const handleQueryChange = (val: string) => {
    setQuery(val || null);
    setPage(1);
  };

  const handleYearChange = (val: string) => {
    setYear(val || null);
    setPage(1);
  };

  const handleBarangayChange = (val: string) => {
    setBarangay(val || null);
    setPage(1);
  };

  const handleAbcChange = (val: string) => {
    setApprovedBudget(val || null);
    setPage(1);
  };

  const handleSortChange = (val: string) => {
    setSort(val === 'date-desc' ? null : val);
    setPage(1);
  };

  const clearFilters = () => {
    setQuery(null);
    setYear(null);
    setBarangay(null);
    setApprovedBudget(null);
    setSort(null);
    setPage(1);
  };

  // Metrics calculations
  const abcUnavailableCount = summary.totalRecords - summary.withApprovedBudget;
  const abcAvailablePct =
    summary.totalRecords > 0
      ? ((summary.withApprovedBudget / summary.totalRecords) * 100).toFixed(1)
      : '0.0';
  const abcUnavailablePct =
    summary.totalRecords > 0
      ? ((abcUnavailableCount / summary.totalRecords) * 100).toFixed(1)
      : '0.0';

  const isCompleteCollection =
    summary.withWinningBid === summary.totalRecords &&
    summary.withWinningBidder === summary.totalRecords &&
    summary.withAttachment === summary.totalRecords;

  // Chart 1: Records by document year (chronological, with ABC breakdown)
  const recordsByYear = useMemo(() => {
    const map = new Map<
      number,
      { year: number; total: number; withAbc: number; withoutAbc: number }
    >();
    for (const r of records) {
      const y = r.facts.reportYear;
      if (!map.has(y)) {
        map.set(y, { year: y, total: 0, withAbc: 0, withoutAbc: 0 });
      }
      const item = map.get(y)!;
      item.total += 1;
      if (r.facts.approvedBudgetAbc !== null) {
        item.withAbc += 1;
      } else {
        item.withoutAbc += 1;
      }
    }
    return [...map.values()].sort((a, b) => a.year - b.year);
  }, [records]);

  const maxYearTotal = useMemo(
    () => Math.max(1, ...recordsByYear.map(item => item.total)),
    [recordsByYear]
  );

  // Chart 2: Winning bid as a percentage of ABC
  const abcRatioDistribution = useMemo(() => {
    const bands = [
      { label: 'Below 90%', count: 0 },
      { label: '90–94.9%', count: 0 },
      { label: '95–99.9%', count: 0 },
      { label: '100%', count: 0 },
      { label: 'Above 100%', count: 0 },
    ];
    for (const r of records) {
      if (
        r.facts.approvedBudgetAbc !== null &&
        r.facts.approvedBudgetAbc > 0 &&
        r.facts.winningBidAmount !== null
      ) {
        const pct =
          (r.facts.winningBidAmount / r.facts.approvedBudgetAbc) * 100;
        if (pct < 90) bands[0].count += 1;
        else if (pct < 95) bands[1].count += 1;
        else if (pct < 100) bands[2].count += 1;
        else if (pct === 100) bands[3].count += 1;
        else bands[4].count += 1;
      }
    }
    return bands;
  }, [records]);

  const maxRatioCount = useMemo(
    () => Math.max(1, ...abcRatioDistribution.map(band => band.count)),
    [abcRatioDistribution]
  );

  const comparableCount = useMemo(
    () => abcRatioDistribution.reduce((sum, b) => sum + b.count, 0),
    [abcRatioDistribution]
  );
  const mainConcentrationCount = abcRatioDistribution[2]?.count ?? 0;
  const mainConcentrationPct =
    comparableCount > 0
      ? ((mainConcentrationCount / comparableCount) * 100).toFixed(1)
      : '0.0';
  const below95Count =
    (abcRatioDistribution[0]?.count ?? 0) +
    (abcRatioDistribution[1]?.count ?? 0);
  const atOrAbove100Count =
    (abcRatioDistribution[3]?.count ?? 0) +
    (abcRatioDistribution[4]?.count ?? 0);

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Breadcrumbs + Editorial Intro & Scope Module */}
      <section className="container mx-auto px-4 pt-6 pb-8 sm:pt-8 sm:pb-10">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Projects', href: '/projects' },
            { label: 'Procurement', href: '/procurement' },
            { label: 'Bid Results' },
          ]}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              BID RESULTS
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Published bid-result evidence
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
              Browse project-linked bid-result records, winning bidders,
              Approved Budget for the Contract (ABC), winning-bid amounts,
              procurement references, and official source documents.
            </p>
          </div>

          <aside
            aria-labelledby="scope-module-title"
            className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5"
          >
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              SCOPE
            </p>
            <h2
              id="scope-module-title"
              className="mt-1.5 text-base font-bold text-gray-950"
            >
              Project-linked bid-result records
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              These are published BID_RESULTS evidence records connected to
              BetterSanFernando’s current project collection. They are not a
              complete archive of all City Government procurement.
            </p>
          </aside>
        </div>
      </section>

      {/* 2. Non-Repetitive Metric Strip */}
      <section
        aria-label="Bid result collection metrics"
        className="border-y border-gray-200 bg-gray-50"
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <dl className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            {/* Metric 1 */}
            <div className="py-3 sm:py-0 sm:pr-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  Bid-result records
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {summary.totalRecords}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                across {summary.projectsRepresented} represented projects
              </p>
            </div>

            {/* Metric 2 */}
            <div className="py-3 sm:py-0 sm:px-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  ABC available
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {summary.withApprovedBudget}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {abcAvailablePct}% of records
              </p>
            </div>

            {/* Metric 3 */}
            <div className="py-3 sm:py-0 sm:pl-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  ABC unavailable
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {abcUnavailableCount}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {abcUnavailablePct}% of records
              </p>
            </div>
          </dl>

          {isCompleteCollection && (
            <p className="mt-3 border-t border-gray-200 pt-3 text-xs leading-relaxed text-gray-500 sm:mt-4 sm:pt-4">
              All current bid-result records include a winning bid, winning
              bidder, and source document.
            </p>
          )}
        </div>
      </section>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 sm:py-12 space-y-10 sm:space-y-14">
        {/* 3. Analytical Overview Charts */}
        <section aria-labelledby="overview-heading">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              BID-RESULT OVERVIEW
            </p>
            <h2
              id="overview-heading"
              className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
            >
              Overview of published bid results
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Analytical breakdown of documentary years and winning bid
              comparisons across this evidence collection.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
            {/* Chart 1: By Document Year */}
            <div className="flex h-full flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Bid-result records by document year
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  See when the published bid-result evidence in this collection
                  was documented.
                </p>

                {/* Vertical Bar Chart */}
                <div
                  className="mt-5 grid grid-cols-4 items-end gap-3 sm:gap-6 border-b border-gray-200 pb-3"
                  role="img"
                  aria-label={`Bid result records by document year: ${recordsByYear.map(y => `${y.year}: ${y.total} records (${y.withAbc} with ABC, ${y.withoutAbc} without ABC)`).join('; ')}`}
                >
                  {recordsByYear.map(item => {
                    const isHovered = activeChartYear === item.year;
                    const totalHeightPct = (item.total / maxYearTotal) * 100;
                    const withoutAbcPct =
                      item.total > 0 ? (item.withoutAbc / item.total) * 100 : 0;
                    const withAbcPct =
                      item.total > 0 ? (item.withAbc / item.total) * 100 : 0;

                    return (
                      <button
                        key={item.year}
                        type="button"
                        onMouseEnter={() => setActiveChartYear(item.year)}
                        onMouseLeave={() => setActiveChartYear(null)}
                        onFocus={() => setActiveChartYear(item.year)}
                        onBlur={() => setActiveChartYear(null)}
                        className="group flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:rounded-sm"
                        aria-label={`${item.year}: ${item.total} bid-result records (${item.withAbc} with ABC, ${item.withoutAbc} without ABC)`}
                      >
                        {/* Count label above bar */}
                        <span className="text-xs font-bold tabular-nums text-gray-950 group-hover:text-[#0066EB]">
                          {item.total}
                        </span>

                        {/* Bar column */}
                        <span className="flex h-32 sm:h-36 w-full max-w-12 items-end rounded-sm bg-gray-100 p-0.5">
                          <span
                            className="flex w-full flex-col justify-end overflow-hidden rounded-sm transition-all"
                            style={{ height: `${totalHeightPct}%` }}
                          >
                            {/* Unavailable segment on top */}
                            {item.withoutAbc > 0 && (
                              <span
                                className="w-full bg-[#94A3B8]"
                                style={{ height: `${withoutAbcPct}%` }}
                              />
                            )}
                            {/* Available segment below */}
                            <span
                              className={`w-full ${isHovered ? 'bg-[#0052BC]' : 'bg-[#0066EB]'}`}
                              style={{ height: `${withAbcPct}%` }}
                            />
                          </span>
                        </span>

                        {/* Year label */}
                        <span
                          className={`text-xs font-medium tabular-nums ${isHovered ? 'font-bold text-[#0066EB]' : 'text-gray-600'}`}
                        >
                          {item.year}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Compact dynamic breakdown / hint */}
                <div className="mt-3 rounded-sm bg-[#F3F6FB] px-3 py-1.5 text-xs text-gray-700">
                  {activeChartYear ? (
                    (() => {
                      const activeItem = recordsByYear.find(
                        i => i.year === activeChartYear
                      );
                      if (!activeItem) return null;
                      return (
                        <p className="tabular-nums">
                          <strong className="font-semibold text-gray-950">
                            {activeItem.year}
                          </strong>{' '}
                          &middot; {activeItem.total} records &middot;{' '}
                          <span className="text-[#0066EB] font-medium">
                            {activeItem.withAbc} with ABC
                          </span>
                          {activeItem.withoutAbc > 0 && (
                            <span className="text-gray-600 font-medium">
                              {' '}
                              &middot; {activeItem.withoutAbc} without ABC
                            </span>
                          )}
                        </p>
                      );
                    })()
                  ) : (
                    <p className="text-gray-500">
                      Hover or focus a year to view details.
                    </p>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-none bg-[#0066EB]"
                    aria-hidden="true"
                  />
                  ABC available
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-none bg-[#94A3B8]"
                    aria-hidden="true"
                  />
                  ABC unavailable
                </span>
              </div>
            </div>

            {/* Chart 2: Winning Bid as % of ABC */}
            <div className="flex h-full flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  How winning bids compare with ABC
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  Shows the winning bid as a percentage of ABC for records where
                  both amounts are available.
                </p>

                {/* Horizontal Distribution Bars */}
                <div
                  className="mt-4 space-y-2"
                  role="img"
                  aria-label={`Winning bid as percentage of ABC distribution: ${abcRatioDistribution.map(b => `${b.label}: ${b.count} records`).join('; ')}`}
                >
                  {abcRatioDistribution.map(band => (
                    <div key={band.label} className="flex items-center gap-3">
                      <span className="w-24 sm:w-28 shrink-0 text-xs font-medium text-gray-700">
                        {band.label}
                      </span>
                      <span className="h-3.5 sm:h-4 flex-1 overflow-hidden rounded-sm bg-gray-100">
                        <span
                          className="block h-full rounded-sm bg-[#0066EB] transition-all"
                          style={{
                            width:
                              band.count > 0
                                ? `${Math.max(2, (band.count / maxRatioCount) * 100)}%`
                                : '0%',
                          }}
                        />
                      </span>
                      <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-gray-950">
                        {band.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quick Read: Factual distribution summary */}
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <p
                    className="text-eyebrow text-[#0066EB]"
                    style={eyebrowTracking}
                  >
                    QUICK READ
                  </p>
                  <div className="mt-2.5 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                    <div>
                      <p className="text-lg font-bold tabular-nums text-gray-950">
                        {comparableCount}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600">
                        records have both ABC and winning-bid values
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-bold tabular-nums text-gray-950">
                        {mainConcentrationCount} of {comparableCount}{' '}
                        <span className="text-xs font-semibold text-gray-500">
                          ({mainConcentrationPct}%)
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600">
                        fall between 95% and 99.9% of ABC
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-bold tabular-nums text-gray-950">
                        {below95Count} of {comparableCount}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600">
                        fall below 95% of ABC
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-bold tabular-nums text-gray-950">
                        {atOrAbove100Count}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600">
                        are at or above 100% of ABC
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clarification Note immediately following */}
              <p className="mt-4 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">
                This compares published bid amounts with ABC. It does not
                represent actual expenditure or project savings.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Published Records Browser */}
        <section aria-labelledby="bid-records-heading" className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                BID-RESULT RECORDS
              </p>
              <h2
                id="bid-records-heading"
                className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
              >
                Published records
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Search and filter the published bid-result evidence in this
                collection.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-xs font-medium tabular-nums text-gray-600 sm:text-sm"
                aria-live="polite"
              >
                {filtered.length === 0
                  ? '0 matching records'
                  : hasActiveFilters
                    ? `Showing ${fromCount}–${toCount} of ${filtered.length} matching records`
                    : `Showing ${fromCount}–${toCount} of ${filtered.length} records`}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-sm border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:border-[#0066EB] hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters Surface */}
          <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-gray-700">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Filter bid results
            </div>

            {/* Primary Search Input */}
            <div className="relative">
              <span className="sr-only">Search bid-result records</span>
              <Search
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder="Search project, bidder, BAC reference, or record ID..."
                className="w-full rounded-sm border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
              />
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Year Filter */}
              <div>
                <label
                  htmlFor="filter-year"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Document year
                </label>
                <select
                  id="filter-year"
                  value={year}
                  onChange={e => handleYearChange(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">All document years</option>
                  {years.map(y => (
                    <option key={y} value={y.toString()}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Barangay Filter */}
              <div>
                <label
                  htmlFor="filter-barangay"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Barangay
                </label>
                <select
                  id="filter-barangay"
                  value={barangay}
                  onChange={e => handleBarangayChange(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">All barangays</option>
                  {barangays.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* ABC Filter */}
              <div>
                <label
                  htmlFor="filter-abc"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  ABC availability
                </label>
                <select
                  id="filter-abc"
                  value={approvedBudget}
                  onChange={e => handleAbcChange(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">All records</option>
                  <option value="available">ABC available</option>
                  <option value="unavailable">ABC unavailable</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label
                  htmlFor="filter-sort"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Sort order
                </label>
                <select
                  id="filter-sort"
                  value={sort}
                  onChange={e => handleSortChange(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="date-desc">Newest document</option>
                  <option value="date-asc">Oldest document</option>
                  <option value="bid-desc">Winning bid: high to low</option>
                  <option value="bid-asc">Winning bid: low to high</option>
                  <option value="name-asc">Project name A–Z</option>
                  <option value="reference-asc">BAC / reference A–Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filtered.length === 0 ? (
            <div className="rounded-sm border border-gray-200 bg-white px-6 py-14 text-center">
              <SearchX
                className="mx-auto h-8 w-8 text-gray-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 text-base font-bold text-gray-950">
                No bid-result records match these filters.
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Try changing or clearing one or more filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-[#0066EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Compact Table */}
              <div className="hidden lg:block overflow-hidden rounded-sm border border-gray-200 bg-white">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#F3F6FB] text-xs font-semibold text-gray-700">
                      <th scope="col" className="py-3 px-4 w-[28%]">
                        Project
                      </th>
                      <th scope="col" className="py-3 px-4 w-[18%]">
                        Winning bidder
                      </th>
                      <th scope="col" className="py-3 px-4 w-[16%]">
                        BAC / reference
                      </th>
                      <th scope="col" className="py-3 px-4 w-[11%]">
                        Document date
                      </th>
                      <th scope="col" className="py-3 px-4 text-right w-[11%]">
                        <span className="sr-only">
                          Approved Budget for the Contract (ABC)
                        </span>
                        ABC
                      </th>
                      <th scope="col" className="py-3 px-4 text-right w-[11%]">
                        <span className="sr-only">Winning bid amount</span>
                        Winning bid
                      </th>
                      <th scope="col" className="py-3 px-4 text-right w-[5%]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {paginatedRecords.map(({ evidence, project, facts }) => {
                      const sourceUrl = getEvidenceSourceUrl(evidence);

                      return (
                        <tr
                          key={evidence.id}
                          className="hover:bg-gray-50/75 transition-colors"
                        >
                          {/* Project Cell */}
                          <td className="py-3 px-4 align-top">
                            <Link
                              href={`/projects/${project.id}`}
                              className="font-semibold text-gray-950 hover:text-[#0066EB] line-clamp-2"
                              aria-label={`View project: ${project.project_name}`}
                            >
                              {project.project_name}
                            </Link>
                            <span className="mt-0.5 block text-xs text-gray-500">
                              {project.barangay || 'City-wide'}
                            </span>
                          </td>

                          {/* Winning Bidder Cell */}
                          <td className="py-3 px-4 align-top text-gray-900">
                            <span className="line-clamp-2">
                              {facts.winningBidder ?? 'Not specified'}
                            </span>
                          </td>

                          {/* BAC / Reference Cell */}
                          <td className="py-3 px-4 align-top">
                            <span className="font-mono text-xs font-medium text-gray-900 break-words">
                              {facts.bacReference}
                            </span>
                            <span className="mt-0.5 block font-mono text-[11px] text-gray-400 break-words">
                              ID: {evidence.id}
                            </span>
                          </td>

                          {/* Document Date Cell */}
                          <td className="py-3 px-4 align-top text-xs text-gray-700 whitespace-nowrap">
                            {formatIsoDate(facts.biddingDate)}
                          </td>

                          {/* ABC Cell */}
                          <td className="py-3 px-4 align-top text-right font-semibold tabular-nums text-gray-900">
                            {facts.approvedBudgetAbc !== null ? (
                              formatPeso(facts.approvedBudgetAbc)
                            ) : (
                              <span className="font-normal italic text-gray-400">
                                Unavailable
                              </span>
                            )}
                          </td>

                          {/* Winning Bid Cell */}
                          <td className="py-3 px-4 align-top text-right font-semibold tabular-nums text-gray-900">
                            {facts.winningBidAmount !== null ? (
                              formatPeso(facts.winningBidAmount)
                            ) : (
                              <span className="font-normal italic text-gray-400">
                                Unavailable
                              </span>
                            )}
                          </td>

                          {/* Actions Cell */}
                          <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                            <div className="flex flex-col items-end gap-1 text-xs">
                              {sourceUrl && (
                                <a
                                  href={sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-semibold text-[#0066EB] hover:text-[#0052BC] hover:underline"
                                  aria-label={`Open official source for ${project.project_name} (opens in a new tab)`}
                                >
                                  Official source
                                  <ExternalLink
                                    className="h-3 w-3"
                                    aria-hidden="true"
                                  />
                                </a>
                              )}
                              <Link
                                href={`/projects/${project.id}`}
                                className="inline-flex items-center text-gray-600 hover:text-gray-950 hover:underline"
                              >
                                View project &rarr;
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Records (< lg) */}
              <ol className="lg:hidden divide-y divide-gray-200 rounded-sm border border-gray-200 bg-white">
                {paginatedRecords.map(({ evidence, project, facts }) => {
                  const sourceUrl = getEvidenceSourceUrl(evidence);

                  return (
                    <li key={evidence.id} className="p-4 sm:p-5 space-y-3">
                      {/* Project title and location */}
                      <div>
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-bold text-gray-950 hover:text-[#0066EB] leading-snug"
                        >
                          {project.project_name}
                        </Link>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {project.barangay || 'City-wide'}
                        </p>
                      </div>

                      {/* Details Grid */}
                      <dl className="grid grid-cols-2 gap-3 text-xs">
                        <div className="col-span-2">
                          <dt className="font-medium text-gray-500">
                            Winning bidder
                          </dt>
                          <dd className="mt-0.5 text-sm font-semibold text-gray-950">
                            {facts.winningBidder ?? 'Not specified'}
                          </dd>
                        </div>

                        <div>
                          <dt className="font-medium text-gray-500">
                            BAC / reference
                          </dt>
                          <dd className="mt-0.5 font-mono font-medium text-gray-900 break-words">
                            {facts.bacReference}
                          </dd>
                        </div>

                        <div>
                          <dt className="font-medium text-gray-500">
                            Document date
                          </dt>
                          <dd className="mt-0.5 font-medium text-gray-900">
                            {formatIsoDate(facts.biddingDate)}
                          </dd>
                        </div>

                        <div>
                          <dt className="font-medium text-gray-500">
                            Approved Budget (ABC)
                          </dt>
                          <dd className="mt-0.5 font-semibold tabular-nums text-gray-950">
                            {facts.approvedBudgetAbc !== null ? (
                              formatPeso(facts.approvedBudgetAbc)
                            ) : (
                              <span className="font-normal italic text-gray-400">
                                Unavailable
                              </span>
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt className="font-medium text-gray-500">
                            Winning bid amount
                          </dt>
                          <dd className="mt-0.5 font-semibold tabular-nums text-gray-950">
                            {facts.winningBidAmount !== null ? (
                              formatPeso(facts.winningBidAmount)
                            ) : (
                              <span className="font-normal italic text-gray-400">
                                Unavailable
                              </span>
                            )}
                          </dd>
                        </div>
                      </dl>

                      {/* Provenance ID */}
                      <p className="font-mono text-[11px] text-gray-400">
                        Record ID: {evidence.id}
                      </p>

                      {/* Mobile Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs font-semibold">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-gray-700 hover:text-gray-950"
                        >
                          View project &rarr;
                        </Link>
                        {sourceUrl && (
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#0066EB] hover:text-[#0052BC]"
                          >
                            Official source
                            <ExternalLink
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* 5. Real Pagination (10 per page) */}
              {totalPages > 1 && (
                <nav
                  aria-label="Bid result pagination"
                  className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-5"
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
                    {getPageWindow(currentPage, totalPages).map(
                      (item, index) =>
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
                            aria-current={
                              item === currentPage ? 'page' : undefined
                            }
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
            </>
          )}
        </section>

        {/* 6. How to Read These Records */}
        <section
          aria-labelledby="how-to-read-heading"
          className="border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            HOW TO READ THESE RECORDS
          </p>
          <h2
            id="how-to-read-heading"
            className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
          >
            Understanding bid-result evidence
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Key rules for interpreting published procurement facts and figures.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <Info className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">Coverage</h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                This archive contains BID_RESULTS evidence linked to
                BetterSanFernando’s current project collection. It does not
                represent all City procurement.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <Scale className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">Winning bid</h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                A winning bid is not the same as an award, contract amount,
                payment, or actual expenditure.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <HelpCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">
                  Missing values
                </h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                Missing information remains unknown unless another published
                source establishes it.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Keep Exploring */}
        <section
          aria-labelledby="keep-exploring-heading"
          className="border-t border-gray-200 pt-8 sm:pt-10 pb-8 sm:pb-12"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            KEEP EXPLORING
          </p>
          <h2
            id="keep-exploring-heading"
            className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
          >
            Continue exploring procurement data
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Compare published contracts, awards, and broader documentary
            statistics across San Fernando public works.
          </p>

          {/* Two Featured Equal Destinations */}
          <div className="mt-6 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
            {/* Contracts and Awards Card */}
            <article className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6 transition-colors hover:bg-[#F3F6FB]">
              <div>
                <div className="flex items-center gap-2.5 text-[#0066EB]">
                  <FileCheck2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <h3 className="text-base font-bold text-gray-950">
                    Contracts and Awards
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Review published award and contract evidence linked to City
                  projects.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/procurement/contracts"
                  className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC]"
                >
                  View Contracts and Awards &rarr;
                </Link>
              </div>
            </article>

            {/* Procurement Statistics Card */}
            <article className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6 transition-colors hover:bg-[#F3F6FB]">
              <div>
                <div className="flex items-center gap-2.5 text-[#0066EB]">
                  <FileSearch className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <h3 className="text-base font-bold text-gray-950">
                    Procurement Statistics
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Explore documentary coverage and descriptive statistics across
                  the project collection.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/statistics/procurement"
                  className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC]"
                >
                  View Procurement Statistics &rarr;
                </Link>
              </div>
            </article>
          </div>

          {/* Related resources: 2x2 Directory */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Related resources
            </h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 border-y border-gray-200">
              {RELATED_RESOURCES.map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[#F3F6FB] ${
                    idx % 2 === 1 ? 'md:border-l md:border-gray-200' : ''
                  } ${idx >= 2 ? 'md:border-t md:border-gray-200' : ''}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
