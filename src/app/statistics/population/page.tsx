import { ArrowDown, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getBarangays,
  getCityDemographicsSource,
  getCityTotalPopulation,
} from '../../../data/civic/demographics';
import { aggregatePopulationStatistics } from '../../../data/civic/populationStatistics';
import { buildPageMetadata } from '../../../lib/metadata';
import { formatIsoDate } from '../../../lib/utils';
import BarangayTable from './BarangayTable';

export const metadata = buildPageMetadata({
  title: 'Population Statistics',
  description:
    'Explore San Fernando’s 2024 POPCEN population across all 35 barangays, with exact counts, city shares, classifications, and official-source context.',
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

function getPopulationScale(maxValue: number) {
  let step = 10000;
  if (maxValue > 100000) {
    step = 25000;
  } else if (maxValue > 50000) {
    step = 10000;
  } else if (maxValue <= 20000) {
    step = 5000;
  }

  const max = Math.max(step, Math.ceil(maxValue / step) * step);
  const ticks: number[] = [];
  for (let val = 0; val <= max; val += step) {
    ticks.push(val);
  }

  return { max, ticks, step };
}

const populationScale = getPopulationScale(largestPopulation);

const ruralBarangayNames = statistics.ruralBarangays
  .map(barangay => barangay.name)
  .join(', ');

const topFiveBarangays = statistics.rankedBarangays.slice(0, 5);

const readingGuideItems = [
  {
    title: 'Population',
    description:
      'The exact 2024 POPCEN population published for each barangay.',
  },
  {
    title: 'City Share',
    description: `The barangay population as a share of San Fernando’s published city total of ${numberFormatter.format(statistics.totalPopulation)}.`,
  },
  {
    title: 'Classification',
    description:
      'The published Urban or Rural classification associated with each barangay.',
  },
  {
    title: 'Reference Period',
    description:
      'All comparisons on this page use the same 2024 POPCEN baseline.',
  },
] as const;

const keepExploringLinks = [
  {
    href: '/statistics/city-profile',
    title: 'City Profile',
    description:
      'A source-aware overview of verified city facts, boundaries, and office records.',
    action: 'View city profile',
  },
  {
    href: '/barangays',
    title: 'Barangay Directory',
    description:
      'Search verified PSGC identity, population, and classification records.',
    action: 'Browse barangays',
  },
  {
    href: '/statistics/public-records',
    title: 'Public Records Statistics',
    description:
      'Track published datasets, coverage periods, and evidence units.',
    action: 'View public records',
  },
  {
    href: '/transparency/methodology',
    title: 'How We Publish Data',
    description:
      'Learn how BetterSanFernando verifies and documents public data sources.',
    action: 'Read methodology',
  },
] as const;

export default function PopulationStatistics() {
  return (
    <main className="flex-grow bg-white">
      {/* 1. EDITORIAL HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Statistics', href: '/statistics' },
              { label: 'Population Statistics' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                STATISTICS · POPULATION
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                Population Statistics
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                Explore San Fernando’s {source.census} population across all{' '}
                {statistics.barangayCount} barangays, with exact counts, city
                shares, classifications, and official-source context.
              </p>

              {/* Prominent primary figure */}
              <div className="mt-6">
                <p className="text-4xl font-extrabold tabular-nums text-gray-950 sm:text-5xl">
                  {numberFormatter.format(statistics.totalPopulation)}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {source.census} Population
                </p>
              </div>

              {/* CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#distribution"
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC]"
                >
                  Explore Population Distribution
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  View Official PSA Source
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* RIGHT-SIDE SCOPE MODULE */}
            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
              <p className="text-eyebrow text-[#0066EB]">DATA SCOPE</p>
              <h2 className="mt-1.5 text-base font-bold text-gray-950">
                {source.census}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                Official population baseline published by the Philippine
                Statistics Authority. These figures are census values, not
                estimates or projections.
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-gray-200/80 pt-3 text-xs text-gray-600">
                <span>{statistics.barangayCount} Barangays</span>
                <span>Last Verified: {formatIsoDate(source.lastVerified)}</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 2. AT A GLANCE */}
      <section
        id="at-a-glance"
        className="border-b border-gray-200 bg-white"
        aria-labelledby="snapshot-heading"
      >
        <div className="container mx-auto px-4 py-8 sm:py-10">
          <h2 id="snapshot-heading" className="sr-only">
            At a Glance
          </h2>

          <dl className="grid grid-cols-1 gap-6 border-y border-gray-200 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-gray-200">
            {/* Barangays */}
            <div className="lg:pr-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Barangays
              </dt>
              <dd className="mt-1.5 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {statistics.barangayCount}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Complete published barangay set
              </p>
            </div>

            {/* Largest Barangay */}
            <div className="lg:px-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Largest Barangay
              </dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">
                {statistics.largestBarangay?.name}
              </dd>
              <p className="mt-0.5 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {numberFormatter.format(
                  statistics.largestBarangay?.population ?? 0
                )}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {percentFormatter.format(
                  statistics.largestBarangay?.share ?? 0
                )}{' '}
                of city total
              </p>
            </div>

            {/* Smallest Barangay */}
            <div className="lg:px-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Smallest Barangay
              </dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">
                {statistics.smallestBarangay?.name}
              </dd>
              <p className="mt-0.5 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {numberFormatter.format(
                  statistics.smallestBarangay?.population ?? 0
                )}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {percentFormatter.format(
                  statistics.smallestBarangay?.share ?? 0
                )}{' '}
                of city total
              </p>
            </div>

            {/* Classification */}
            <div className="lg:pl-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Classification
              </dt>
              <dd className="mt-1.5 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {statistics.urbanBarangayCount} Urban
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                {statistics.ruralBarangayCount} Rural · {ruralBarangayNames}
              </p>
            </div>
          </dl>
        </div>
      </section>

      {/* 3 & 4 & 5. POPULATION DISTRIBUTION */}
      <section
        id="distribution"
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="distribution-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">DISTRIBUTION</p>
            <h2
              id="distribution-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              How Population Is Distributed
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              The five most populous barangays based on the {source.census}{' '}
              population baseline.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.8fr)] lg:gap-12">
            {/* 4. LEFT: TOP 5 HORIZONTAL BAR CHART */}
            <div className="flex flex-col justify-between overflow-hidden rounded-sm border border-gray-200 bg-white">
              <div>
                {/* Header */}
                <div className="border-b border-gray-200 bg-white px-4 py-3.5 sm:px-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-950">
                        Top 5 Most Populous Barangays
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Population counts from the {source.census}.
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 sm:text-right">
                      <p className="font-medium text-gray-600">
                        {source.census} · {statistics.barangayCount} Barangays
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Population scale · residents
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop Column Header */}
                <div className="hidden border-b border-gray-200 bg-gray-50/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:grid sm:grid-cols-[1.75rem_8.5rem_minmax(0,1fr)_5.5rem_4.5rem] sm:items-center sm:gap-4 sm:px-5">
                  <span>#</span>
                  <span>Barangay</span>
                  <span>Barangay Population</span>
                  <span className="text-right">Population</span>
                  <span className="text-right">City Share</span>
                </div>

                {/* Rows */}
                <ol className="divide-y divide-gray-100">
                  {topFiveBarangays.map(barangay => {
                    const barWidthPercent =
                      (barangay.population / populationScale.max) * 100;
                    const accessibleLabel = `${barangay.name}: ${numberFormatter.format(
                      barangay.population
                    )} residents, ${(barangay.share * 100).toFixed(
                      1
                    )} percent of San Fernando’s ${source.census} population.`;

                    return (
                      <li
                        key={barangay.psgc_code}
                        className="px-4 py-3.5 sm:px-5"
                      >
                        {/* Desktop layout: all rows share the same grid */}
                        <div className="hidden sm:grid sm:grid-cols-[1.75rem_8.5rem_minmax(0,1fr)_5.5rem_4.5rem] sm:items-center sm:gap-4">
                          <span className="text-xs font-semibold tabular-nums text-gray-400">
                            {barangay.rank}
                          </span>

                          <span className="truncate text-sm font-semibold text-gray-950">
                            {barangay.name}
                          </span>

                          {/* Bar: simple horizontal comparison bar on neutral track */}
                          <div
                            className="h-4 w-full bg-gray-100"
                            role="img"
                            aria-label={accessibleLabel}
                          >
                            <div
                              className="h-full bg-[#0066EB]"
                              style={{ width: `${barWidthPercent}%` }}
                            />
                          </div>

                          <span className="text-right text-sm font-semibold tabular-nums text-gray-950">
                            {numberFormatter.format(barangay.population)}
                          </span>

                          <span className="text-right text-sm tabular-nums text-gray-600">
                            {percentFormatter.format(barangay.share)}
                          </span>
                        </div>

                        {/* Mobile layout: clean stack without squeezing axis */}
                        <div className="space-y-2 sm:hidden">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="flex min-w-0 items-baseline gap-2">
                              <span className="text-xs font-semibold tabular-nums text-gray-400">
                                #{barangay.rank}
                              </span>
                              <span className="truncate text-sm font-semibold text-gray-950">
                                {barangay.name}
                              </span>
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-950">
                              {numberFormatter.format(barangay.population)}
                            </span>
                          </div>

                          <div
                            className="h-3.5 w-full bg-gray-100"
                            role="img"
                            aria-label={accessibleLabel}
                          >
                            <div
                              className="h-full bg-[#0066EB]"
                              style={{ width: `${barWidthPercent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {percentFormatter.format(barangay.share)} of city
                              population
                            </span>
                            <span className="tabular-nums">
                              0–{numberFormatter.format(populationScale.max)}{' '}
                              scale
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {/* Desktop Axis beneath bars: streamlined to minimal height and clean tick labels */}
                <div className="hidden border-t border-gray-100 bg-gray-50/30 px-4 py-1.5 sm:grid sm:grid-cols-[1.75rem_8.5rem_minmax(0,1fr)_5.5rem_4.5rem] sm:items-center sm:gap-4 sm:px-5">
                  <span />
                  <span />
                  <div>
                    <div className="flex justify-between px-0.5">
                      {populationScale.ticks.map(tick => (
                        <span
                          key={tick}
                          className="h-1 w-px bg-gray-300"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <div className="mt-0.5 flex justify-between text-[11px] tabular-nums text-gray-400">
                      {populationScale.ticks.map((tick, index) => (
                        <span
                          key={tick}
                          className={
                            index === 0
                              ? 'text-left'
                              : index === populationScale.ticks.length - 1
                                ? 'text-right'
                                : 'text-center'
                          }
                        >
                          {tick === 0 ? '0' : `${tick / 1000}k`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span />
                  <span />
                </div>
              </div>

              <a
                href="#barangays"
                className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 text-xs font-semibold text-[#0066EB] transition-colors hover:bg-[#F3F6FB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] sm:px-5"
              >
                <span>View all {statistics.barangayCount} barangays</span>
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* 5. RIGHT: POPULATION CONTEXT */}
            <aside
              aria-labelledby="context-heading"
              className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-6 sm:p-7"
            >
              <div>
                <h3
                  id="context-heading"
                  className="text-base font-bold text-gray-950"
                >
                  Population Context
                </h3>

                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-950">
                      Largest to Smallest
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
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

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-semibold text-gray-950">
                      Urban and Rural Classification
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      {statistics.urbanBarangayCount} barangays are classified
                      Urban and {ruralBarangayNames} is classified Rural.
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-semibold text-gray-950">
                      One Census Baseline
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      All barangay comparisons on this page use the same{' '}
                      {source.census} reference.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pale support module */}
              <div className="mt-6 rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 text-xs leading-relaxed text-gray-700">
                <p className="text-eyebrow text-[#0066EB]">
                  VERIFIED POPULATION BASELINE
                </p>
                <p className="mt-1.5 text-gray-700">
                  Figures come from the Philippine Statistics Authority’s{' '}
                  {source.census}. BetterSanFernando presents the published
                  values without adding estimates or projections.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 6, 7, 8, 9, 10. ALL BARANGAYS */}
      <section
        id="barangays"
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="barangays-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">ALL BARANGAYS</p>
            <h2
              id="barangays-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              All Barangays
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
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
        </div>
      </section>

      {/* 11. HOW TO READ THESE NUMBERS */}
      <section
        className="border-b border-gray-200 bg-[#F9FAFB] py-10 sm:py-12 lg:py-14"
        aria-labelledby="reading-guide-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">READING GUIDE</p>
            <h2
              id="reading-guide-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              How to Read These Numbers
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {readingGuideItems.map(item => (
              <div
                key={item.title}
                className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6"
              >
                <h3 className="text-base font-bold text-gray-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. SOURCE & REFERENCE PERIOD */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="provenance-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">PROVENANCE</p>
            <h2
              id="provenance-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              Source &amp; Reference Period
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
            {/* LEFT: Authority & Verification */}
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  {source.publisher}
                </h3>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-900">
                      Reference:
                    </span>{' '}
                    {source.census}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Last Verified:
                    </span>{' '}
                    {formatIsoDate(source.lastVerified)}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  BetterSanFernando presents the Philippine Statistics
                  Authority’s official census release for the City of San
                  Fernando, Pampanga.
                </p>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  View Official PSA Source
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* RIGHT: What This Means */}
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  What This Means
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
                  <li className="flex items-start gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                      aria-hidden="true"
                    />
                    <span>
                      Official census values published by the national
                      statistical agency.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                      aria-hidden="true"
                    />
                    <span>
                      One shared census reference across all 35 component
                      barangays.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                      aria-hidden="true"
                    />
                    <span>
                      BetterSanFernando does not add population estimates.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                      aria-hidden="true"
                    />
                    <span>BetterSanFernando does not add projections.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-3 text-xs text-gray-500">
                All 35 barangay populations sum exactly to the published city
                total.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. KEEP EXPLORING */}
      <section
        className="bg-white py-10 pb-16 sm:py-12 sm:pb-24 lg:py-14 lg:pb-28"
        aria-labelledby="keep-exploring-heading"
      >
        <div className="container mx-auto px-4">
          <p className="text-eyebrow text-[#0066EB]">RELATED RESOURCES</p>
          <h2
            id="keep-exploring-heading"
            className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
          >
            Keep Exploring
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {keepExploringLinks.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] sm:p-5"
              >
                <div>
                  <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">
                    {item.description}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  {item.action}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
