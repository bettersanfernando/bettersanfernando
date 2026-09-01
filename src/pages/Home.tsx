import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Database,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderKanban,
  Landmark,
  Link2,
  Search,
  ShieldCheck,
} from 'lucide-react';
import SEO from '../components/SEO';
import { getHomeSummary } from '../data/civic/homeSummary';
import { getSearchHref } from '../data/navigation';

const summary = getHomeSummary();
const numberFormatter = new Intl.NumberFormat('en-PH');

const destinations = [
  {
    title: 'Projects',
    description:
      'Browse published infrastructure and procurement project records with supporting evidence.',
    href: '/projects',
    action: 'Explore projects',
    icon: FolderKanban,
  },
  {
    title: 'Government',
    description:
      'Find published office records, institutional contacts, and legislative collections.',
    href: '/government',
    action: 'Browse government',
    icon: Landmark,
  },
  {
    title: 'Statistics',
    description:
      'Understand published population, project, procurement, barangay, and city-profile data.',
    href: '/statistics',
    action: 'View statistics',
    icon: BarChart3,
  },
  {
    title: 'Transparency',
    description:
      'Inspect the portal’s sources, methodology, verification practices, and coverage limits.',
    href: '/transparency',
    action: 'Review transparency',
    icon: ShieldCheck,
  },
] as const;

