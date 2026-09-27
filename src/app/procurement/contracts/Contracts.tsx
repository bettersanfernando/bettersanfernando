'use client';

import { useMemo, useState } from 'react';
import Link from '../../../components/i18n/LocaleLink';
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
  CONTRACT_RECORD_SORTS,
  filterAndSortContractRecords,
  getAwardAndContractRecords,
  getContractsSummary,
  hasContractAmount,
  hasContractNumber,
  type ContractRecordSort,
} from '../../../data/civic/contracts';
import { getProjects } from '../../../data/civic/projects';
import { getEvidenceSourceUrl } from '../../../data/civic/sources';
import { formatIsoDate, formatPeso } from '../../../lib/utils';
import type { PageT } from '../../../i18n/page-t';
import { usePageT } from '../../../components/i18n/PageMessages';
import { useLocale } from '../../../components/i18n/useLocale';

const PAGE_SIZE = 10;
const eyebrowTracking = { letterSpacing: '0.14em' };

const RELATED_RESOURCES = (t: PageT) =>
  [
    {
      title: t('Procurement overview'),
      description: t(
        'Understand the procurement records and evidence available across BetterSanFernando.'
      ),
      href: '/procurement',
    },
    {
      title: t('City Projects'),
      description: t('Browse the full published City project collection.'),
      href: '/projects/city-projects',
    },
    {
      title: t('Project Evidence'),
      description: t(
        'Inspect the official-source records used to establish project facts.'
      ),
      href: '/projects/sources',
    },
    {
      title: t('Project Methodology'),
      description: t(
        'See how project records are collected, structured, and interpreted.'
      ),
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

export default function Contracts() {
  const t = usePageT();
  const locale = useLocale();
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [lifecycle, setLifecycle] = useQueryState('status', {
    defaultValue: '',
  });
  const [year, setYear] = useQueryState('year', { defaultValue: '' });
  const [barangay, setBarangay] = useQueryState('barangay', {
    defaultValue: '',
  });
  const [funding, setFunding] = useQueryState('funding', { defaultValue: '' });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'date-desc',
  });
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const [activeChartYear, setActiveChartYear] = useState<number | null>(null);

  const projects = useMemo(() => getProjects(), []);
  const records = useMemo(() => getAwardAndContractRecords(), []);
  const summary = useMemo(
    () => getContractsSummary(records, projects.length),
    [projects.length, records]
  );

  const years = useMemo(
    () =>
      [...new Set(records.map(record => record.project.year))].sort(
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

  const fundingSources = useMemo(
    () =>
      [
        ...new Set(
          records
            .map(r => r.project.funding_source)
            .filter((f): f is string => Boolean(f))
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [records]
  );

  const filtered = useMemo(
    () =>
      filterAndSortContractRecords(records, {
        query,
        lifecycle:
          lifecycle === 'AWARDED' || lifecycle === 'CONTRACTED'
            ? lifecycle
            : '',
        year,
        barangay,
        funding,
        sort: CONTRACT_RECORD_SORTS.includes(sort as ContractRecordSort)
          ? (sort as ContractRecordSort)
          : 'date-desc',
      }),
    [barangay, funding, lifecycle, query, records, sort, year]
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
    lifecycle ||
    year ||
    barangay ||
    funding ||
    (sort && sort !== 'date-desc')
  );

  const handleQueryChange = (val: string) => {
    setQuery(val || null);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setLifecycle(val || null);
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

  const handleFundingChange = (val: string) => {
    setFunding(val || null);
    setPage(1);
  };

  const handleSortChange = (val: string) => {
    setSort(val === 'date-desc' ? null : val);
    setPage(1);
  };

  const clearFilters = () => {
    setQuery(null);
    setLifecycle(null);
    setYear(null);
    setBarangay(null);
    setFunding(null);
    setSort(null);
    setPage(1);
  };

  // Metrics calculations
  const contractCoveragePct =
    summary.awarded > 0
      ? ((summary.contracted / summary.awarded) * 100).toFixed(1)
      : '0.0';

  const allContractedHaveDetails =
    summary.contracted > 0 &&
    summary.withContractNumber === summary.contracted &&
    records
      .filter(r => r.project.lifecycle_status === 'CONTRACTED')
      .every(r => hasContractAmount(r.project));

  // Chart 1: Evidence by document year (chronological, with Awarded vs Contracted breakdown)
  const recordsByYear = useMemo(() => {
    const map = new Map<
      number,
      { year: number; total: number; awarded: number; contracted: number }
    >();
    for (const r of records) {
      const y = r.project.year;
      if (!map.has(y)) {
        map.set(y, { year: y, total: 0, awarded: 0, contracted: 0 });
      }
      const item = map.get(y)!;
      item.total += 1;
      if (r.project.lifecycle_status === 'CONTRACTED') {
        item.contracted += 1;
      } else {
        item.awarded += 1;
      }
    }
    return [...map.values()].sort((a, b) => a.year - b.year);
  }, [records]);

  const maxYearTotal = useMemo(
    () => Math.max(1, ...recordsByYear.map(item => item.total)),
    [recordsByYear]
  );

  // Quick Read derivations from documentary timeline
  const timelineQuickRead = useMemo(() => {
    const totalRecordsRepresented = recordsByYear.reduce(
      (sum, item) => sum + item.total,
      0
    );
    let highestYear = recordsByYear[0] ?? { year: 0, total: 0 };
    for (const item of recordsByYear) {
      if (item.total > highestYear.total) {
        highestYear = item;
      }
    }
    const yearsRepresented = recordsByYear.length;
    const yearsWithContracted = recordsByYear.filter(
      item => item.contracted > 0
    ).length;

    return {
      totalRecordsRepresented,
      highestYear,
      yearsRepresented,
      yearsWithContracted,
    };
  }, [recordsByYear]);

  // Right Module: Contracted Projects Snapshot & Comparison
  const contractedProjects = useMemo(
    () =>
      records
        .filter(r => r.project.lifecycle_status === 'CONTRACTED')
        .map(r => {
          const p = r.project;
          const pct =
            p.approved_budget_abc && p.contract_amount
              ? ((p.contract_amount / p.approved_budget_abc) * 100).toFixed(1)
              : null;
          return {
            id: p.id,
            name: p.project_name,
            contractor: p.contractor,
            contractNumber: p.identifiers.contract_number,
            abc: p.approved_budget_abc,
            contractAmount: p.contract_amount,
            pct,
          };
        }),
    [records]
  );

  // Right Module 2: Evidence Coverage for Contracted projects
  const contractedEvidenceCoverage = useMemo(() => {
    const contractedRecords = records.filter(
      r => r.project.lifecycle_status === 'CONTRACTED'
    );
    const total = contractedRecords.length;
    const withContractNumber = contractedRecords.filter(r =>
      hasContractNumber(r.project)
    ).length;
    const withContractAmount = contractedRecords.filter(r =>
      hasContractAmount(r.project)
    ).length;
    const withOfficialSource = contractedRecords.filter(
      r => Boolean(r.sourceEvidence) || Boolean(r.evidence?.length)
    ).length;

    return {
      total,
      withContractNumber,
      withContractAmount,
      withOfficialSource,
    };
  }, [records]);

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Breadcrumbs + Editorial Intro & Scope Module */}
      <section className="container mx-auto px-4 pt-6 pb-8 sm:pt-8 sm:pb-10">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: t('Home'), href: '/' },
            { label: t('Projects'), href: '/projects' },
            { label: t('Procurement'), href: '/procurement' },
            { label: t('Contracts and Awards') },
          ]}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              {t('CONTRACTS & AWARDS')}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              {t('Published award and contract evidence')}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
              {t(
                'Browse project-linked award records, contract evidence, contractors, contract references, financial amounts, and official source documents.'
              )}
            </p>
          </div>

          <aside
            aria-labelledby="scope-module-title"
            className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5"
          >
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              {t('SCOPE')}
            </p>
            <h2
              id="scope-module-title"
              className="mt-1.5 text-base font-bold text-gray-950"
            >
              {t('Project-linked award and contract records')}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              {t(
                'These records document award and contract-related evidence connected to BetterSanFernando’s current project collection. They are not a complete archive of all City Government procurement.'
              )}
            </p>
          </aside>
        </div>
      </section>

      {/* 2. Non-Repetitive Summary Metrics Strip */}
      <section
        aria-label={t('Award and contract metrics')}
        className="border-y border-gray-200 bg-gray-50"
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <dl className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            {/* Metric 1 */}
            <div className="py-3 sm:py-0 sm:pr-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  {t('Awarded projects')}
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {summary.awarded}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {t('projects with published award evidence')}
              </p>
            </div>

            {/* Metric 2 */}
            <div className="py-3 sm:py-0 sm:px-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  {t('Contracted projects')}
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {summary.contracted}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {t(
                  'projects whose canonical records support contract execution'
                )}
              </p>
            </div>

            {/* Metric 3 */}
            <div className="py-3 sm:py-0 sm:pl-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  {t('Contract evidence coverage')}
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {t('{{contracted}} of {{awarded}}', {
                    contracted: summary.contracted,
                    awarded: summary.awarded,
                  })}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {t('{{contractCoveragePct}}% documentary status coverage', {
                  contractCoveragePct,
                })}
              </p>
            </div>
          </dl>

          {allContractedHaveDetails && (
            <p className="mt-3 border-t border-gray-200 pt-3 text-xs leading-relaxed text-gray-500 sm:mt-4 sm:pt-4">
              {t(
                'All currently Contracted projects include a published contract number and contract amount.'
              )}
            </p>
          )}
        </div>
      </section>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 sm:py-12 space-y-10 sm:space-y-14">
        {/* 3. Documentary Overview (Equal-height desktop panels) */}
        <section aria-labelledby="overview-heading">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              {t('DOCUMENTARY OVERVIEW')}
            </p>
            <h2
              id="overview-heading"
              className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
            >
              {t('Overview of award and contract evidence')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {t(
                'See how published award and contract-related records are represented across the current project collection.'
              )}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {/* Left Column: Year Chart + Quick Read */}
            <div className="flex h-full flex-col gap-5">
              {/* Left Top: Evidence by document year */}
              <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
                <h3 className="text-base font-bold text-gray-950">
                  {t('Award and contract evidence by document year')}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {t(
                    'See when the published award and contract-related evidence in this collection was documented.'
                  )}
                </p>

                {/* Vertical Stacked Bar Chart */}
                <div
                  className="mt-5 grid grid-cols-5 items-end gap-2 sm:gap-4 border-b border-gray-200 pb-3"
                  role="img"
                  aria-label={t(
                    'Award and contract projects by year: {{items}}',
                    {
                      items: recordsByYear
                        .map(y =>
                          t(
                            '{{year}}: {{total}} projects ({{awarded}} awarded, {{contracted}} contracted)',
                            {
                              year: y.year,
                              total: y.total,
                              awarded: y.awarded,
                              contracted: y.contracted,
                            }
                          )
                        )
                        .join('; '),
                    }
                  )}
                >
                  {recordsByYear.map(item => {
                    const isHovered = activeChartYear === item.year;
                    const totalHeightPct = (item.total / maxYearTotal) * 100;
                    const contractedPct =
                      item.total > 0 ? (item.contracted / item.total) * 100 : 0;
                    const awardedPct =
                      item.total > 0 ? (item.awarded / item.total) * 100 : 0;

                    return (
                      <button
                        key={item.year}
                        type="button"
                        onMouseEnter={() => setActiveChartYear(item.year)}
                        onMouseLeave={() => setActiveChartYear(null)}
                        onFocus={() => setActiveChartYear(item.year)}
                        onBlur={() => setActiveChartYear(null)}
                        className="group flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:rounded-sm"
                        aria-label={t(
                          '{{year}}: {{total}} projects ({{awarded}} awarded, {{contracted}} contracted)',
                          {
                            year: item.year,
                            total: item.total,
                            awarded: item.awarded,
                            contracted: item.contracted,
                          }
                        )}
                      >
                        {/* Count label above bar */}
                        <span className="text-xs font-bold tabular-nums text-gray-950 group-hover:text-[#0066EB]">
                          {item.total}
                        </span>

                        {/* Bar column */}
                        <span className="flex h-32 sm:h-36 w-full max-w-10 items-end rounded-sm bg-gray-100 p-0.5">
                          <span
                            className="flex w-full flex-col justify-end overflow-hidden rounded-sm transition-all"
                            style={{ height: `${totalHeightPct}%` }}
                          >
                            {/* Contracted segment on top */}
                            {item.contracted > 0 && (
                              <span
                                className="w-full bg-[#0F766E]"
                                style={{ height: `${contractedPct}%` }}
                              />
                            )}
                            {/* Awarded segment below */}
                            <span
                              className={`w-full ${isHovered ? 'bg-[#0052BC]' : 'bg-[#0066EB]'}`}
                              style={{ height: `${awardedPct}%` }}
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
                          {t('· {{total}} projects ·', {
                            total: activeItem.total,
                          })}{' '}
                          <span className="text-[#0066EB] font-medium">
                            {t('{{awarded}} awarded', {
                              awarded: activeItem.awarded,
                            })}
                          </span>
                          {activeItem.contracted > 0 && (
                            <span className="text-[#0F766E] font-medium">
                              {t('· {{contracted}} contracted', {
                                contracted: activeItem.contracted,
                              })}
                            </span>
                          )}
                        </p>
                      );
                    })()
                  ) : (
                    <p className="text-gray-500">
                      {t('Hover or focus a year to view details.')}
                    </p>
                  )}
                </div>

                {/* Legend pinned to bottom of chart */}
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-none bg-[#0066EB]"
                      aria-hidden="true"
                    />
                    {t('Awarded status')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-none bg-[#0F766E]"
                      aria-hidden="true"
                    />
                    {t('Contracted status')}
                  </span>
                </div>
              </div>

              {/* Left Bottom: Quick Read module */}
              <div className="mt-auto rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
                <p
                  className="text-eyebrow text-[#0066EB]"
                  style={eyebrowTracking}
                >
                  {t('QUICK READ')}
                </p>
                <h4 className="mt-1 text-sm font-bold text-gray-950">
                  {t('What the documentary timeline shows')}
                </h4>
                <div className="mt-3 grid grid-cols-1 divide-y divide-gray-200/80 sm:grid-cols-2 sm:divide-y-0 border-t border-gray-200/80 pt-1">
                  {/* Top-Left: Records represented */}
                  <div className="py-3 sm:py-3 sm:pr-4 sm:border-r sm:border-b border-gray-200/80">
                    <p className="text-lg font-bold tabular-nums text-gray-950">
                      {timelineQuickRead.totalRecordsRepresented}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {t('records represented across timeline')}
                    </p>
                  </div>

                  {/* Top-Right: Highest-volume year */}
                  <div className="py-3 sm:py-3 sm:pl-4 sm:border-b border-gray-200/80">
                    <p className="text-lg font-bold tabular-nums text-gray-950">
                      {timelineQuickRead.highestYear.year}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {t('highest-volume year ·')}{' '}
                      <span className="tabular-nums font-medium text-gray-900">
                        {t('{{total}} records', {
                          total: timelineQuickRead.highestYear.total,
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Bottom-Left: Document years represented */}
                  <div className="py-3 sm:py-3 sm:pr-4 sm:border-r border-gray-200/80">
                    <p className="text-lg font-bold tabular-nums text-gray-950">
                      {timelineQuickRead.yearsRepresented}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {t('document years represented')}
                    </p>
                  </div>

                  {/* Bottom-Right: Years with Contracted-status records */}
                  <div className="py-3 sm:py-3 sm:pl-4">
                    <p className="text-lg font-bold tabular-nums text-gray-950">
                      {timelineQuickRead.yearsWithContracted}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {t('document years include Contracted-status records')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contract Comparison + Evidence Coverage */}
            <div className="flex flex-col gap-5">
              {/* Right Top: Contract Comparison */}
              <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="text-eyebrow text-[#0066EB]"
                    style={eyebrowTracking}
                  >
                    {t('CONTRACT EVIDENCE')}
                  </p>
                  <span className="text-xs font-semibold text-gray-500">
                    {t('{{contracted}} verified projects', {
                      contracted: summary.contracted,
                    })}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-bold text-gray-950">
                  {t('Current contract evidence snapshot')}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Factual summary and financial comparison for the {{contracted}} projects with verified contract execution.',
                    { contracted: summary.contracted }
                  )}
                </p>

                {/* Contract Amount Compared with ABC */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {t('Contract amount compared with ABC')}
                  </h4>
                  <div className="mt-2.5 divide-y divide-gray-100 border-y border-gray-100 text-xs">
                    {contractedProjects.map(cp => (
                      <div
                        key={cp.id}
                        className="py-2 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/projects/${cp.id}`}
                            className="font-medium text-gray-950 hover:text-[#0066EB] line-clamp-1"
                            title={cp.name}
                          >
                            {cp.name}
                          </Link>
                          <p className="text-[11px] text-gray-500">
                            {cp.contractor}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-semibold tabular-nums text-gray-900">
                            {cp.contractAmount !== null
                              ? formatPeso(cp.contractAmount, locale)
                              : 'Unavailable'}
                          </span>
                          {cp.pct && (
                            <span className="block text-[11px] font-medium tabular-nums text-gray-500">
                              {t('{{pct}}% of ABC', { pct: cp.pct })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clarification Note immediately following */}
                <p className="mt-4 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">
                  {t(
                    'This compares published contract amounts with ABC. It does not represent actual expenditure, payment, or savings.'
                  )}
                </p>
              </div>

              {/* Right Bottom: Evidence Coverage */}
              <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
                <p
                  className="text-eyebrow text-[#0066EB]"
                  style={eyebrowTracking}
                >
                  {t('EVIDENCE COVERAGE')}
                </p>
                <h4 className="mt-1 text-sm font-bold text-gray-950">
                  {t('What is available for the Contracted projects')}
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-4 divide-y divide-gray-200/80 sm:grid-cols-3 sm:divide-y-0 sm:divide-x sm:divide-gray-200/80">
                  <div className="sm:pr-3">
                    <p className="text-lg font-bold tabular-nums text-gray-950">
                      {t('{{withContractNumber}} of {{total}}', {
                        withContractNumber:
                          contractedEvidenceCoverage.withContractNumber,
                        total: contractedEvidenceCoverage.total,
                      })}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {t('include a published contract number')}
                    </p>
                  </div>

                  <div className="pt-3 sm:pt-0 sm:px-3">
                    <p className="text-lg font-bold tabular-nums text-gray-950">
                      {t('{{withContractAmount}} of {{total}}', {
                        withContractAmount:
                          contractedEvidenceCoverage.withContractAmount,
                        total: contractedEvidenceCoverage.total,
                      })}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {t('include a published contract amount')}
                    </p>
                  </div>

                  <div className="pt-3 sm:pt-0 sm:pl-3">
                    <p className="text-lg font-bold tabular-nums text-gray-950">
                      {t('{{withOfficialSource}} of {{total}}', {
                        withOfficialSource:
                          contractedEvidenceCoverage.withOfficialSource,
                        total: contractedEvidenceCoverage.total,
                      })}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {t('include contract-related official evidence')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Published Records Browser */}
        <section
          aria-labelledby="records-browser-heading"
          className="space-y-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('AWARD AND CONTRACT RECORDS')}
              </p>
              <h2
                id="records-browser-heading"
                className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
              >
                {t('Published records')}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {t(
                  'Search and filter award and contract-related evidence linked to published City projects.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-xs font-medium tabular-nums text-gray-600 sm:text-sm"
                aria-live="polite"
              >
                {filtered.length === 0
                  ? t('0 matching records')
                  : hasActiveFilters
                    ? t(
                        'Showing {{from}}–{{to}} of {{total}} matching records',
                        {
                          from: fromCount,
                          to: toCount,
                          total: filtered.length,
                        }
                      )
                    : t('Showing {{from}}–{{to}} of {{total}} records', {
                        from: fromCount,
                        to: toCount,
                        total: filtered.length,
                      })}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-sm border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:border-[#0066EB] hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('Clear filters')}
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters Surface */}
          <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-gray-700">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              {t('Filter award and contract records')}
            </div>

            {/* Primary Search Input */}
            <div className="relative">
              <span className="sr-only">{t('Search records')}</span>
              <Search
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder={t(
                  'Search project, contractor, contract number, or reference...'
                )}
                className="w-full rounded-sm border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
              />
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* Status Filter */}
              <div>
                <label
                  htmlFor="filter-status"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  {t('Documentary status')}
                </label>
                <select
                  id="filter-status"
                  value={lifecycle}
                  onChange={e => handleStatusChange(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">{t('All statuses')}</option>
                  <option value="AWARDED">{t('Awarded')}</option>
                  <option value="CONTRACTED">{t('Contracted')}</option>
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label
                  htmlFor="filter-year"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  {t('Document year')}
                </label>
                <select
                  id="filter-year"
                  value={year}
                  onChange={e => handleYearChange(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">{t('All years')}</option>
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
                  {t('Barangay')}
                </label>
                <select
                  id="filter-barangay"
                  value={barangay}
                  onChange={e => handleBarangayChange(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">{t('All barangays')}</option>
                  {barangays.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Funding Source Filter */}
              <div>
                <label
                  htmlFor="filter-funding"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  {t('Funding source')}
                </label>
                <select
                  id="filter-funding"
                  value={funding}
                  onChange={e => handleFundingChange(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">{t('All funding sources')}</option>
                  {fundingSources.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label
                  htmlFor="filter-sort"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  {t('Sort order')}
                </label>
                <select
                  id="filter-sort"
                  value={sort}
                  onChange={e => handleSortChange(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="date-desc">{t('Newest document')}</option>
                  <option value="date-asc">{t('Oldest document')}</option>
                  <option value="title-asc">{t('Project name A–Z')}</option>
                  <option value="abc-desc">{t('ABC: high to low')}</option>
                  <option value="abc-asc">{t('ABC: low to high')}</option>
                  <option value="contract-amount-desc">
                    {t('Contract amount: high to low')}
                  </option>
                  <option value="contract-amount-asc">
                    {t('Contract amount: low to high')}
                  </option>
                  <option value="contract-number-asc">
                    {t('Contract number A–Z')}
                  </option>
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
                {t('No award or contract records match these filters.')}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {t('Try changing or clearing one or more filters.')}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-[#0066EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {t('Clear filters')}
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Compact Table */}
              <div className="hidden lg:block overflow-hidden rounded-sm border border-gray-200 bg-white">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#F3F6FB] text-xs font-semibold text-gray-700">
                      <th scope="col" className="py-3 px-4 w-[26%]">
                        {t('Project')}
                      </th>
                      <th scope="col" className="py-3 px-4 w-[11%]">
                        {t('Status')}
                      </th>
                      <th scope="col" className="py-3 px-4 w-[17%]">
                        {t('Contractor')}
                      </th>
                      <th scope="col" className="py-3 px-4 w-[14%]">
                        {t('Reference')}
                      </th>
                      <th scope="col" className="py-3 px-4 w-[10%]">
                        {t('Date')}
                      </th>
                      <th scope="col" className="py-3 px-4 text-right w-[11%]">
                        <span className="sr-only">
                          {t('Approved Budget for the Contract (ABC)')}
                        </span>
                        {t('ABC')}
                      </th>
                      <th scope="col" className="py-3 px-4 text-right w-[11%]">
                        <span className="sr-only">
                          {t('Winning bid amount')}
                        </span>
                        {t('Contract amount')}
                      </th>
                      <th scope="col" className="py-3 px-4 text-right w-[5%]">
                        {t('Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {paginatedRecords.map(
                      ({ project, sourceEvidence, relevantDate }) => {
                        const sourceUrl = sourceEvidence
                          ? getEvidenceSourceUrl(sourceEvidence)
                          : null;
                        const isContracted =
                          project.lifecycle_status === 'CONTRACTED';

                        return (
                          <tr
                            key={project.id}
                            className="hover:bg-gray-50/75 transition-colors"
                          >
                            {/* Project Cell */}
                            <td className="py-3 px-4 align-top">
                              <Link
                                href={`/projects/${project.id}`}
                                className="font-semibold text-gray-950 hover:text-[#0066EB] line-clamp-2"
                                aria-label={t(
                                  'View project: {{project_name}}',
                                  { project_name: project.project_name }
                                )}
                              >
                                {project.project_name}
                              </Link>
                              <span className="mt-0.5 block text-xs text-gray-500">
                                {project.barangay || 'City-wide'}
                              </span>
                            </td>

                            {/* Status Badge Cell */}
                            <td className="py-3 px-4 align-top">
                              <span
                                className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${
                                  isContracted
                                    ? 'border border-teal-200 bg-teal-50 text-teal-800'
                                    : 'border border-blue-200 bg-blue-50 text-blue-800'
                                }`}
                              >
                                {isContracted ? t('Contracted') : t('Awarded')}
                              </span>
                            </td>

                            {/* Contractor Cell */}
                            <td className="py-3 px-4 align-top text-gray-900">
                              <span className="line-clamp-2">
                                {project.contractor ?? t('Not specified')}
                              </span>
                            </td>

                            {/* Reference / Contract Number Cell */}
                            <td className="py-3 px-4 align-top">
                              {hasContractNumber(project) ? (
                                <span className="font-mono text-xs font-medium text-gray-900 break-words">
                                  {project.identifiers.contract_number}
                                </span>
                              ) : (
                                <span className="text-xs italic text-gray-400">
                                  {t('Not available')}
                                </span>
                              )}
                              <span className="mt-0.5 block font-mono text-[11px] text-gray-400 break-words">
                                {t('ID: {{id}}', { id: project.id })}
                              </span>
                            </td>

                            {/* Document Date Cell */}
                            <td className="py-3 px-4 align-top text-xs text-gray-700 whitespace-nowrap">
                              {formatIsoDate(relevantDate, locale)}
                            </td>

                            {/* ABC Cell */}
                            <td className="py-3 px-4 align-top text-right font-semibold tabular-nums text-gray-900">
                              {project.approved_budget_abc !== null ? (
                                formatPeso(project.approved_budget_abc, locale)
                              ) : (
                                <span className="font-normal italic text-gray-400">
                                  {t('Unavailable')}
                                </span>
                              )}
                            </td>

                            {/* Contract Amount Cell */}
                            <td className="py-3 px-4 align-top text-right font-semibold tabular-nums text-gray-900">
                              {hasContractAmount(project) ? (
                                formatPeso(project.contract_amount, locale)
                              ) : (
                                <span className="font-normal italic text-gray-400">
                                  {t('Unavailable')}
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
                                    aria-label={t(
                                      'Open official source for {{project_name}} (opens in a new tab)',
                                      { project_name: project.project_name }
                                    )}
                                  >
                                    {t('Official source')}
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
                                  {t('View project →')}
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Records (< lg) */}
              <ol className="lg:hidden divide-y divide-gray-200 rounded-sm border border-gray-200 bg-white">
                {paginatedRecords.map(
                  ({ project, sourceEvidence, relevantDate }) => {
                    const sourceUrl = sourceEvidence
                      ? getEvidenceSourceUrl(sourceEvidence)
                      : null;
                    const isContracted =
                      project.lifecycle_status === 'CONTRACTED';

                    return (
                      <li key={project.id} className="p-4 sm:p-5 space-y-3">
                        {/* Status and Project Title */}
                        <div>
                          <span
                            className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${
                              isContracted
                                ? 'border border-teal-200 bg-teal-50 text-teal-800'
                                : 'border border-blue-200 bg-blue-50 text-blue-800'
                            }`}
                          >
                            {isContracted ? t('Contracted') : t('Awarded')}
                          </span>
                          <Link
                            href={`/projects/${project.id}`}
                            className="mt-2 block font-bold text-gray-950 hover:text-[#0066EB] leading-snug"
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
                              {t('Contractor')}
                            </dt>
                            <dd className="mt-0.5 text-sm font-semibold text-gray-950">
                              {project.contractor ?? t('Not specified')}
                            </dd>
                          </div>

                          <div>
                            <dt className="font-medium text-gray-500">
                              {t('Contract number')}
                            </dt>
                            <dd className="mt-0.5 font-mono font-medium text-gray-900 break-words">
                              {hasContractNumber(project) ? (
                                project.identifiers.contract_number
                              ) : (
                                <span className="font-sans italic text-gray-400">
                                  {t('Not available')}
                                </span>
                              )}
                            </dd>
                          </div>

                          <div>
                            <dt className="font-medium text-gray-500">
                              {t('Document date')}
                            </dt>
                            <dd className="mt-0.5 font-medium text-gray-900">
                              {formatIsoDate(relevantDate, locale)}
                            </dd>
                          </div>

                          <div>
                            <dt className="font-medium text-gray-500">
                              {t('Approved Budget (ABC)')}
                            </dt>
                            <dd className="mt-0.5 font-semibold tabular-nums text-gray-950">
                              {project.approved_budget_abc !== null ? (
                                formatPeso(project.approved_budget_abc, locale)
                              ) : (
                                <span className="font-normal italic text-gray-400">
                                  {t('Unavailable')}
                                </span>
                              )}
                            </dd>
                          </div>

                          <div>
                            <dt className="font-medium text-gray-500">
                              {t('Contract amount')}
                            </dt>
                            <dd className="mt-0.5 font-semibold tabular-nums text-gray-950">
                              {hasContractAmount(project) ? (
                                formatPeso(project.contract_amount, locale)
                              ) : (
                                <span className="font-normal italic text-gray-400">
                                  {t('Unavailable')}
                                </span>
                              )}
                            </dd>
                          </div>
                        </dl>

                        {/* Provenance ID */}
                        <p className="font-mono text-[11px] text-gray-400">
                          {t('Record ID: {{id}}', { id: project.id })}
                        </p>

                        {/* Mobile Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs font-semibold">
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-gray-700 hover:text-gray-950"
                          >
                            {t('View project →')}
                          </Link>
                          {sourceUrl && (
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#0066EB] hover:text-[#0052BC]"
                            >
                              {t('Official source')}
                              <ExternalLink
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  }
                )}
              </ol>

              {/* 5. Real Pagination (10 per page) */}
              {totalPages > 1 && (
                <nav
                  aria-label={t('Award and contract pagination')}
                  className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-5"
                >
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    {t('Previous')}
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
                    {t('Page {{currentPage}} of {{totalPages}}', {
                      currentPage,
                      totalPages,
                    })}
                  </p>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  >
                    {t('Next')}
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
            {t('HOW TO READ THESE RECORDS')}
          </p>
          <h2
            id="how-to-read-heading"
            className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
          >
            {t('Understanding award and contract evidence')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {t(
              'Key rules for interpreting published procurement facts and figures. Award does not equal contract execution.'
            )}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <Info className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">
                  {t('Award evidence')}
                </h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                {t(
                  'Published award evidence establishes an award decision. It does not by itself establish contract execution.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <Scale className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">
                  {t('Contract evidence')}
                </h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                {t(
                  'Contracted status requires separate evidence supporting contract execution.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <HelpCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">
                  {t('Financial amounts')}
                </h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                {t(
                  'ABC, winning bid, contract amount, payment, and actual expenditure are different financial concepts. Missing values remain unknown unless another published source establishes it.'
                )}
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
            {t('KEEP EXPLORING')}
          </p>
          <h2
            id="keep-exploring-heading"
            className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
          >
            {t('Continue exploring procurement data')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {t(
              'Compare published bidders, winning bids, ABC values, and descriptive procurement statistics across San Fernando public works.'
            )}
          </p>

          {/* Two Featured Equal Destinations */}
          <div className="mt-6 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
            {/* Bid Results Card */}
            <article className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6 transition-colors hover:bg-[#F3F6FB]">
              <div>
                <div className="flex items-center gap-2.5 text-[#0066EB]">
                  <FileSearch className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <h3 className="text-base font-bold text-gray-950">
                    {t('Bid Results')}
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Review published bidders, winning bids, ABC values, and procurement references.'
                  )}
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/procurement/bid-results"
                  className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC]"
                >
                  {t('View Bid Results →')}
                </Link>
              </div>
            </article>

            {/* Procurement Statistics Card */}
            <article className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6 transition-colors hover:bg-[#F3F6FB]">
              <div>
                <div className="flex items-center gap-2.5 text-[#0066EB]">
                  <FileCheck2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <h3 className="text-base font-bold text-gray-950">
                    {t('Procurement Statistics')}
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Explore documentary coverage and descriptive procurement statistics across the project collection.'
                  )}
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/statistics/procurement"
                  className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC]"
                >
                  {t('View Procurement Statistics →')}
                </Link>
              </div>
            </article>
          </div>

          {/* Related resources: 2x2 Directory */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {t('Related resources')}
            </h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 border-y border-gray-200">
              {RELATED_RESOURCES(t).map((item, idx) => (
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
