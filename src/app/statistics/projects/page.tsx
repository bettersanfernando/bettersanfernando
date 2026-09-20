import Link from 'next/link';
import { ChevronRight, FolderKanban, MapPinned } from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import { aggregateProjectStatistics } from '../../../data/civic/projectStatistics';
import { getProjects } from '../../../data/civic/projects';
import { formatIsoDate, titleCaseEnum } from '../../../lib/utils';
import { buildPageMetadata } from '../../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Project Statistics',
  description:
    'A high-level descriptive snapshot of San Fernando’s published infrastructure and public-works project collection.',
  path: '/statistics/projects',
});

const eyebrowTracking = { letterSpacing: '0.08em' } as const;

const amountLabels = {
  approved_budget_abc: 'Approved Budget for the Contract (ABC)',
  winning_bid_amount: 'Winning bid amount',
  contract_amount: 'Contract amount',
} as const;

const RELATED_RESOURCES = [
  {
    title: 'Project Cost & Utilization',
    description:
      'Verified, source-reported cost-utilization observations for city projects.',
    href: '/statistics/project-spending',
  },
  {
    title: 'Procurement Statistics',
    description:
      'Explore documentary coverage and descriptive statistics across the project collection.',
    href: '/statistics/procurement',
  },
  {
    title: 'Project Evidence',
    description:
      'Inspect the official-source records behind published project facts.',
    href: '/projects/sources',
  },
  {
    title: 'Project Methodology',
    description:
      'Learn how project records are gathered, verified, normalized, and interpreted.',
    href: '/projects/methodology',
  },
] as const;

