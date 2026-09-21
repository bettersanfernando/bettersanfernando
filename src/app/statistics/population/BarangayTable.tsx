'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';

import type { RankedBarangayPopulation } from '../../../data/civic/populationStatistics';

type SortKey = 'rank' | 'barangay' | 'population' | 'share' | 'classification';

type SortDirection = 'asc' | 'desc';

interface BarangayTableProps {
  barangays: readonly RankedBarangayPopulation[];
  largestPopulation?: number;
  totalPopulation: number;
  barangayCount: number;
}

const PAGE_SIZE = 10;

const numberFormatter = new Intl.NumberFormat('en-PH');

const percentFormatter = new Intl.NumberFormat('en-PH', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) {
    return (
      <ArrowUpDown
        className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-gray-600"
        aria-hidden="true"
      />
    );
  }

  return direction === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-[#0066EB]" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-[#0066EB]" aria-hidden="true" />
  );
}

export default function BarangayTable({
  barangays,
  totalPopulation,
  barangayCount,
}: BarangayTableProps) {
  const [query, setQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<
    'ALL' | 'Urban' | 'Rural'
  >('ALL');
  const [page, setPage] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredBarangays = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return barangays.filter(barangay => {
      const matchesQuery =
        !normalizedQuery ||
        barangay.name.toLowerCase().includes(normalizedQuery);
      const matchesClassification =
        classificationFilter === 'ALL' ||
        barangay.classification === classificationFilter;

      return matchesQuery && matchesClassification;
    });
  }, [barangays, query, classificationFilter]);

  const sortedBarangays = useMemo(() => {
    return [...filteredBarangays].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'rank':
          comparison = a.rank - b.rank;
          break;

        case 'barangay':
          comparison = a.name.localeCompare(b.name, 'en-PH');
          break;

        case 'population':
          comparison = a.population - b.population;
          break;

        case 'share':
          comparison = a.share - b.share;
          break;

        case 'classification':
          comparison = a.classification.localeCompare(
            b.classification,
            'en-PH'
          );
          break;
      }

      if (comparison === 0) {
        comparison = a.rank - b.rank;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredBarangays, sortDirection, sortKey]);

  const pageCount = Math.max(1, Math.ceil(sortedBarangays.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, sortedBarangays.length);

  const visibleBarangays = sortedBarangays.slice(pageStart, pageEnd);

  const isFiltered = query.trim() !== '' || classificationFilter !== 'ALL';

  const handleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) {
      setSortDirection(current => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);

    if (key === 'population' || key === 'share') {
      setSortDirection('desc');
    } else {
      setSortDirection('asc');
    }
  };

  const getSortLabel = (key: SortKey, label: string) => {
    if (sortKey !== key) {
      return `Sort by ${label}`;
    }

    return `Sort by ${label}, currently ${
      sortDirection === 'asc' ? 'ascending' : 'descending'
    }`;
  };

  const pageNumbers = Array.from(
    { length: pageCount },
    (_, index) => index + 1
  );

  const renderSortableHeader = (
    key: SortKey,
    label: string,
    alignment: 'left' | 'right' = 'left'
  ) => {
    const active = sortKey === key;

    return (
      <button
        type="button"
        onClick={() => handleSort(key)}
        aria-label={getSortLabel(key, label)}
        className={`group inline-flex cursor-pointer items-center gap-1.5 rounded-sm py-1 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] ${
          alignment === 'right' ? 'justify-end' : ''
        } ${active ? 'text-[#0066EB]' : 'text-gray-500 hover:text-gray-900'}`}
      >
        <span>{label}</span>
        <SortIcon active={active} direction={sortDirection} />
      </button>
    );
  };

  // Synchronized current sort value string for the dropdown
  const currentSortValue = `${sortKey}-${sortDirection}`;

  return (
    <div className="mt-7">
      {/* 8. IMPROVED TABLE TOOLBAR (#F3F6FB pale support toolbar) */}
      <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search input */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={event => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by barangay name…"
              aria-label="Search by barangay name"
              className="h-10 w-full rounded-sm border border-gray-300 bg-white pl-9 pr-8 text-sm text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 hover:border-gray-400 focus:border-[#0066EB] focus:ring-1 focus:ring-[#0066EB]"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setPage(1);
                }}
                aria-label="Clear barangay search"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Classification filter */}
          <div>
            <label htmlFor="classification-filter" className="sr-only">
              Classification filter
            </label>
            <select
              id="classification-filter"
              value={classificationFilter}
              onChange={e => {
                setClassificationFilter(
                  e.target.value as 'ALL' | 'Urban' | 'Rural'
                );
                setPage(1);
              }}
              aria-label="Filter by classification"
              className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition-[border-color,box-shadow] hover:border-gray-400 focus:border-[#0066EB] focus:ring-1 focus:ring-[#0066EB]"
            >
              <option value="ALL">All Classifications</option>
              <option value="Urban">Urban</option>
              <option value="Rural">Rural</option>
            </select>
          </div>

          {/* Explicit Sort By control */}
          <div>
            <label htmlFor="sort-control" className="sr-only">
              Sort barangays
            </label>
            <select
              id="sort-control"
              value={currentSortValue}
              onChange={e => {
                const [key, dir] = e.target.value.split('-') as [
                  SortKey,
                  SortDirection,
                ];
                setSortKey(key);
                setSortDirection(dir);
                setPage(1);
              }}
              aria-label="Sort barangays"
              className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition-[border-color,box-shadow] hover:border-gray-400 focus:border-[#0066EB] focus:ring-1 focus:ring-[#0066EB]"
            >
              <option value="population-desc">Population: High to Low</option>
              <option value="population-asc">Population: Low to High</option>
              <option value="barangay-asc">Barangay: A–Z</option>
              <option value="barangay-desc">Barangay: Z–A</option>
              <option value="share-desc">City Share: High to Low</option>
              <option value="rank-asc">Rank</option>
            </select>
          </div>
        </div>

        {/* Status line & clear action */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200/80 pt-3 text-xs text-gray-600">
          <p aria-live="polite">
            {sortedBarangays.length === 0 ? (
              'No matching barangays'
            ) : isFiltered ? (
              <>
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {pageStart + 1}–{pageEnd}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-900">
                  {sortedBarangays.length}
                </span>{' '}
                matching barangays
              </>
            ) : (
              <>
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {pageStart + 1}–{pageEnd}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-900">
                  {sortedBarangays.length}
                </span>{' '}
                barangays
              </>
            )}
          </p>

          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setClassificationFilter('ALL');
              }}
              className="cursor-pointer font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {sortedBarangays.length === 0 ? (
        /* Empty state */
        <div className="mt-5 rounded-sm border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <Search
            className="mx-auto h-6 w-6 text-gray-400"
            aria-hidden="true"
          />
          <p className="mt-4 font-semibold text-gray-950">No barangays found</p>
          <p className="mt-1 text-sm text-gray-500">
            No barangay matches the selected criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setClassificationFilter('ALL');
            }}
            className="mt-5 cursor-pointer rounded-sm bg-[#0066EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* 9. MOBILE LIST (sm:hidden) */}
          <ol className="mt-5 divide-y divide-gray-200 rounded-sm border border-gray-200 bg-white sm:hidden">
            {visibleBarangays.map(barangay => (
              <li key={barangay.psgc_code} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold tabular-nums text-gray-400">
                      #{barangay.rank}
                    </span>
                    <h3 className="truncate text-base font-bold text-gray-950">
                      {barangay.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {percentFormatter.format(barangay.share)} of city
                      population
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-bold tabular-nums text-gray-950">
                      {numberFormatter.format(barangay.population)}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-sm px-1.5 py-0.5 text-[11px] font-semibold ${
                        barangay.classification === 'Urban'
                          ? 'bg-[#E6F0FD] text-[#0052BC]'
                          : 'border border-gray-300 bg-gray-100 text-gray-700'
                      }`}
                    >
                      {barangay.classification}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {/* 7. SIMPLIFIED DESKTOP TABLE (sm:block) */}
          <div className="mt-5 hidden overflow-hidden rounded-sm border border-gray-200 bg-white sm:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  All {barangayCount} San Fernando barangays ranked by
                  population, including population, city share, and urban or
                  rural classification.
                </caption>
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <th scope="col" className="w-20 px-4 py-3">
                      {renderSortableHeader('rank', 'Rank')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {renderSortableHeader('barangay', 'Barangay')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      {renderSortableHeader(
                        'population',
                        'Population',
                        'right'
                      )}
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      {renderSortableHeader('share', 'City Share', 'right')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      {renderSortableHeader(
                        'classification',
                        'Classification',
                        'right'
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleBarangays.map(barangay => (
                    <tr
                      key={barangay.psgc_code}
                      className="transition-colors hover:bg-[#F3F6FB]/70"
                    >
                      <td className="px-4 py-3 text-sm font-medium tabular-nums text-gray-400">
                        {barangay.rank}
                      </td>
                      <th
                        scope="row"
                        className="px-4 py-3 font-semibold text-gray-950"
                      >
                        {barangay.name}
                      </th>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-950">
                        {numberFormatter.format(barangay.population)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                        {percentFormatter.format(barangay.share)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex rounded-sm px-2 py-0.5 text-xs font-semibold ${
                            barangay.classification === 'Urban'
                              ? 'bg-[#E6F0FD] text-[#0052BC]'
                              : 'border border-gray-300 bg-gray-100 text-gray-700'
                          }`}
                        >
                          {barangay.classification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50/70">
                    <th
                      scope="row"
                      colSpan={2}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                    >
                      City total · {barangayCount} barangays
                    </th>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-gray-950">
                      {numberFormatter.format(totalPopulation)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-700">
                      100.0%
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-5 flex flex-col gap-4 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500" aria-live="polite">
              Showing{' '}
              <span className="font-semibold text-gray-900">
                {pageStart + 1}–{pageEnd}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900">
                {sortedBarangays.length}
              </span>{' '}
              barangays
            </p>

            <nav
              className="flex items-center gap-1.5"
              aria-label="Barangay table pagination"
            >
              <button
                type="button"
                onClick={() =>
                  setPage(current =>
                    Math.max(1, Math.min(pageCount, current) - 1)
                  )
                }
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {pageNumbers.map(pageNumber => {
                const active = pageNumber === currentPage;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={active ? 'page' : undefined}
                    className={`h-10 min-w-10 cursor-pointer rounded-sm px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] ${
                      active
                        ? 'border border-[#0066EB] bg-[#0066EB] text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setPage(current =>
                    Math.min(pageCount, Math.min(pageCount, current) + 1)
                  )
                }
                disabled={currentPage === pageCount}
                aria-label="Next page"
                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
