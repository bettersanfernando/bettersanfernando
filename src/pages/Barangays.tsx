import { useMemo } from 'react';
import {
  ArrowRight,
  ExternalLink,
  MapPinned,
  RotateCcw,
  Search,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { useQueryState } from 'nuqs';
import { Link } from 'react-router';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import {
  filterAndSortBarangays,
  type BarangayDirectoryClassification,
  type BarangayDirectorySort,
} from '../data/civic/barangayDirectory';
import {
  getBarangays,
  getCityDemographicsSource,
  getCityTotalPopulation,
} from '../data/civic/demographics';
import { aggregatePopulationStatistics } from '../data/civic/populationStatistics';
import { formatIsoDate } from '../lib/utils';

const numberFormatter = new Intl.NumberFormat('en-PH');
const percentFormatter = new Intl.NumberFormat('en-PH', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const statistics = aggregatePopulationStatistics(
  getBarangays(),
  getCityTotalPopulation()
);
const source = getCityDemographicsSource();

function isClassification(
  value: string
): value is BarangayDirectoryClassification {
  return value === 'All' || value === 'Urban' || value === 'Rural';
}

function isSort(value: string): value is BarangayDirectorySort {
  return (
    value === 'name-asc' ||
    value === 'population-desc' ||
    value === 'population-asc'
  );
}

export default function Barangays() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [classificationValue, setClassification] = useQueryState('type', {
    defaultValue: 'All',
  });
  const [sortValue, setSort] = useQueryState('sort', {
    defaultValue: 'name-asc',
  });
  const classification = isClassification(classificationValue)
    ? classificationValue
    : 'All';
  const sort = isSort(sortValue) ? sortValue : 'name-asc';
  const hasFilters = Boolean(
    query.trim() || classification !== 'All' || sort !== 'name-asc'
  );
  const visibleBarangays = useMemo(
    () =>
      filterAndSortBarangays(statistics.rankedBarangays, {
        query,
        classification,
        sort,
      }),
    [query, classification, sort]
  );

  function resetDirectory() {
    void Promise.all([setQuery(null), setClassification(null), setSort(null)]);
  }

  return (
    <>
      <SEO
        title="Barangay directory"
        description="Browse all 35 barangays in San Fernando, Pampanga with verified PSGC identity, PSA 2024 POPCEN population, and urban or rural classification."
        keywords="San Fernando Pampanga barangays, barangay directory, PSGC, 2024 POPCEN"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/barangays`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[{ label: 'Home', href: '/' }, { label: 'Barangays' }]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <MapPinned className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Barangay directory
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Find every barangay in the City of San Fernando and review the
                  verified public facts currently available for each one.
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-y border-gray-200 py-5">
                <div>
                  <dt className="text-sm text-gray-600">Barangays</dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                    {statistics.barangayCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Population baseline</dt>
                  <dd className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                    {numberFormatter.format(statistics.totalPopulation)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Urban</dt>
                  <dd className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                    {statistics.urbanBarangayCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Rural</dt>
                  <dd className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                    {statistics.ruralBarangayCount}
                    <span className="ml-1 text-sm font-medium text-gray-600">
                      Lourdes
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10 md:py-14">
          <section aria-labelledby="directory-heading">
            <div className="max-w-3xl">
              <h2
                id="directory-heading"
                className="text-2xl font-bold tracking-[-0.02em] text-gray-900 md:text-3xl"
              >
                Browse all barangays
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Search by name, filter by the published Urban or Rural
                classification, or order the directory by population. Population
                ranks and shares use all 35 barangays and the city total of{' '}
                {numberFormatter.format(statistics.totalPopulation)}.
              </p>
            </div>
            <div className="mt-6 rounded-xl bg-primary-900 p-4 text-white shadow-[0_8px_28px_rgba(0,41,94,0.14)] md:p-5">
              <div className="grid gap-4 md:grid-cols-[minmax(15rem,1fr)_12rem_14rem_auto] md:items-end">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-primary-50">
                    Search barangays
                  </span>
                  <span className="relative block">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={event => setQuery(event.target.value || null)}
                      placeholder="Enter a barangay name"
                      className="min-h-11 w-full rounded-lg border border-primary-700 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-primary-50">
                    Classification
                  </span>
                  <select
                    value={classification}
                    onChange={event => setClassification(event.target.value)}
                    className="min-h-11 w-full rounded-lg border border-primary-700 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                  >
                    <option value="All">All classifications</option>
                    <option value="Urban">Urban</option>
                    <option value="Rural">Rural</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-primary-50">
                    Sort directory
                  </span>
                  <select
                    value={sort}
                    onChange={event => setSort(event.target.value)}
                    className="min-h-11 w-full rounded-lg border border-primary-700 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                  >
                    <option value="name-asc">Name A–Z</option>
                    <option value="population-desc">
                      Population, largest first
                    </option>
                    <option value="population-asc">
                      Population, smallest first
                    </option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={resetDirectory}
                  disabled={!hasFilters}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p
                className="text-sm font-semibold text-gray-800"
                aria-live="polite"
              >
                Showing {visibleBarangays.length} of {statistics.barangayCount}{' '}
                barangays
              </p>
              <p className="text-sm text-gray-600">
                {source.census} · 2024 reference
              </p>
            </div>

            {visibleBarangays.length ? (
              <ol className="mt-4 divide-y divide-gray-200 overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(0,41,94,0.08)]">
                {visibleBarangays.map(barangay => (
                  <li
                    key={barangay.psgc_code}
                    className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center md:px-6"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-lg font-bold text-gray-900">
                          {barangay.name}
                        </h3>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          {barangay.classification}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        PSGC {barangay.psgc_code} · Population rank{' '}
                        {barangay.rank}
                      </p>
                      <Link
                        to={`/projects?barangay=${encodeURIComponent(barangay.psgc_code)}`}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                      >
                        Browse projects for {barangay.name}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-6 border-t border-gray-200 pt-4 sm:min-w-64 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                      <div>
                        <dt className="text-xs text-gray-600">Population</dt>
                        <dd className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                          {numberFormatter.format(barangay.population)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-600">City share</dt>
                        <dd className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                          {percentFormatter.format(barangay.share)}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-4 rounded-xl bg-white px-5 py-12 text-center shadow-[0_8px_28px_rgba(0,41,94,0.08)]">
                <Search
                  className="mx-auto h-7 w-7 text-gray-500"
                  aria-hidden="true"
                />
                <h3 className="mt-3 text-lg font-bold text-gray-900">
                  No barangays match these filters
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
                  Check the spelling or reset the directory to show all 35
                  barangays.
                </p>
                <button
                  type="button"
                  onClick={resetDirectory}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Show all barangays
                </button>
              </div>
            )}
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
            <div className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-8">
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className="h-6 w-6 text-primary-700"
                  aria-hidden="true"
                />
                <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-900">
                  Source and scope
                </h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-700">
                Population and classification figures come from the Philippine
                Statistics Authority’s {source.census}. BetterSanFernando
                independently presents this verified 2024 baseline and does not
                add estimates, projections, private contacts, or claims about
                barangay wealth, density, or development.
              </p>
              <dl className="mt-5 divide-y divide-gray-200 border-y border-gray-200 text-sm">
                <div className="grid grid-cols-[7rem_1fr] gap-4 py-3">
                  <dt className="text-gray-600">Publisher</dt>
                  <dd className="font-semibold text-gray-900">
                    {source.publisher}
                  </dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] gap-4 py-3">
                  <dt className="text-gray-600">Reference</dt>
                  <dd className="font-semibold text-gray-900">
                    {source.census}
                  </dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] gap-4 py-3">
                  <dt className="text-gray-600">Last verified</dt>
                  <dd className="font-semibold text-gray-900">
                    {formatIsoDate(source.lastVerified)}
                  </dd>
                </div>
              </dl>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                View the official PSA source
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <aside className="rounded-xl bg-primary-50 p-6 text-primary-950 md:p-8">
              <div className="flex items-center gap-3">
                <UsersRound
                  className="h-6 w-6 text-primary-700"
                  aria-hidden="true"
                />
                <h2 className="text-xl font-bold">Continue exploring</h2>
              </div>
              <p className="mt-3 text-sm leading-6">
                Use the dedicated statistics and project views when you want
                comparison or geographic project context rather than directory
                browsing.
              </p>
              <div className="mt-5 space-y-3 border-t border-primary-200 pt-5">
                <Link
                  to="/statistics/population"
                  className="flex items-center justify-between gap-3 font-semibold text-primary-800 underline underline-offset-4 hover:text-primary-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  View population statistics
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
                <Link
                  to="/projects/map"
                  className="flex items-center justify-between gap-3 font-semibold text-primary-800 underline underline-offset-4 hover:text-primary-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  Explore project distribution
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}
