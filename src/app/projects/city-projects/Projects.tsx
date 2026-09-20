'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueryState, parseAsInteger } from 'nuqs';
import {
  Search as SearchIcon,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  SearchX,
  X,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getProjects,
  ProjectLifecycleStatus,
  ProjectCategory,
  ProjectType,
  type Project,
} from '../../../data/civic/projects';
import { getBarangays } from '../../../data/civic/demographics';
import { formatPeso, titleCaseEnum } from '../../../lib/utils';

const PAGE_SIZE = 10;
const UNATTRIBUTED_BARANGAY = 'unattributed';

const LIFECYCLE_OPTIONS = ProjectLifecycleStatus.options;
const CATEGORY_OPTIONS = ProjectCategory.options;
const TYPE_OPTIONS = ProjectType.options;

// Restrained, factual lifecycle badge colors — reuses existing design
// tokens (no invented "Completed"/"Ongoing" semantics, see design doc §1).
const STATUS_STYLES: Record<string, string> = {
  PLANNED: 'bg-gray-100 text-gray-600',
  PROCUREMENT: 'bg-gray-200 text-gray-700',
  AWARDED: 'bg-primary-50 text-primary-600',
  CONTRACTED: 'bg-primary-100 text-primary-700',
  IMPLEMENTATION_REPORTED: 'bg-success-50 text-success-700',
};

const SORTS = [
  { value: 'year-desc', label: 'Newest year' },
  { value: 'year-asc', label: 'Oldest year' },
  { value: 'name-asc', label: 'Project name A–Z' },
  { value: 'abc-desc', label: 'Highest ABC' },
  { value: 'abc-asc', label: 'Lowest ABC' },
  { value: 'contract-desc', label: 'Highest contract amount' },
  { value: 'contract-asc', label: 'Lowest contract amount' },
] as const;
type SortValue = (typeof SORTS)[number]['value'];
const SORT_VALUES: readonly string[] = SORTS.map(sort => sort.value);
const DEFAULT_SORT: SortValue = 'year-desc';

function matchesQuery(project: Project, query: string): boolean {
  const q = query.toLowerCase();
  return (
    project.project_name.toLowerCase().includes(q) ||
    (project.barangay?.toLowerCase().includes(q) ?? false) ||
    (project.contractor?.toLowerCase().includes(q) ?? false) ||
    (project.identifiers.bid_reference?.toLowerCase().includes(q) ?? false) ||
    (project.identifiers.contract_number?.toLowerCase().includes(q) ?? false) ||
    (project.identifiers.philgeps_reference?.toLowerCase().includes(q) ??
      false) ||
    (project.identifiers.app_code?.toLowerCase().includes(q) ?? false)
  );
}

// Null ABC/contract amounts always sort after real values, regardless of
// direction, per the design doc's numeric-sort requirement.
function compareNullableNumber(
  a: number | null,
  b: number | null,
  direction: 'asc' | 'desc'
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return direction === 'desc' ? b - a : a - b;
}

function sortProjects(
  projects: readonly Project[],
  sort: SortValue
): Project[] {
  const sorted = [...projects];
  sorted.sort((a, b) => {
    let primary: number;
    switch (sort) {
      case 'year-asc':
        primary = a.year - b.year;
        break;
      case 'name-asc':
        primary = 0;
        break;
      case 'abc-desc':
        primary = compareNullableNumber(
          a.approved_budget_abc,
          b.approved_budget_abc,
          'desc'
        );
        break;
      case 'abc-asc':
        primary = compareNullableNumber(
          a.approved_budget_abc,
          b.approved_budget_abc,
          'asc'
        );
        break;
      case 'contract-desc':
        primary = compareNullableNumber(
          a.contract_amount,
          b.contract_amount,
          'desc'
        );
        break;
      case 'contract-asc':
        primary = compareNullableNumber(
          a.contract_amount,
          b.contract_amount,
          'asc'
        );
        break;
      case 'year-desc':
      default:
        primary = b.year - a.year;
    }
    // Stable secondary sort so ties (including all-null groups) never
    // reorder unpredictably between renders.
    return primary !== 0
      ? primary
      : a.project_name.localeCompare(b.project_name);
  });
  return sorted;
}

