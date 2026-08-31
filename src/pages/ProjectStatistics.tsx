import { ArrowRight, BarChart3, Info, Map, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import { aggregateProjectStatistics } from '../data/civic/projectStatistics';
import { getProjects } from '../data/civic/projects';
import { formatIsoDate, titleCaseEnum } from '../lib/utils';

const statistics = aggregateProjectStatistics(getProjects());

const lifecycleDescriptions = {
  PLANNED: 'Planning or approved-program evidence is available.',
  PROCUREMENT: 'A procurement process is documented.',
  AWARDED: 'Award evidence is available; this does not establish a contract.',
  CONTRACTED: 'Contract evidence is available.',
} as const;

const amountLabels = {
  approved_budget_abc: 'Approved budget (ABC)',
  winning_bid_amount: 'Winning bid amount',
  contract_amount: 'Contract amount',
} as const;

function formatPercentage(value: number) {
  return `${new Intl.NumberFormat('en-PH', {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function DistributionTable({
  title,
  description,
  items,
  headingLevel = 'h2',
}: {
  title: string;
  description: string;
  items: Array<{ label: string; count: number; percentage: number }>;
  headingLevel?: 'h2' | 'h3';
}) {
  const maximum = Math.max(...items.map(item => item.count), 1);
  const HeadingTag = headingLevel;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(0,41,94,0.08)]">
      <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
        <HeadingTag className="text-xl font-bold tracking-[-0.02em] text-gray-900">
          {title}
        </HeadingTag>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-700">
          {description}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            {title}: counts and share of {statistics.totalProjects} published
            project records
          </caption>
          <thead className="bg-gray-50 text-gray-800">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold sm:px-6">
                Group
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Relative count
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Records
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-right font-semibold sm:px-6"
              >
                Share
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.label}>
                <th
                  scope="row"
                  className="px-5 py-3 font-medium text-gray-900 sm:px-6"
                >
                  {item.label}
                </th>
                <td className="w-2/5 px-4 py-3">
                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-gray-200"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-primary-600"
                      style={{ width: `${(item.count / maximum) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                  {item.count}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-gray-700 sm:px-6">
                  {formatPercentage(item.percentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProjectStatistics() {
  const attributedPercentage =
    (statistics.barangayAttribution.attributed / statistics.totalProjects) *
    100;

  return (
    <>
      <SEO
        title="Project statistics"
        description="Explore careful, source-aware summaries of BetterSanFernando's bounded set of 239 verified infrastructure and public-works project records."
        keywords="San Fernando project statistics, infrastructure projects, public works, project lifecycle"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/statistics/projects`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Statistics', href: '/statistics' },
                { label: 'Project statistics' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <BarChart3 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Project statistics
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Explore patterns across BetterSanFernando’s published,
                  verified infrastructure and public-works project records.
                  Every count keeps the dataset’s limits and documentary
                  evidence states visible.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-relaxed text-primary-900">
                <p className="font-semibold">Bounded published subset</p>
                <p className="mt-1">
                  These are counts within BetterSanFernando’s dataset, not
                  totals for all City Government projects or procurement
                  activity.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid gap-x-8 gap-y-5 border-y border-gray-200 py-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-sm text-gray-600">Published records</dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {statistics.totalProjects}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Status as of</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatIsoDate(statistics.statusAsOf)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">
                  With barangay attribution
                </dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {statistics.barangayAttribution.attributed}
                  <span className="ml-2 text-base font-medium text-gray-600">
                    of {statistics.totalProjects}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Barangays represented</dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {statistics.barangayAttribution.representedBarangays}
                  <span className="ml-2 text-base font-medium text-gray-600">
                    of 35
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="container mx-auto space-y-12 px-4 py-10 md:py-14">
          <section aria-labelledby="lifecycle-heading">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
              <DistributionTable
                title="Documentary lifecycle"
                description={`Each of the ${statistics.totalProjects} records appears once. The state describes the strongest published documentary evidence available, not physical construction progress.`}
                items={statistics.lifecycle.map(item => ({
                  label: titleCaseEnum(item.key),
                  count: item.count,
                  percentage: item.percentage,
                }))}
              />
              <div className="rounded-xl bg-primary-900 p-6 text-white">
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    className="h-6 w-6 text-primary-200"
                    aria-hidden="true"
                  />
                  <h2 id="lifecycle-heading" className="text-xl font-bold">
                    How to read lifecycle
                  </h2>
                </div>
                <dl className="mt-5 space-y-4 text-sm leading-6">
                  {statistics.lifecycle.map(item => (
                    <div key={item.key}>
                      <dt className="font-semibold text-white">
                        {titleCaseEnum(item.key)} · {item.count} records
                      </dt>
                      <dd className="text-primary-100">
                        {lifecycleDescriptions[item.key]}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 border-t border-primary-700 pt-5 text-sm leading-6 text-primary-100">
                  Awarded and contracted are separate states. Neither state
                  claims that construction started, progressed, or finished.
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="record-patterns-heading">
            <div className="mb-6 max-w-3xl">
              <h2
                id="record-patterns-heading"
                className="text-2xl font-bold tracking-[-0.02em] text-gray-900 md:text-3xl"
              >
                What the published records describe
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Type and year distributions use all {statistics.totalProjects}{' '}
                records. Year is the project record’s stated year; it is not an
                expenditure year or a completion year.
              </p>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <DistributionTable
                title="Project type"
                description="Record count by the normalized infrastructure or public-works type."
                headingLevel="h3"
                items={statistics.projectTypes.map(item => ({
                  label: titleCaseEnum(item.key),
                  count: item.count,
                  percentage: item.percentage,
                }))}
              />
              <DistributionTable
                title="Project record year"
                description="Record count by stated project year; denominator: 239 published records."
                headingLevel="h3"
                items={statistics.years.map(item => ({
                  label: String(item.key),
                  count: item.count,
                  percentage: item.percentage,
                }))}
              />
            </div>
          </section>

          <section
            className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
            aria-labelledby="coverage-heading"
          >
            <div className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)]">
              <div className="flex items-center gap-3">
                <Map className="h-6 w-6 text-primary-700" aria-hidden="true" />
                <h2
                  id="coverage-heading"
                  className="text-xl font-bold text-gray-900"
                >
                  Barangay attribution
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                {statistics.barangayAttribution.attributed} of{' '}
                {statistics.totalProjects} records (
                {formatPercentage(attributedPercentage)}) have a verified
                barangay association. The remaining{' '}
                {statistics.barangayAttribution.unattributed} records stay in
                every citywide denominator and are reported as unattributed.
              </p>
              <div
                className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-primary-600"
                  style={{ width: `${attributedPercentage}%` }}
                />
              </div>
              <dl className="mt-3 flex justify-between gap-4 text-sm">
                <div>
                  <dt className="text-gray-600">Attributed</dt>
                  <dd className="font-semibold tabular-nums text-gray-900">
                    {statistics.barangayAttribution.attributed}
                  </dd>
                </div>
                <div className="text-right">
                  <dt className="text-gray-600">Not attributed</dt>
                  <dd className="font-semibold tabular-nums text-gray-900">
                    {statistics.barangayAttribution.unattributed}
                  </dd>
                </div>
              </dl>
              <Link
                to="/projects/map"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                Explore the barangay distribution map
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)]">
              <h2 className="text-xl font-bold text-gray-900">
                Monetary field coverage
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
                These counts show how many of the {statistics.totalProjects}{' '}
                records contain each field. They are not peso totals, and the
                fields are not interchangeable.
              </p>
              <dl className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
                {statistics.amountCoverage.map(item => (
                  <div
                    key={item.field}
                    className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div>
                      <dt className="font-semibold text-gray-900">
                        {amountLabels[item.field]}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-600">
                        Present on {item.count} of {statistics.totalProjects}{' '}
                        records
                      </dd>
                    </div>
                    <p className="text-lg font-bold tabular-nums text-gray-900">
                      {formatPercentage(item.percentage)}
                    </p>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-warning-50 p-4 text-sm leading-6 text-warning-900">
                <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>
                  Actual expenditure is not established by this dataset. No
                  value on this page should be read as total spending.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-8">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-900">
              Coverage and evidence
            </h2>
            <div className="mt-4 grid gap-6 text-sm leading-6 text-gray-700 md:grid-cols-2">
              <div>
                <p>
                  Statistics describe BetterSanFernando’s published verified
                  subset. They do not measure all City Government activity.
                  Missing evidence does not prove that an activity did not
                  happen, and documentary lifecycle does not describe physical
                  progress.
                </p>
              </div>
              <nav aria-label="Project statistics supporting pages">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['/projects', 'Browse project records'],
                    ['/projects/map', 'Explore the project map'],
                    ['/projects/sources', 'Review project sources'],
                    ['/projects/methodology', 'Read the methodology'],
                  ].map(([href, label]) => (
                    <li key={href}>
                      <Link
                        to={href}
                        className="inline-flex items-center gap-2 font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                      >
                        {label}
                        <ArrowRight
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
