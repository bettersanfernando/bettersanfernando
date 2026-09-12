import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, ExternalLink, Library } from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getPublicRecordsArchiveCoverage,
  getPublicRecordsCoverageMetadata,
  getPublicRecordsMetrics,
  getPublicRecordsRelatedCollections,
} from '../data/civic/publicRecordsCoverage';

const metrics = getPublicRecordsMetrics();
const archiveCoverage = getPublicRecordsArchiveCoverage();
const relatedCollections = getPublicRecordsRelatedCollections();
const metadata = getPublicRecordsCoverageMetadata();

type SourceFamilyFilter = 'ALL' | (typeof metrics)[number]['source_family'];

export default function PublicRecordsStatistics() {
  const [sourceFamily, setSourceFamily] = useState<SourceFamilyFilter>('ALL');

  const sourceFamilies = useMemo(
    () => [...new Set(metrics.map(metric => metric.source_family))],
    []
  );

  const visibleMetrics = useMemo(
    () =>
      sourceFamily === 'ALL'
        ? metrics
        : metrics.filter(metric => metric.source_family === sourceFamily),
    [sourceFamily]
  );

  return (
    <>
      <SEO
        title="Public Records Statistics"
        description="Coverage, publication status, and units for every dataset BetterSanFernando currently publishes, each kept in its own unit — never combined into a single total."
        keywords="San Fernando Pampanga public records, data coverage, transparency statistics"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/statistics/public-records`}
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
                { label: 'Public Records Statistics' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Library className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Public Records Statistics
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Coverage for every dataset BetterSanFernando currently
                  publishes, each shown in its own unit.
                </p>
              </div>
              <aside className="rounded-xl bg-warning-50 p-5 text-sm leading-relaxed text-warning-900">
                <p className="font-semibold">No combined total</p>
                <p className="mt-1">{metadata.overallLimitation}</p>
              </aside>
            </div>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-10 md:py-12"
          aria-labelledby="metrics-heading"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="metrics-heading"
                className="text-2xl font-bold text-gray-900"
              >
                Published datasets
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
                Each card uses its dataset&apos;s own unit label. Different
                units are never added together.
              </p>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-gray-700">
                Filter by source family
              </span>
              <select
                value={sourceFamily}
                onChange={event =>
                  setSourceFamily(event.target.value as SourceFamilyFilter)
                }
                className="min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              >
                <option value="ALL">All source families</option>
                {sourceFamilies.map(family => (
                  <option key={family} value={family}>
                    {family.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p
            className="mt-4 text-sm font-semibold text-gray-800"
            aria-live="polite"
          >
            Showing {visibleMetrics.length} of {metrics.length} datasets
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleMetrics.map(metric => (
              <article
                key={metric.record_type}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-3xl font-bold tabular-nums text-gray-900">
                    {metric.count}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {metric.unit_label}
                  </span>
                </div>
                <h3 className="mt-2 font-bold text-gray-900">
                  {metric.record_type.replaceAll('_', ' ')}
                </h3>
                <p className="mt-1 text-xs font-semibold text-gray-600">
                  {metric.period_coverage.start_year}
                  {metric.period_coverage.end_year !==
                  metric.period_coverage.start_year
                    ? `–${metric.period_coverage.end_year}`
                    : ''}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {metric.coverage_note}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    to={metric.canonical_route}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                  >
                    Browse
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                  <a
                    href={metric.official_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View the official source for ${metric.record_type.replaceAll('_', ' ')} (opens in a new tab)`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-gray-900"
                  >
                    Official source
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {relatedCollections.length > 0 && (
          <section
            className="border-y border-gray-200 bg-white"
            aria-labelledby="related-heading"
          >
            <div className="container mx-auto px-4 py-10 md:py-12">
              <h2
                id="related-heading"
                className="text-2xl font-bold text-gray-900"
              >
                Related specialized collections
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
                These collections may reference artifacts already represented
                above. They are not core holding counts and are never added to
                the totals above.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {relatedCollections.map(collection => (
                  <div
                    key={collection.record_type}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-2xl font-bold tabular-nums text-gray-900">
                        {collection.count}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {collection.unit_label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      {collection.coverage_note}
                    </p>
                    <Link
                      to={collection.canonical_route}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                    >
                      Browse
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {archiveCoverage.length > 0 && (
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
              Numbered range positions found in official archives, not
              individually published records. Kept separate from every count
              above.
            </p>
            <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <thead className="bg-gray-50 text-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Record type
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Year
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Count
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Unit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {archiveCoverage.map(entry => (
                    <tr key={`${entry.record_type}-${entry.year}`}>
                      <td className="px-4 py-3 text-gray-700">
                        {entry.record_type.replaceAll('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{entry.year}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {entry.count} ({entry.range_start}–{entry.range_end})
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {entry.unit_label}
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
            <p>{metadata.overallLimitation}</p>
          </div>
        </section>
      </main>
    </>
  );
}