// Compact page-number window with first/last + ellipsis, e.g. 1 … 4 5 [6] 7 8 … 17
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

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-800 hover:border-[#0066EB] hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
    >
      {label}
      <X className="h-3 w-3" aria-hidden="true" />
    </button>
  );
}

const selectClass =
  'w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20';

export default function Projects() {
  const [q, setQ] = useQueryState('q', { defaultValue: '' });
  const [lifecycle, setLifecycle] = useQueryState('status', {
    defaultValue: '',
  });
  const [barangayPsgc, setBarangayPsgc] = useQueryState('barangay', {
    defaultValue: '',
  });
  const [year, setYear] = useQueryState('year', { defaultValue: '' });
  const [type, setType] = useQueryState('type', { defaultValue: '' });
  const [category, setCategory] = useQueryState('category', {
    defaultValue: '',
  });
  const [funding, setFunding] = useQueryState('funding', {
    defaultValue: '',
  });
  const [procurement, setProcurement] = useQueryState('procurement', {
    defaultValue: '',
  });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: DEFAULT_SORT as string,
  });
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const allProjects = getProjects();
  const barangays = getBarangays();
  const barangayNameByPsgc = useMemo(
    () => new Map(barangays.map(b => [b.psgc_code, b.name])),
    [barangays]
  );

  const years = useMemo(
    () => [...new Set(allProjects.map(p => p.year))].sort((a, b) => b - a),
    [allProjects]
  );
  const fundingSources = useMemo(
    () =>
      [
        ...new Set(
          allProjects
            .map(p => p.funding_source)
            .filter((v): v is string => Boolean(v))
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [allProjects]
  );
  const procurementModes = useMemo(
    () =>
      [
        ...new Set(
          allProjects
            .map(p => p.procurement_mode)
            .filter((v): v is string => Boolean(v))
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [allProjects]
  );

  const activeSort = SORT_VALUES.includes(sort)
    ? (sort as SortValue)
    : DEFAULT_SORT;

  const filtered = useMemo(() => {
    return allProjects.filter(p => {
      if (q.trim() && !matchesQuery(p, q.trim())) return false;
      if (lifecycle && p.lifecycle_status !== lifecycle) return false;
      if (
        barangayPsgc &&
        (barangayPsgc === UNATTRIBUTED_BARANGAY
          ? p.barangay_psgc !== null
          : p.barangay_psgc !== barangayPsgc)
      )
        return false;
      if (year && p.year !== Number(year)) return false;
      if (type && p.project_type !== type) return false;
      if (category && p.project_category !== category) return false;
      if (funding && p.funding_source !== funding) return false;
      if (procurement && p.procurement_mode !== procurement) return false;
      return true;
    });
  }, [
    allProjects,
    q,
    lifecycle,
    barangayPsgc,
    year,
    type,
    category,
    funding,
    procurement,
  ]);

  const sorted = useMemo(
    () => sortProjects(filtered, activeSort),
    [filtered, activeSort]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageProjects = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const rangeStart =
    sorted.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, sorted.length);

  const hasFilters = Boolean(
    q ||
    lifecycle ||
    barangayPsgc ||
    year ||
    type ||
    category ||
    funding ||
    procurement
  );
  const activeFilterCount = [
    lifecycle,
    barangayPsgc,
    year,
    type,
    category,
    funding,
    procurement,
  ].filter(Boolean).length;

  function resetPage() {
    setPage(1);
  }

  function clearAll() {
    setQ(null);
    setLifecycle(null);
    setBarangayPsgc(null);
    setYear(null);
    setType(null);
    setCategory(null);
    setFunding(null);
    setProcurement(null);
    setSort(null);
    setPage(1);
    setMoreFiltersOpen(false);
  }

  const barangayLabel =
    barangayPsgc === UNATTRIBUTED_BARANGAY
      ? 'Barangay not attributed'
      : barangayNameByPsgc.get(barangayPsgc);

  return (
    <main className="flex-grow bg-white pb-16 md:pb-24">
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Projects', href: '/projects' },
              { label: 'City Projects' },
            ]}
          />
          <div className="mt-6 max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">City Projects</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 md:text-5xl">
              City Projects
            </h1>
            <p className="mt-5 text-base leading-7 text-gray-700 md:text-lg">
              Browse verified City projects and procurement records.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Every project links to the official evidence behind it.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 md:py-12">
        {/* Search + filters */}
        <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={q}
              onChange={event => {
                setQ(event.target.value || null);
                resetPage();
              }}
              placeholder="Search by project, barangay, contractor, bid reference, contract number, or PhilGEPS reference..."
              aria-label="Search projects"
              className="w-full rounded-sm border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(open => !open)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900"
              aria-expanded={mobileFiltersOpen}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>

            <label className="flex-1">
              <span className="sr-only">Sort projects</span>
              <select
                value={activeSort}
                onChange={event => {
                  setSort(event.target.value);
                  resetPage();
                }}
                className={selectClass}
              >
                {SORTS.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            className={`${mobileFiltersOpen ? 'grid' : 'hidden'} mt-4 grid-cols-1 gap-3 md:grid md:grid-cols-2 md:mt-4 lg:grid-cols-5`}
          >
            <label>
              <span className="sr-only">Filter by status</span>
              <select
                value={lifecycle}
                onChange={event => {
                  setLifecycle(event.target.value || null);
                  resetPage();
                }}
                className={selectClass}
              >
                <option value="">All statuses</option>
                {LIFECYCLE_OPTIONS.map(status => (
                  <option key={status} value={status}>
                    {titleCaseEnum(status)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter by barangay</span>
              <select
                value={barangayPsgc}
                onChange={event => {
                  setBarangayPsgc(event.target.value || null);
                  resetPage();
                }}
                className={selectClass}
              >
                <option value="">All barangays</option>
                <option value={UNATTRIBUTED_BARANGAY}>
                  Barangay not attributed
                </option>
                {barangays.map(b => (
                  <option key={b.psgc_code} value={b.psgc_code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter by year</span>
              <select
                value={year}
                onChange={event => {
                  setYear(event.target.value || null);
                  resetPage();
                }}
                className={selectClass}
              >
                <option value="">All years</option>
                {years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter by project type</span>
              <select
                value={type}
                onChange={event => {
                  setType(event.target.value || null);
                  resetPage();
                }}
                className={selectClass}
              >
                <option value="">All project types</option>
                {TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>
                    {titleCaseEnum(t)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter by project category</span>
              <select
                value={category}
                onChange={event => {
                  setCategory(event.target.value || null);
                  resetPage();
                }}
                className={selectClass}
              >
                <option value="">All categories</option>
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c} value={c}>
                    {titleCaseEnum(c)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block`}>
            <button
              type="button"
              onClick={() => setMoreFiltersOpen(open => !open)}
              aria-expanded={moreFiltersOpen}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              More filters
            </button>

            {moreFiltersOpen && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label>
                  <span className="sr-only">Filter by funding source</span>
                  <select
                    value={funding}
                    onChange={event => {
                      setFunding(event.target.value || null);
                      resetPage();
                    }}
                    className={selectClass}
                  >
                    <option value="">All funding sources</option>
                    {fundingSources.map(source => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="sr-only">Filter by procurement mode</span>
                  <select
                    value={procurement}
                    onChange={event => {
                      setProcurement(event.target.value || null);
                      resetPage();
                    }}
                    className={selectClass}
                  >
                    <option value="">All procurement modes</option>
                    {procurementModes.map(mode => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>

          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4">
              {q && (
                <FilterChip
                  label={`"${q}"`}
                  onRemove={() => {
                    setQ(null);
                    resetPage();
                  }}
                />
              )}
              {lifecycle && (
                <FilterChip
                  label={titleCaseEnum(lifecycle)}
                  onRemove={() => {
                    setLifecycle(null);
                    resetPage();
                  }}
                />
              )}
              {barangayPsgc && barangayLabel && (
                <FilterChip
                  label={barangayLabel}
                  onRemove={() => {
                    setBarangayPsgc(null);
                    resetPage();
                  }}
                />
              )}
              {year && (
                <FilterChip
                  label={year}
                  onRemove={() => {
                    setYear(null);
                    resetPage();
                  }}
                />
              )}
              {type && (
                <FilterChip
                  label={titleCaseEnum(type)}
                  onRemove={() => {
                    setType(null);
                    resetPage();
                  }}
                />
              )}
              {category && (
                <FilterChip
                  label={titleCaseEnum(category)}
                  onRemove={() => {
                    setCategory(null);
                    resetPage();
                  }}
                />
              )}
              {funding && (
                <FilterChip
                  label={funding}
                  onRemove={() => {
                    setFunding(null);
                    resetPage();
                  }}
                />
              )}
              {procurement && (
                <FilterChip
                  label={procurement}
                  onRemove={() => {
                    setProcurement(null);
                    resetPage();
                  }}
                />
              )}
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-gray-600 underline decoration-gray-300 underline-offset-4 hover:text-[#0066EB]"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results header */}
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-950">
              {sorted.length} {sorted.length === 1 ? 'project' : 'projects'}
            </h2>
            <p className="mt-1 text-sm text-gray-600" aria-live="polite">
              {sorted.length === 0
                ? 'Showing 0 projects'
                : `Showing ${rangeStart}–${rangeEnd} of ${sorted.length} projects`}
            </p>
          </div>

          <label className="hidden md:block">
            <span className="sr-only">Sort projects</span>
            <select
              value={activeSort}
              onChange={event => {
                setSort(event.target.value);
                resetPage();
              }}
              className={selectClass}
            >
              {SORTS.map(option => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Project rows */}
        {sorted.length === 0 ? (
          <div className="mt-6 border border-gray-200 px-6 py-16 text-center">
            <SearchX
              className="mx-auto h-8 w-8 text-gray-400"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-bold text-gray-900">
              No projects match these filters.
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Try changing or clearing one or more filters.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 inline-flex items-center rounded-sm bg-[#0066EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0052BC]"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <ol className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {pageProjects.map(project => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="group flex items-center justify-between gap-4 px-2 py-5 transition-colors hover:bg-[#F3F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB] sm:px-3"
                >
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[project.lifecycle_status] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {titleCaseEnum(project.lifecycle_status)}
                    </span>
                    <h3 className="mt-1.5 truncate text-lg font-bold leading-tight text-gray-950 group-hover:text-[#0066EB] md:text-xl">
                      {project.project_name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {project.barangay ?? 'Barangay not attributed'} ·{' '}
                      {project.year} · {titleCaseEnum(project.project_type)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <span className="text-gray-500">
                        ABC{' '}
                        <span className="font-semibold text-gray-900">
                          {formatPeso(project.approved_budget_abc)}
                        </span>
                      </span>
                      <span className="text-gray-500">
                        Contract amount{' '}
                        <span className="font-semibold text-gray-900">
                          {formatPeso(project.contract_amount)}
                        </span>
                      </span>
                    </div>
                    {project.contractor && (
                      <p className="mt-2 truncate text-xs text-gray-500">
                        {project.contractor}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0066EB] group-focus-visible:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ol>
        )}

        {/* Pagination */}
        {sorted.length > 0 && totalPages > 1 && (
          <nav
            aria-label="Project pages"
            className="mt-6 flex items-center justify-between gap-4"
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
      </div>
    </main>
  );
}
