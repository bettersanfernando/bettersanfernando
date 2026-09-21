import { ArrowDown, ArrowRight, ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';

import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getAgeBandPopulation2020,
  getAgeSexPopulation2020,
  getDemographicProfileMetadata,
  getHouseholdPopulation2024,
  getPovertyIncidence2023,
} from '../../../data/civic/demographicProfile';
import { getCityTotalPopulation } from '../../../data/civic/demographics';
import { buildPageMetadata } from '../../../lib/metadata';
import { formatIsoDate } from '../../../lib/utils';
import HouseholdBarangayTable from './HouseholdBarangayTable';

export function generateMetadata() {
  return buildPageMetadata({
    title: 'Demographics',
    description:
      'Explore official 2024 POPCEN household population, 2020 CPH age and sex structure, and 2023 poverty small area estimates for San Fernando, Pampanga, each kept in its own reference period.',
    path: '/statistics/demographics',
  });
}

const numberFormatter = new Intl.NumberFormat('en-PH');
const percentFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Not available';
  return numberFormatter.format(value);
}

const metadata = getDemographicProfileMetadata();
const households2024 = getHouseholdPopulation2024();
const ageSex2020 = getAgeSexPopulation2020();
const ageBands2020 = getAgeBandPopulation2020();
const poverty2023 = getPovertyIncidence2023();
const totalPopulation2024 = getCityTotalPopulation();

const ageSexTotals = {
  both: ageSex2020.find(r => r.sex === 'both' && r.category === 'all_ages'),
  male: ageSex2020.find(r => r.sex === 'male' && r.category === 'all_ages'),
  female: ageSex2020.find(r => r.sex === 'female' && r.category === 'all_ages'),
};

const ageBandRows = ['0-14', '15-64', '65+']
  .map(band => ({
    band,
    both: ageBands2020.find(r => r.category === band && r.sex === 'both'),
    male: ageBands2020.find(r => r.category === band && r.sex === 'male'),
    female: ageBands2020.find(r => r.category === band && r.sex === 'female'),
  }))
  .filter(row => row.both);

// Top 5 household population barangays
const sortedHouseholdBarangays = [...households2024.barangays].sort(
  (a, b) => b.householdPopulation - a.householdPopulation
);
const topFiveHouseholdBarangays = sortedHouseholdBarangays
  .slice(0, 5)
  .map((b, index) => ({
    rank: index + 1,
    ...b,
  }));

const largestHouseholdPop =
  topFiveHouseholdBarangays[0]?.householdPopulation ?? 44658;
const householdScaleMax = Math.ceil(largestHouseholdPop / 10000) * 10000; // 50,000
const householdTicks = [0, 10000, 20000, 30000, 40000, 50000];

// Age pyramid shared scale: max single-sex band value is 120,133 (Male 15-64)
const pyramidScaleMax = 130000;

const readingGuideMeasures = [
  {
    vintage: '2024 POPCEN',
    title: 'Household Population & Households',
    description:
      'Official count of residents living in private households and number of households. Excludes institutional populations.',
  },
  {
    vintage: '2020 CPH',
    title: 'Age & Sex Structure',
    description:
      'Official household population breakdown by sex and broad age bands, measured during the 2020 census reference.',
  },
  {
    vintage: '2023 SAE',
    title: 'Model-Based Poverty Estimate',
    description:
      'Small Area Estimate of citywide poverty incidence, published with standard error and statistical confidence intervals.',
  },
] as const;

const keepExploringLinks = [
  {
    href: '/statistics/population',
    title: 'Population Statistics',
    description:
      'Official 2024 POPCEN total city population (377,534) and barangay rankings.',
    action: 'View population statistics',
  },
  {
    href: '/statistics/city-profile',
    title: 'City Profile',
    description:
      'Verified city baseline facts, boundaries, landmarks, and governance records.',
    action: 'View city profile',
  },
  {
    href: '/barangays',
    title: 'Barangay Directory',
    description:
      'Explore PSGC identity, classification, and contact directories for all 35 barangays.',
    action: 'Browse barangays',
  },
  {
    href: '/transparency/methodology',
    title: 'How We Publish Data',
    description:
      'Learn how BetterSanFernando verifies, documents, and keeps public data separated.',
    action: 'Read methodology',
  },
] as const;

