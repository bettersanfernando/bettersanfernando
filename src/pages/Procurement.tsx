import { Link } from 'react-router';
import {
  ArrowRight,
  BarChart3,
  Database,
  FileCheck2,
  FileSearch,
  Scale,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import { getProcurementStatistics } from '../data/civic/procurementStatistics';

const statistics = getProcurementStatistics();

const destinations = [
  {
    title: 'Bid Results',
    href: '/procurement/bid-results',
    action: 'View Bid Results',
    icon: FileSearch,
    count: statistics.bidResults.total,
    countLabel: 'published BID_RESULTS evidence records',
    description:
      'Inspect project-linked procurement results, identifiers, bidders, ABC and winning-bid fields, sources, and published documents.',
    note: 'A winning bid does not establish contract execution.',
  },
  {
    title: 'Contracts and Awards',
    href: '/procurement/contracts',
    action: 'View Contracts and Awards',
    icon: FileCheck2,
    count: statistics.awardsAndContracts.awarded,
    countLabel: 'AWARDED projects',
    description:
      'Compare award evidence with the smaller set of projects whose canonical lifecycle supports contract execution.',
    note: `${statistics.awardsAndContracts.contracted} projects are currently CONTRACTED.`,
  },
  {
    title: 'Procurement Statistics',
    href: '/statistics/procurement',
    action: 'View Procurement Statistics',
    icon: BarChart3,
    count: statistics.projects.total,
    countLabel: 'published projects as the main denominator',
    description:
      'Review documentary lifecycle, project-field coverage, BID_RESULTS coverage, and evidence by document year.',
    note: 'Descriptive coverage statistics, not a performance or spending dashboard.',
  },
] as const;

export default function Procurement() {
  return (
    <>
      <SEO
        title="Procurement"
        description="Explore the bounded procurement records and statistics BetterSanFernando publishes for its verified infrastructure and public-works project subset."
        keywords="San Fernando Pampanga procurement, bid results, contracts, infrastructure projects"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/procurement`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Projects', href: '/projects' },
                { label: 'Procurement' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Scale className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Procurement
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Find the procurement evidence, award and contract records, and
                  descriptive statistics currently published for
                  BetterSanFernando&apos;s bounded infrastructure and
                  public-works project subset.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-6 text-primary-900">
                <p className="font-bold">Project-linked public evidence</p>
                <p className="mt-1">
                  This hub describes published records connected to the current
                  project dataset—not all procurement by the City Government.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid grid-cols-2 border-y border-gray-200 lg:grid-cols-5">
              {[
                ['Published project records', statistics.projects.total],
                ['Project evidence records', statistics.evidence.total],
                ['Published bid-result evidence', statistics.bidResults.total],
                ['AWARDED projects', statistics.awardsAndContracts.awarded],
                [
                  'CONTRACTED projects',
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

        <section
          className="container mx-auto px-4 py-10 md:py-14"
          aria-labelledby="procurement-destinations-heading"
        >
          <div className="max-w-3xl">
            <h2
              id="procurement-destinations-heading"
              className="text-2xl font-bold text-gray-900 md:text-3xl"
            >
              Explore published procurement data
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              Each destination answers a different question and retains its own
              record or statistical denominator.
            </p>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {destinations.map(destination => {
              const Icon = destination.icon;
              return (
                <article
                  key={destination.href}
                  className="flex min-w-0 flex-col rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon
                      className="h-6 w-6 shrink-0 text-primary-700"
                      aria-hidden="true"
                    />
                    <span className="text-3xl font-bold tabular-nums text-primary-800">
                      {destination.count}
                    </span>
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-gray-900">
                    {destination.title}
                  </h2>
                  <p className="mt-1 text-xs font-semibold leading-5 text-gray-600">
                    {destination.countLabel}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-gray-700">
                    {destination.description}
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-gray-900">
                    {destination.note}
                  </p>
                  <Link
                    to={destination.href}
                    className="mt-6 inline-flex items-center gap-2 self-start text-sm font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                  >
                    {destination.action}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  How to read the records
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  The dataset contains documentary states and evidence
                  relationships. Planning or procurement references, bid-result
                  evidence, award evidence, and contract evidence are separate
                  concepts—not a funnel proving that every project followed a
                  complete observable sequence.
                </p>
                <dl className="mt-6 divide-y divide-gray-200 border-y border-gray-200 text-sm">
                  <div className="py-4">
                    <dt className="font-bold text-gray-900">AWARDED</dt>
                    <dd className="mt-1 leading-6 text-gray-700">
                      Published evidence establishes an award decision.
                    </dd>
                  </div>
                  <div className="py-4">
                    <dt className="font-bold text-gray-900">CONTRACTED</dt>
                    <dd className="mt-1 leading-6 text-gray-700">
                      Separate canonical evidence supports contract execution.
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Financial fields remain distinct
                </h2>
                <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <div>
                    <dt className="font-bold text-gray-900">
                      Approved Budget for the Contract (ABC)
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      The approved procurement ceiling or budget concept.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-gray-900">
                      Winning bid amount
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      The amount represented by winning bid or result evidence.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-gray-900">Contract amount</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      An amount established by contract-related evidence where
                      supported.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-gray-900">
                      Actual expenditure
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      Not currently available in the published project
                      procurement dataset.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)]">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Evidence and identifiers
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
                Procurement facts are tied to canonical project and evidence
                relationships. BetterSanFernando project IDs, evidence IDs, APP
                Codes, BAC or control references, PhilGEPS references, and
                contract numbers retain their separate namespaces. A source
                supports only the fields it actually establishes; bid-result
                evidence alone does not establish contract execution, Notice to
                Proceed, completion, payment, or actual expenditure.
              </p>
            </div>
            <aside className="flex items-start gap-3 rounded-xl bg-primary-50 p-5 text-sm leading-6 text-primary-900">
              <Database
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <p>
                Inspect all {statistics.evidence.total} published project
                evidence records in the{' '}
                <Link
                  to="/projects/sources"
                  className="font-bold underline decoration-primary-300 underline-offset-4 hover:text-primary-800"
                >
                  Project Evidence archive
                </Link>
                .
              </p>
            </aside>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Coverage and limitations
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-700">
              These records cover BetterSanFernando&apos;s bounded
              infrastructure and public-works subset, not all City Government
              procurement. Documentary lifecycle is not physical progress; an
              award does not equal a contract, and contract evidence does not
              establish Notice to Proceed, completion, payment, or expenditure.
              Financial fields have different meanings, missing values remain
              unknown, and an absent record does not prove that an activity
              never occurred.
            </p>
          </div>

          <nav
            className="mt-9 border-t border-gray-200 pt-7"
            aria-label="Related pages"
          >
            <h2 className="text-lg font-bold text-gray-900">
              Related information
            </h2>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
              {[
                ['/projects', 'City Projects'],
                ['/statistics/projects', 'Project Statistics'],
                ['/projects/sources', 'Project Evidence Sources'],
                ['/projects/methodology', 'Project Methodology'],
                ['/transparency/sources', 'Published Data Sources'],
                ['/transparency/methodology', 'Transparency Methodology'],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  to={href}
                  className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </section>
      </main>
    </>
  );
}
