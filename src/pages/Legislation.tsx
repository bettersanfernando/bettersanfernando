import { Link } from 'react-router';
import {
  ArrowRight,
  FileCheck2,
  FileText,
  Landmark,
  Scale,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import { getLegislationSummary } from '../data/civic/legislationSummary';
import type { LegislationPreviewRecord } from '../data/civic/legislationSummary';

const summary = getLegislationSummary();

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function PreviewList({
  records,
  type,
}: {
  records: readonly LegislationPreviewRecord[];
  type: 'executive-order' | 'ordinance';
}) {
  return (
    <ol className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
      {records.map(record => (
        <li key={record.id} className="py-4">
          <article>
            <div className="flex flex-wrap items-center gap-2">
              <span className="break-all font-mono text-sm font-semibold text-primary-800">
                {type === 'ordinance' && 'Ordinance No. '}
                {record.documentNumber}
              </span>
              {type === 'ordinance' && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    record.fullTextAvailable
                      ? 'bg-success-100 text-success-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {record.fullTextAvailable ? (
                    <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {record.fullTextAvailable
                    ? 'Full text available'
                    : 'Reference record only'}
                </span>
              )}
            </div>
            {record.title && (
              <h3 className="mt-2 text-sm font-semibold leading-6 text-gray-900">
                {record.title}
              </h3>
            )}
            <p className="mt-1 text-xs text-gray-600">
              {record.date ? (
                <time dateTime={record.date}>{formatDate(record.date)}</time>
              ) : (
                `Year ${record.year}`
              )}
            </p>
          </article>
        </li>
      ))}
    </ol>
  );
}

export default function Legislation() {
  return (
    <>
      <SEO
        title="Legislation"
        description="Explore the bounded Executive Order and ordinance collections currently verified and published by BetterSanFernando."
        keywords="San Fernando Pampanga legislation, executive orders, ordinances, public records"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/legislation`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Government', href: '/government' },
                { label: 'Legislation' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Scale className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Legislation
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Explore the executive and legislative records that
                  BetterSanFernando can currently verify and publish for the
                  City of San Fernando, Pampanga.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-relaxed text-primary-900">
                <p className="font-semibold">Bounded public collection</p>
                <p className="mt-1">
                  These are collection-specific record counts, not a complete
                  legislative history or a count of every City measure.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid border-y border-gray-200 sm:grid-cols-3">
              <div className="p-5">
                <dt className="text-sm text-gray-600">
                  Executive Orders published
                </dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {summary.executiveOrders.total}
                </dd>
              </div>
              <div className="border-t border-gray-200 p-5 sm:border-l sm:border-t-0">
                <dt className="text-sm text-gray-600">Ordinances published</dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {summary.ordinances.total}
                </dd>
              </div>
              <div className="border-t border-gray-200 p-5 sm:border-l sm:border-t-0">
                <dt className="text-sm text-gray-600">
                  Resolutions currently published
                </dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {summary.resolutions.total}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-10 md:py-14"
          aria-labelledby="published-collections-heading"
        >
          <div className="max-w-3xl">
            <h2
              id="published-collections-heading"
              className="text-2xl font-bold text-gray-900 md:text-3xl"
            >
              Published collections
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              The previews below show the three newest records in each current
              collection. Follow the archive links for every published record,
              its availability state, and supporting source actions.
            </p>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            <article className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-7">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Executive Orders
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    Executive issuances published as their own record class.
                    Full text is available for{' '}
                    {summary.executiveOrders.withFullText} of{' '}
                    {summary.executiveOrders.total} current records.
                  </p>
                </div>
                <span className="shrink-0 text-3xl font-bold tabular-nums text-primary-800">
                  {summary.executiveOrders.total}
                </span>
              </div>

              <PreviewList
                records={summary.executiveOrders.preview}
                type="executive-order"
              />

              <Link
                to="/legislation/executive-orders"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                View all Executive Orders
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-7">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Ordinances
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    Legislative enactments published separately from executive
                    issuances. {summary.ordinances.withFullText} records have
                    full text in BetterSanFernando;{' '}
                    {summary.ordinances.referenceOnly} are reference-only
                    records.
                  </p>
                </div>
                <span className="shrink-0 text-3xl font-bold tabular-nums text-primary-800">
                  {summary.ordinances.total}
                </span>
              </div>

              <PreviewList
                records={summary.ordinances.preview}
                type="ordinance"
              />

              <Link
                to="/legislation/ordinances"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                View all Ordinances
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto grid gap-6 px-4 py-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start md:py-12">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-gray-600" aria-hidden="true" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Resolutions
                </h2>
                <p className="mt-1 text-sm font-semibold text-gray-600">
                  Not currently published
                </p>
              </div>
            </div>
            <div className="max-w-3xl text-sm leading-6 text-gray-700">
              <p>
                No resolution records currently meet BetterSanFernando&apos;s
                verification and publication standard. This public availability
                state does not mean that City resolutions do not exist or that
                none were passed.
              </p>
              <p className="mt-2">
                A resolution archive will only become a public destination when
                qualifying records can be supported safely.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)]">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Coverage and archive limits
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
                BetterSanFernando publishes only records it can currently verify
                and support safely. This is not a complete historical archive,
                and Executive Order and ordinance coverage differ. Missing full
                text does not prove that a document does not exist; absence from
                these collections does not prove that a measure was never issued
                or enacted.
              </p>
            </div>
            <aside className="flex items-start gap-3 rounded-xl bg-primary-50 p-5 text-sm leading-6 text-primary-900">
              <Landmark
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <p>
                BetterSanFernando is an independent civic-information project,
                not the official City Government website. Detailed archives link
                each published fact to its supporting public source.
              </p>
            </aside>
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
                ['/government/offices', 'City Offices'],
                ['/government/contact', 'Government Contact Directory'],
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