export default function DemographicsStatistics() {
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
              { label: 'Demographics' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                STATISTICS · DEMOGRAPHICS
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                Demographics
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                Explore published demographic measures for San Fernando,
                including household population and households, age and sex
                structure, and the latest available poverty estimate.
              </p>

              {/* Action row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#household-population"
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  <span>Explore Household Population</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>

                <Link
                  href="/statistics/population"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  <span>Compare with Population Statistics (377,534)</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right-Side Scope Module */}
            <aside
              aria-label="Demographic data scope"
              className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Data Scope
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-950">
                Different Measures, Different Reference Periods
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                This page combines separate official datasets. Figures should be
                interpreted using their own reference year, population universe,
                and methodology.
              </p>

              <dl className="mt-4 space-y-2.5 border-t border-gray-200/80 pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Household Population</dt>
                  <dd className="font-semibold text-gray-900">2024 POPCEN</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Age &amp; Sex Structure</dt>
                  <dd className="font-semibold text-gray-900">2020 CPH</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Poverty Incidence</dt>
                  <dd className="font-semibold text-gray-900">2023 SAE</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* 2. READING GUIDE NEAR THE TOP */}
      <section
        className="border-b border-gray-200 bg-white py-8 sm:py-10"
        aria-labelledby="reading-guide-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">READING GUIDE</p>
            <h2
              id="reading-guide-heading"
              className="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Three Different Demographic Measures
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              These measures should not be added together or interpreted as a
              single same-year demographic snapshot.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {readingGuideMeasures.map(item => (
              <div
                key={item.vintage}
                className="border-l-2 border-[#0066EB] pl-4"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                  {item.vintage}
                </p>
                <h3 className="mt-1 text-sm font-bold text-gray-950">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3, 4 & 5. HOUSEHOLD POPULATION SECTION */}
      <section
        id="household-population"
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="household-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              2024 POPCEN · REFERENCE DATE:{' '}
              {formatIsoDate(households2024.referenceDate)}
            </p>
            <h2
              id="household-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              Household Population and Households
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Official 2024 Census of Population baseline for private households
              and household counts published by the Philippine Statistics
              Authority.
            </p>
          </div>

          {/* Primary Metrics */}
          <div className="mt-8 grid grid-cols-1 items-start gap-6 border-b border-gray-200 pb-8 lg:grid-cols-3">
            {/* Two metric columns with subtle center divider */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:divide-x sm:divide-gray-200 lg:col-span-2">
              {/* Household Population */}
              <div className="space-y-1 sm:pr-6">
                <div className="h-0.5 w-7 bg-[#0066EB]" aria-hidden="true" />
                <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Household Population
                </p>
                <p className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                  {formatCount(households2024.cityHouseholdPopulation)}
                </p>
                <p className="text-xs text-gray-600">
                  Residents in private households
                </p>
                <p className="text-[11px] text-gray-400">2024 POPCEN</p>
              </div>

              {/* Households */}
              <div className="space-y-1 sm:pl-6">
                <div className="h-0.5 w-7 bg-[#0066EB]" aria-hidden="true" />
                <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Households
                </p>
                <p className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                  {formatCount(households2024.cityNumberOfHouseholds)}
                </p>
                <p className="text-xs text-gray-600">
                  Published household units
                </p>
                <p className="text-[11px] text-gray-400">2024 POPCEN</p>
              </div>
            </div>

            {/* Right-Side Information Module */}
            <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#0066EB]"
                  aria-hidden="true"
                />
                <div className="space-y-1.5">
                  <p className="font-semibold text-gray-900">
                    Different from Total Population
                  </p>
                  <p className="leading-relaxed text-gray-600">
                    Household population excludes institutional and certain
                    non-household populations, so it is not the same population
                    universe as the {formatCount(totalPopulation2024)} total
                    population shown on Population Statistics.
                  </p>
                  <Link
                    href="/statistics/population"
                    className="inline-flex items-center gap-1 font-semibold text-[#0066EB] hover:text-[#0052BC]"
                  >
                    <span>View Population Statistics</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 4. HOUSEHOLD POPULATION DISTRIBUTION: TOP 5 */}
          <div className="mt-10">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                HOUSEHOLD DISTRIBUTION
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl">
                Largest Household Populations
              </h3>
              <p className="mt-1.5 text-xs text-gray-600 sm:text-sm">
                The five largest barangays by 2024 POPCEN household population.
              </p>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="mt-6 flex flex-col justify-between overflow-hidden rounded-sm border border-gray-200 bg-white">
              <div>
                {/* Header */}
                <div className="border-b border-gray-200 bg-white px-4 py-3.5 sm:px-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-950">
                        Top 5 Most Populous Barangays by Household Count
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Official 2024 POPCEN household population figures.
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 sm:text-right">
                      <p className="font-medium text-gray-600">
                        2024 POPCEN · {households2024.barangayCount} Barangays
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Household population scale · residents
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop Column Header */}
                <div className="hidden border-b border-gray-200 bg-gray-50/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:grid sm:grid-cols-[1.75rem_8.5rem_minmax(0,1fr)_6.5rem] sm:items-center sm:gap-4 sm:px-5">
                  <span>#</span>
                  <span>Barangay</span>
                  <span>Household Population Scale</span>
                  <span className="text-right">Household Pop</span>
                </div>

                {/* Rows */}
                <ol className="divide-y divide-gray-100">
                  {topFiveHouseholdBarangays.map(barangay => {
                    const barWidthPercent =
                      (barangay.householdPopulation / householdScaleMax) * 100;
                    const accessibleLabel = `${barangay.name}: ${numberFormatter.format(
                      barangay.householdPopulation
                    )} household residents (2024 POPCEN).`;

                    return (
                      <li key={barangay.psgc} className="px-4 py-3.5 sm:px-5">
                        {/* Desktop layout: aligned grid */}
                        <div className="hidden sm:grid sm:grid-cols-[1.75rem_8.5rem_minmax(0,1fr)_6.5rem] sm:items-center sm:gap-4">
                          <span className="text-xs font-semibold tabular-nums text-gray-400">
                            {barangay.rank}
                          </span>

                          <span className="truncate text-sm font-semibold text-gray-950">
                            {barangay.name}
                          </span>

                          {/* Comparison bar on neutral track */}
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
                            {numberFormatter.format(
                              barangay.householdPopulation
                            )}
                          </span>
                        </div>

                        {/* Mobile layout: clean vertical stack */}
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
                              {numberFormatter.format(
                                barangay.householdPopulation
                              )}
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

                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>2024 POPCEN Household Population</span>
                            <span className="tabular-nums">
                              0–{numberFormatter.format(householdScaleMax)}{' '}
                              scale
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {/* Desktop Axis beneath bars */}
                <div className="hidden border-t border-gray-100 bg-gray-50/30 px-4 py-1.5 sm:grid sm:grid-cols-[1.75rem_8.5rem_minmax(0,1fr)_6.5rem] sm:items-center sm:gap-4 sm:px-5">
                  <span />
                  <span />
                  <div>
                    <div className="flex justify-between px-0.5">
                      {householdTicks.map(tick => (
                        <span
                          key={tick}
                          className="h-1 w-px bg-gray-300"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <div className="mt-0.5 flex justify-between text-[11px] tabular-nums text-gray-400">
                      {householdTicks.map((tick, index) => (
                        <span
                          key={tick}
                          className={
                            index === 0
                              ? 'text-left'
                              : index === householdTicks.length - 1
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
                </div>
              </div>

              {/* Bottom anchor */}
              <a
                href="#all-barangays-household"
                className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 text-xs font-semibold text-[#0066EB] transition-colors hover:bg-[#F3F6FB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] sm:px-5"
              >
                <span>
                  View all {households2024.barangayCount} barangays below
                </span>
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* 5. ALL BARANGAYS — HOUSEHOLD POPULATION TABLE */}
          <div id="all-barangays-household" className="mt-12">
            <div className="max-w-3xl">
              <h3 className="text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl">
                Household Population by Barangay
              </h3>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                Search, sort, and browse official 2024 POPCEN household
                population for all 35 barangays.
              </p>
            </div>

            <HouseholdBarangayTable barangays={households2024.barangays} />
          </div>
        </div>
      </section>

      {/* 6, 7 & 8. AGE & SEX SECTION */}
      <section
        id="age-sex"
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="age-sex-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              2020 CPH · DIFFERENT REFERENCE PERIOD
            </p>
            <h2
              id="age-sex-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              Household Population by Age and Sex
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              These figures describe the 2020 household population and must not
              be blended with the 2024 household-population figures above.
            </p>
          </div>

          {/* Top 2020 Metrics */}
          <dl className="mt-8 grid grid-cols-1 gap-6 border-b border-gray-200 pb-8 sm:grid-cols-3">
            <div className="border-l-2 border-[#0066EB] pl-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Male
              </dt>
              <dd className="mt-1 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {formatCount(ageSexTotals.male?.value)}
              </dd>
              <p className="mt-1 text-xs text-gray-500">
                2020 CPH Household Population
              </p>
            </div>

            <div className="border-l-2 border-[#0066EB] pl-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Female
              </dt>
              <dd className="mt-1 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {formatCount(ageSexTotals.female?.value)}
              </dd>
              <p className="mt-1 text-xs text-gray-500">
                2020 CPH Household Population
              </p>
            </div>

            <div className="border-l-2 border-gray-300 pl-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                2020 Household Population
              </dt>
              <dd className="mt-1 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {formatCount(ageSexTotals.both?.value)}
              </dd>
              <p className="mt-1 text-xs text-gray-500">
                Combined total across all age groups (2020)
              </p>
            </div>
          </dl>

          {/* 7. POPULATION PYRAMID VISUALIZATION */}
          <div className="mt-10">
            <div className="max-w-3xl">
              <h3 className="text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl">
                Population Structure by Age Group
              </h3>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                Mirrored comparison of male and female counts across broad age
                bands from the 2020 CPH.
              </p>
            </div>

            <div className="mt-6 rounded-sm border border-gray-200 bg-white">
              {/* Desktop Pyramid View */}
              <div className="hidden p-5 sm:p-7 md:block">
                {/* Header columns */}
                <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_6.5rem_minmax(0,1fr)_5.5rem] items-center gap-3 border-b border-gray-200 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:gap-4">
                  <span className="text-right text-[#0066EB]">Male Count</span>
                  <span className="text-right font-medium text-gray-400">
                    Male Bar (extends left)
                  </span>
                  <span className="text-center font-bold text-gray-700">
                    Age Band
                  </span>
                  <span className="text-left font-medium text-gray-400">
                    Female Bar (extends right)
                  </span>
                  <span className="text-left text-[#0066EB]">Female Count</span>
                </div>

                {/* Pyramid rows */}
                <div className="mt-4 space-y-4">
                  {ageBandRows.map(row => {
                    const maleVal = row.male?.value ?? 0;
                    const femaleVal = row.female?.value ?? 0;
                    const malePercent = (maleVal / pyramidScaleMax) * 100;
                    const femalePercent = (femaleVal / pyramidScaleMax) * 100;

                    const accessiblePyramidLabel = `Age band ${row.band}: ${numberFormatter.format(
                      maleVal
                    )} males, ${numberFormatter.format(
                      femaleVal
                    )} females (2020 CPH).`;

                    return (
                      <div
                        key={row.band}
                        className="grid grid-cols-[5.5rem_minmax(0,1fr)_6.5rem_minmax(0,1fr)_5.5rem] items-center gap-3 sm:gap-4"
                        role="img"
                        aria-label={accessiblePyramidLabel}
                      >
                        {/* Male Count */}
                        <span className="text-right text-sm font-semibold tabular-nums text-gray-950">
                          {numberFormatter.format(maleVal)}
                        </span>

                        {/* Male Bar (extends left from center) */}
                        <div className="flex h-5 w-full justify-end bg-gray-100">
                          <div
                            className="h-full bg-[#0066EB]"
                            style={{ width: `${malePercent}%` }}
                          />
                        </div>

                        {/* Centered Age Band Label */}
                        <div className="rounded-xs bg-gray-100/90 py-1 text-center text-xs font-bold uppercase tracking-wider text-gray-800">
                          {row.band}
                        </div>

                        {/* Female Bar (extends right from center) */}
                        <div className="flex h-5 w-full justify-start bg-gray-100">
                          <div
                            className="h-full bg-[#0066EB]"
                            style={{ width: `${femalePercent}%` }}
                          />
                        </div>

                        {/* Female Count */}
                        <span className="text-left text-sm font-semibold tabular-nums text-gray-950">
                          {numberFormatter.format(femaleVal)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Scale reference footer */}
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-400">
                  <span>← Male (scale to 130k)</span>
                  <span>Shared 2020 CPH population scale</span>
                  <span>Female (scale to 130k) →</span>
                </div>
              </div>

              {/* Mobile Pyramid View: stacked cards per age band */}
              <div className="divide-y divide-gray-100 p-4 md:hidden">
                {ageBandRows.map(row => {
                  const maleVal = row.male?.value ?? 0;
                  const femaleVal = row.female?.value ?? 0;
                  const malePercent = (maleVal / pyramidScaleMax) * 100;
                  const femalePercent = (femaleVal / pyramidScaleMax) * 100;

                  return (
                    <div key={row.band} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-950">
                          Age Group: {row.band}
                        </span>
                        <span className="font-medium text-gray-500">
                          Both sexes: {formatCount(row.both?.value)}
                        </span>
                      </div>

                      {/* Male row */}
                      <div className="mt-2.5 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-600">
                            Male
                          </span>
                          <span className="font-semibold tabular-nums text-gray-950">
                            {formatCount(maleVal)}
                          </span>
                        </div>
                        <div className="h-3 w-full bg-gray-100">
                          <div
                            className="h-full bg-[#0066EB]"
                            style={{ width: `${malePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Female row */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-600">
                            Female
                          </span>
                          <span className="font-semibold tabular-nums text-gray-950">
                            {formatCount(femaleVal)}
                          </span>
                        </div>
                        <div className="h-3 w-full bg-gray-100">
                          <div
                            className="h-full bg-[#0066EB]"
                            style={{ width: `${femalePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 8. AGE/SEX INTERPRETATION */}
          <div className="mt-8 grid grid-cols-1 gap-6 rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:grid-cols-3 sm:p-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                What You’re Seeing
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-700">
                Household population by broad age group and sex from the 2020
                CPH. Age bands (0–14, 15–64, 65+) are derived by summing
                official 5-year age groups from the 2020 CPH release.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                How to Read It
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-700">
                Bar lengths compare population counts within the same 2020
                household-population universe using a single shared scale.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Reference Warning
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-700">
                These figures are from 2020 and should not be compared directly
                with 2024 counts as though they were measured at the same time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9, 10 & 11. POVERTY INCIDENCE SECTION */}
      <section
        id="poverty"
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="poverty-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              2023 CITY/MUNICIPAL POVERTY SAE · MODEL-BASED ESTIMATE
            </p>
            <h2
              id="poverty-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              Poverty Incidence
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              A 2023 model-based Small Area Estimate with statistical
              uncertainty. It is not a census count and does not identify
              individual poor households.
            </p>
          </div>

          {poverty2023 ? (
            <div className="mt-8 space-y-8">
              {/* Primary Metric & Secondary Statistics */}
              <dl className="grid grid-cols-1 gap-6 border-b border-gray-200 pb-8 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border-l-2 border-[#0066EB] pl-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Estimated Poverty Incidence
                  </dt>
                  <dd className="mt-1 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                    {percentFormatter.format(poverty2023.value)}%
                  </dd>
                  <p className="mt-1 text-xs text-gray-500">
                    Central model estimate (2023)
                  </p>
                </div>

                <div className="border-l-2 border-gray-300 pl-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Standard Error
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                    {poverty2023.standard_error !== null
                      ? percentFormatter.format(poverty2023.standard_error)
                      : 'Not available'}
                  </dd>
                  <p className="mt-1 text-xs text-gray-500">
                    Measure of sampling variability
                  </p>
                </div>

                <div className="border-l-2 border-gray-300 pl-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Coefficient of Variation
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                    {poverty2023.coefficient_of_variation !== null
                      ? percentFormatter.format(
                          poverty2023.coefficient_of_variation
                        )
                      : 'Not available'}
                  </dd>
                  <p className="mt-1 text-xs text-gray-500">
                    Relative precision (9.93%)
                  </p>
                </div>

                <div className="border-l-2 border-gray-300 pl-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    90% Confidence Interval
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                    {poverty2023.confidence_interval_lower !== null &&
                    poverty2023.confidence_interval_upper !== null
                      ? `${percentFormatter.format(poverty2023.confidence_interval_lower)}%–${percentFormatter.format(poverty2023.confidence_interval_upper)}%`
                      : 'Not available'}
                  </dd>
                  <p className="mt-1 text-xs text-gray-500">
                    Lower to upper bound at 90% level
                  </p>
                </div>
              </dl>

              {/* 10. CONFIDENCE INTERVAL VISUAL */}
              <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-7">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                    UNCERTAINTY VISUALIZATION
                  </p>
                  <h3 className="mt-1 text-base font-bold text-gray-950">
                    90% Confidence Interval
                  </h3>
                  <p className="mt-1 text-xs text-gray-600">
                    Model estimates include statistical uncertainty. The central
                    point estimate is flanked by its 90% confidence bounds.
                  </p>
                </div>

                {/* Horizontal Range Visualization */}
                <div className="mt-8 px-2 sm:px-6">
                  {/* Values row */}
                  <div className="flex items-baseline justify-between text-xs font-semibold tabular-nums text-gray-900 sm:text-sm">
                    <div className="text-left">
                      <span className="block text-gray-950">
                        {poverty2023.confidence_interval_lower !== null
                          ? `${percentFormatter.format(poverty2023.confidence_interval_lower)}%`
                          : 'Not available'}
                      </span>
                      <span className="text-[11px] font-normal text-gray-500">
                        Lower 90% Bound
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="block font-bold text-[#0066EB]">
                        ● {percentFormatter.format(poverty2023.value)}%
                      </span>
                      <span className="text-[11px] font-semibold text-[#0066EB]">
                        Estimate
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block text-gray-950">
                        {poverty2023.confidence_interval_upper !== null
                          ? `${percentFormatter.format(poverty2023.confidence_interval_upper)}%`
                          : 'Not available'}
                      </span>
                      <span className="text-[11px] font-normal text-gray-500">
                        Upper 90% Bound
                      </span>
                    </div>
                  </div>

                  {/* Horizontal visual line with center dot */}
                  <div className="relative mt-3 flex items-center">
                    {/* Left endpoint cap */}
                    <div className="h-4 w-0.5 bg-gray-400" />

                    {/* Left connecting line */}
                    <div className="h-1 flex-1 bg-gray-300" />

                    {/* Center point marker */}
                    <div
                      className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0066EB] bg-white shadow-xs"
                      aria-hidden="true"
                    >
                      <div className="h-2.5 w-2.5 rounded-full bg-[#0066EB]" />
                    </div>

                    {/* Right connecting line */}
                    <div className="h-1 flex-1 bg-gray-300" />

                    {/* Right endpoint cap */}
                    <div className="h-4 w-0.5 bg-gray-400" />
                  </div>

                  {/* Description below range */}
                  <p className="mt-4 text-center text-xs text-gray-500">
                    Range: 3.31% &mdash; ● 3.95% &mdash; 4.60% (90% Confidence
                    Interval)
                  </p>
                </div>
              </div>

              {/* 11. POVERTY INTERPRETATION */}
              <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 text-xs leading-relaxed text-gray-700 sm:p-6">
                <h4 className="font-bold text-gray-950">
                  How to Understand This Estimate
                </h4>
                <p className="mt-1.5 text-gray-600">
                  This is a 2023 model-based Small Area Estimate with
                  statistical uncertainty. It is not a census count and does not
                  identify individual poor households. It should not be
                  interpreted as a count of poor individuals nor multiplied by
                  2024 population counts to synthesize new totals.
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-600">Not available.</p>
          )}
        </div>
      </section>

      {/* 12. HOW TO INTERPRET THESE MEASURES (REPLACES DARK NAVY BLOCK) */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="interpretation-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">INTERPRETATION</p>
            <h2
              id="interpretation-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              How to Interpret These Measures
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Guidance for understanding why these three demographic datasets
              are kept distinct on BetterSanFernando.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                Different Population Universes
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                Total population and household population describe different
                populations and must not be treated as interchangeable.
                Household population excludes institutional populations such as
                dormitories, barracks, and correctional facilities.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                Different Reference Years
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                The household, age/sex, and poverty measures come from different
                reference periods: 2024 POPCEN, 2020 CPH, and 2023 SAE
                respectively. They reflect conditions at their respective
                reference dates.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                Census vs. Estimate
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                Population figures come from census/population datasets, while
                poverty is a model-based estimate with uncertainty. The poverty
                rate cannot be directly multiplied by census counts to invent
                individual poor-person numbers.
              </p>
            </div>
          </div>

          {/* 13. CURRENT COVERAGE LIMITS */}
          <div className="mt-10 rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950">
              Current Coverage Limits
            </h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-600">
              <li className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                  aria-hidden="true"
                />
                <span>
                  2020 is the currently published age/sex reference vintage from
                  the Philippine Statistics Authority.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                  aria-hidden="true"
                />
                <span>
                  Household-size figures are Not available in this release.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                  aria-hidden="true"
                />
                <span>
                  Population density is held from publication: source table
                  returned a server error at verification.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                  aria-hidden="true"
                />
                <span>
                  Individual-level poverty records are not published in public
                  domain releases.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                  aria-hidden="true"
                />
                <span>
                  Missing demographic fields remain unknown rather than inferred
                  or projected.
                </span>
              </li>
            </ul>
            <p className="mt-4 border-t border-gray-200/70 pt-3 text-[11px] text-gray-500">
              Dataset status: {metadata.publicationStatus} · Last verified{' '}
              {formatIsoDate(metadata.lastVerified)}.
            </p>
          </div>
        </div>
      </section>

      {/* 14. PROVENANCE */}
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
              Sources &amp; Reference Periods
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Official publications supporting the demographic datasets on this
              page.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {/* Household Population & Households */}
            <div className="flex flex-col justify-between gap-4 rounded-sm border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                  Household Population &amp; Households
                </p>
                <h3 className="mt-1 text-base font-bold text-gray-950">
                  Philippine Statistics Authority
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Reference: 2024 POPCEN (July 1, 2024) · Citywide and 35
                  Barangays
                </p>
              </div>
              <a
                href="https://openstat.psa.gov.ph/PXWeb/pxweb/en/DB/DB__1A__PO_2024/0031A6DTPH2.px/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
              >
                <span>View PSA OpenSTAT Source</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Age & Sex */}
            <div className="flex flex-col justify-between gap-4 rounded-sm border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                  Age &amp; Sex Structure
                </p>
                <h3 className="mt-1 text-base font-bold text-gray-950">
                  Philippine Statistics Authority
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Reference: 2020 CPH (May 1, 2020) · Derived Broad Age Bands
                </p>
              </div>
              <a
                href="https://psa.gov.ph/statistics/population-and-housing/node/167965"
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
              >
                <span>View PSA 2020 CPH Source</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Poverty */}
            <div className="flex flex-col justify-between gap-4 rounded-sm border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                  Poverty Incidence
                </p>
                <h3 className="mt-1 text-base font-bold text-gray-950">
                  Philippine Statistics Authority
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Reference: 2023 City/Municipal Small Area Estimate (SAE)
                </p>
              </div>
              <a
                href="https://psa.gov.ph/statistics/poverty-sae/node/1684082420"
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
              >
                <span>View PSA 2023 SAE Source</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 15. KEEP EXPLORING */}
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
