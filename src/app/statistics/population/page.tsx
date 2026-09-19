import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarRange,
  ExternalLink,
  FileText,
  Landmark,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getBarangays,
  getCityDemographicsSource,
  getCityTotalPopulation,
} from '../../../data/civic/demographics';
import { aggregatePopulationStatistics } from '../../../data/civic/populationStatistics';
import { formatIsoDate } from '../../../lib/utils';
import { buildPageMetadata } from '../../../lib/metadata';
import BarangayTable from './BarangayTable';

export const metadata = buildPageMetadata({
  title: 'Population Statistics',
  description:
    'Compare the PSA 2024 POPCEN population of San Fernando, Pampanga across all 35 barangays, with exact values and source context.',
  path: '/statistics/population',
});

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

const ruralBarangayNames = statistics.ruralBarangays
  .map(barangay => barangay.name)
  .join(', ');

const topFiveBarangays = statistics.rankedBarangays.slice(0, 5);

export default function PopulationStatistics() {
  return (
    <main className="flex-grow bg-[#f7f8fa]">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Statistics', href: '/statistics' },
              { label: 'Population Statistics' },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#002EAC] text-white">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.055]"
          aria-hidden="true"
        >
          <div className="absolute -right-24 -top-32 h-[28rem] w-[28rem] rounded-full border-[72px] border-white" />
          <div className="absolute -bottom-64 right-[20%] h-[32rem] w-[32rem] rounded-full border-[80px] border-white" />
        </div>

        <div className="container relative mx-auto grid gap-10 px-4 py-12 md:py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-16 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-blue-100">Population</p>

            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-display text-white sm:text-5xl lg:text-[3.75rem]">
              Population Statistics
            </h1>

            <p className="mt-5 max-w-2xl text-base font-normal leading-7 text-blue-100 md:text-[17px]">
              Understand San Fernando&apos;s {source.census} population baseline
              and see how residents are distributed across the city&apos;s{' '}
              {statistics.barangayCount} barangays.
            </p>

            <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
              <div>
                <p className="text-5xl font-extrabold text-stat-value leading-none text-white sm:text-6xl lg:text-[4.25rem]">
                  {numberFormatter.format(statistics.totalPopulation)}
                </p>

                <p className="mt-2 text-sm font-medium text-blue-100">
                  {source.referenceYear} POPCEN city population
                </p>
              </div>

              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Landmark className="h-4 w-4" aria-hidden="true" />
                Philippine Statistics Authority
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <dl className="divide-y divide-white/20 border-y border-white/20">
            <div className="flex gap-4 py-4">
              <Users
                className="mt-1 h-5 w-5 shrink-0 text-blue-100"
                aria-hidden="true"
              />

              <div>
                <dd className="text-xl font-bold tracking-[-0.02em] text-white">
                  {statistics.barangayCount} barangays
                </dd>

                <dt className="mt-0.5 text-sm font-normal text-blue-100">
                  Administrative divisions
                </dt>
              </div>
            </div>

            <div className="flex gap-4 py-4">
              <CalendarRange
                className="mt-1 h-5 w-5 shrink-0 text-blue-100"
                aria-hidden="true"
              />

              <div>
                <dd className="text-xl font-bold tracking-[-0.02em] text-white">
                  {source.census}
                </dd>

                <dt className="mt-0.5 text-sm font-normal text-blue-100">
                  Reference period
                </dt>
              </div>
            </div>

            <div className="flex gap-4 py-4">
              <Landmark
                className="mt-1 h-5 w-5 shrink-0 text-blue-100"
                aria-hidden="true"
              />

              <div>
                <dd className="font-bold leading-6 tracking-[-0.01em] text-white">
                  {source.publisher}
                </dd>

                <dt className="mt-0.5 text-sm font-normal text-blue-100">
                  Official data publisher
                </dt>
              </div>
            </div>
          </dl>
        </div>
      </section>

      {/* KPI row */}
      <section
        className="relative z-10 lg:-mt-7"
        aria-label="Key population figures"
      >
        <div className="container mx-auto px-4">
          <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:grid-cols-3">
            {/* Total population */}
            <div className="border-b border-gray-200 p-5 sm:border-b-0 sm:border-r md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Population
                  </p>

                  <p className="mt-3 text-3xl font-bold text-stat-value text-[#0066EB] md:text-4xl">
                    {numberFormatter.format(statistics.totalPopulation)}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">{source.census}</p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0FD] text-[#0066EB]">
                  <Users className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>

            {/* Largest */}
            <div className="border-b border-gray-200 p-5 sm:border-b-0 sm:border-r md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Largest Barangay
                  </p>

                  <p className="mt-3 text-lg font-semibold text-gray-900">
                    {statistics.largestBarangay?.name}
                  </p>

                  <p className="mt-0.5 text-3xl font-bold text-stat-value text-gray-950">
                    {numberFormatter.format(
                      statistics.largestBarangay?.population ?? 0
                    )}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {percentFormatter.format(
                      statistics.largestBarangay?.share ?? 0
                    )}{' '}
                    of city total
                  </p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>

            {/* Smallest */}
            <div className="p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Smallest Barangay
                  </p>

                  <p className="mt-3 text-lg font-semibold text-gray-900">
                    {statistics.smallestBarangay?.name}
                  </p>

                  <p className="mt-0.5 text-3xl font-bold text-stat-value text-gray-950">
                    {numberFormatter.format(
                      statistics.smallestBarangay?.population ?? 0
                    )}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {percentFormatter.format(
                      statistics.smallestBarangay?.share ?? 0
                    )}{' '}
                    of city total
                  </p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
                  <TrendingDown className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="container mx-auto space-y-16 px-4 pt-12 pb-8 md:pt-16 md:pb-10">
        {/* Population distribution */}
        <section
          className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)] lg:gap-12"
          aria-labelledby="distribution-heading"
        >
          <div>
            <div className="max-w-2xl">
              <p className="text-eyebrow text-[#0066EB]">Distribution</p>

              <h2
                id="distribution-heading"
                className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
              >
                How Population Is Distributed
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                The five most populous barangays based on the {source.census}{' '}
                population baseline.
              </p>
            </div>

            <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="grid grid-cols-[2rem_minmax(0,1fr)_5rem] gap-3 border-b border-gray-200 bg-gray-50/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid-cols-[2rem_10rem_minmax(0,1fr)_6rem_4rem]">
                <span>#</span>
                <span>Barangay</span>
                <span className="hidden sm:block">Relative population</span>
                <span className="text-right">Population</span>
                <span className="hidden text-right sm:block">Share</span>
              </div>

              <ol className="divide-y divide-gray-100">
                {topFiveBarangays.map(barangay => (
                  <li
                    key={barangay.psgc_code}
                    className="grid grid-cols-[2rem_minmax(0,1fr)_5rem] items-center gap-3 px-4 py-4 sm:grid-cols-[2rem_10rem_minmax(0,1fr)_6rem_4rem]"
                  >
                    <span className="text-sm tabular-nums text-gray-400">
                      {barangay.rank}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {barangay.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500 sm:hidden">
                        {percentFormatter.format(barangay.share)} of city
                      </p>
                    </div>

                    <div
                      className="hidden h-2 overflow-hidden rounded-full bg-gray-100 sm:block"
                      role="img"
                      aria-label={`${barangay.name}: ${numberFormatter.format(
                        barangay.population
                      )} residents`}
                    >
                      <div
                        className="h-full rounded-full bg-[#0066EB]"
                        style={{
                          width: `${
                            (barangay.population / largestPopulation) * 100
                          }%`,
                        }}
                      />
                    </div>

                    <span className="text-right text-sm font-semibold tabular-nums text-gray-900">
                      {numberFormatter.format(barangay.population)}
                    </span>

                    <span className="hidden text-right text-sm tabular-nums text-gray-500 sm:block">
                      {percentFormatter.format(barangay.share)}
                    </span>
                  </li>
                ))}
              </ol>

              <a
                href="#barangays"
                className="flex items-center justify-between border-t border-gray-200 px-4 py-4 text-sm font-semibold text-[#0066EB] transition-colors hover:bg-[#E6F0FD] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
              >
                View all {statistics.barangayCount} barangays
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Population insights */}
          <aside aria-labelledby="insights-heading">
            <p className="text-eyebrow text-[#0066EB]">Context</p>

            <h2
              id="insights-heading"
              className="mt-2 text-2xl font-bold text-section-title text-gray-950"
            >
              Population Insights
            </h2>

            <div className="mt-7 border-y border-gray-200">
              <div className="flex gap-4 py-5">
                <BarChart3
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#0066EB]"
                  aria-hidden="true"
                />

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Population range
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-gray-600">
                    {statistics.largestBarangay?.name} has{' '}
                    {numberFormatter.format(
                      statistics.largestBarangay?.population ?? 0
                    )}{' '}
                    residents, compared with{' '}
                    {numberFormatter.format(
                      statistics.smallestBarangay?.population ?? 0
                    )}{' '}
                    in {statistics.smallestBarangay?.name}.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 border-t border-gray-200 py-5">
                <Building2
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#0066EB]"
                  aria-hidden="true"
                />

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Urban and rural classification
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-gray-600">
                    {statistics.urbanBarangayCount} barangays are classified as
                    Urban and {statistics.ruralBarangayCount} (
                    {ruralBarangayNames}) as Rural.
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    This classification is published source data. It does not by
                    itself measure wealth, population density, development, or
                    access to services.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#CCE0FB] bg-[#E6F0FD] px-4 py-4">
              <div className="flex gap-3">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#0052BC]"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-semibold text-[#003D8D]">
                    Verified population baseline
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#003D8D]/80">
                    Figures come from the Philippine Statistics Authority&apos;s
                    2024 POPCEN. BetterSanFernando presents the published data
                    without adding estimates or projections.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Full barangay dataset */}
        <section id="barangays" aria-labelledby="barangays-heading">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">Barangay Data</p>

            <h2
              id="barangays-heading"
              className="mt-2 text-3xl font-bold text-section-title text-gray-950"
            >
              All Barangays
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Search and compare all {statistics.barangayCount} barangays using
              their official {source.census} population, city share, and
              classification.
            </p>
          </div>

          <BarangayTable
            barangays={statistics.rankedBarangays}
            largestPopulation={largestPopulation}
            totalPopulation={statistics.totalPopulation}
            barangayCount={statistics.barangayCount}
          />
        </section>

        {/* Source and provenance */}
        <section
          aria-labelledby="source-heading"
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
            {/* Main source information */}
            <div className="p-6 md:p-7 lg:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F0FD] text-[#0066EB]">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>

                <div>
                  <p className="text-eyebrow text-[#0066EB]">Data Provenance</p>

                  <h2
                    id="source-heading"
                    className="mt-1 text-xl font-bold text-section-title text-gray-950 md:text-2xl"
                  >
                    Source and Reference Period
                  </h2>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-gray-600">
                BetterSanFernando presents the Philippine Statistics
                Authority&apos;s {source.census} population figures for the City
                of San Fernando, Pampanga. This page uses the official{' '}
                {source.referenceYear} baseline and does not combine estimates,
                projections, or older census values.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066EB] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
                >
                  View official PSA source
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <ShieldCheck
                    className="h-4 w-4 text-[#0066EB]"
                    aria-hidden="true"
                  />
                  Official source · no added estimates
                </div>
              </div>
            </div>

            {/* Dataset metadata */}
            <div className="border-t border-gray-200 bg-[#f8fafc] px-6 py-6 md:px-7 lg:border-l lg:border-t-0 lg:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                Dataset Details
              </p>

              <dl className="mt-4 divide-y divide-gray-200">
                <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 py-3 first:pt-0">
                  <dt className="text-sm text-gray-500">Publisher</dt>

                  <dd className="text-sm font-semibold leading-5 text-gray-950">
                    {source.publisher}
                  </dd>
                </div>

                <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 py-3">
                  <dt className="text-sm text-gray-500">Reference</dt>

                  <dd className="text-sm font-semibold text-gray-950">
                    {source.census}
                  </dd>
                </div>

                <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 py-3">
                  <dt className="text-sm text-gray-500">Last verified</dt>

                  <dd className="text-sm font-semibold text-gray-950">
                    {formatIsoDate(source.lastVerified)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Verification footer */}
          <div className="flex items-start gap-3 border-t border-[#CCE0FB] bg-[#F4F8FE] px-6 py-3.5 md:px-7 lg:px-8">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-[#0066EB]"
              aria-hidden="true"
            />

            <p className="text-xs leading-5 text-[#003D8D]">
              Population values are presented from the official PSA dataset. The
              figures shown on this page are not estimates generated by
              BetterSanFernando.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
