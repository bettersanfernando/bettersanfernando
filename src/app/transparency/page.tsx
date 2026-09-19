import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { getTransparencySummary } from '../../data/civic/transparencySummary';

import { buildPageMetadata } from '../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Transparency',
  description:
    'Explore the bounded public civic datasets, source records, methodology, and current publication gaps documented by BetterSanFernando.',
  path: '/transparency',
});

const summary = getTransparencySummary();

// The shared `text-eyebrow` utility (src/index.css) sets a fairly wide
// 0.18em tracking used site-wide; here we tighten it locally with an
// inline override rather than editing the shared utility, so this
// page's eyebrows read closer to the Statistics Explorer benchmark
// without changing eyebrow rendering on any other page.
const eyebrowTracking = { letterSpacing: '0.08em' } as const;

interface CatalogRow {
  title: string;
  description: string;
  links: readonly (readonly [string, string])[];
}

const catalog: CatalogRow[] = [
  {
    title: 'Projects & Procurement',
    description: `${summary.projects.total} published project records, backed by ${summary.projects.evidence} evidence records including ${summary.projects.bidResults} bid results.`,
    links: [
      ['/projects', 'Browse projects'],
      ['/procurement', 'Explore procurement'],
      ['/projects/sources', 'Inspect project evidence'],
      ['/statistics/procurement', 'View procurement statistics'],
    ],
  },
  {
    title: 'Government Directory',
    description: `Published City office and contact information available on BetterSanFernando (${summary.government.officeRecords} office records). This is not a complete organizational chart.`,
    links: [
      ['/government/offices', 'Browse City offices'],
      ['/government/contact', 'Find institutional contacts'],
    ],
  },
  {
    title: 'Legislation',
    description: `${summary.legislation.executiveOrders} Executive Orders, ${summary.legislation.ordinances} ordinances, and ${summary.legislation.resolutions} resolutions, published as separate record types.`,
    links: [
      ['/legislation', 'Explore legislation'],
      ['/legislation/executive-orders', 'View Executive Orders'],
      ['/legislation/ordinances', 'View ordinances'],
      ['/legislation/resolutions', 'View resolutions'],
    ],
  },
  {
    title: 'City Finances',
    description:
      'Selected official aggregate finance reports, shown as reported by their source rather than combined into one total.',
    links: [['/transparency/finance', 'Explore City Finances']],
  },
  {
    title: 'Population & Geography',
    description: `${summary.population.total.toLocaleString()} residents in the ${summary.population.census} baseline across ${summary.population.barangays} barangays, with city and barangay boundary maps.`,
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

// Three headline metrics carry the release summary; published domains and
// office records are real but secondary, so they read as supporting text
// rather than competing for the same visual weight (Design System v2 §9).
const primaryStats = [
  { label: 'Dataset files', value: summary.release.datasetFiles },
  { label: 'Project records', value: summary.projects.total },
  { label: 'Evidence records', value: summary.projects.evidence },
] as const;

export default function Transparency() {
  return (
    <main className="bg-white pb-16 md:pb-24">
      {/* Editorial page header — white canvas, breadcrumb inline above the intro */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-14">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[{ label: 'Home', href: '/' }, { label: 'Transparency' }]}
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
            <div className="max-w-2xl">
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                Transparency
              </p>

              <h1 className="mt-3 text-3xl font-extrabold text-display text-gray-950 sm:text-4xl lg:text-5xl">
                Public data you can trace.
              </h1>

              <p className="mt-4 text-lg font-medium leading-7 text-gray-800 sm:text-xl">
                BetterSanFernando makes public information about the City of San
                Fernando easier to find, understand, and verify.
              </p>

              <p className="mt-3 text-base leading-7 text-gray-600 md:text-[17px]">
                Explore published records, see where the information comes from,
                and understand what is not yet available.
              </p>
            </div>

            {/* Trust / info module — flat editorial supporting copy, no card */}
            <div className="mt-8 border-t border-gray-200 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                Independent civic portal
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-gray-950">
                Independent and community-run. Not an official City Government
                website.
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                BetterSanFernando organizes public services, projects,
                government information, records, and official-source data in one
                place.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Local public information, made easier to use.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-8 px-4 py-8 sm:space-y-12 sm:py-12 lg:space-y-20 lg:py-20">
        {/* Current public release */}
        <section aria-labelledby="summary-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            Current Public Release
          </p>
          <h2
            id="summary-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            What BetterSanFernando publishes today
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Representative counts from the current frontend-safe data release,
            not citywide totals.
          </p>

          <dl className="mt-6 grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {primaryStats.map(stat => (
              <div
                key={stat.label}
                className="flex items-baseline justify-between gap-4 py-4 sm:block sm:px-6 sm:py-5 sm:first:pl-0"
              >
                <dt className="text-sm text-gray-600 sm:text-xs sm:font-medium sm:uppercase sm:tracking-wide sm:text-gray-500">
                  {stat.label}
                </dt>
                <dd className="text-2xl font-extrabold tabular-nums text-stat-value text-gray-950 sm:mt-2 sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-sm text-gray-500">
            {summary.release.publishedDomains} published domains ·{' '}
            {summary.government.officeRecords} office records
          </p>
        </section>

        {/* Published data catalog */}
        <section aria-labelledby="explore-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            Explore Published Data
          </p>
          <h2
            id="explore-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Find the information you need.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Each area covers a distinct part of the City. Follow a link for
            record-level detail, sources, and dates.
          </p>

          <div className="mt-7 overflow-hidden rounded-sm border border-gray-200 bg-white">
            {catalog.map((domain, index) => (
              <div
                key={domain.title}
                className={`flex flex-col gap-3 p-5 sm:p-6 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8 lg:p-7 ${index > 0 ? 'border-t border-gray-200' : ''}`}
              >
                <h3 className="text-base font-bold text-gray-950">
                  {domain.title}
                </h3>

                <div>
                  <p className="max-w-2xl text-sm leading-6 text-gray-700">
                    {domain.description}
                  </p>
                  <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:gap-x-6 lg:gap-y-2">
                    {domain.links.map(([href, label]) => (
                      <Link
                        key={href}
                        href={href}
                        className="group inline-flex min-h-8 items-center gap-1 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
                      >
                        {label}
                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sources & Methodology — open editorial section, no outer card */}
        <section
          aria-labelledby="sources-heading"
          className="border-l-2 border-[#0066EB] pl-5 sm:pl-6"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            Sources &amp; Methodology
          </p>
          <h2
            id="sources-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Know where the data comes from.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            See how records are sourced, reviewed, and presented, and understand
            the limitations behind the public release.
          </p>

          <div className="mt-7 grid gap-8 border-t border-gray-200 pt-7 sm:grid-cols-2 sm:gap-10 sm:divide-x sm:divide-gray-200">
            <div className="sm:pr-8">
              <h3 className="text-base font-bold text-gray-950">Sources</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                See what each dataset covers, who publishes it, and where the
                original public record lives.
              </p>
              <Link
                href="/transparency/sources"
                className="mt-3 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
              >
                Explore published data sources
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="sm:pl-8">
              <h3 className="text-base font-bold text-gray-950">Methodology</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Read how records are reviewed and normalized, and how missing
                values and limitations are handled.
              </p>
              <Link
                href="/transparency/methodology"
                className="mt-3 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
              >
                Read the transparency methodology
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Publication gaps — open editorial section, no outer card */}
        <section aria-labelledby="availability-heading">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-gray-600" style={eyebrowTracking}>
              Publication Gaps
            </p>
            <h2
              id="availability-heading"
              className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
            >
              Important publication gaps
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              These notes describe what is and is not currently available on
              BetterSanFernando. They do not mean the City has no records for
              these areas.
            </p>
          </div>

          <ul className="mt-7 divide-y divide-gray-200 border-t border-gray-200">
            {summary.unavailable.map(domain => (
              <li key={domain.id} className="py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-bold text-gray-950">{domain.name}</h3>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                    {unavailableLabels[domain.status]}
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                  {domain.note}
                </p>
              </li>
            ))}
            <li className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-bold text-gray-950">
                  Unified transparency documents
                </h3>
                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                  Not currently exported
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                A unified, frontend-safe document projection is not currently
                part of the public release. Published record-specific documents
                remain available through their existing archives.
              </p>
            </li>
            <li className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-bold text-gray-950">
                  Broader demographics
                </h3>
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                  Partial
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                The public release currently supports the population baseline
                and barangay classifications, not broader age, sex, household,
                or density measures.
              </p>
            </li>
          </ul>
        </section>

        {/* How to read this coverage */}
        <section
          aria-labelledby="limits-heading"
          className="border-t border-gray-200 pt-8 sm:pt-9 lg:pt-10"
        >
          <h2
            id="limits-heading"
            className="text-xl font-bold text-section-title text-gray-950"
          >
            How to read this coverage
          </h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold text-gray-950">
                Published does not mean complete.
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-gray-600">
                BetterSanFernando publishes bounded datasets, not every City
                Government record. A document moving through its lifecycle — an
                award, a contract — does not by itself establish completion,
                payment, or physical progress.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-950">
                Records are not interchangeable.
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-gray-600">
                Project, procurement, contract, and spending records describe
                different things and should not be treated as equivalent.
                Missing fields remain unknown, and an item&rsquo;s absence from
                a dataset does not prove it doesn&rsquo;t exist.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
