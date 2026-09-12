import { AlertTriangle, ArrowRight, Scale } from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getExecutiveOrders,
  getOrdinances,
  getResolutions,
} from '../data/civic/legislation';
import {
  getPublicRecordsArchiveCoverage,
  getPublicRecordsMetrics,
} from '../data/civic/publicRecordsCoverage';

const executiveOrders = getExecutiveOrders();
const ordinances = getOrdinances();
const resolutions = getResolutions();

const legislationMetrics = getPublicRecordsMetrics().filter(metric =>
  ['executive_order', 'ordinance', 'resolution'].includes(metric.record_type)
);

const archiveRanges = getPublicRecordsArchiveCoverage().filter(entry =>
  [
    'resolution_archive_range',
    'ordinance_archive_range',
    'appropriation_ordinance_archive_range',
  ].includes(entry.record_type)
);

const collections = [
  {
    id: 'executive_order',
    label: 'Executive Orders',
    count: executiveOrders.length,
    href: '/legislation/executive-orders',
  },
  {
    id: 'ordinance',
    label: 'Ordinances',
    count: ordinances.length,
    href: '/legislation/ordinances',
  },
  {
    id: 'resolution',
    label: 'Resolutions',
    count: resolutions.length,
    href: '/legislation/resolutions',
  },
] as const;

const maxCount = Math.max(...collections.map(collection => collection.count));

function CollectionBar({ label, count }: { label: string; count: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-gray-800">{label}</span>
        <span className="font-bold tabular-nums text-gray-900">{count}</span>
      </div>
      <div
        className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-gray-200"
        role="img"
        aria-label={`${label}: ${count} published records`}
      >
        <div
          className="h-full rounded-full bg-primary-600"
          style={{ width: `${(count / maxCount) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function LegislationStatistics() {
  return (
    <>
      <SEO
        title="Legislation Statistics"
        description="Coverage statistics for BetterSanFernando's published Executive Order, Ordinance, and Resolution collections."
        keywords="San Fernando Pampanga legislation statistics, executive orders, ordinances, resolutions"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/statistics/legislation`}
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
                { label: 'Legislation Statistics' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Scale className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Legislation Statistics
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Coverage of BetterSanFernando&apos;s verified published
                  Executive Order, Ordinance, and Resolution collections.
                </p>
              </div>
              <aside className="rounded-xl bg-warning-50 p-5 text-sm leading-relaxed text-warning-900">
                <p className="font-semibold">Not the City&apos;s full record</p>
                <p className="mt-1">
                  These counts describe BetterSanFernando&apos;s current
                  published holdings, not the complete legislative output of the
                  City.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid grid-cols-3 border-y border-gray-200">
              {collections.map((collection, index) => (
                <div
                  key={collection.id}
                  className={`p-4 sm:p-5 ${index > 0 ? 'border-l border-gray-200' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-600">
                    {collection.label}
                  </dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                    {collection.count}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-10 md:py-12"
          aria-labelledby="comparison-heading"
        >
          <h2
            id="comparison-heading"
            className="text-2xl font-bold text-gray-900"
          >
            Published holdings, compared
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
            Compares BetterSanFernando&apos;s verified published record counts
            only — not the City&apos;s total legislative activity, legal effect,
            current validity, or repeal status of any measure.
          </p>
          <div className="mt-6 max-w-xl space-y-5 rounded-xl border border-gray-200 bg-white p-5">
            {collections.map(collection => (
              <CollectionBar
                key={collection.id}
                label={collection.label}
                count={collection.count}
              />
            ))}
          </div>
        </section>

        <section
          className="border-y border-gray-200 bg-white"
          aria-labelledby="coverage-heading"
        >
          <div className="container mx-auto px-4 py-10 md:py-12">
            <h2
              id="coverage-heading"
              className="text-2xl font-bold text-gray-900"
            >
              Coverage by type and year
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
              Years reflect individually published records only, not archive
              ranges.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {legislationMetrics.map(metric => {
                const collection = collections.find(
                  item => item.id === metric.record_type
                );
                return (
                  <div
                    key={metric.record_type}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <h3 className="font-bold text-gray-900">
                      {collection?.label ?? metric.record_type}
                    </h3>
                    <p className="mt-1 text-sm text-gray-700">
                      Years: {metric.period_coverage.years.join(', ')}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-gray-600">
                      {metric.coverage_note}
                    </p>
                    {collection && (
                      <Link
                        to={collection.href}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                      >
                        Browse {collection.label}
                        <ArrowRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {archiveRanges.length > 0 && (
          <section
            className="container mx-auto px-4 py-10 md:py-12"
            aria-labelledby="archive-heading"
          >
            <h2
              id="archive-heading"
              className="text-2xl font-bold text-gray-900"
            >
              Archive-range metadata
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
              These are numbered range positions found in the City&apos;s
              archive, not individually published records. They are always kept
              separate from the counts above and never added to them.
            </p>
            <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead className="bg-gray-50 text-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Record type
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Year
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Archive range positions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {archiveRanges.map(entry => (
                    <tr key={`${entry.record_type}-${entry.year}`}>
                      <td className="px-4 py-3 text-gray-700">
                        {entry.record_type.replaceAll('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{entry.year}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {entry.count} ({entry.range_start}–{entry.range_end})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 pb-10 md:pb-14">
          <div
            className="flex items-start gap-3 rounded-xl bg-warning-50 p-5 text-sm leading-6 text-warning-900"
            role="note"
          >
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <p>
              These figures describe BetterSanFernando&apos;s verified published
              holdings only. Portal holdings are not the complete legislative
              output of the City, and absence from these collections does not
              prove a measure was never issued or enacted. BetterSanFernando
              does not determine legal effect, current validity, repeal status,
              sponsorship, or authorship for any record shown here.
            </p>
          </div>
          <p className="mt-5 text-sm">
            <Link
              to="/legislation"
              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            >
              Browse Legislation
            </Link>
            {' · '}
            <Link
              to="/statistics/public-records"
              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            >
              View Public Records Statistics
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
