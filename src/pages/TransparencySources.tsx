import {
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  FileSearch,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Section from '../components/ui/Section';
import SEO from '../components/SEO';
import {
  getTransparencySourceInventory,
  type PublishedSourceDomain,
  type TransparencySourceLink,
} from '../data/civic/transparencySources';
import { formatIsoDate } from '../lib/utils';

function SourceLink({ link }: { link: TransparencySourceLink }) {
  const className =
    'inline-flex min-h-11 items-center gap-2 font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2';

  if (link.type === 'internal') {
    return (
      <Link to={link.url} className={className}>
        {link.label}
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <a href={link.url} target="_blank" rel="noreferrer" className={className}>
      {link.label}
      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
    </a>
  );
}

function DatasetRow({ domain }: { domain: PublishedSourceDomain }) {
  return (
    <article
      className="grid gap-5 py-7 first:pt-0 last:pb-0 lg:grid-cols-[minmax(13rem,0.72fr)_minmax(0,1.28fr)] lg:gap-10"
      aria-labelledby={`domain-${domain.id}`}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <h3
            id={`domain-${domain.id}`}
            className="text-xl font-bold tracking-[-0.02em] text-gray-950"
          >
            {domain.name}
          </h3>
          <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-800">
            Published
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-700">
          {domain.description}
        </p>
        <p className="mt-3 font-semibold tabular-nums text-gray-950">
          {domain.recordCount.toLocaleString()} {domain.recordLabel}
        </p>
      </div>

      <div>
        <dl className="divide-y divide-gray-200 border-y border-gray-200 text-sm">
          <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="font-medium text-gray-600">Publisher / authority</dt>
            <dd className="font-semibold leading-6 text-gray-900">
              {domain.authority}
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="font-medium text-gray-600">Reference period</dt>
            <dd className="leading-6 text-gray-800">
              {domain.referencePeriod}
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="font-medium text-gray-600">Last verified</dt>
            <dd className="leading-6 text-gray-800">
              {domain.lastVerified
                ? formatIsoDate(domain.lastVerified)
                : 'Recorded per source entry'}
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="font-medium text-gray-600">Coverage</dt>
            <dd className="leading-6 text-gray-800">{domain.coverageNote}</dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:gap-x-5">
          {domain.links.map(link => (
            <SourceLink key={`${domain.id}-${link.url}`} link={link} />
          ))}
        </div>
      </div>
    </article>
  );
}

export default function TransparencySources() {
  const inventory = getTransparencySourceInventory();

  return (
    <>
      <SEO
        title="Transparency Sources"
        description="See the public datasets, publishers, reference periods, and source links supporting information published by BetterSanFernando."
        keywords="San Fernando Pampanga public datasets, civic data sources, transparency, source inventory"
      />
      <main className="bg-[#f7f8fa] pb-16 md:pb-24">
        <Section className="p-3">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Transparency', href: '/transparency' },
              { label: 'Sources' },
            ]}
            className="mb-8"
          />

          <header className="grid gap-8 border-b border-gray-300 pb-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-[-0.03em] text-gray-950 sm:text-5xl">
                The public sources behind BetterSanFernando
              </h1>
              <p className="mt-5 max-w-[70ch] text-lg leading-8 text-gray-700">
                This inventory shows which frontend-safe civic datasets are
                currently published, who supports their facts, what periods they
                cover, and where readers can inspect the public sources.
              </p>
            </div>
            <div className="border-t border-primary-200 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <p className="text-sm font-semibold text-gray-700">
                Current public release
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-primary-900">
                Export {inventory.release.exportVersion}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Source data {inventory.release.sourceDataVersion}. Release dates
                are not exposed by the manifest; verification dates are shown
                per domain where available.
              </p>
            </div>
          </header>

          <section
            aria-labelledby="release-summary-heading"
            className="grid gap-px overflow-hidden rounded-xl bg-primary-200 shadow-[0_10px_32px_rgba(0,41,94,0.09)] md:grid-cols-3"
          >
            <h2 id="release-summary-heading" className="sr-only">
              Release summary
            </h2>
            <div className="bg-primary-800 p-6 text-white md:p-7">
              <Database
                className="h-5 w-5 text-primary-200"
                aria-hidden="true"
              />
              <p className="mt-4 text-3xl font-bold tabular-nums">
                {inventory.release.datasetCount}
              </p>
              <p className="mt-1 text-sm text-primary-100">
                dataset files declared by the public manifest
              </p>
            </div>
            <div className="bg-primary-900 p-6 text-white md:p-7">
              <CheckCircle2
                className="h-5 w-5 text-primary-200"
                aria-hidden="true"
              />
              <p className="mt-4 text-3xl font-bold tabular-nums">
                {inventory.publishedDomains.length}
              </p>
              <p className="mt-1 text-sm text-primary-100">
                published domains with verified records
              </p>
            </div>
            <div className="bg-white p-6 md:p-7">
              <ShieldCheck
                className="h-5 w-5 text-primary-700"
                aria-hidden="true"
              />
              <p className="mt-4 text-lg font-bold text-gray-950">
                Fact → Source → Public link
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Authority is stated per domain and never assumed from a generic
                government label.
              </p>
            </div>
          </section>

          <section aria-labelledby="published-heading" className="mt-14">
            <div className="max-w-3xl">
              <h2
                id="published-heading"
                className="text-3xl font-bold tracking-[-0.025em] text-gray-950"
              >
                Published datasets and domains
              </h2>
              <p className="mt-3 text-base leading-7 text-gray-700">
                Dataset files that serve one public purpose are grouped
                together. Geography, for example, combines city and barangay
                boundary files while preserving their distinct source roles.
              </p>
            </div>

            <div className="mt-8 divide-y divide-gray-300 rounded-xl bg-white p-5 shadow-[0_10px_32px_rgba(0,41,94,0.08)] sm:p-7 lg:p-9">
              {inventory.publishedDomains.map(domain => (
                <DatasetRow key={domain.id} domain={domain} />
              ))}
            </div>
          </section>

          <section
            aria-labelledby="not-published-heading"
            className="mt-14 grid gap-7 rounded-xl bg-gray-950 p-6 text-white md:p-9 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]"
          >
            <div>
              <FileSearch
                className="h-6 w-6 text-primary-200"
                aria-hidden="true"
              />
              <h2
                id="not-published-heading"
                className="mt-5 text-3xl font-bold tracking-[-0.025em]"
              >
                Not currently published
              </h2>
              <p className="mt-3 max-w-[58ch] text-sm leading-6 text-gray-300">
                These labels describe this frontend release only. They do not
                mean that records do not exist or that the City has no records.
              </p>
            </div>
            <ul className="divide-y divide-gray-700 border-y border-gray-700">
              {inventory.unavailableDomains.map(domain => (
                <li key={domain.id} className="py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{domain.name}</h3>
                    <span className="rounded-full bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-200">
                      {domain.status === 'NOT_EXPORTED'
                        ? 'Not exported'
                        : 'Not verified for publication'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    {domain.note}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <aside className="mt-10 flex gap-3 rounded-xl bg-primary-50 p-5 text-gray-950 md:items-center md:p-6">
            <Info
              className="mt-0.5 h-5 w-5 shrink-0 md:mt-0"
              aria-hidden="true"
            />
            <p className="text-sm leading-6">
              Need the records behind an individual project?{' '}
              <Link
                to="/projects/sources"
                className="font-bold underline decoration-primary-300 underline-offset-4 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                Browse all 334 project evidence records
              </Link>
              . Site-wide verification rules will live on the separate{' '}
              <Link
                to="/transparency/methodology"
                className="font-bold underline decoration-primary-300 underline-offset-4 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                Transparency Methodology page
              </Link>
              .
            </p>
          </aside>
        </Section>
      </main>
    </>
  );
}
