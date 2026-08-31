import {
  ArrowRight,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
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

const source = getCityDemographicsSource();
const statistics = aggregatePopulationStatistics(
  getBarangays(),
  getCityTotalPopulation()
);
const largestPopulation = statistics.largestBarangay?.population ?? 1;

function PopulationBar({ population }: { population: number }) {
  return (
    <div
      className="h-2 overflow-hidden rounded-full bg-gray-200"
      aria-hidden="true"
    >
      <div
        className="h-full rounded-full bg-primary-600"
        style={{ width: `${(population / largestPopulation) * 100}%` }}
      />
    </div>
  );
}

export default function PopulationStatistics() {
  return (
    <>
      <SEO
        title="Population statistics"
        description="Compare the PSA 2024 POPCEN population of San Fernando, Pampanga across all 35 barangays, with exact values and source context."
        keywords="San Fernando Pampanga population, 2024 POPCEN, barangay population, PSA population"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/statistics/population`}
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
                { label: 'Population statistics' },
              ]}
            />

            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Users className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Population statistics
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Understand San Fernando’s {source.census} population baseline
                  and compare the exact count reported for each of the city’s 35
                  barangays.
                </p>
                <div className="mt-7">
                  <p className="text-sm font-medium text-gray-600">
                    City population · {source.referenceYear} reference
                  </p>
                  <p className="mt-1 text-5xl font-bold tracking-[-0.03em] tabular-nums text-gray-900 sm:text-6xl">
                    {numberFormatter.format(statistics.totalPopulation)}
                  </p>
                </div>
              </div>

              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-6 text-primary-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  <p className="font-semibold">Verified population baseline</p>
                </div>
                <p className="mt-2">
                  Figures are from the Philippine Statistics Authority’s 2024
                  POPCEN. BetterSanFernando independently presents these
                  published figures and does not add estimates or projections.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid gap-x-8 gap-y-5 border-y border-gray-200 py-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-sm text-gray-600">Barangays represented</dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {statistics.barangayCount}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Urban classification</dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {statistics.urbanBarangayCount}
                  <span className="ml-2 text-base font-medium text-gray-600">
                    barangays
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Rural classification</dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {statistics.ruralBarangayCount}
                  <span className="ml-2 text-base font-medium text-gray-600">
                    Lourdes
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Reference period</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {source.census}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="container mx-auto space-y-12 px-4 py-10 md:py-14">
          <section
            className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]"
            aria-labelledby="range-heading"
          >
            <div className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-7">
              <h2
                id="range-heading"
                className="text-2xl font-bold tracking-[-0.02em] text-gray-900"
              >
                Population range
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-700">
                Largest and smallest refer only to the 35 barangay population
                values in the {source.census} baseline.
              </p>
              <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="border-t border-gray-200 pt-4">
                  <dt className="text-sm text-gray-600">Largest barangay</dt>
                  <dd className="mt-1 text-xl font-bold text-gray-900">
                    {statistics.largestBarangay?.name}
                  </dd>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-primary-700">
                    {numberFormatter.format(
                      statistics.largestBarangay?.population ?? 0
                    )}
                  </dd>
                  <dd className="mt-1 text-sm text-gray-600">
                    {percentFormatter.format(
                      statistics.largestBarangay?.share ?? 0
                    )}{' '}
                    of the city total
                  </dd>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <dt className="text-sm text-gray-600">Smallest barangay</dt>
                  <dd className="mt-1 text-xl font-bold text-gray-900">
                    {statistics.smallestBarangay?.name}
                  </dd>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-primary-700">
                    {numberFormatter.format(
                      statistics.smallestBarangay?.population ?? 0
                    )}
                  </dd>
                  <dd className="mt-1 text-sm text-gray-600">
                    {percentFormatter.format(
                      statistics.smallestBarangay?.share ?? 0
                    )}{' '}
                    of the city total
                  </dd>
                </div>
              </dl>
            </div>

            <aside className="rounded-xl bg-primary-900 p-6 text-white md:p-7">
              <div className="flex items-center gap-3">
                <MapPin
                  className="h-6 w-6 text-primary-200"
                  aria-hidden="true"
                />
                <h2 className="text-xl font-bold">Urban and rural</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-primary-100">
                The published data classifies 34 barangays as Urban and one,
                Lourdes, as Rural.
              </p>
              <p className="mt-4 border-t border-primary-700 pt-4 text-sm leading-6 text-primary-100">
                This classification is shown as source data. It does not by
                itself measure wealth, density, development, or access to
                services.
              </p>
            </aside>
          </section>

          <section id="barangays" aria-labelledby="barangay-ranking-heading">
            <div className="max-w-3xl">
              <h2
                id="barangay-ranking-heading"
                className="text-2xl font-bold tracking-[-0.02em] text-gray-900 md:text-3xl"
              >
                Barangay population comparison
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                All 35 barangays ranked by their {source.census} population.
                Shares use the city total of{' '}
                {numberFormatter.format(statistics.totalPopulation)} as the
                denominator. Bars are scaled to Calulut, the largest barangay.
              </p>
            </div>

            <ol className="mt-6 divide-y divide-gray-200 overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(0,41,94,0.08)] sm:hidden">
              {statistics.rankedBarangays.map(barangay => (
                <li key={barangay.psgc_code} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-600">
                        Rank {barangay.rank}
                      </p>
                      <p className="mt-1 break-words font-semibold text-gray-900">
                        {barangay.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {barangay.classification} ·{' '}
                        {percentFormatter.format(barangay.share)} of city total
                      </p>
                    </div>
                    <p className="shrink-0 text-lg font-bold tabular-nums text-gray-900">
                      {numberFormatter.format(barangay.population)}
                    </p>
                  </div>
                  <div className="mt-3">
                    <PopulationBar population={barangay.population} />
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 hidden overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(0,41,94,0.08)] sm:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                  <caption className="sr-only">
                    All 35 San Fernando barangays ranked by PSA 2024 POPCEN
                    population, with exact counts, city shares, and urban or
                    rural classification
                  </caption>
                  <thead className="bg-gray-100 text-gray-800">
                    <tr>
                      <th scope="col" className="w-16 px-5 py-3 font-semibold">
                        Rank
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Barangay
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Relative population
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-semibold"
                      >
                        Population
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-semibold"
                      >
                        City share
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3 text-right font-semibold"
                      >
                        Classification
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {statistics.rankedBarangays.map(barangay => (
                      <tr key={barangay.psgc_code}>
                        <td className="px-5 py-3 font-medium tabular-nums text-gray-600">
                          {barangay.rank}
                        </td>
                        <th
                          scope="row"
                          className="px-4 py-3 font-semibold text-gray-900"
                        >
                          {barangay.name}
                        </th>
                        <td className="w-1/4 px-4 py-3">
                          <PopulationBar population={barangay.population} />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                          {numberFormatter.format(barangay.population)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                          {percentFormatter.format(barangay.share)}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-700">
                          {barangay.classification}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-300 bg-gray-50">
                    <tr>
                      <th
                        scope="row"
                        colSpan={3}
                        className="px-5 py-3 text-left font-bold text-gray-900"
                      >
                        City total · {statistics.barangayCount} barangays
                      </th>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-gray-900">
                        {numberFormatter.format(statistics.totalPopulation)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-gray-900">
                        100.0%
                      </td>
                      <td className="px-5 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-8">
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
              <div>
                <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-900">
                  Source and reference period
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
                  BetterSanFernando presents the Philippine Statistics
                  Authority’s {source.census} figures for the City of San
                  Fernando, Pampanga. This page uses one 2024 baseline only; it
                  does not combine older census values, estimates, projections,
                  or broader demographic measures.
                </p>
              </div>
              <dl className="divide-y divide-gray-200 border-y border-gray-200 text-sm">
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
            </div>
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              View the official PSA barangay source
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            <p className="mt-5 flex items-start gap-2 border-t border-gray-200 pt-5 text-sm leading-6 text-gray-700">
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-primary-700"
                aria-hidden="true"
              />
              Fact: 377,534 residents · Source: Philippine Statistics Authority
              · Official link: PSA source page above.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
