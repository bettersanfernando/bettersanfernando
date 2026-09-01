import { Link } from 'react-router';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Database,
  Landmark,
  Phone,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import { getGovernmentSummary } from '../data/civic/governmentSummary';

const summary = getGovernmentSummary();

const destinations = [
  {
    title: 'Offices',
    description:
      'Browse verified office identities, locations, contact availability, and source details in the published directory.',
    href: '/government/offices',
    action: 'Browse published offices',
    icon: Building2,
  },
  {
    title: 'Contact Directory',
    description:
      'Find currently published institutional phone numbers, email addresses, and office locations.',
    href: '/government/contact',
    action: 'Find office contacts',
    icon: Phone,
  },
  {
    title: 'Legislation',
    description:
      'Explore the bounded Executive Order and Ordinance collections currently available in BetterSanFernando.',
    href: '/legislation',
    action: 'Explore legislation',
    icon: Scale,
  },
  {
    title: 'Statistics',
    description:
      'See published population, project, procurement, geography, and directory data in context.',
    href: '/statistics',
    action: 'View city statistics',
    icon: BarChart3,
  },
  {
    title: 'Transparency',
    description:
      'Understand the portal’s sources, verification approach, limitations, and published public-record collections.',
    href: '/transparency',
    action: 'Open transparency hub',
    icon: ShieldCheck,
  },
] as const;

export default function Government() {
  return (
    <>
      <SEO
        title="Government"
        description="Find currently published government office, contact, legislation, statistics, and transparency information for the City of San Fernando, Pampanga."
        keywords="San Fernando Pampanga government, city offices, government contacts, legislation, civic data"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/government`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[{ label: 'Home', href: '/' }, { label: 'Government' }]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Landmark className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Government
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Find the institutional, contact, legislative, statistical, and
                  transparency information that BetterSanFernando currently
                  publishes for the City of San Fernando, Pampanga.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-relaxed text-primary-900">
                <p className="font-semibold">Independent civic portal</p>
                <p className="mt-1">
                  BetterSanFernando is independent and not an official City
                  Government website. Follow linked sources when you need to
                  confirm information with the City.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid border-y border-gray-200 sm:grid-cols-3">
              {[
                ['Published office records', summary.officeRecords],
                ['Executive Orders published', summary.executiveOrders],
                ['Ordinance records published', summary.ordinances],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`p-5 ${index > 0 ? 'border-t border-gray-200 sm:border-l sm:border-t-0' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-600">{label}</dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-5 text-gray-600">
              Counts describe records in the portal’s current bounded
              collections, not complete City inventories or archives.
            </p>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-10 md:py-14"
          aria-labelledby="government-destinations-heading"
        >
          <div className="max-w-3xl">
            <h2
              id="government-destinations-heading"
              className="text-2xl font-bold text-gray-900 md:text-3xl"
            >
              Find government information
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              Start with the directory or collection that matches what you need.
              Every destination below is currently published.
            </p>
          </div>

          <div className="mt-7 overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(0,41,94,0.08)]">
            {destinations.map((destination, index) => {
              const Icon = destination.icon;
              return (
                <article
                  key={destination.href}
                  className={`grid gap-5 p-6 md:grid-cols-[3rem_minmax(0,1fr)_auto] md:items-center md:p-7 ${index > 0 ? 'border-t border-gray-200' : ''}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {destination.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-700">
                      {destination.description}
                    </p>
                  </div>
                  <Link
                    to={destination.href}
                    className="inline-flex items-center gap-2 justify-self-start text-sm font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 md:justify-self-end"
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
          <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] lg:items-start md:py-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                How to interpret coverage
              </h2>
              <div className="mt-3 max-w-3xl space-y-3 text-sm leading-6 text-gray-700">
                <p>
                  BetterSanFernando publishes only records supported by verified
                  or public provenance. The published office records are not
                  asserted to represent the complete City organizational
                  structure, and government-structure research remains
                  incomplete.
                </p>
                <p>
                  The legislative collections are bounded archives, not a
                  complete City legislative archive. Missing content does not
                  mean that an office or document does not exist.
                </p>
              </div>
            </div>
            <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-6 text-primary-900">
              <div className="flex items-start gap-3">
                <Database
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold">Sources and methods</p>
                  <p className="mt-1">
                    Review where published data comes from and how the portal
                    verifies, scopes, and describes it.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-semibold">
                <Link
                  to="/transparency/sources"
                  className="underline decoration-primary-300 underline-offset-4 hover:text-primary-800"
                >
                  Data sources
                </Link>
                <Link
                  to="/transparency/methodology"
                  className="underline decoration-primary-300 underline-offset-4 hover:text-primary-800"
                >
                  Methodology
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
