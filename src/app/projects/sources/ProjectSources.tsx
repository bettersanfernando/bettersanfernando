'use client';

import { useMemo } from 'react';
import Link from '../../../components/i18n/LocaleLink';
import { useQueryState, parseAsInteger } from 'nuqs';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileSearch,
  FolderKanban,
  HelpCircle,
  Info,
  RotateCcw,
  Scale,
  Search,
  SearchX,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  EvidenceSourceAuthority,
  getAllProjectEvidence,
  ProjectEvidenceStage,
} from '../../../data/civic/projects';
import {
  countProjectEvidenceByStage,
  EVIDENCE_STAGE_METADATA,
  filterProjectEvidence,
  PROJECT_EVIDENCE_SORTS,
  resolveProjectEvidence,
  type ProjectEvidenceSort,
} from '../../../data/civic/projectSources';
import {
  getEvidenceSourceLabel,
  getEvidenceSourceUrl,
  hasAttachment,
} from '../../../data/civic/sources';
import { formatIsoDate, titleCaseEnum } from '../../../lib/utils';
import type { PageT } from '../../../i18n/page-t';
import { usePageT } from '../../../components/i18n/PageMessages';
import { useLocale } from '../../../components/i18n/useLocale';
import { withSlots } from '../../../components/i18n/rich';

const PAGE_SIZE = 10;
const eyebrowTracking = { letterSpacing: '0.08em' } as const;

const ESTABLISHED_FIELD_LABELS = (t: PageT): Record<string, string> => ({
  project_name: t('Project name'),
  primary_procurement_id: t('Procurement reference'),
  philgeps_reference: t('PhilGEPS reference'),
  contract_number: t('Contract number'),
  approved_budget_abc: t('ABC'),
  contract_amount: t('Contract amount'),
  contractor: t('Contractor'),
  award_date: t('Award date'),
  contract_effectivity_date: t('Contract start date'),
  contract_end_date: t('Contract end date'),
  proceed_date: t('Notice to Proceed date'),
  year: t('Fiscal year'),
  implementing_office: t('Implementing office'),
  location_text: t('Location'),
  barangay: t('Barangay'),
  estimated_budget: t('Estimated budget'),
  funding_source: t('Funding source'),
  procurement_mode: t('Procurement mode'),
  app_code: t('APP Code'),
  winning_bid_amount: t('Winning bid amount'),
  winning_bidder: t('Winning bidder'),
});

function formatEstablishedField(t: PageT, field: string): string {
  return ESTABLISHED_FIELD_LABELS(t)[field] ?? titleCaseEnum(field);
}

// Document-type labels are the data module's own English text; only their display
// is translated (lookup by that text), so the canonical record stays untouched.
function stageLabel(
  t: PageT,
  stage: keyof typeof EVIDENCE_STAGE_METADATA,
  field: 'label' | 'shortLabel'
): string {
  const meta = EVIDENCE_STAGE_METADATA[stage];
  return meta ? t(meta[field]) : stage;
}

// Retrieval-status labels come from getEvidenceSourceLabel(); only their display
// is translated, and an unrecognized status is shown as recorded.
function sourceStatusLabel(t: PageT, label: string): string {
  switch (label) {
    case 'Document verified':
      return t('Document verified');
    case 'Document link recovered':
      return t('Document link recovered');
    case 'Source page only':
      return t('Source page only');
    case 'Source URL recorded':
      return t('Source URL recorded');
    default:
      return label;
  }
}

function formatAuthority(t: PageT, authority: string): string {
  if (authority === 'PRIMARY_OFFICIAL_CSFP') {
    return t('City Government of San Fernando');
  }
  return t('Primary official source');
}

function getPageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