const trustSteps = [
  [FileCheck2, 'FACT', 'A claim supported by a published record.'],
  [Link2, 'SOURCE', 'The provenance and record behind the claim.'],
  [
    ExternalLink,
    'OFFICIAL LINK',
    'A public path to inspect the source when available.',
  ],
] as const;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(getSearchHref(searchQuery));
  }

  return (
    <>
      <SEO
        title="BetterSanFernando"
        description="BetterSanFernando is an independent civic transparency portal for verified public information about the City of San Fernando, Pampanga."
        keywords="BetterSanFernando, San Fernando Pampanga, civic transparency, city projects, public records"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)] lg:items-end md:py-16">
            <header className="max-w-3xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                <Landmark className="h-6 w-6" aria-hidden="true" />
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-[-0.03em] text-gray-900 md:text-6xl">
                BetterSanFernando
              </h1>
              <p className="mt-5 max-w-[66ch] text-lg leading-8 text-gray-700">
                An independent civic transparency portal that makes verified
                public information about the City of San Fernando, Pampanga
                easier to find, understand, and trace back to sources.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
                <Link
                  to="/projects"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-700 px-4 py-2.5 text-white transition hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Explore Projects
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/government"
                  className="inline-flex min-h-11 items-center gap-2 text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Browse Government
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-6 max-w-[68ch] text-sm leading-6 text-gray-600">
                BetterSanFernando is independent and not an official City
                Government website. It organizes public information without
                replacing the official sources behind it.
              </p>
            </header>

            <form
              onSubmit={submitSearch}
              className="rounded-xl bg-primary-50 p-5 text-primary-950 md:p-6"
              role="search"
            >
              <label htmlFor="home-search" className="text-lg font-bold">
                Search BetterSanFernando
              </label>
              <p className="mt-1 text-sm leading-6 text-primary-900">
                Search currently published projects, barangays, offices,
                legislation, and project-source records.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-700"
                    aria-hidden="true"
                  />
                  <input
                    id="home-search"
                    type="search"
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    placeholder="Project, barangay, office, or document"
                    className="w-full rounded-lg border border-primary-200 bg-white py-3 pl-11 pr-4 text-base text-gray-900 outline-none transition placeholder:text-gray-600 focus:border-primary-600 focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Search
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <Link
                to="/search"
                className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-primary-800 underline decoration-primary-300 underline-offset-4 hover:text-primary-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Open the full search page
              </Link>
            </form>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-10 md:py-14"
          aria-labelledby="snapshot-heading"
        >
          <div className="max-w-3xl">
            <h2
              id="snapshot-heading"
              className="text-2xl font-bold text-gray-900 md:text-3xl"
            >
              Published civic snapshot
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              Representative facts from the portal’s current frontend-safe,
              bounded datasets.
            </p>
          </div>
          <dl className="mt-7 grid border-y border-gray-200 bg-white sm:grid-cols-2 lg:grid-cols-5">
            {[
              [
                numberFormatter.format(summary.population.total),
                `${summary.population.referenceYear} POPCEN population`,
              ],
              [summary.population.barangays, 'Barangays'],
              [summary.projects.total, 'Published project records'],
              [summary.projects.evidence, 'Project evidence records'],
              [summary.government.officeRecords, 'Published office records'],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={`p-5 ${index > 0 ? 'border-t border-gray-200 sm:border-l sm:border-t-0' : ''} ${index === 2 ? 'sm:border-l-0 lg:border-l' : ''} ${index > 1 ? 'sm:border-t lg:border-t-0' : ''}`}
              >
                <dt className="text-sm leading-5 text-gray-600">{label}</dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-5 text-gray-600">
            Population is a citywide PSA baseline. Record counts describe only
            what BetterSanFernando currently publishes and are not complete City
            inventories.
          </p>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Explore by area
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Enter through the section that best matches the public
                information you need.
              </p>
            </div>
            <div className="mt-7 grid overflow-hidden rounded-xl shadow-[0_8px_28px_rgba(0,41,94,0.08)] lg:grid-cols-2">
              {destinations.map((destination, index) => {
                const Icon = destination.icon;
                return (
                  <article
                    key={destination.href}
                    className={`grid gap-4 bg-white p-6 sm:grid-cols-[3rem_minmax(0,1fr)] ${index > 0 ? 'border-t border-gray-200' : ''} ${index % 2 === 1 ? 'lg:border-l' : ''} ${index === 2 ? 'lg:border-t' : ''}`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {destination.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-gray-700">
                        {destination.description}
                      </p>
                      <Link
                        to={destination.href}
                        className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                      >
                        {destination.action}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.58fr)] lg:gap-16">
            <div>
              <FolderKanban
                className="h-7 w-7 text-primary-700"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
                Projects and procurement
              </h2>
              <p className="mt-3 max-w-[70ch] text-sm leading-6 text-gray-700">
                Follow published projects from directory records to mapped
                barangay context, procurement records, and the source evidence
                supporting each established fact. Documentary stages remain
                distinct: an award is not a contract or proof of physical
                completion.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
                <Link
                  to="/projects"
                  className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  Project directory
                </Link>
                <Link
                  to="/projects/map"
                  className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  Project map
                </Link>
                <Link
                  to="/procurement"
                  className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  Procurement
                </Link>
                <Link
                  to="/projects/sources"
                  className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  Evidence archive
                </Link>
              </div>
            </div>
            <dl className="grid grid-cols-3 border-y border-gray-200 bg-white lg:grid-cols-1">
              {[
                [summary.projects.total, 'Published project records'],
                [summary.projects.evidence, 'Evidence records'],
                [summary.projects.bidResults, 'BID_RESULTS records'],
              ].map(([value, label], index) => (
                <div
                  key={label}
                  className={`p-4 sm:p-5 ${index > 0 ? 'border-l border-gray-200 lg:border-l-0 lg:border-t' : ''}`}
                >
                  <dt className="text-xs leading-5 text-gray-600 sm:text-sm">
                    {label}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-900 sm:text-3xl">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto grid gap-10 px-4 py-10 lg:grid-cols-2 lg:gap-16 md:py-14">
            <div>
              <Building2
                className="h-7 w-7 text-primary-700"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Government information
              </h2>
              <p className="mt-3 max-w-[68ch] text-sm leading-6 text-gray-700">
                Browse {summary.government.officeRecords} published office
                records and currently available institutional contact details.
                These records are not asserted to represent the complete City
                organizational structure.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
                <Link
                  to="/government"
                  className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  Government hub
                </Link>
                <Link
                  to="/government/offices"
                  className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  Offices
                </Link>
                <Link
                  to="/government/contact"
                  className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  Contact Directory
                </Link>
              </div>
            </div>
            <div>
              <FileText
                className="h-7 w-7 text-primary-700"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Legislation
              </h2>
              <p className="mt-3 max-w-[68ch] text-sm leading-6 text-gray-700">
                Explore {summary.government.executiveOrders} published Executive
                Orders and {summary.government.ordinances} published Ordinance
                records. These are bounded collections, not a complete City
                legislative archive.
              </p>
              <Link
                to="/legislation"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                Explore legislation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,48rem)] lg:gap-14">
            <div>
              <Database
                className="h-7 w-7 text-primary-700"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
                A visible trust path
              </h2>
            </div>
            <div>
              <ol className="grid overflow-hidden rounded-xl shadow-[0_10px_32px_rgba(0,41,94,0.09)] sm:grid-cols-3">
                {trustSteps.map(([Icon, label, description], index) => (
                  <li
                    key={label}
                    className={`p-5 text-white sm:p-6 ${index === 1 ? 'bg-primary-900' : 'bg-primary-800'} ${index > 0 ? 'border-t border-primary-700 sm:border-l sm:border-t-0' : ''}`}
                  >
                    <Icon
                      className="h-5 w-5 text-primary-200"
                      aria-hidden="true"
                    />
                    <p className="mt-4 font-bold">{label}</p>
                    <p className="mt-1 text-sm leading-6 text-primary-100">
                      {description}
                    </p>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-sm leading-6 text-gray-700">
                BetterSanFernando prefers official and primary sources, keeps
                bounded datasets labeled, does not treat missing data as zero,
                and does not silently fill gaps. Only reviewed frontend-safe
                information is published.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
                <Link
                  to="/transparency/sources"
                  className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  Explore Sources
                </Link>
                <Link
                  to="/transparency/methodology"
                  className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  Read Methodology
                </Link>
                <Link
                  to="/barangays"
                  className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  Browse Barangays
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 bg-primary-50">
          <div className="container mx-auto grid gap-6 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center md:py-12">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-primary-950">
                Coverage has limits
              </h2>
              <p className="mt-2 text-sm leading-6 text-primary-900">
                Absence from BetterSanFernando does not mean a record, service,
                office, or document does not exist. Some public-information
                domains remain under research or publication review.
              </p>
            </div>
            <Link
              to="/about"
              className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-primary-800 underline decoration-primary-300 underline-offset-4 hover:text-primary-950 lg:justify-self-end"
            >
              About BetterSanFernando
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
