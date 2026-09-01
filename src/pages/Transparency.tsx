import {
  ArrowRight,
  Building2,
  Database,
  FileSearch,
  Landmark,
  Map,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Section from '../components/ui/Section';
import SEO from '../components/SEO';
import { getTransparencySummary } from '../data/civic/transparencySummary';

const summary = getTransparencySummary();

const domains = [
  {
    title: 'Projects and procurement',
    icon: FileSearch,
    description: `${summary.projects.total} published project records connect to ${summary.projects.evidence} evidence records, including ${summary.projects.bidResults} BID_RESULTS records.`,
    links: [
      ['/projects', 'Browse projects'],
      ['/procurement', 'Explore procurement'],
      ['/projects/sources', 'Inspect project evidence'],
      ['/statistics/procurement', 'View procurement statistics'],
    ],
  },
  {
    title: 'Government directory',
    icon: Building2,
    description: `${summary.government.officeRecords} office records are represented in the frontend-safe institutional directory. This is not a complete organizational chart.`,
    links: [
      ['/government/offices', 'Browse City offices'],
      ['/government/contact', 'Find institutional contacts'],
    ],
  },
  {
    title: 'Legislation',
    icon: Scale,
    description: `${summary.legislation.executiveOrders} Executive Orders and ${summary.legislation.ordinances} ordinances are published as separate record classes.`,
    links: [
      ['/legislation', 'Explore legislation'],
      ['/legislation/executive-orders', 'View Executive Orders'],
      ['/legislation/ordinances', 'View ordinances'],
    ],
  },
  {
    title: 'Population and geography',
    icon: Map,
    description: `${summary.population.total.toLocaleString()} residents in the ${summary.population.census} baseline across ${summary.population.barangays} barangays, with one city boundary and ${summary.geography.barangayBoundaries} barangay polygons.`,
    links: [
      ['/statistics/population', 'View population statistics'],
      ['/statistics/city-profile', 'View the city profile'],
      ['/barangays', 'Explore barangays'],
      ['/projects/map', 'View the project coverage map'],
    ],
  },
] as const;

const unavailableLabels = {
  NOT_EXPORTED: 'Not currently exported',
  NOT_VERIFIED: 'Not verified for publication',
} as const;

export default function Transparency() {
  return (
    <>
      <SEO
        title="Transparency"
        description="Explore the bounded public civic datasets, source records, methodology, and current publication gaps documented by BetterSanFernando."
        keywords="San Fernando Pampanga transparency, civic data, public records, data sources"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/transparency`}
        siteName="BetterSanFernando"
      />
      <main className="bg-[#f7f8fa] pb-16 md:pb-24">
        <Section className="p-3">
          <Breadcrumbs
            items={[{ label: 'Home', href: '/' }, { label: 'Transparency' }]}
            className="mb-8"
          />

          <header className="grid gap-8 border-b border-gray-300 pb-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-[-0.03em] text-gray-950 sm:text-5xl">
                Transparency
              </h1>
              <p className="mt-5 max-w-[70ch] text-lg leading-8 text-gray-700">
                Explore the civic datasets BetterSanFernando currently
                publishes, inspect the records and sources behind them, and see
                important areas that are not yet part of the public frontend
                release.
              </p>
            </div>
            <aside className="border-t border-primary-200 pt-5 text-sm leading-6 text-gray-700 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <p className="font-bold text-gray-950">
                Independent and community-run
              </p>
              <p className="mt-1">
                BetterSanFernando is not the official City Government website.
                It publishes bounded, verified records with their provenance and
                limitations.
              </p>
            </aside>
          </header>

          <section aria-labelledby="summary-heading" className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="summary-heading"
                  className="text-2xl font-bold text-gray-950"
                >
                  Current public release
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Representative counts from frontend-safe typed data, not
                  citywide totals.
                </p>
              </div>
              <p className="text-xs font-semibold text-gray-600">
                Export {summary.release.exportVersion}
              </p>
            </div>
            <dl className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-gray-200 bg-white sm:grid-cols-3 lg:grid-cols-5">
              {[
                ['Manifest dataset files', summary.release.datasetFiles],
                ['Published domains', summary.release.publishedDomains],
                ['Published projects', summary.projects.total],
                ['Project evidence', summary.projects.evidence],
                ['Published office records', summary.government.officeRecords],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`min-w-0 p-4 sm:p-5 ${index > 0 ? 'border-l border-gray-200' : ''} ${index > 1 ? 'max-sm:border-t' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-600">{label}</dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-950">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="explore-heading" className="mt-14">
            <h2
              id="explore-heading"
              className="text-3xl font-bold tracking-[-0.025em] text-gray-950"
            >
              Explore published data
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-gray-700">
              Each area has a distinct scope. Follow the detailed destinations
              for record-level evidence, dates, denominators, and source
              actions.
            </p>
            <div className="mt-7 grid gap-px overflow-hidden rounded-xl bg-gray-200 shadow-[0_10px_32px_rgba(0,41,94,0.08)] lg:grid-cols-2">
              {domains.map(domain => {
                const Icon = domain.icon;
                return (
                  <article
                    key={domain.title}
                    className="min-w-0 bg-white p-6 md:p-7"
                  >
                    <Icon
                      className="h-6 w-6 text-primary-700"
                      aria-hidden="true"
                    />
                    <h3 className="mt-4 text-xl font-bold text-gray-950">
                      {domain.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      {domain.description}
                    </p>
                    <div className="mt-5 flex flex-col items-start gap-2">
                      {domain.links.map(([href, label]) => (
                        <Link
                          key={href}
                          to={href}
                          className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-900"
                        >
                          {label}
                          <ArrowRight
                            className="h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                        </Link>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            aria-labelledby="sources-heading"
            className="mt-14 grid overflow-hidden rounded-xl bg-primary-900 text-white lg:grid-cols-2"
          >
            <div className="p-6 md:p-8">
              <Database
                className="h-6 w-6 text-primary-200"
                aria-hidden="true"
              />
              <h2 id="sources-heading" className="mt-4 text-2xl font-bold">
                Sources
              </h2>
              <p className="mt-3 text-sm leading-6 text-primary-100">
                The source inventory identifies dataset coverage, publishers and
                authorities, release versions, reference periods, and public
                links. The model is Fact → Source → Public link; an official
                label is used only where the authority supports it.
              </p>
              <Link
                to="/transparency/sources"
                className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-white underline decoration-primary-300 underline-offset-4"
              >
                Explore Published Data Sources
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="border-t border-primary-700 bg-primary-800 p-6 md:p-8 lg:border-l lg:border-t-0">
              <ShieldCheck
                className="h-6 w-6 text-primary-200"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-2xl font-bold">Methodology</h2>
              <p className="mt-3 text-sm leading-6 text-primary-100">
                Read how sources are evaluated, records are normalized, missing
                values remain unknown, privacy boundaries are enforced, releases
                are versioned, and limitations are presented.
              </p>
              <Link
                to="/transparency/methodology"
                className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-white underline decoration-primary-300 underline-offset-4"
              >
                Read Transparency Methodology
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section
            aria-labelledby="availability-heading"
            className="mt-14 grid gap-8 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)]"
          >
            <div>
              <Landmark className="h-6 w-6 text-gray-600" aria-hidden="true" />
              <h2
                id="availability-heading"
                className="mt-4 text-3xl font-bold tracking-[-0.025em] text-gray-950"
              >
                Important publication gaps
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                These states describe BetterSanFernando&apos;s public frontend
                release. They do not say that the City has no records or that an
                activity did not occur.
              </p>
            </div>
            <ul className="divide-y divide-gray-300 border-y border-gray-300">
              {summary.unavailable.map(domain => (
                <li key={domain.id} className="py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-950">{domain.name}</h3>
                    <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-bold text-gray-700">
                      {unavailableLabels[domain.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {domain.note}
                  </p>
                </li>
              ))}
              <li className="py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-gray-950">
                    Unified transparency documents
                  </h3>
                  <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-bold text-gray-700">
                    Not currently exported
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  A unified, frontend-safe document projection is not currently
                  part of the public release. Published record-specific
                  documents remain available through their existing archives.
                </p>
              </li>
              <li className="py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-gray-950">
                    Broader demographics
                  </h3>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                    Partial
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  The public release currently supports the population baseline
                  and barangay classifications, not broader age, sex, household,
                  or density measures.
                </p>
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="limits-heading"
            className="mt-14 border-t border-gray-300 pt-9"
          >
            <h2
              id="limits-heading"
              className="text-2xl font-bold text-gray-950"
            >
              How to read this coverage
            </h2>
            <div className="mt-4 grid gap-5 text-sm leading-6 text-gray-700 md:grid-cols-2">
              <p>
                These records describe bounded BetterSanFernando datasets, not
                every City Government record. Documentary lifecycle does not
                equal physical progress. Award evidence does not establish
                contract execution, and contract evidence does not establish
                Notice to Proceed, completion, payment, or expenditure.
              </p>
              <p>
                Approved Budget for the Contract, winning bid amount, and
                contract amount are distinct fields; none is treated as actual
                expenditure. Missing fields remain unknown, and absence from the
                public dataset does not prove that a record or activity does not
                exist.
              </p>
            </div>
          </section>
        </Section>
      </main>
    </>
  );
}
