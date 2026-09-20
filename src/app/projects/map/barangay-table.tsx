'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import type { BarangayProjectSummary } from '../../../data/civic/projectMap';
import { titleCaseEnum } from '../../../lib/utils';

const PAGE_SIZE = 10;

const SORTS = [
  { value: 'most', label: 'Most project records' },
  { value: 'fewest', label: 'Fewest project records' },
  { value: 'name-asc', label: 'Barangay A–Z' },
  { value: 'name-desc', label: 'Barangay Z–A' },
] as const;
type SortValue = (typeof SORTS)[number]['value'];

const selectClass =
  'h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20';

// Lifecycle counts are current-state, not cumulative milestones, so most
// cells would read "0" if every status got its own column — only the
// non-zero statuses are worth showing per row.
function statusBreakdown(barangay: BarangayProjectSummary): string {
  const parts = Object.entries(barangay.lifecycleCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `${titleCaseEnum(status)} ${count}`);
  return parts.length > 0 ? parts.join(' · ') : 'No attributed project records';
}

// Compact page-number window with first/last + ellipsis — same pattern as
// /projects/city-projects's pagination.
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

export default function BarangayDistributionTable({
  barangays,
}: {
  barangays: readonly BarangayProjectSummary[];
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortValue>('most');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? barangays.filter(b => b.name.toLowerCase().includes(q))
      : barangays;
  }, [barangays, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case 'fewest':
        copy.sort((a, b) => a.projectCount - b.projectCount);
        break;
      case 'name-asc':
        copy.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        copy.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'most':
      default:
        copy.sort((a, b) => b.projectCount - a.projectCount);
    }
    return copy;
  }, [filtered, sort]);

  // Rank reflects position in the full current sort order, not just the
  // visible page, so page 2 continues at 11 rather than restarting at 01.
  const ranked = useMemo(
    () => sorted.map((barangay, index) => ({ barangay, rank: index + 1 })),
    [sorted]
  );

  const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = ranked.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }
  function updateSort(value: SortValue) {
    setSort(value);
    setPage(1);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={event => updateSearch(event.target.value)}
          placeholder="Search barangays…"
          aria-label="Search barangays"
          className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20 sm:max-w-md"
        />
        <label className="w-full sm:w-60">
          <span className="sr-only">Sort barangays</span>
          <select
            value={sort}
            onChange={event => updateSort(event.target.value as SortValue)}
            className={`${selectClass} w-full`}
          >
            {SORTS.map(option => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-5 border border-gray-200 px-6 py-12 text-center">
          <SearchX
            className="mx-auto h-7 w-7 text-gray-400"
            aria-hidden="true"
          />
          <h3 className="mt-3 text-base font-bold text-gray-900">
            No barangays match your search.
          </h3>
          <button
            type="button"
            onClick={() => updateSearch('')}
            className="mt-4 inline-flex items-center rounded-sm bg-[#0066EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0052BC]"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <ol
            className="mt-5 divide-y divide-gray-200 border-y border-gray-200"
            aria-label="Barangays ranked by project record count"
          >
            {pageRows.map(({ barangay, rank }) => (
              <li
                key={barangay.psgcCode}
                className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start sm:gap-4"
              >
                <span
                  className="font-mono text-sm text-gray-400 sm:pt-0.5"
                  aria-hidden="true"
                >
                  {String(rank).padStart(2, '0')}
                </span>

                <div className="min-w-0">
                  <Link
                    href={`/projects/city-projects?barangay=${barangay.psgcCode}`}
                    className="text-base font-bold text-gray-900 hover:text-[#0066EB] sm:text-lg"
                  >
                    {barangay.name}
                  </Link>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-900">
                    {barangay.projectCount} project
                    {barangay.projectCount === 1 ? '' : 's'}
                  </p>
                  {barangay.projectCount > 0 ? (
                    <div className="mt-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        Current stages
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-gray-600">
                        {statusBreakdown(barangay)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      No attributed project records
                    </p>
                  )}
                </div>

                {barangay.projectCount > 0 && (
                  <Link
                    href={`/projects/city-projects?barangay=${barangay.psgcCode}`}
                    className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC] sm:justify-self-end sm:pt-0.5"
                  >
                    View projects
                    <span
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ol>

          <p className="mt-3 text-sm text-gray-600">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, ranked.length)} of{' '}
            {ranked.length} barangays
          </p>

          {totalPages > 1 && (
            <nav
              aria-label="Barangay directory pages"
              className="mt-4 flex items-center justify-between gap-4"
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

              <p className="text-sm text-gray-600 sm:hidden">
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
    </div>
  );
}
