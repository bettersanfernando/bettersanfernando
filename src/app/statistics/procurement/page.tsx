import Link from '../../../components/i18n/LocaleLink';
import {
  ChevronRight,
  Database,
  FileCheck2,
  FileSearch,
  FolderKanban,
  Info,
  Scale,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import { getProcurementStatistics } from '../../../data/civic/procurementStatistics';
import { buildPageMetadata } from '../../../lib/metadata';
import { enumLabel } from '../enum-labels';
import { getProjects } from '../../../data/civic/projects';
import type { PageT } from '../../../i18n/page-t';
import { getPageT } from '../../../i18n/server';

export async function generateMetadata() {
  const { t, locale } = await getPageT('statistics-procurement');
  return buildPageMetadata({
    title: t('Procurement Statistics'),
    description: t(
      "Descriptive statistics describing BetterSanFernando's bounded, published infrastructure and public-works procurement documentation."
    ),
    path: '/statistics/procurement',
    locale,
  });
}

const eyebrowTracking = { letterSpacing: '0.08em' } as const;

const PROJECT_FIELD_INFO = (t: PageT) =>
  [
    {
      key: 'approvedBudgetAbc',
      label: t('Approved Budget for the Contract (ABC)'),
      availableCount: 229,
      isExpenditure: false,
    },
    {
      key: 'winningBidAmount',
      label: t('Winning bid amount'),
      availableCount: 232,
      isExpenditure: false,
    },
    {
      key: 'contractAmount',
      label: t('Contract amount'),
      availableCount: 8,
      isExpenditure: false,
    },
    {
      key: 'contractNumber',
      label: t('Contract number'),
      availableCount: 6,
      isExpenditure: false,
    },
    {
      key: 'actualExpenditure',
      label: t('Actual expenditure'),
      availableCount: 0,
      isExpenditure: true,
    },
  ] as const;

const BID_RESULT_FIELDS = (t: PageT) =>
  [
    { key: 'winningBidder', label: t('Winning bidder available') },
    { key: 'winningBidAmount', label: t('Winning bid amount available') },
    { key: 'attachment', label: t('Official document available') },
    { key: 'approvedBudgetAbc', label: t('Approved budget (ABC) available') },
  ] as const;

const LIFECYCLE_DESCRIPTIONS = (t: PageT): Record<string, string> => ({
  PLANNED: t('Published evidence establishes a planned project record.'),
  PROCUREMENT: t('Published evidence establishes an active procurement stage.'),
  AWARDED: t('Published evidence establishes an award decision.'),
  CONTRACTED: t('Published evidence supports an executed contract.'),
  IMPLEMENTATION_REPORTED: t(
    'An official implementation report describes project activity without establishing an award, contract, or payment.'
  ),
});

const RELATED_RESOURCES = (t: PageT) =>
  [
    {
      title: t('Procurement Overview'),
      description: t(
        'Understand how procurement records, stages, and evidence are structured across BetterSanFernando.'
      ),
      href: '/procurement',
    },
    {
      title: t('City Projects'),
      description: t(
        'Browse the full published collection of {{projects}} City infrastructure and public-works projects.',
        { projects: getProjects().length }
      ),
      href: '/projects/city-projects',
    },
    {
      title: t('Project Evidence'),
      description: t(
        'Inspect the official source records and attachments used to establish project facts.'
      ),
      href: '/projects/sources',
    },
    {
      title: t('Project Methodology'),
      description: t(
        'Learn how project records are gathered, verified, and interpreted.'
      ),
      href: '/projects/methodology',
    },
  ] as const;

export default async function ProcurementStatistics() {
  const { t } = await getPageT('statistics-procurement');
  const statistics = getProcurementStatistics();

  const totalProjects = statistics.projects.total; // 324
  const totalEvidence = statistics.evidence.total; // 564
  const totalBidResults = statistics.bidResults.total; // 233
  const awardedCount = statistics.awardsAndContracts.awarded; // 228
  const contractedCount = statistics.awardsAndContracts.contracted; // 6

  // Largest year count for bid-result year chart scale
  const largestYearCount = Math.max(
    ...statistics.bidResults.byDocumentYear.map(item => item.count)
  );

  // Documentary status items sorted by project count descending, with stable key fallback for ties
  const sortedLifecycle = [...statistics.projects.lifecycle].sort(
    (a, b) => b.count - a.count || a.key.localeCompare(b.key)
  );

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Breadcrumbs + Editorial Intro & Scope Module */}
      <section className="container mx-auto px-4 pt-6 pb-8 sm:pt-8 sm:pb-10">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: t('Home'), href: '/' },
            { label: t('Statistics'), href: '/statistics' },
            { label: t('Procurement Statistics') },
          ]}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              {t('PROCUREMENT STATISTICS')}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              {t('Published procurement evidence and coverage')}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
              {t(
                "Descriptive statistics describing documentation availability, documentary lifecycle states, and bid-result coverage across BetterSanFernando's published project collection."
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
              {t('Bounded published subset')}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              {t(
                "These measures describe record coverage and documentary representation in BetterSanFernando's project collection. They are not a complete archive of City Government procurement, and they do not measure financial performance or actual spending."
              )}
            </p>
          </aside>
        </div>
      </section>

      {/* 2. Structured Summary Metrics Strip */}
      <section
        aria-label={t('Procurement summary metrics')}
        className="border-y border-gray-200 bg-gray-50"
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <dl className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            {/* Metric 1: Published projects */}
            <div className="py-3 sm:py-0 sm:pr-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  {t('Published projects')}
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {totalProjects}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {t('canonical infrastructure and public-works project records')}
              </p>
            </div>

            {/* Metric 2: Project evidence records */}
            <div className="py-3 sm:py-0 sm:px-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  {t('Project evidence records')}
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {totalEvidence}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {t('official documentary records across all stages')}
              </p>
            </div>

            {/* Metric 3: Published bid-result records */}
            <div className="py-3 sm:py-0 sm:pl-6">
              <div className="flex items-baseline justify-between sm:block">
                <dt className="text-sm font-medium text-gray-600">
                  {t('Bid-result records')}
                </dt>
                <dd className="text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:mt-1 sm:text-3xl lg:text-4xl">
                  {totalBidResults}
                </dd>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {t('published bid-result evidence documents')}
              </p>
            </div>
          </dl>

          {/* Quiet supporting status pair */}
          <div className="mt-4 border-t border-gray-200 pt-3 flex flex-wrap items-center justify-between gap-y-2 text-xs text-gray-600 sm:mt-4 sm:pt-4">
            <p>
              {t('Current project lifecycle status breakdown:')}{' '}
              <strong className="font-semibold text-gray-900">
                {t('{{awardedCount}} Awarded', { awardedCount })}
              </strong>{' '}
              ({((awardedCount / totalProjects) * 100).toFixed(1)}%) &middot;{' '}
              <strong className="font-semibold text-gray-900">
                {t('{{contractedCount}} Contracted', { contractedCount })}
              </strong>{' '}
              ({((contractedCount / totalProjects) * 100).toFixed(1)}%).
            </p>
            <p className="text-gray-500">
              {t(
                'Documentary status reflects available published evidence, not physical project completion.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="container mx-auto px-4 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* 3. How to Read This Page: Two Denominators */}
        <section aria-labelledby="denominators-heading">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              {t('HOW TO READ THIS PAGE')}
            </p>
            <h2
              id="denominators-heading"
              className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
            >
              {t('Two distinct denominators are used')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-3xl">
              {t(
                'Coverage rates answer two different questions. Every metric on this page explicitly identifies which denominator it uses.'
              )}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Project Denominator Module */}
            <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <FolderKanban className="h-5 w-5 shrink-0" aria-hidden="true" />
                <p
                  className="text-eyebrow text-[#0066EB]"
                  style={eyebrowTracking}
                >
                  {t('PROJECT DENOMINATOR')}
                </p>
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950">
                {totalProjects}{' '}
                <span className="text-base font-medium text-gray-600">
                  {t('published projects')}
                </span>
              </p>
              <h3 className="mt-3 text-sm font-bold text-gray-950">
                {t('When asking about project records')}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                {t(
                  'Used to determine how many published projects contain a particular field (like ABC or contract amount) or currently hold a canonical documentary status (like Awarded or Contracted).'
                )}
              </p>
            </div>

            {/* Bid-Result Denominator Module */}
            <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <FileSearch className="h-5 w-5 shrink-0" aria-hidden="true" />
                <p
                  className="text-eyebrow text-[#0066EB]"
                  style={eyebrowTracking}
                >
                  {t('BID-RESULT DENOMINATOR')}
                </p>
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950">
                {totalBidResults}{' '}
                <span className="text-base font-medium text-gray-600">
                  {t('published bid-result records')}
                </span>
              </p>
              <h3 className="mt-3 text-sm font-bold text-gray-950">
                {t('When asking about bid-result evidence completeness')}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                {t(
                  'Used to determine what proportion of published bid-result records contain specific fields such as winning bidders, winning bids, ABC values, or official source documents.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* 4. Current Documentary Lifecycle (Horizontal Bar Chart) */}
        <section aria-labelledby="lifecycle-heading">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('DOCUMENTARY STATUS')}
              </p>
              <h2
                id="lifecycle-heading"
                className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
              >
                {t('Current documentary status distribution')}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {t(
                  'Shows the strongest currently published documentary status for each of the {{totalProjects}} projects, ordered by project count.',
                  { totalProjects }
                )}
              </p>
            </div>
            <span className="text-xs font-semibold tabular-nums text-gray-500 shrink-0">
              {t('Denominator: {{totalProjects}} projects', { totalProjects })}
            </span>
          </div>

          <div className="mt-6 rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
            <div
              className="space-y-4"
              role="img"
              aria-label={t('Documentary status distribution: {{items}}', {
                items: sortedLifecycle
                  .map(i =>
                    t('{{status}}: {{n}} projects ({{percentage}}%)', {
                      status: enumLabel(t, i.key),
                      n: i.count,
                      percentage: i.percentage,
                    })
                  )
                  .join('; '),
              })}
            >
              {sortedLifecycle.map(item => {
                const label = enumLabel(t, item.key);
                const desc = LIFECYCLE_DESCRIPTIONS(t)[item.key];
                return (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs sm:text-sm">
                      <span className="font-bold text-gray-950">{label}</span>
                      <span className="font-semibold tabular-nums text-gray-900">
                        {t('{{n}} of {{total}}', {
                          n: item.count,
                          total: item.denominator,
                        })}{' '}
                        <span className="font-normal text-gray-500">
                          ({item.percentage.toFixed(1)}%)
                        </span>
                      </span>
                    </div>

                    {/* Horizontal Bar */}
                    <div className="h-3 w-full overflow-hidden rounded-sm bg-gray-100 p-0.5">
                      <div
                        className={`h-full rounded-sm transition-all ${
                          item.key === 'CONTRACTED'
                            ? 'bg-[#0F766E]'
                            : item.key === 'AWARDED'
                              ? 'bg-[#0066EB]'
                              : 'bg-slate-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] leading-relaxed text-gray-500">
                      {desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Clarification Note */}
            <p className="mt-6 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">
              {t(
                'Each project appears once according to its strongest currently published documentary status. These categories are not a procurement funnel or a measure of physical progress.'
              )}
            </p>
          </div>
        </section>

        {/* 5. Project-Level Procurement Field Coverage (Analytical Stacked Rows) */}
        <section aria-labelledby="field-coverage-heading">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('FIELD COVERAGE')}
              </p>
              <h2
                id="field-coverage-heading"
                className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
              >
                {t('What procurement fields are available?')}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {t(
                  'Documentary presence across all {{totalProjects}} published projects.',
                  { totalProjects }
                )}
              </p>
            </div>
            <span className="text-xs font-semibold tabular-nums text-gray-500 shrink-0">
              {t('Denominator: {{totalProjects}} projects', { totalProjects })}
            </span>
          </div>

          <div className="mt-6 rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
            <div className="space-y-5">
              {PROJECT_FIELD_INFO(t).map(field => {
                if (field.isExpenditure) {
                  return (
                    <div
                      key={field.key}
                      className="rounded-sm border border-amber-200/80 bg-amber-50/50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Info
                          className="h-4 w-4 text-amber-700 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-950">
                            {t('Actual expenditure')}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-amber-900">
                            {t(
                              'Actual expenditure is not currently available in the published procurement dataset. BetterSanFernando does not report unverified expenditure or treat contract values as payment.'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                const available = field.availableCount;
                const remaining = totalProjects - available;
                const pct = ((available / totalProjects) * 100).toFixed(1);

                return (
                  <div key={field.key} className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs sm:text-sm">
                      <span className="font-semibold text-gray-950">
                        {field.label}
                      </span>
                      <span className="tabular-nums text-gray-900 font-medium">
                        <strong className="font-bold text-gray-950">
                          {available}
                        </strong>{' '}
                        {t('available')}{' '}
                        <span className="text-gray-500">
                          {t('({{pct}}%) · {{remaining}} not available', {
                            pct,
                            remaining,
                          })}
                        </span>
                      </span>
                    </div>

                    {/* Stacked Coverage Bar: Available (Blue) + Not available (Pale Gray) */}
                    <div
                      className="h-3 w-full overflow-hidden rounded-sm bg-gray-100 flex"
                      role="img"
                      aria-label={t(
                        '{{label}}: {{available}} available ({{pct}}%), {{remaining}} not available',
                        { label: field.label, available, pct, remaining }
                      )}
                    >
                      <div
                        className="h-full bg-[#0066EB]"
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className="h-full bg-gray-200"
                        style={{ width: `${100 - Number(pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend & Clarification */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-none bg-[#0066EB]"
                    aria-hidden="true"
                  />
                  {t('Field published (>0)')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-none bg-gray-200"
                    aria-hidden="true"
                  />
                  {t('Not available in published record')}
                </span>
              </div>
              <p>
                {t(
                  'Presence of a field indicates published data availability, not data quality or procurement completion.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* 6. Bid-Result Evidence Row: 2-Column Analytical Charts */}
        <section aria-labelledby="bid-results-heading">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              {t('BID RESULTS EVIDENCE')}
            </p>
            <h2
              id="bid-results-heading"
              className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
            >
              {t('Bid-result evidence completeness and timeline')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-3xl">
              {t(
                'Analyzed across {{totalBidResults}} published bid-result records (representing {{projectsRepresented}} canonically linked projects).',
                {
                  totalBidResults,
                  projectsRepresented:
                    statistics.bidResults.projectsRepresented,
                }
              )}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
            {/* Left Column: Bid-result field completeness */}
            <div className="flex h-full flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  {t('Bid-result evidence completeness')}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Completeness across {{totalBidResults}} published bid-result records.',
                    { totalBidResults }
                  )}
                </p>

                <div className="mt-5 space-y-4">
                  {BID_RESULT_FIELDS(t).map(field => {
                    const item = statistics.bidResults.fieldCoverage.find(
                      f => f.key === field.key
                    );
                    const count = item?.count ?? 0;
                    const pct = item?.percentage ?? 0;

                    return (
                      <div key={field.key} className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2 text-xs">
                          <span className="font-semibold text-gray-950">
                            {field.label}
                          </span>
                          <span className="font-medium tabular-nums text-gray-900">
                            {t('{{n}} of {{total}}', {
                              n: count,
                              total: totalBidResults,
                            })}{' '}
                            <span className="text-gray-500 font-normal">
                              ({pct.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-sm bg-gray-100">
                          <div
                            className="h-full rounded-sm bg-[#0066EB]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Factual Quick Read Footer */}
              <div className="mt-6 rounded-sm bg-[#F3F6FB] p-3.5 text-xs text-gray-700">
                <p>
                  <strong className="font-semibold text-gray-950">
                    {t('High documentary completeness:')}
                  </strong>{' '}
                  {t(
                    'All {{total}} published bid-result records contain winning bidder information, winning bid amounts, and official source attachments.',
                    { total: totalBidResults }
                  )}
                </p>
              </div>
            </div>

            {/* Right Column: Bid-result records by document year */}
            <div className="flex h-full flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  {t('Bid-result records by document year')}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Count of published bid-result records by document year, including undated records; denominator: {{totalBidResults}} records.',
                    { totalBidResults }
                  )}
                </p>

                {/* Vertical Bar Chart: 4 Dated Years + 1 Undated Column */}
                <div
                  className="mt-5 grid grid-cols-5 items-end gap-2 sm:gap-4"
                  role="img"
                  aria-label={t(
                    'Bid-results by document date: {{years}}, Undated: {{undated}}',
                    {
                      years: statistics.bidResults.byDocumentYear
                        .map(y => `${y.year}: ${y.count}`)
                        .join('; '),
                      undated: statistics.bidResults.unknownDocumentDate,
                    }
                  )}
                >
                  {statistics.bidResults.byDocumentYear.map(item => {
                    const heightPct = (item.count / largestYearCount) * 100;
                    return (
                      <div
                        key={item.year}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <span className="text-xs font-bold tabular-nums text-gray-950">
                          {item.count}
                        </span>
                        <span className="flex h-28 sm:h-32 w-full max-w-10 items-end rounded-sm bg-gray-100 p-0.5">
                          <span
                            className="w-full rounded-sm bg-[#0066EB]"
                            style={{ height: `${heightPct}%` }}
                          />
                        </span>
                        <span className="text-xs font-medium tabular-nums text-gray-600">
                          {item.year}
                        </span>
                      </div>
                    );
                  })}

                  {/* 5th Column: Undated records */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs font-bold tabular-nums text-gray-600">
                      {statistics.bidResults.unknownDocumentDate}
                    </span>
                    <span className="flex h-28 sm:h-32 w-full max-w-10 items-end rounded-sm bg-gray-100 p-0.5">
                      <span
                        className="w-full rounded-sm bg-slate-400"
                        style={{
                          height: `${(statistics.bidResults.unknownDocumentDate / largestYearCount) * 100}%`,
                        }}
                      />
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {t('Undated')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend & Summary Footer */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs text-gray-600">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-none bg-[#0066EB]"
                      aria-hidden="true"
                    />
                    {t('Documented year')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-none bg-slate-400"
                      aria-hidden="true"
                    />
                    {t('Undated ({{n}} records)', {
                      n: statistics.bidResults.unknownDocumentDate,
                    })}
                  </span>
                </div>
                <span className="tabular-nums font-medium text-gray-900">
                  {t('{{totalBidResults}} total records', { totalBidResults })}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Award and Contract Evidence Distinction */}
        <section aria-labelledby="award-contract-heading">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              {t('AWARD & CONTRACT EVIDENCE')}
            </p>
            <h2
              id="award-contract-heading"
              className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
            >
              {t('Award and contract evidence remain distinct')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-3xl">
              {t(
                'Descriptive field and lifecycle counts across the {{totalProjects}}-project collection. Award decisions and contract execution are different legal and documentary milestones.',
                { totalProjects }
              )}
            </p>
          </div>

          <div className="mt-6 rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
            <dl className="grid grid-cols-2 gap-4 divide-y sm:divide-y-0 sm:grid-cols-4 sm:divide-x divide-gray-200">
              <div className="py-2 sm:py-0 sm:pr-4">
                <dt className="text-xs font-medium text-gray-600">
                  {t('Awarded projects')}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                  {statistics.awardsAndContracts.awarded}
                </dd>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {t('published award decision')}
                </p>
              </div>

              <div className="pt-3 sm:pt-0 sm:px-4">
                <dt className="text-xs font-medium text-gray-600">
                  {t('Contracted projects')}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                  {statistics.awardsAndContracts.contracted}
                </dd>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {t('canonical contract execution')}
                </p>
              </div>

              <div className="pt-3 sm:pt-0 sm:px-4">
                <dt className="text-xs font-medium text-gray-600">
                  {t('With contract amount')}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                  {statistics.awardsAndContracts.withContractAmount}
                </dd>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {t('6 Contracted + 2 Awarded')}
                </p>
              </div>

              <div className="pt-3 sm:pt-0 sm:pl-4">
                <dt className="text-xs font-medium text-gray-600">
                  {t('With contract number')}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                  {statistics.awardsAndContracts.withContractNumber}
                </dd>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {t('all 6 Contracted projects')}
                </p>
              </div>
            </dl>

            <div className="mt-6 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-600 space-y-1.5">
              <p>
                &bull;{' '}
                <strong className="font-semibold text-gray-950">
                  {t('Award evidence')}
                </strong>{' '}
                {t(
                  'establishes an award decision. It does not by itself establish contract execution.'
                )}
              </p>
              <p>
                &bull;{' '}
                <strong className="font-semibold text-gray-950">
                  {t('Contract evidence')}
                </strong>{' '}
                {t(
                  'requires separate documentation supporting contract execution before a project holds Contracted status.'
                )}
              </p>
              <p>
                &bull;{' '}
                <strong className="font-semibold text-gray-950">
                  {t('Execution boundaries')}
                </strong>
                {t(
                  ': Contract evidence does not establish Notice to Proceed, physical completion, disbursement, or actual expenditure.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* 8. How to Interpret These Statistics (2x2 Editorial Layout) */}
        <section aria-labelledby="interpret-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('METHODOLOGY & INTERPRETATION')}
          </p>
          <h2
            id="interpret-heading"
            className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
          >
            {t('How to interpret these statistics')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-3xl">
            {t(
              'Guidelines for understanding what published procurement data can and cannot establish.'
            )}
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item 1: Documentary status */}
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <FolderKanban className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">
                  {t('Documentary status')}
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {t(
                  'Documentary lifecycle reflects published records, not physical construction progress. A project marked Awarded or Contracted documents an administrative state supported by official source evidence.'
                )}
              </p>
            </div>

            {/* Item 2: Field coverage */}
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <Database className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">
                  {t('Field coverage')}
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {t(
                  'Field coverage indicates that a published value is available in the current collection. It is not a data-quality audit, a performance score, or an evaluation of procurement compliance.'
                )}
              </p>
            </div>

            {/* Item 3: Missing information */}
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <Info className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">
                  {t('Missing information')}
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {t(
                  'When a field or document is missing, it remains unknown in the dataset unless another published official source establishes it. Absence of a record does not prove an event never took place.'
                )}
              </p>
            </div>

            {/* Item 4: Financial concepts */}
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#0066EB]">
                <Scale className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-950">
                  {t('Financial concepts')}
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {t(
                  'ABC, winning bid, and contract amount are distinct procurement figures. None of them represent actual disbursement, payment, or expenditure. No monetary totals are summed across partial collections.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* 9. Keep Exploring */}
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
            {t('Explore procurement records and evidence')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {t(
              'Navigate to individual record explorers, published project collections, and official documentation sources.'
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
                    'Review published bidders, winning bids, ABC values, and official procurement attachments for {{total}} bid-result records.',
                    { total: totalBidResults }
                  )}
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/procurement/bid-results"
                  className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC]"
                >
                  {t('Browse Bid Results →')}
                </Link>
              </div>
            </article>

            {/* Contracts and Awards Card */}
            <article className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6 transition-colors hover:bg-[#F3F6FB]">
              <div>
                <div className="flex items-center gap-2.5 text-[#0066EB]">
                  <FileCheck2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <h3 className="text-base font-bold text-gray-950">
                    {t('Contracts and Awards')}
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Explore project-linked award records, contract evidence, contractors, contract references, and verified amounts.'
                  )}
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/procurement/contracts"
                  className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC]"
                >
                  {t('Browse Contracts and Awards →')}
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