const RELATED_RESOURCES = (t: PageT) =>
  [
    {
      title: t('Bid Results'),
      description: t(
        'Review published bidders, winning bids, ABC values, and official procurement attachments.'
      ),
      href: '/procurement/bid-results',
    },
    {
      title: t('Contracts and Awards'),
      description: t(
        'Explore project-linked award records, contract evidence, contractors, and verified amounts.'
      ),
      href: '/procurement/contracts',
    },
    {
      title: t('Project Methodology'),
      description: t(
        'Learn how project records are gathered, verified, normalized, and interpreted.'
      ),
      href: '/projects/methodology',
    },
    {
      title: t('Procurement Statistics'),
      description: t(
        'Explore documentary coverage and descriptive statistics across the project collection.'
      ),
      href: '/statistics/procurement',
    },
  ] as const;

export default function ProjectSources() {
  const t = usePageT();
  const locale = useLocale();
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [stage, setStage] = useQueryState('stage', { defaultValue: '' });
  const [authority, setAuthority] = useQueryState('authority', {
    defaultValue: '',
  });
  const [document, setDocument] = useQueryState('document', {
    defaultValue: '',
  });
  const [year, setYear] = useQueryState('year', { defaultValue: '' });
  const [projectId, setProjectId] = useQueryState('project', {
    defaultValue: '',
  });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'date-desc',
  });
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const evidence = getAllProjectEvidence();
  const records = useMemo(() => resolveProjectEvidence(evidence), [evidence]);

  const totalEvidence = evidence.length; // 564
  const totalProjects = useMemo(
    () => new Set(evidence.map(item => item.project_id)).size,
    [evidence]
  ); // 324
  const withDocuments = useMemo(
    () => evidence.filter(hasAttachment).length,
    [evidence]
  ); // 554
  const withoutDocuments = totalEvidence - withDocuments; // 9
  const documentCoveragePct = ((withDocuments / totalEvidence) * 100).toFixed(
    1
  ); // '98.4'

  const stageCounts = useMemo(
    () => countProjectEvidenceByStage(evidence),
    [evidence]
  );

  // Evidence types sorted descending by count
  const sortedStages = useMemo(() => {
    return ProjectEvidenceStage.options
      .map(stageKey => ({
        key: stageKey,
        count: stageCounts[stageKey],
        percentage: (stageCounts[stageKey] / totalEvidence) * 100,
        label: stageLabel(t, stageKey, 'label'),
        shortLabel: stageLabel(t, stageKey, 'shortLabel'),
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [stageCounts, totalEvidence, t]);

  // Document years available in the evidence collection
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    for (const item of evidence) {
      if (item.document_date) {
        set.add(item.document_date.slice(0, 4));
      }
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [evidence]);

  const undatedCount = useMemo(
    () => evidence.filter(item => !item.document_date).length,
    [evidence]
  );

  const filtered = useMemo(
    () =>
      filterProjectEvidence(records, {
        query,
        stage: ProjectEvidenceStage.safeParse(stage).success
          ? (stage as (typeof ProjectEvidenceStage.options)[number])
          : '',
        authority: EvidenceSourceAuthority.safeParse(authority).success
          ? (authority as (typeof EvidenceSourceAuthority.options)[number])
          : '',
        document:
          document === 'attachment' || document === 'page-only' ? document : '',
        year,
        projectId,
        sort: PROJECT_EVIDENCE_SORTS.includes(sort as ProjectEvidenceSort)
          ? (sort as ProjectEvidenceSort)
          : 'date-desc',
      }),
    [records, query, stage, authority, document, year, projectId, sort]
  );

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

  const hasActiveFilters = Boolean(
    query ||
    stage ||
    authority ||
    document ||
    year ||
    projectId ||
    (sort && sort !== 'date-desc')
  );

  const handleQueryChange = (val: string) => {
    setQuery(val || null);
    setPage(1);
  };

  const handleStageChange = (val: string) => {
    setStage(val || null);
    setPage(1);
  };

  const handleAuthorityChange = (val: string) => {
    setAuthority(val || null);
    setPage(1);
  };

  const handleDocumentChange = (val: string) => {
    setDocument(val || null);
    setPage(1);
  };

  const handleYearChange = (val: string) => {
    setYear(val || null);
    setPage(1);
  };

  const handleSortChange = (val: string) => {
    setSort(val === 'date-desc' ? null : val);
    setPage(1);
  };

  const clearFilters = () => {
    setQuery(null);
    setStage(null);
    setAuthority(null);
    setDocument(null);
    setYear(null);
    setProjectId(null);
    setSort(null);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Breadcrumbs + Editorial Intro & Scope Module */}
      <section className="container mx-auto px-4 pt-6 pb-8 sm:pt-8 sm:pb-10">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: t('Home'), href: '/' },
            { label: t('Projects'), href: '/projects' },
            { label: t('Project Evidence') },
          ]}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              {t('PROJECT EVIDENCE')}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              {t('Records behind the project facts')}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
              {t(
                'Browse the official records used to support BetterSanFernando’s published project information. Each evidence record identifies the project it supports, the facts it establishes, and the official source where available.'
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
              {t('Project-linked source records')}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              {t(
                'This archive contains source records used to establish published project facts. It is not a complete archive of every document published by the City Government.'
              )}
            </p>
          </aside>
        </div>
      </section>

      {/* 2. Structured Summary Metrics Strip */}
      <section
        aria-label={t('Project evidence summary metrics')}
        className="border-y border-gray-200 bg-gray-50"
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <dl className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            {/* Metric 1: Evidence records */}
            <div className="py-3 sm:py-0 sm:pr-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  {t('Evidence records')}
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {totalEvidence}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {t('official documentary records in the archive')}
              </p>
            </div>

            {/* Metric 2: Projects represented */}
            <div className="py-3 sm:py-0 sm:px-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  {t('Projects represented')}
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {totalProjects}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {t('canonically linked infrastructure and public works')}
              </p>
            </div>

            {/* Metric 3: Official documents available */}
            <div className="py-3 sm:py-0 sm:pl-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  {t('Official documents available')}
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {t('{{withDocuments}} of {{totalEvidence}}', {
                    withDocuments,
                    totalEvidence,
                  })}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {t('{{documentCoveragePct}}% direct document coverage', {
                  documentCoveragePct,
                })}
              </p>
            </div>
          </dl>

          <div className="mt-4 border-t border-gray-200 pt-3 text-xs text-gray-600 sm:mt-4 sm:pt-4">
            <p>
              {t(
                'The archive contains several evidence types, including bid results, utilization reports, procurement monitoring reports, award records, APP records, and invitations to bid.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* 3. Evidence Overview */}
        <section aria-labelledby="evidence-overview-heading">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              {t('EVIDENCE OVERVIEW')}
            </p>
            <h2
              id="evidence-overview-heading"
              className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
            >
              {t('What kinds of records are in the archive?')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-3xl">
              {t(
                'See how the published project evidence is distributed across documentary record types and format availability.'
              )}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* Left Column: Horizontal Evidence-Type Bar Chart */}
            <div className="flex h-full flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <h3 className="text-base font-bold text-gray-950">
                    {t('Evidence type distribution')}
                  </h3>
                  <span className="text-xs font-semibold tabular-nums text-gray-500">
                    {t('Denominator: {{totalEvidence}} records', {
                      totalEvidence,
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Count of published evidence records by documentary type, ordered by record count.'
                  )}
                </p>

                <div
                  className="mt-5 space-y-3.5"
                  role="img"
                  aria-label={t('Evidence type distribution: {{items}}', {
                    items: sortedStages
                      .map(s =>
                        t('{{label}}: {{count}} records ({{percentage}}%)', {
                          label: s.label,
                          count: s.count,
                          percentage: s.percentage.toFixed(1),
                        })
                      )
                      .join('; '),
                  })}
                >
                  {sortedStages.map(stageItem => (
                    <div key={stageItem.key} className="space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                        <span className="font-semibold text-gray-950">
                          {stageItem.label}
                        </span>
                        <span className="font-medium tabular-nums text-gray-900">
                          {t('{{count}} of {{total}}', {
                            count: stageItem.count,
                            total: totalEvidence,
                          })}{' '}
                          <span className="font-normal text-gray-500">
                            ({stageItem.percentage.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-sm bg-gray-100 p-0.5">
                        <div
                          className="h-full rounded-sm bg-[#0066EB] transition-all"
                          style={{ width: `${stageItem.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">
                <p>
                  {t(
                    'Each record serves a distinct documentary function. Multiple evidence records can support the same project across different stages.'
                  )}
                </p>
              </div>
            </div>

            {/* Right Column: Document Availability Summary */}
            <div className="flex h-full flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  {t('Document availability')}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Availability of direct file attachments versus official source-page records.'
                  )}
                </p>

                <div className="mt-5 space-y-3.5">
                  <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                        {t('Direct document link')}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-gray-950">
                        {t('{{withDocuments}} of {{totalEvidence}}', {
                          withDocuments,
                          totalEvidence,
                        })}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-700">
                      {withSlots(
                        t(
                          '{{percent}} of records link directly to downloadable PDF files or official scanned attachments hosted on official government portals.'
                        ),
                        { percent: <strong>{documentCoveragePct}%</strong> }
                      )}
                    </p>
                  </div>

                  <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {t('Source page only')}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-gray-950">
                        {t('{{withoutDocuments}} of {{totalEvidence}}', {
                          withoutDocuments,
                          totalEvidence,
                        })}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-700">
                      {withSlots(
                        t(
                          '{{count}} records rely on verified official source web pages where no separate attachment was published or recovered.'
                        ),
                        { count: <strong>{withoutDocuments}</strong> }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">
                <p>
                  {t(
                    'All {{totalEvidence}} records trace to primary official government sources (City of San Fernando official portal or national oversight agencies).',
                    { totalEvidence }
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Project Evidence Archive (Search & Filters) */}
        <section aria-labelledby="archive-heading">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('PROJECT EVIDENCE ARCHIVE')}
              </p>
              <h2
                id="archive-heading"
                className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
              >
                {t('Browse evidence records')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Search official-source records by project, evidence type, identifier, or the facts they establish.'
                )}
              </p>
            </div>

            {/* Results Count Summary */}
            <p className="text-xs font-semibold tabular-nums text-gray-700 sm:text-sm shrink-0">
              {filtered.length === totalEvidence
                ? t('Showing {{from}}–{{to}} of {{total}} records', {
                    from: fromCount,
                    to: toCount,
                    total: totalEvidence,
                  })
                : t('Showing {{from}}–{{to}} of {{total}} matching records', {
                    from: fromCount,
                    to: toCount,
                    total: filtered.length,
                  })}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            {/* Primary Search Input */}
            <div className="relative">
              <span className="sr-only">{t('Search evidence records')}</span>
              <Search
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={event => handleQueryChange(event.target.value)}
                placeholder={t(
                  'Search project, source ID, evidence ID, or established field...'
                )}
                className="w-full rounded-sm border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-950 placeholder:text-gray-500 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => handleQueryChange('')}
                  aria-label={t('Clear search input')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Responsive Filter Controls */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* Filter: Evidence Type */}
              <div>
                <label
                  htmlFor="filter-stage"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                >
                  {t('Evidence type')}
                </label>
                <select
                  id="filter-stage"
                  value={stage}
                  onChange={event => handleStageChange(event.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-950 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">{t('All evidence types')}</option>
                  {sortedStages.map(s => (
                    <option key={s.key} value={s.key}>
                      {s.label} ({s.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter: Source Authority */}
              <div>
                <label
                  htmlFor="filter-authority"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                >
                  {t('Source authority')}
                </label>
                <select
                  id="filter-authority"
                  value={authority}
                  onChange={event => handleAuthorityChange(event.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-950 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">{t('All source authorities')}</option>
                  <option value="PRIMARY_OFFICIAL_CSFP">
                    {t('City Government of San Fernando ({{count}})', {
                      count: evidence.filter(
                        item =>
                          item.source_authority === 'PRIMARY_OFFICIAL_CSFP'
                      ).length,
                    })}
                  </option>
                  <option value="PRIMARY_OFFICIAL">
                    {t('Primary official ({{count}})', {
                      count: evidence.filter(
                        item => item.source_authority === 'PRIMARY_OFFICIAL'
                      ).length,
                    })}
                  </option>
                </select>
              </div>

              {/* Filter: Document Availability */}
              <div>
                <label
                  htmlFor="filter-document"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                >
                  {t('Document availability')}
                </label>
                <select
                  id="filter-document"
                  value={document}
                  onChange={event => handleDocumentChange(event.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-950 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">{t('All records')}</option>
                  <option value="attachment">
                    {t('Direct document available ({{withDocuments}})', {
                      withDocuments,
                    })}
                  </option>
                  <option value="page-only">
                    {t('Source page only ({{withoutDocuments}})', {
                      withoutDocuments,
                    })}
                  </option>
                </select>
              </div>

              {/* Filter: Document Year */}
              <div>
                <label
                  htmlFor="filter-year"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                >
                  {t('Document year')}
                </label>
                <select
                  id="filter-year"
                  value={year}
                  onChange={event => handleYearChange(event.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-950 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">{t('All years')}</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                  <option value="undated">
                    {t('Undated ({{undatedCount}})', { undatedCount })}
                  </option>
                </select>
              </div>

              {/* Filter: Sort Order */}
              <div>
                <label
                  htmlFor="filter-sort"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                >
                  {t('Sort order')}
                </label>
                <select
                  id="filter-sort"
                  value={sort}
                  onChange={event => handleSortChange(event.target.value)}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-950 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="date-desc">{t('Newest document')}</option>
                  <option value="date-asc">{t('Oldest document')}</option>
                  <option value="project-asc">{t('Project name A–Z')}</option>
                  <option value="type-asc">{t('Evidence type A–Z')}</option>
                  <option value="identifier-asc">
                    {t('Source identifier A–Z')}
                  </option>
                </select>
              </div>
            </div>

            {/* Active Filters Clear Row */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/80 pt-3">
                <span className="text-xs text-gray-600">
                  {t(
                    'Filters are active ({{length}} of {{totalEvidence}} records match)',
                    { length: filtered.length, totalEvidence }
                  )}
                </span>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0066EB] hover:text-[#0052BC] transition-colors"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  {t('Clear all filters')}
                </button>
              </div>
            )}
          </div>

          {/* 5. Evidence Records List */}
          {filtered.length === 0 ? (
            /* Empty State */
            <div className="mt-6 rounded-sm border border-gray-200 bg-white p-8 text-center sm:p-12">
              <SearchX
                className="mx-auto h-8 w-8 text-gray-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 text-base font-bold text-gray-950">
                {t('No evidence records match these filters.')}
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                {t('Try changing or clearing one or more filters.')}
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-[#0066EB] px-4 py-2 text-xs font-bold text-white hover:bg-[#0052BC] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('Clear filters')}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
              <ol className="divide-y divide-gray-200">
                {paginatedRecords.map(({ evidence: item, project }) => {
                  const sourceUrl = getEvidenceSourceUrl(item);
                  const hasDirectDoc = hasAttachment(item);
                  const sourceLabel = sourceStatusLabel(
                    t,
                    getEvidenceSourceLabel(item)
                  );

                  return (
                    <li
                      key={item.id}
                      className="p-5 sm:p-6 transition-colors hover:bg-[#F3F6FB]"
                    >
                      {/* Desktop Grid Layout */}
                      <div className="hidden lg:grid lg:grid-cols-[minmax(9rem,1.1fr)_minmax(0,2.5fr)_minmax(12rem,1.4fr)_minmax(9rem,1fr)] lg:items-start lg:gap-6">
                        {/* Col 1: Evidence type + date + tech ID */}
                        <div>
                          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#0066EB]">
                            {stageLabel(t, item.stage, 'shortLabel')}
                          </span>
                          <p className="mt-1 text-xs font-medium text-gray-900">
                            {item.document_date
                              ? formatIsoDate(item.document_date, locale)
                              : t('Undated document')}
                          </p>
                          <p className="mt-1 font-mono text-xs text-gray-500 break-words">
                            {item.source_identifier}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-gray-400 break-all">
                            {t('ID: {{id}}', { id: item.id })}
                          </p>
                        </div>

                        {/* Col 2: Project + What this record establishes */}
                        <div className="min-w-0">
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-base font-bold text-gray-950 hover:text-[#0066EB] transition-colors leading-snug"
                          >
                            {project.project_name}
                          </Link>
                          {project.barangay && (
                            <p className="mt-1 text-xs text-gray-600">
                              {project.barangay}
                            </p>
                          )}
                          <p className="mt-2.5 text-xs leading-relaxed text-gray-700">
                            <strong className="font-semibold text-gray-900">
                              {t('Establishes:')}{' '}
                            </strong>
                            {item.fields_established.length > 0
                              ? item.fields_established
                                  .map(field =>
                                    formatEstablishedField(t, field)
                                  )
                                  .join(' · ')
                              : t('General documentary support')}
                          </p>
                        </div>

                        {/* Col 3: Source / Provenance */}
                        <div>
                          <p className="text-xs font-bold text-gray-950">
                            {formatAuthority(t, item.source_authority)}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-emerald-600"
                              aria-hidden="true"
                            />
                            {sourceLabel}
                          </div>
                          <p className="mt-1 text-[11px] text-gray-500">
                            {hasDirectDoc
                              ? t('Direct official document')
                              : t('Official source page')}
                          </p>
                        </div>

                        {/* Col 4: Actions */}
                        <div className="flex flex-col gap-2 pt-0.5 lg:items-end">
                          {sourceUrl && (
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#0066EB] hover:text-[#0052BC] transition-colors"
                              aria-label={t(
                                '{{value}} for {{source_identifier}} (opens in a new tab)',
                                {
                                  value: hasDirectDoc
                                    ? 'Open official document'
                                    : 'Open official source page',
                                  source_identifier: item.source_identifier,
                                }
                              )}
                            >
                              {hasDirectDoc
                                ? t('Open document')
                                : t('Open source page')}
                              <ExternalLink
                                className="h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                              />
                            </a>
                          )}
                          {hasDirectDoc && item.page_url && (
                            <a
                              href={item.page_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                              aria-label={t(
                                'Open source page for {{source_identifier}} (opens in a new tab)',
                                { source_identifier: item.source_identifier }
                              )}
                            >
                              {t('Source page')}
                              <ExternalLink
                                className="h-3 w-3 shrink-0"
                                aria-hidden="true"
                              />
                            </a>
                          )}
                          <Link
                            href={`/projects/${project.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-[#0066EB] transition-colors"
                          >
                            {t('View project →')}
                          </Link>
                        </div>
                      </div>

                      {/* Mobile / Tablet Stacked Layout */}
                      <div className="space-y-3 lg:hidden">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#0066EB]">
                            {stageLabel(t, item.stage, 'shortLabel')}
                          </span>
                          <span className="text-xs font-medium text-gray-600">
                            {item.document_date
                              ? formatIsoDate(item.document_date, locale)
                              : 'Undated'}
                          </span>
                        </div>

                        <div>
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-base font-bold text-gray-950 hover:text-[#0066EB] transition-colors"
                          >
                            {project.project_name}
                          </Link>
                          {project.barangay && (
                            <p className="mt-0.5 text-xs text-gray-600">
                              {project.barangay}
                            </p>
                          )}
                        </div>

                        <p className="text-xs leading-relaxed text-gray-700">
                          <strong className="font-semibold text-gray-900">
                            {t('Establishes:')}{' '}
                          </strong>
                          {item.fields_established.length > 0
                            ? item.fields_established
                                .map(field => formatEstablishedField(t, field))
                                .join(' · ')
                            : t('General documentary support')}
                        </p>

                        <div className="border-t border-gray-100 pt-2 text-xs text-gray-600">
                          <p className="font-medium text-gray-950">
                            {formatAuthority(t, item.source_authority)}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-600">
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-emerald-600"
                              aria-hidden="true"
                            />
                            {sourceLabel} ·{' '}
                            <span className="font-mono text-[11px] text-gray-500">
                              {item.source_identifier}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                          {sourceUrl && (
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-[#0066EB] hover:text-[#0052BC]"
                              aria-label={t(
                                '{{value}} for {{source_identifier}} (opens in a new tab)',
                                {
                                  value: hasDirectDoc
                                    ? 'Open official document'
                                    : 'Open official source page',
                                  source_identifier: item.source_identifier,
                                }
                              )}
                            >
                              {hasDirectDoc
                                ? t('Open document')
                                : t('Open source page')}
                              <ExternalLink
                                className="h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                              />
                            </a>
                          )}
                          {hasDirectDoc && item.page_url && (
                            <a
                              href={item.page_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900"
                              aria-label={t(
                                'Open source page for {{source_identifier}} (opens in a new tab)',
                                { source_identifier: item.source_identifier }
                              )}
                            >
                              {t('Source page')}
                              <ExternalLink
                                className="h-3 w-3 shrink-0"
                                aria-hidden="true"
                              />
                            </a>
                          )}
                          <Link
                            href={`/projects/${project.id}`}
                            className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-[#0066EB]"
                          >
                            {t('View project →')}
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* 6. Pagination Controls */}
          {filtered.length > PAGE_SIZE && (
            <nav
              aria-label={t('Project evidence pagination')}
              className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6"
            >
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {t('Previous')}
              </button>

              {/* Desktop Numbered Window */}
              <div className="hidden sm:flex sm:items-center sm:gap-1">
                {getPageWindow(currentPage, totalPages).map((item, idx) =>
                  item === '…' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-sm text-gray-400 select-none"
                    >
                      {t('…')}
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      aria-current={item === currentPage ? 'page' : undefined}
                      aria-label={t('Page {{item}}', { item })}
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
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                {t('Next')}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>

        {/* 7. How to Read This Archive */}
        <section
          aria-labelledby="how-to-read-heading"
          className="border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('HOW TO READ THIS ARCHIVE')}
          </p>
          <h2
            id="how-to-read-heading"
            className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
          >
            {t('Understanding project evidence')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {t(
              'Key rules for interpreting published evidence records and official citations.'
            )}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <Info className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">
                  {t('Evidence supports specific facts')}
                </h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                {t(
                  'A source record supports only the project fields it actually establishes. Its presence does not verify every fact about a project.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <Scale className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">
                  {t('Missing evidence remains unknown')}
                </h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                {t(
                  'If a record is not present in the published archive, BetterSanFernando has not established that fact from the evidence currently available. This does not prove the activity or document never existed.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <HelpCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">
                  {t('Different records answer different questions')}
                </h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                {t(
                  'Bid-result records, award records, contract evidence, utilization reports, and other documents establish different facts about a project.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* 8. Keep Exploring */}
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
            {t('Continue exploring project records')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {t(
              'Navigate the complete repository of city infrastructure projects, procurement overviews, and official documentation sources.'
            )}
          </p>

          {/* Two Featured Destinations */}
          <div className="mt-6 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
            {/* City Projects Card */}
            <article className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6 transition-colors hover:bg-[#F3F6FB]">
              <div>
                <div className="flex items-center gap-2.5 text-[#0066EB]">
                  <FolderKanban
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  <h3 className="text-base font-bold text-gray-950">
                    {t('City Projects')}
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t('Browse the complete published City project collection.')}
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/projects/city-projects"
                  className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC]"
                >
                  {t('Browse City Projects →')}
                </Link>
              </div>
            </article>

            {/* Procurement Overview Card */}
            <article className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6 transition-colors hover:bg-[#F3F6FB]">
              <div>
                <div className="flex items-center gap-2.5 text-[#0066EB]">
                  <FileSearch className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <h3 className="text-base font-bold text-gray-950">
                    {t('Procurement Overview')}
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Understand how project, bid, award, and contract evidence relate.'
                  )}
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/procurement"
                  className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC]"
                >
                  {t('View Procurement Overview →')}
                </Link>
              </div>
            </article>
          </div>

          {/* Related resources: 2x2 Directory */}
          <div className="mt-8">
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
