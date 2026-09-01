import { Link } from 'react-router';
import { ArrowRight, Database, FileText, Info, Scale } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import { getProcurementStatistics } from '../data/civic/procurementStatistics';
import { titleCaseEnum } from '../lib/utils';

const PROJECT_FIELD_LABELS = {
  approvedBudgetAbc: 'Approved Budget for the Contract (ABC)',
  winningBidAmount: 'Winning bid amount',
  contractAmount: 'Contract amount',
  contractNumber: 'Contract number',
} as const;

const BID_RESULT_FIELD_LABELS = {
  approvedBudgetAbc: 'ABC available',
  winningBidAmount: 'Winning bid amount available',
  winningBidder: 'Winning bidder available',
  attachment: 'Document available',
} as const;

const LIFECYCLE_DESCRIPTIONS = {
  PLANNED: 'Published evidence establishes a planned project record.',
  PROCUREMENT: 'Published evidence establishes an active procurement stage.',
  AWARDED: 'Published evidence establishes an award decision.',
  CONTRACTED: 'Published evidence supports an executed contract.',
} as const;

const RELATED_PAGES = [
  ['/procurement/bid-results', 'Browse Bid Results'],
  ['/procurement/contracts', 'Browse Contracts and Awards'],
  ['/statistics/projects', 'View overall Project Statistics'],
  ['/projects', 'Browse City Projects'],
  ['/projects/sources', 'Review Project Evidence Sources'],
  ['/projects/methodology', 'Read the Project Methodology'],
  ['/transparency/sources', 'Review Published Data Sources'],
  ['/transparency/methodology', 'Read the Transparency Methodology'],
] as const;

