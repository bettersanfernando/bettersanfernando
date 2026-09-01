import {
  ArrowRight,
  BarChart3,
  Building2,
  Database,
  FolderKanban,
  Landmark,
  Scale,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Section from '../components/ui/Section';
import { getStatisticsSummary } from '../data/civic/statisticsSummary';

const numberFormatter = new Intl.NumberFormat('en-PH');
const summary = getStatisticsSummary();

const statisticalViews = [
  {
    href: '/statistics/population',
    action: 'View Population Statistics',
    title: 'Population',
    icon: UsersRound,
    measure: `${numberFormatter.format(summary.population.total)} people`,
    context: `${summary.population.census} baseline`,
    description:
      'Compare the current city baseline and barangay population values, rankings, shares, and urban or rural classifications.',
  },
  {
    href: '/statistics/projects',
    action: 'View Project Statistics',
    title: 'Projects',
    icon: FolderKanban,
    measure: `${summary.projects.total} project records`,
    context: 'Bounded published dataset',
    description:
      'Review documentary lifecycle, project type and year distribution, barangay attribution, and financial-field coverage.',
  },
  {
    href: '/statistics/procurement',
    action: 'View Procurement Statistics',
    title: 'Procurement',
    icon: Scale,
    measure: `${summary.procurement.evidence} evidence records`,
    context: 'Linked to the published project dataset',
    description:
      'Explore documentary lifecycle, field coverage, BID_RESULTS evidence, document years, and the award and contract distinction.',
  },
  {
    href: '/statistics/city-profile',
    action: 'View City Profile',
    title: 'City Profile',
    icon: Landmark,
    measure: `${summary.population.barangays} barangays`,
    context: `${summary.population.urbanBarangays} urban · ${summary.population.ruralBarangays} rural`,
    description:
      'See a concise cross-domain baseline for population, barangays, geographic coverage, and the published institutional directory.',
  },
] as const;

const snapshot = [
  {
    label: `${summary.population.census} population`,
    value: numberFormatter.format(summary.population.total),
  },
  { label: 'Barangays', value: summary.population.barangays },
  { label: 'Published project records', value: summary.projects.total },
  { label: 'Project evidence records', value: summary.procurement.evidence },
  {
    label: 'Published office records',
    value: summary.government.officeRecords,
  },
] as const;

export default function Statistics() {
  return (
    <>
      <SEO
        title="Statistics"
        description="Explore descriptive population, project, procurement, and city-profile statistics derived from BetterSanFernando's bounded frontend-safe civic datasets."
        keywords="San Fernando Pampanga statistics, population, projects, procurement, city profile"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/statistics`}
        siteName="BetterSanFernando"
      />
      <main className="bg-[#f7f8fa] pb-16 md:pb-24">
        <Section className="p-3">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Transparency', href: '/transparency' },
              { label: 'Statistics' },
            ]}
            className="mb-8"
          />

          <header className="grid gap-8 border-b border-gray-300 pb-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                <BarChart3 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h1 className="text-4xl font-bold tracking-[-0.03em] text-gray-950 sm:text-5xl">
                Statistics
              </h1>
              <p className="mt-5 max-w-[70ch] text-lg leading-8 text-gray-700">
                BetterSanFernando publishes descriptive statistics from its
                bounded, frontend-safe civic datasets. Each view states what it
                measures and keeps its source period, denominator, and coverage
                limits visible.
              </p>
            </div>
            <aside className="border-t border-primary-200 pt-5 text-sm leading-6 text-gray-700 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <p className="font-bold text-gray-950">A statistical directory</p>
              <p className="mt-1">
                These summaries describe published records. They are not a city
                scorecard, performance ranking, or claim of complete City
                Government coverage.
              </p>
            </aside>
          </header>

          <section aria-labelledby="snapshot-heading" className="mt-10">
            <h2
              id="snapshot-heading"
              className="text-2xl font-bold text-gray-950"
            >
              Representative snapshot
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Selected measures from different published datasets; their
              denominators are not interchangeable.
            </p>
            <dl className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-gray-200 bg-white sm:grid-cols-3 lg:grid-cols-5">
              {snapshot.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`min-w-0 p-4 sm:p-5 ${index > 0 ? 'border-l border-gray-200' : ''} ${index > 1 ? 'max-sm:border-t' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-600">
                    {metric.label}
                  </dt>
                  <dd className="mt-1 break-words text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="views-heading" className="mt-14">
            <h2
              id="views-heading"
              className="text-3xl font-bold tracking-[-0.025em] text-gray-950"
            >
              Statistical views
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-gray-700">
              Open the detailed view that owns each comparison. This hub keeps
              only enough context to make the destinations understandable.
            </p>
            <div className="mt-7 grid gap-px overflow-hidden rounded-xl bg-gray-200 shadow-[0_10px_32px_rgba(0,41,94,0.08)] lg:grid-cols-2">
              {statisticalViews.map(view => {
                const Icon = view.icon;
                return (
                  <article
                    key={view.href}
                    className="flex min-w-0 flex-col bg-white p-6 md:p-7"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <Icon
                        className="h-6 w-6 shrink-0 text-primary-700"
                        aria-hidden="true"
                      />
                      <p className="text-right text-xs font-bold uppercase tracking-wide text-gray-600">
                        {view.context}
                      </p>
                    </div>
                    <h3 className="mt-5 text-2xl font-bold text-gray-950">
                      {view.title}
                    </h3>
                    <p className="mt-1 text-lg font-bold tabular-nums text-primary-800">
                      {view.measure}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-gray-700">
                      {view.description}
                    </p>
                    <Link
                      to={view.href}
                      className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
                    >
                      {view.action}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            aria-labelledby="interpret-heading"
            className="mt-14 grid gap-8 border-y border-gray-300 py-10 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)]"
          >
            <div>
              <Database className="h-6 w-6 text-gray-600" aria-hidden="true" />
              <h2
                id="interpret-heading"
                className="mt-4 text-3xl font-bold tracking-[-0.025em] text-gray-950"
              >
                How to interpret the numbers
              </h2>
            </div>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="font-bold text-gray-950">Coverage is bounded</dt>
                <dd className="mt-2 text-sm leading-6 text-gray-700">
                  A published dataset count is not a citywide total. The 239
                  project records describe BetterSanFernando&apos;s current
                  bounded project dataset.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-gray-950">
                  Reference periods matter
                </dt>
                <dd className="mt-2 text-sm leading-6 text-gray-700">
                  Population uses the {summary.population.census} reference.
                  Project and procurement records use their own dates and
                  evidence periods.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-gray-950">
                  States stay distinct
                </dt>
                <dd className="mt-2 text-sm leading-6 text-gray-700">
                  Documentary lifecycle is not physical progress. AWARDED does
                  not mean CONTRACTED, completed, paid, or operational.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-gray-950">Missing is not zero</dt>
                <dd className="mt-2 text-sm leading-6 text-gray-700">
                  Missing and unavailable values remain unknown. Different
                  statistical pages may use different, explicitly stated
                  denominators.
                </dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="gaps-heading"
            className="mt-14 grid gap-8 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)]"
          >
            <div>
              <Building2 className="h-6 w-6 text-gray-600" aria-hidden="true" />
              <h2
                id="gaps-heading"
                className="mt-4 text-3xl font-bold tracking-[-0.025em] text-gray-950"
              >
                Not yet included
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                These gaps describe the current public release, not an absence
                of government activity or records.
              </p>
            </div>
            <ul className="divide-y divide-gray-300 border-y border-gray-300">
              <li className="py-5">
                <h3 className="font-bold text-gray-950">
                  Broader demographics
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  Current public data supports population and barangay
                  classification, but not a complete frontend-safe dataset for
                  age, sex, households, or density.
                </p>
              </li>
              <li className="py-5">
                <h3 className="font-bold text-gray-950">Project spending</h3>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  Actual project expenditure is not established by the current
                  published data. Approved budget, winning bid, and contract
                  amount are separate procurement fields and are not treated as
                  spending.
                </p>
              </li>
              <li className="py-5">
                <h3 className="font-bold text-gray-950">
                  Public-record statistics
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  A defensible cross-domain records universe and shared
                  denominator have not been established for a separate
                  statistical view.
                </p>
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="methods-heading"
            className="mt-14 grid overflow-hidden rounded-xl bg-primary-900 text-white lg:grid-cols-2"
          >
            <div className="p-6 md:p-8">
              <ShieldCheck
                className="h-6 w-6 text-primary-200"
                aria-hidden="true"
              />
              <h2 id="methods-heading" className="mt-4 text-2xl font-bold">
                Sources
              </h2>
              <p className="mt-3 text-sm leading-6 text-primary-100">
                Statistical values inherit the scope, reference period, and
                limitations of their underlying records: fact → source → public
                link.
              </p>
              <Link
                to="/transparency/sources"
                className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-white underline decoration-primary-300 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore Published Data Sources
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="border-t border-primary-700 bg-primary-800 p-6 md:p-8 lg:border-l lg:border-t-0">
              <Database
                className="h-6 w-6 text-primary-200"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-2xl font-bold">Methodology</h2>
              <p className="mt-3 text-sm leading-6 text-primary-100">
                Read how records are accepted, normalized, linked, dated, and
                presented when fields or coverage are incomplete.
              </p>
              <Link
                to="/transparency/methodology"
                className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-white underline decoration-primary-300 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Read Transparency Methodology
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </Section>
      </main>
    </>
  );
}
