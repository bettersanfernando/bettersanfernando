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

export interface BarangayHouseholdRecord {
  psgc: string;
  name: string;
  householdPopulation: number;
}

interface HouseholdBarangayTableProps {
  barangays: readonly BarangayHouseholdRecord[];
}

type SortOption = 'pop-desc' | 'pop-asc' | 'name-asc' | 'name-desc';

const PAGE_SIZE = 10;
const numberFormatter = new Intl.NumberFormat('en-PH');

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: 'asc' | 'desc';
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

export default function HouseholdBarangayTable({
  barangays,
}: HouseholdBarangayTableProps) {
  const [query, setQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('pop-desc');
  const [page, setPage] = useState(1);

  const filteredBarangays = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) return barangays;

    return barangays.filter(item =>
      item.name.toLowerCase().includes(normalizedQuery)
    );
  }, [barangays, query]);

  const sortedBarangays = useMemo(() => {
    return [...filteredBarangays].sort((a, b) => {
      switch (sortOption) {
        case 'pop-desc':
          return b.householdPopulation - a.householdPopulation;
        case 'pop-asc':
          return a.householdPopulation - b.householdPopulation;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
      }
    });
  }, [filteredBarangays, sortOption]);

  const pageCount = Math.max(1, Math.ceil(sortedBarangays.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, sortedBarangays.length);

  const visibleBarangays = sortedBarangays.slice(pageStart, pageEnd);
  const isFiltered = query.trim() !== '';

  const handleHeaderSort = (field: 'name' | 'pop') => {
    setPage(1);
    if (field === 'name') {
      setSortOption(current =>
        current === 'name-asc' ? 'name-desc' : 'name-asc'
      );
    } else {
      setSortOption(current =>
        current === 'pop-desc' ? 'pop-asc' : 'pop-desc'
      );
    }
  };

  const pageNumbers = Array.from(
    { length: pageCount },
    (_, index) => index + 1
  );

  return (
    <div className="mt-8">
      {/* Search and Sort Toolbar */}
      <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              placeholder="Search barangay…"
              aria-label="Search barangay"
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

          {/* Sort By control */}
          <div>
            <label htmlFor="household-sort-control" className="sr-only">
              Sort barangays
            </label>
            <select
              id="household-sort-control"
              value={sortOption}
              onChange={e => {
                setSortOption(e.target.value as SortOption);
                setPage(1);
              }}
              aria-label="Sort barangays"
              className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition-[border-color,box-shadow] hover:border-gray-400 focus:border-[#0066EB] focus:ring-1 focus:ring-[#0066EB]"
            >
              <option value="pop-desc">
                Household Population: High to Low
              </option>
              <option value="pop-asc">Household Population: Low to High</option>
              <option value="name-asc">Barangay: A–Z</option>
              <option value="name-desc">Barangay: Z–A</option>
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
                <span className="font-semibold text-gray-950">
                  {pageStart + 1}–{pageEnd}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-950">
                  {sortedBarangays.length}
                </span>{' '}
                matching barangays
              </>
            ) : (
              <>
                Showing{' '}
                <span className="font-semibold text-gray-950">
                  {pageStart + 1}–{pageEnd}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-950">
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
                setPage(1);
              }}
              className="font-medium text-[#0066EB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            >
              Reset search
            </button>
          )}
        </div>
      </div>

      {sortedBarangays.length === 0 ? (
        <div className="mt-4 rounded-sm border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No barangays match your search.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="mt-4 hidden overflow-hidden rounded-sm border border-gray-200 bg-white sm:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Household population by barangay (2024 POPCEN)
                </caption>
                <thead className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort('name')}
                        className="group inline-flex cursor-pointer items-center gap-1.5 rounded-sm py-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                      >
                        <span>Barangay</span>
                        <SortIcon
                          active={
                            sortOption === 'name-asc' ||
                            sortOption === 'name-desc'
                          }
                          direction={
                            sortOption === 'name-desc' ? 'desc' : 'asc'
                          }
                        />
                      </button>
                    </th>
                    <th scope="col" className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort('pop')}
                        className="group inline-flex cursor-pointer items-center justify-end gap-1.5 rounded-sm py-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                      >
                        <span>Household Population</span>
                        <SortIcon
                          active={
                            sortOption === 'pop-desc' ||
                            sortOption === 'pop-asc'
                          }
                          direction={sortOption === 'pop-asc' ? 'asc' : 'desc'}
                        />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleBarangays.map(barangay => (
                    <tr
                      key={barangay.psgc}
                      className="transition-colors hover:bg-gray-50/60"
                    >
                      <th
                        scope="row"
                        className="px-5 py-3 font-semibold text-gray-950"
                      >
                        {barangay.name}
                      </th>
                      <td className="px-5 py-3 text-right font-medium tabular-nums text-gray-900">
                        {numberFormatter.format(barangay.householdPopulation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile List View */}
          <div className="mt-4 divide-y divide-gray-100 rounded-sm border border-gray-200 bg-white sm:hidden">
            {visibleBarangays.map(barangay => (
              <div key={barangay.psgc} className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-950">
                    {barangay.name}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-gray-950">
                    {numberFormatter.format(barangay.householdPopulation)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  2024 POPCEN Household Population
                </p>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex flex-col gap-4 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500" aria-live="polite">
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
              aria-label="Barangay household table pagination"
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
                className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-sm border border-gray-300 bg-white px-2.5 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
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
                    className={`h-9 min-w-9 cursor-pointer rounded-sm px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] ${
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
                className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-sm border border-gray-300 bg-white px-2.5 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