function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function ProcurementStatistics() {
  const statistics = getProcurementStatistics();
  const largestYearCount = Math.max(
    ...statistics.bidResults.byDocumentYear.map(item => item.count)
  );

  return (
    <>
      <SEO
        title="Procurement Statistics"
        description="Denominator-first statistics describing BetterSanFernando's bounded, published infrastructure and public-works procurement dataset."
        keywords="procurement statistics, bid results, contracts, infrastructure projects, San Fernando Pampanga"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Transparency', href: '/transparency' },
                { label: 'Procurement Statistics' },
              ]}
            />

            <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Procurement Statistics
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700 md:text-lg">
                  A denominator-first view of BetterSanFernando&apos;s currently
                  published infrastructure and public-works procurement subset.
                  These measures describe record coverage and documentary
                  states—not citywide performance or spending.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-6 text-primary-900">
                <p className="font-bold">Bounded published subset</p>
                <p className="mt-1">
                  Every percentage on this page names whether it uses published
                  projects or BID_RESULTS evidence records as its denominator.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid grid-cols-2 border-y border-gray-200 lg:grid-cols-4">
              {[
                ['Published projects', statistics.projects.total],
                ['Project evidence records', statistics.evidence.total],
                ['BID_RESULTS records', statistics.bidResults.total],
                [
                  'Contracted projects',
                  statistics.awardsAndContracts.contracted,
                ],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`p-4 sm:p-5 ${index % 2 === 1 ? 'border-l border-gray-200' : ''} ${index > 1 ? 'border-t border-gray-200 lg:border-t-0' : ''} ${index > 0 ? 'lg:border-l lg:border-gray-200' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-600">{label}</dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="container mx-auto space-y-12 px-4 py-10 md:py-14">
          <section
            className="grid overflow-hidden rounded-xl bg-primary-900 text-white md:grid-cols-2"
            aria-labelledby="denominators-heading"
          >
            <div className="p-6 md:p-7">
              <div className="flex items-center gap-3">
                <Scale
                  className="h-6 w-6 text-primary-200"
                  aria-hidden="true"
                />
                <h2 id="denominators-heading" className="text-xl font-bold">
                  Two denominators, two questions
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-primary-100">
                Project coverage asks how many of the{' '}
                {statistics.projects.total} published project records contain a
                field. Evidence coverage asks what the{' '}
                {statistics.bidResults.total} published BID_RESULTS records
                contain. These populations are reported separately.
              </p>
            </div>
            <dl className="grid border-t border-primary-700 sm:grid-cols-2 md:border-l md:border-t-0">
              <div className="p-6">
                <dt className="font-bold">Project denominator</dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums">
                  {statistics.projects.total}
                </dd>
                <dd className="mt-1 text-sm text-primary-100">
                  Published project records
                </dd>
              </div>
              <div className="border-t border-primary-700 p-6 sm:border-l sm:border-t-0">
                <dt className="font-bold">Evidence denominator</dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums">
                  {statistics.bidResults.total}
                </dd>
                <dd className="mt-1 text-sm text-primary-100">
                  Published BID_RESULTS records
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="lifecycle-heading">
            <div className="max-w-3xl">
              <h2
                id="lifecycle-heading"
                className="text-2xl font-bold text-gray-900 md:text-3xl"
              >
                Current documentary lifecycle
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Each of the {statistics.projects.total} published projects
                appears once. This is a distribution of strongest published
                documentary state, not a funnel or a measure of physical
                construction progress.
              </p>
            </div>

            <dl className="mt-6 divide-y divide-gray-200 rounded-xl bg-white px-5 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:px-7">
              {statistics.projects.lifecycle.map(item => (
                <div
                  key={item.key}
                  className="grid gap-3 py-5 md:grid-cols-[10rem_minmax(0,1fr)_10rem] md:items-center md:gap-6"
                >
                  <div>
                    <dt className="font-bold text-gray-900">
                      {titleCaseEnum(item.key)}
                    </dt>
                    <dd className="mt-1 text-xs leading-5 text-gray-600">
                      {LIFECYCLE_DESCRIPTIONS[item.key]}
                    </dd>
                  </div>
                  <div
                    className="h-3 overflow-hidden rounded-full bg-gray-200"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-primary-600"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <dd className="text-sm font-semibold tabular-nums text-gray-900 md:text-right">
                    {item.count} of {item.denominator}{' '}
                    <span className="text-gray-600">
                      ({formatPercentage(item.percentage)})
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="project-coverage-heading">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
              <div>
                <h2
                  id="project-coverage-heading"
                  className="text-2xl font-bold text-gray-900 md:text-3xl"
                >
                  Project-level procurement field coverage
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
                  Denominator: all {statistics.projects.total} published project
                  records. Coverage indicates that a field is populated; it is
                  not a procurement-completion or data-quality score.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-warning-50 p-4 text-sm leading-6 text-warning-900">
                <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>
                  Actual expenditure is not currently available in the published
                  procurement dataset.
                </p>
              </div>
            </div>

            <dl className="mt-6 divide-y divide-gray-200 border-y border-gray-200 bg-white">
              {statistics.projects.fieldCoverage.map(item => (
                <div
                  key={item.key}
                  className="grid gap-3 px-4 py-5 sm:grid-cols-[minmax(14rem,0.75fr)_minmax(12rem,1fr)_10rem] sm:items-center sm:gap-6"
                >
                  <dt className="font-semibold text-gray-900">
                    {PROJECT_FIELD_LABELS[item.key]}
                  </dt>
                  <div
                    className="h-3 overflow-hidden rounded-full bg-gray-200"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-primary-600"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <dd className="text-sm font-semibold tabular-nums text-gray-900 sm:text-right">
                    {item.count} of {item.denominator}{' '}
                    <span className="text-gray-600">
                      ({formatPercentage(item.percentage)})
                    </span>
                  </dd>
                </div>
              ))}
              <div className="grid gap-2 px-4 py-5 sm:grid-cols-[minmax(14rem,1fr)_auto] sm:items-center">
                <dt className="font-semibold text-gray-900">
                  Actual expenditure
                </dt>
                <dd className="text-sm font-medium text-gray-700">
                  Not available in the current public export
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="bid-evidence-heading">
            <div className="max-w-3xl">
              <h2
                id="bid-evidence-heading"
                className="text-2xl font-bold text-gray-900 md:text-3xl"
              >
                Published bid-result evidence coverage
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Denominator: {statistics.bidResults.total} published BID_RESULTS
                evidence records, representing{' '}
                {statistics.bidResults.projectsRepresented} canonically linked
                projects. These counts do not use the 239-project denominator.
              </p>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
              <dl className="divide-y divide-gray-200 rounded-xl bg-white px-5 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:px-7">
                {statistics.bidResults.fieldCoverage.map(item => (
                  <div
                    key={item.key}
                    className="grid gap-3 py-5 sm:grid-cols-[minmax(13rem,0.8fr)_minmax(10rem,1fr)_10rem] sm:items-center sm:gap-5"
                  >
                    <dt className="font-semibold text-gray-900">
                      {BID_RESULT_FIELD_LABELS[item.key]}
                    </dt>
                    <div
                      className="h-3 overflow-hidden rounded-full bg-gray-200"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-success-600"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <dd className="text-sm font-semibold tabular-nums text-gray-900 sm:text-right">
                      {item.count} of {item.denominator}{' '}
                      <span className="text-gray-600">
                        ({formatPercentage(item.percentage)})
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="rounded-xl bg-white p-5 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-7">
                <h3 className="text-xl font-bold text-gray-900">
                  Bid-result evidence by document year
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  Count of BID_RESULTS records by their published document date;
                  denominator: {statistics.bidResults.total} records.
                </p>
                <dl className="mt-5 space-y-4">
                  {statistics.bidResults.byDocumentYear.map(item => (
                    <div key={item.year}>
                      <div className="flex items-baseline justify-between gap-4 text-sm">
                        <dt className="font-semibold text-gray-900">
                          {item.year}
                        </dt>
                        <dd className="tabular-nums text-gray-700">
                          {item.count} of {statistics.bidResults.total}
                        </dd>
                      </div>
                      <div
                        className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-gray-200"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full rounded-full bg-primary-600"
                          style={{
                            width: `${(item.count / largestYearCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-4 border-t border-gray-200 pt-4 text-sm">
                    <dt className="font-semibold text-gray-900">
                      Unknown document date
                    </dt>
                    <dd className="tabular-nums text-gray-700">
                      {statistics.bidResults.unknownDocumentDate} of{' '}
                      {statistics.bidResults.total}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <section aria-labelledby="award-contract-heading">
            <div className="grid overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(0,41,94,0.08)] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.7fr)]">
              <div className="p-6 md:p-8">
                <h2
                  id="award-contract-heading"
                  className="text-2xl font-bold text-gray-900"
                >
                  Award and contract evidence remain distinct
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
                  The counts below use the{' '}
                  {statistics.awardsAndContracts.denominator}-project
                  denominator. They are descriptive field and lifecycle counts,
                  not a conversion rate or performance measure.
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                  <div>
                    <dt className="text-sm text-gray-600">Awarded</dt>
                    <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                      {statistics.awardsAndContracts.awarded}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Contracted</dt>
                    <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                      {statistics.awardsAndContracts.contracted}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">
                      With contract amount
                    </dt>
                    <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                      {statistics.awardsAndContracts.withContractAmount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">
                      With contract number
                    </dt>
                    <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                      {statistics.awardsAndContracts.withContractNumber}
                    </dd>
                  </div>
                </dl>
              </div>
              <aside className="bg-warning-50 p-6 text-sm leading-6 text-warning-900 md:p-8">
                <p className="font-bold">How to interpret these counts</p>
                <p className="mt-2">
                  Award evidence does not establish contract execution. Two
                  awarded records contain contract-amount fields without the
                  canonical evidence required to classify them CONTRACTED.
                  Contract evidence does not establish Notice to Proceed,
                  completion, payment, or expenditure.
                </p>
                <Link
                  to="/procurement/contracts"
                  className="mt-4 inline-flex items-center gap-2 font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning-900"
                >
                  Review Contracts and Awards
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </aside>
            </div>
          </section>

          <section
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.55fr)]"
            aria-labelledby="limitations-heading"
          >
            <div className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-8">
              <div className="flex items-center gap-3">
                <Database
                  className="h-6 w-6 text-primary-700"
                  aria-hidden="true"
                />
                <h2
                  id="limitations-heading"
                  className="text-2xl font-bold text-gray-900"
                >
                  Coverage and limitations
                </h2>
              </div>
              <div className="mt-4 grid gap-4 text-sm leading-6 text-gray-700 md:grid-cols-2">
                <p>
                  These statistics describe BetterSanFernando&apos;s currently
                  published bounded infrastructure and public-works dataset, not
                  all City Government procurement. Rates use only the explicit
                  denominators shown.
                </p>
                <p>
                  Documentary lifecycle is not physical progress. Winning bid is
                  not contract amount, contract amount is not expenditure,
                  missing fields remain unknown, and absence from this dataset
                  does not prove an activity did not occur.
                </p>
              </div>
              <p className="mt-5 border-t border-gray-200 pt-5 text-sm leading-6 text-gray-700">
                No monetary totals are presented because the mixed-year,
                partial-coverage fields do not support a clear citywide spending
                interpretation.
              </p>
            </div>

            <nav
              className="rounded-xl bg-primary-50 p-6 text-primary-900"
              aria-label="Related procurement statistics pages"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6" aria-hidden="true" />
                <h2 className="text-xl font-bold">Explore the records</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm">
                {RELATED_PAGES.map(([href, label]) => (
                  <li key={href}>
                    <Link
                      to={href}
                      className="inline-flex items-center gap-2 font-semibold underline decoration-primary-300 underline-offset-4 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
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
          </section>
        </div>
      </main>
    </>
  );
}
