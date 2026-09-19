'use client';

import { useEffect, useMemo, useState } from 'react';
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

type SortKey =
  'rank' | 'barangay' | 'relative' | 'population' | 'share' | 'classification';

type SortDirection = 'asc' | 'desc';

interface BarangayTableProps {
  barangays: readonly RankedBarangayPopulation[];
  largestPopulation: number;
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
  largestPopulation,
  totalPopulation,
  barangayCount,
}: BarangayTableProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredBarangays = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [...barangays];
    }

    return barangays.filter(barangay =>
      barangay.name.toLowerCase().includes(normalizedQuery)
    );
  }, [barangays, query]);

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

        case 'relative':
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

  useEffect(() => {
    setPage(1);
  }, [query, sortKey, sortDirection]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const pageStart = (page - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, sortedBarangays.length);

  const visibleBarangays = sortedBarangays.slice(pageStart, pageEnd);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(current => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);

    if (key === 'population' || key === 'relative' || key === 'share') {
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
        className={`group inline-flex cursor-pointer items-center gap-1.5 rounded-md py-1 text-xs font-semibold uppercase tracking-[0.05em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2 ${
          alignment === 'right' ? 'justify-end' : ''
        } ${active ? 'text-[#0066EB]' : 'text-gray-500 hover:text-gray-900'}`}
      >
        <span>{label}</span>

        <SortIcon active={active} direction={sortDirection} />
      </button>
    );
  };

  return (
    <div className="mt-7">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-y border-gray-200 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />

          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search barangay..."
            aria-label="Search barangays"
            className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 hover:border-gray-400 focus:border-[#0066EB] focus:ring-4 focus:ring-[#0066EB]/10"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear barangay search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            <span className="font-semibold tabular-nums text-gray-900">
              {sortedBarangays.length}
            </span>{' '}
            {sortedBarangays.length === 1 ? 'barangay' : 'barangays'}
          </p>

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="cursor-pointer text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {sortedBarangays.length === 0 ? (
        /* Empty state */
        <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <Search
            className="mx-auto h-6 w-6 text-gray-400"
            aria-hidden="true"
          />

          <p className="mt-4 font-semibold text-gray-950">No barangays found</p>

          <p className="mt-1 text-sm text-gray-500">
            No barangay matches “{query}”.
          </p>

          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-5 cursor-pointer rounded-lg bg-[#0066EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* Mobile list */}
          <ol className="mt-5 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white sm:hidden">
            {visibleBarangays.map(barangay => (
              <li key={barangay.psgc_code} className="px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium tabular-nums text-gray-400">
                        #{barangay.rank}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          barangay.classification === 'Urban'
                            ? 'bg-[#E6F0FD] text-[#0052BC]'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {barangay.classification}
                      </span>
                    </div>

                    <p className="mt-1.5 truncate text-base font-semibold text-gray-950">
                      {barangay.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {percentFormatter.format(barangay.share)} of city
                      population
                    </p>
                  </div>

                  <p className="shrink-0 text-lg font-bold tracking-[-0.02em] tabular-nums text-gray-950">
                    {numberFormatter.format(barangay.population)}
                  </p>
                </div>

                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100"
                  role="img"
                  aria-label={`${barangay.name}: ${numberFormatter.format(
                    barangay.population
                  )} residents`}
                >
                  <div
                    className="h-full rounded-full bg-[#0066EB]"
                    style={{
                      width: `${
                        (barangay.population / largestPopulation) * 100
                      }%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ol>

          {/* Desktop table */}
          <div className="mt-5 hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[50rem] border-collapse text-left text-sm">
                <caption className="sr-only">
                  All {barangayCount} San Fernando barangays ranked by
                  population, including population, city share, relative
                  population, and urban or rural classification.
                </caption>

                <thead>
                  <tr className="border-b border-gray-200 bg-[#f8fafc]">
                    <th scope="col" className="w-20 px-5 py-3.5">
                      {renderSortableHeader('rank', 'Rank')}
                    </th>

                    <th scope="col" className="px-4 py-3.5">
                      {renderSortableHeader('barangay', 'Barangay')}
                    </th>

                    <th scope="col" className="w-[30%] px-4 py-3.5">
                      {renderSortableHeader('relative', 'Relative population')}
                    </th>

                    <th scope="col" className="px-4 py-3.5 text-right">
                      {renderSortableHeader(
                        'population',
                        'Population',
                        'right'
                      )}
                    </th>

                    <th scope="col" className="px-4 py-3.5 text-right">
                      {renderSortableHeader('share', 'City share', 'right')}
                    </th>

                    <th scope="col" className="px-5 py-3.5 text-right">
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
                      className="group transition-colors hover:bg-[#0066EB]/[0.025]"
                    >
                      <td className="px-5 py-3.5 text-sm font-medium tabular-nums text-gray-400">
                        {barangay.rank}
                      </td>

                      <th
                        scope="row"
                        className="px-4 py-3.5 font-semibold text-gray-950"
                      >
                        {barangay.name}
                      </th>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100"
                            role="img"
                            aria-label={`${barangay.name}: ${numberFormatter.format(
                              barangay.population
                            )} residents`}
                          >
                            <div
                              className="h-full rounded-full bg-[#0066EB] transition-[width]"
                              style={{
                                width: `${
                                  (barangay.population / largestPopulation) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-gray-950">
                        {numberFormatter.format(barangay.population)}
                      </td>

                      <td className="px-4 py-3.5 text-right tabular-nums text-gray-500">
                        {percentFormatter.format(barangay.share)}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            barangay.classification === 'Urban'
                              ? 'bg-[#E6F0FD] text-[#0052BC]'
                              : 'bg-emerald-50 text-emerald-700'
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
                      colSpan={3}
                      className="px-5 py-3.5 text-left text-sm font-semibold text-gray-700"
                    >
                      City total · {barangayCount} barangays
                    </th>

                    <td className="px-4 py-3.5 text-right font-bold tabular-nums text-gray-950">
                      {numberFormatter.format(totalPopulation)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-gray-700">
                      100.0%
                    </td>

                    <td className="px-5 py-3.5" />
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
                onClick={() => setPage(current => Math.max(1, current - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 transition-[background-color,border-color,color,box-shadow] hover:border-[#0066EB]/40 hover:bg-[#E6F0FD] hover:text-[#0052BC] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {pageNumbers.map(pageNumber => {
                const active = pageNumber === page;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={active ? 'page' : undefined}
                    className={`h-10 min-w-10 cursor-pointer rounded-lg px-3 text-sm font-semibold transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2 ${
                      active
                        ? 'border border-[#0066EB] bg-[#0066EB] text-white shadow-sm'
                        : 'border border-gray-300 bg-white text-gray-700 hover:border-[#0066EB]/40 hover:bg-[#E6F0FD] hover:text-[#0052BC]'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setPage(current => Math.min(pageCount, current + 1))
                }
                disabled={page === pageCount}
                aria-label="Next page"
                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 transition-[background-color,border-color,color,box-shadow] hover:border-[#0066EB]/40 hover:bg-[#E6F0FD] hover:text-[#0052BC] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
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