function formatPercentage(value: number): string {
  return `${new Intl.NumberFormat('en-PH', {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

export default function ProjectStatisticsPage() {
  const statistics = aggregateProjectStatistics(getProjects());
  const attributedPercentage =
    (statistics.barangayAttribution.attributed / statistics.totalProjects) *
    100;

  // Programmatically derived quick-read insights
  const largestStatus = [...statistics.lifecycle].sort(
    (a, b) => b.count - a.count
  )[0];
  const largestType = [...statistics.projectTypes].sort(
    (a, b) => b.count - a.count
  )[0];
  const largestYear = [...statistics.years].sort(
    (a, b) => b.count - a.count
  )[0];

  const sortedLifecycle = [...statistics.lifecycle].sort(
    (a, b) => b.count - a.count
  );
  const sortedTypes = [...statistics.projectTypes].sort(
    (a, b) => b.count - a.count
  );

  const categoryCapital = statistics.projectCategories.find(
    c => c.key === 'INFRASTRUCTURE_CAPITAL'
  ) ?? { key: 'INFRASTRUCTURE_CAPITAL', count: 0, percentage: 0 };
  const categoryMaintenance = statistics.projectCategories.find(
    c => c.key === 'INFRASTRUCTURE_MAINTENANCE'
  ) ?? { key: 'INFRASTRUCTURE_MAINTENANCE', count: 0, percentage: 0 };

  const maxYearCount = Math.max(...statistics.years.map(y => y.count), 1);

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Intro & Scope Module */}
      <section className="container mx-auto px-4 pt-6 pb-8 sm:pt-8 sm:pb-10">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Statistics', href: '/statistics' },
            { label: 'Project Statistics' },
          ]}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              PROJECT STATISTICS
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              A snapshot of San Fernando’s published project records
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
              Explore how BetterSanFernando’s current infrastructure and
              public-works project collection is distributed by documentary
              status, project type, stated year, geography, and available
              financial fields.
            </p>
          </div>

          <aside
            aria-labelledby="scope-module-title"
            className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5"
          >
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              WHAT THIS PAGE SHOWS
            </p>
            <h2
              id="scope-module-title"
              className="mt-1.5 text-base font-bold text-gray-950"
            >
              Bounded published project collection
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              These statistics describe BetterSanFernando’s current published
              project collection. They are not totals for all City Government
              projects, spending, procurement activity, or physical construction
              progress.
            </p>
          </aside>
        </div>

        <p className="mt-4 text-xs text-gray-500 sm:text-sm">
          Status as of {formatIsoDate(statistics.statusAsOf)}
        </p>
      </section>

      {/* 2. Top Metric Strip */}
      <section
        aria-label="High-level project metrics"
        className="border-y border-gray-200 bg-gray-50"
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <dl className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            <div className="py-3 sm:py-0 sm:pr-6">
              <dt className="text-sm font-medium text-gray-600">
                Published projects
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                {statistics.totalProjects}
              </dd>
            </div>
            <div className="py-3 sm:py-0 sm:px-6">
              <dt className="text-sm font-medium text-gray-600">
                With barangay attribution
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                {statistics.barangayAttribution.attributed}{' '}
                <span className="text-base font-normal text-gray-500 sm:text-lg">
                  of {statistics.totalProjects}
                </span>
              </dd>
              <p className="mt-0.5 text-xs text-gray-500">
                {formatPercentage(attributedPercentage)} of collection
              </p>
            </div>
            <div className="py-3 sm:py-0 sm:pl-6">
              <dt className="text-sm font-medium text-gray-600">
                Barangays represented
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                {statistics.barangayAttribution.representedBarangays}{' '}
                <span className="text-base font-normal text-gray-500 sm:text-lg">
                  of 35
                </span>
              </dd>
              <p className="mt-0.5 text-xs text-gray-500">
                at least one attributed record
              </p>
            </div>
          </dl>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto space-y-10 px-4 pt-6 pb-16 sm:space-y-12 sm:pt-8 sm:pb-16">
        {/* 3. Quick Read */}
        <section aria-labelledby="quick-read-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            QUICK READ
          </p>
          <h2
            id="quick-read-heading"
            className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl"
          >
            What stands out in the current collection
          </h2>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
              <div className="p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Documentary status
                </p>
                <p className="mt-1.5 text-sm font-bold text-gray-950 sm:text-base">
                  {titleCaseEnum(largestStatus.key)} is the largest group
                </p>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  {largestStatus.count} projects ·{' '}
                  {formatPercentage(largestStatus.percentage)}
                </p>
              </div>
              <div className="p-4 sm:p-5 sm:border-l sm:border-gray-200 lg:border-l-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Project type
                </p>
                <p className="mt-1.5 text-sm font-bold text-gray-950 sm:text-base">
                  {titleCaseEnum(largestType.key)} is the largest type
                </p>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  {largestType.count} projects ·{' '}
                  {formatPercentage(largestType.percentage)}
                </p>
              </div>
              <div className="p-4 sm:p-5 sm:border-t sm:border-gray-200 lg:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Stated project year
                </p>
                <p className="mt-1.5 text-sm font-bold text-gray-950 sm:text-base">
                  {largestYear.key} is the largest stated year
                </p>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  {largestYear.count} projects ·{' '}
                  {formatPercentage(largestYear.percentage)}
                </p>
              </div>
              <div className="p-4 sm:p-5 sm:border-l sm:border-t sm:border-gray-200 lg:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Geographic attribution
                </p>
                <p className="mt-1.5 text-sm font-bold text-gray-950 sm:text-base">
                  {statistics.barangayAttribution.attributed} projects
                  attributed
                </p>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  {formatPercentage(attributedPercentage)} of collection
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Documentary Status */}
        <section
          id="documentary-status"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            DOCUMENTARY STATUS
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            How projects are currently documented
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Each project appears once according to its strongest currently
            published documentary status. These categories describe evidence,
            not physical construction progress.
          </p>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
            <div className="space-y-4">
              {sortedLifecycle.map(item => (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-gray-950">
                      {titleCaseEnum(item.key)}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-gray-900">
                      {item.count}{' '}
                      <span className="font-normal text-gray-500">
                        ({formatPercentage(item.percentage)})
                      </span>
                    </span>
                  </div>
                  <div
                    className="h-2.5 w-full overflow-hidden rounded-sm bg-gray-100"
                    role="img"
                    aria-label={`${titleCaseEnum(item.key)}: ${item.count} projects, ${formatPercentage(item.percentage)}`}
                  >
                    <div
                      className="h-full rounded-sm bg-[#0066EB]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
            Award, contract, and implementation evidence establish different
            documentary facts. This chart is not a procurement funnel or a
            project-completion scale.
          </p>
        </section>

        {/* 5. Project Mix */}
        <section
          id="project-mix"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            PROJECT MIX
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            What kinds of projects are in the collection?
          </h2>

          {/* Project Type Distribution */}
          <div className="mt-6 rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
            <h3 className="text-base font-bold text-gray-950">
              Project type distribution
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Record count by normalized infrastructure or public-works type.
            </p>

            <div className="mt-5 space-y-3">
              {sortedTypes.map(item => (
                <div
                  key={item.key}
                  className="space-y-1 sm:grid sm:grid-cols-[160px_1fr_120px] sm:items-center sm:gap-4 sm:space-y-0"
                >
                  <div className="flex items-baseline justify-between sm:block">
                    <span className="text-xs font-medium text-gray-900 sm:text-sm">
                      {titleCaseEnum(item.key)}
                    </span>
                    <span className="tabular-nums text-xs font-semibold text-gray-900 sm:hidden">
                      {item.count}{' '}
                      <span className="font-normal text-gray-500">
                        ({formatPercentage(item.percentage)})
                      </span>
                    </span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-sm bg-gray-100"
                    role="img"
                    aria-label={`${titleCaseEnum(item.key)}: ${item.count} projects, ${formatPercentage(item.percentage)}`}
                  >
                    <div
                      className="h-full rounded-sm bg-[#0066EB]"
                      style={{
                        width: `${(item.count / statistics.totalProjects) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="hidden text-right tabular-nums text-xs font-semibold text-gray-900 sm:block sm:text-sm">
                    {item.count}{' '}
                    <span className="font-normal text-gray-500">
                      ({formatPercentage(item.percentage)})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Category */}
          <div className="mt-6 rounded-sm border border-gray-200 bg-white p-5 sm:mt-8 sm:p-6">
            <h3 className="text-base font-bold text-gray-950">
              Project category
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Published project records are classified as infrastructure capital
              or infrastructure maintenance.
            </p>

            {/* Horizontal 100% Split Bar */}
            <div className="mt-4 sm:mt-5">
              <div
                className="flex h-3.5 w-full overflow-hidden rounded-sm bg-gray-100"
                role="img"
                aria-label={`Project category composition: ${categoryCapital.count} Infrastructure Capital (${formatPercentage(categoryCapital.percentage)}), ${categoryMaintenance.count} Infrastructure Maintenance (${formatPercentage(categoryMaintenance.percentage)})`}
              >
                <div
                  className="h-full bg-[#0066EB]"
                  style={{ width: `${categoryCapital.percentage}%` }}
                />
                <div
                  className="h-full bg-[#002EAC]"
                  style={{ width: `${categoryMaintenance.percentage}%` }}
                />
              </div>

              {/* Two equal columns with center divider on desktop */}
              <div className="mt-4 grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="pb-3 sm:pb-0 sm:pr-6">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm bg-[#0066EB]"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-bold text-gray-950 sm:text-sm">
                      Infrastructure Capital
                    </p>
                  </div>
                  <p className="mt-1.5 text-lg font-bold tabular-nums text-gray-950 sm:text-xl">
                    {categoryCapital.count}{' '}
                    <span className="text-xs font-normal text-gray-600 sm:text-sm">
                      ({formatPercentage(categoryCapital.percentage)})
                    </span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    New construction, road building, and primary assets
                  </p>
                </div>

                <div className="pt-3 sm:pl-6 sm:pt-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm bg-[#002EAC]"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-bold text-gray-950 sm:text-sm">
                      Infrastructure Maintenance
                    </p>
                  </div>
                  <p className="mt-1.5 text-lg font-bold tabular-nums text-gray-950 sm:text-xl">
                    {categoryMaintenance.count}{' '}
                    <span className="text-xs font-normal text-gray-600 sm:text-sm">
                      ({formatPercentage(categoryMaintenance.percentage)})
                    </span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Repairs, rehabilitation, and preventive upkeep
                  </p>
                </div>
              </div>
            </div>

            {/* Quiet Explanatory Sentence */}
            <div className="mt-4 border-t border-gray-200 pt-3">
              <p className="text-xs leading-relaxed text-gray-500">
                Capital projects account for the majority of the current
                published archive, representing major public-works
                appropriations.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Project Record Year */}
        <section
          id="project-record-year"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            PROJECT RECORD YEAR
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            When are the published project records dated?
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            This is the stated project year in the published record. It is not a
            spending year, completion year, or construction-progress timeline.
          </p>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex h-52 sm:h-60 items-end gap-3 sm:gap-6 border-b border-gray-200 pb-3">
              {statistics.years.map(item => {
                const heightPercent = Math.max(
                  8,
                  (item.count / maxYearCount) * 100
                );
                return (
                  <div
                    key={item.key}
                    className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end"
                  >
                    <span className="text-xs sm:text-sm font-bold tabular-nums text-gray-900">
                      {item.count}
                    </span>
                    <div
                      className="w-full max-w-[4.5rem] rounded-t-sm bg-[#0066EB] transition-colors hover:bg-[#0052BC]"
                      style={{ height: `${heightPercent}%` }}
                      role="img"
                      aria-label={`${item.key}: ${item.count} projects (${formatPercentage(item.percentage)})`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-3 sm:gap-6">
              {statistics.years.map(item => (
                <div key={item.key} className="flex-1 text-center">
                  <p className="text-xs sm:text-sm font-bold text-gray-950">
                    {item.key}
                  </p>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-gray-500 tabular-nums">
                    {formatPercentage(item.percentage)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Geographic Coverage */}
        <section
          id="geographic-coverage"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            GEOGRAPHIC COVERAGE
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            How much of the collection is attributed to a barangay?
          </h2>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-gray-900">
                    Attributed:{' '}
                    <span className="font-bold text-gray-950">
                      {statistics.barangayAttribution.attributed}
                    </span>{' '}
                    ({formatPercentage(attributedPercentage)})
                  </span>
                  <span className="text-gray-600">
                    Unattributed:{' '}
                    <span className="font-bold text-gray-950">
                      {statistics.barangayAttribution.unattributed}
                    </span>{' '}
                    ({formatPercentage(100 - attributedPercentage)})
                  </span>
                </div>
                <div
                  className="mt-2 flex h-3 w-full overflow-hidden rounded-sm bg-gray-100"
                  role="img"
                  aria-label={`Geographic attribution: ${statistics.barangayAttribution.attributed} attributed (${formatPercentage(attributedPercentage)}), ${statistics.barangayAttribution.unattributed} unattributed (${formatPercentage(100 - attributedPercentage)})`}
                >
                  <div
                    className="h-full bg-[#0066EB]"
                    style={{ width: `${attributedPercentage}%` }}
                  />
                  <div
                    className="h-full bg-gray-300"
                    style={{ width: `${100 - attributedPercentage}%` }}
                  />
                </div>
              </div>

              <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <p className="text-base font-bold text-gray-950 sm:text-lg">
                    {statistics.barangayAttribution.representedBarangays} of 35
                    barangays
                  </p>
                  <span className="text-xs text-gray-600 font-medium">
                    represented by at least one attributed project record
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  Barangay attribution identifies an area association from
                  published evidence. It does not represent an exact project
                  coordinate.
                </p>
                <div className="mt-3.5">
                  <Link
                    href="/projects/map"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                  >
                    <MapPinned className="h-4 w-4" aria-hidden="true" />
                    Explore the barangay distribution map →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Financial Field Coverage */}
        <section
          id="financial-field-coverage"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            FINANCIAL FIELD COVERAGE
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            Which monetary fields are available?
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Field coverage shows whether a published project record contains a
            value. It does not measure spending, project quality, or financial
            performance.
          </p>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
            <div className="space-y-5">
              {statistics.amountCoverage.map(item => (
                <div key={item.field} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-gray-950">
                      {amountLabels[item.field]}
                    </span>
                    <span className="text-xs sm:text-sm tabular-nums text-gray-700">
                      <strong className="text-gray-950">{item.count}</strong>{' '}
                      available ·{' '}
                      <strong className="text-gray-950">
                        {item.unavailableCount}
                      </strong>{' '}
                      unavailable ·{' '}
                      <strong className="text-[#0066EB]">
                        {formatPercentage(item.percentage)}
                      </strong>
                    </span>
                  </div>
                  <div
                    className="flex h-3 w-full overflow-hidden rounded-sm bg-gray-200"
                    role="img"
                    aria-label={`${amountLabels[item.field]}: ${item.count} available (${formatPercentage(item.percentage)}), ${item.unavailableCount} unavailable`}
                  >
                    <div
                      className="h-full bg-[#0066EB]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-5">
              <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Actual expenditure
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-700 sm:text-sm">
                  Not established by the current published project dataset.
                </p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
                ABC, winning bid amount, and contract amount are different
                financial concepts and should not be combined.
              </p>
            </div>
          </div>
        </section>

        {/* 9. How to Read These Statistics */}
        <section
          id="how-to-read"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            HOW TO READ THIS PAGE
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            How to interpret these statistics
          </h2>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-[#F3F6FB]">
            <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-y-0">
              <div className="p-5 sm:p-6">
                <h3 className="text-sm font-bold text-gray-950">
                  Documentary status
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  Describes the strongest published documentary state currently
                  supported for a project. It is not physical construction
                  progress.
                </p>
              </div>
              <div className="p-5 sm:p-6 md:border-l md:border-gray-200">
                <h3 className="text-sm font-bold text-gray-950">
                  Project year
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  Refers to the stated year in the project record. It should not
                  be interpreted as an expenditure year or completion year.
                </p>
              </div>
              <div className="p-5 sm:p-6 md:border-t md:border-gray-200">
                <h3 className="text-sm font-bold text-gray-950">
                  Field coverage
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  Indicates whether a published project record contains a value.
                  Missing information remains unknown.
                </p>
              </div>
              <div className="p-5 sm:p-6 md:border-l md:border-t md:border-gray-200">
                <h3 className="text-sm font-bold text-gray-950">
                  Collection scope
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  These statistics describe BetterSanFernando’s bounded
                  infrastructure and public-works project collection, not every
                  City Government project or procurement activity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Keep Exploring */}
        <section
          id="keep-exploring"
          aria-labelledby="keep-exploring-heading"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10 pb-8 sm:pb-10 lg:pb-12"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            KEEP EXPLORING
          </p>
          <h2
            id="keep-exploring-heading"
            className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl"
          >
            Explore the project data
          </h2>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2 text-[#0066EB]">
                  <FolderKanban
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                    City Projects
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                  Browse individual published project records.
                </p>
                <div className="mt-3.5">
                  <Link
                    href="/projects/city-projects"
                    className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                  >
                    Browse City Projects →
                  </Link>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2 text-[#0066EB]">
                  <MapPinned className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                    Project Map
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                  See how published project records are distributed across San
                  Fernando’s barangays.
                </p>
                <div className="mt-3.5">
                  <Link
                    href="/projects/map"
                    className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                  >
                    Explore Project Map →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Related resources
            </h3>
            <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-white">
              <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-y-0">
                {RELATED_RESOURCES.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[#F3F6FB] sm:p-5 ${
                      index % 2 === 1 ? 'md:border-l md:border-gray-200' : ''
                    } ${index >= 2 ? 'md:border-t md:border-gray-200' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
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
          </div>
        </section>
      </div>
    </main>
  );
}
