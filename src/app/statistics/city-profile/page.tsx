import { ArrowDown, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getBarangays,
  getCityDemographicsSource,
  getCityTotalPopulation,
} from '../../../data/civic/demographics';
import { getGeographyMetadata } from '../../../data/civic/geographyMetadata';
import { getCityOfficesMetadata } from '../../../data/civic/government';
import { aggregatePopulationStatistics } from '../../../data/civic/populationStatistics';
import { buildPageMetadata } from '../../../lib/metadata';
import { formatIsoDate } from '../../../lib/utils';

export const metadata = buildPageMetadata({
  title: 'City Profile: San Fernando, Pampanga',
  description:
    'A source-aware overview of the verified city facts BetterSanFernando currently publishes, including population, barangays, geographic coverage, and institutional records.',
  path: '/statistics/city-profile',
});

const numberFormatter = new Intl.NumberFormat('en-PH');
const populationSource = getCityDemographicsSource();
const geography = getGeographyMetadata();
const officesMetadata = getCityOfficesMetadata();
const population = aggregatePopulationStatistics(
  getBarangays(),
  getCityTotalPopulation()
);

const exploreDestinations = [
  {
    category: 'PEOPLE & BARANGAYS',
    href: '/statistics/population',
    title: 'Population Statistics',
    question:
      'How is the City’s population distributed across its 35 barangays?',
  },
  {
    category: 'PEOPLE & BARANGAYS',
    href: '/barangays',
    title: 'Barangay Directory',
    question:
      'Find PSGC identity, population, and classification facts by barangay.',
  },
  {
    category: 'GEOGRAPHY & PROJECTS',
    href: '/projects/map',
    title: 'Project Distribution Map',
    question: 'Explore published project records by barangay boundary.',
  },
  {
    category: 'GEOGRAPHY & PROJECTS',
    href: '/projects/city-projects',
    title: 'Published Projects',
    question: 'Browse BetterSanFernando’s bounded public-works dataset.',
  },
] as const;

const readingGuideItems = [
  {
    title: 'Population Is a Census Baseline',
    description:
      'The population figure comes from the 2024 POPCEN reference and is not a projection or estimate.',
  },
  {
    title: 'Boundary Coverage Has a Separate Geometry Source',
    description:
      'Published polygon geometry is community-maintained and is not presented as an official PSA shapefile.',
  },
  {
    title: 'Office Count Is Directory Coverage',
    description:
      'The published office-record count describes BetterSanFernando’s current verified directory, not the City’s complete legal organization.',
  },
  {
    title: 'This Is a Bounded Profile',
    description:
      'This page does not claim complete coverage of elected officials, historical narrative, economic indicators, or every City statistic.',
  },
] as const;

const keepExploringLinks = [
  {
    href: '/statistics/population',
    title: 'Population Statistics',
    description: 'Explore 2024 census distribution across all 35 barangays.',
    action: 'View statistics',
  },
  {
    href: '/barangays',
    title: 'Barangay Directory',
    description:
      'Search verified PSGC, population, and classification records.',
    action: 'Browse barangays',
  },
  {
    href: '/statistics/government',
    title: 'Government Statistics',
    description:
      'View institutional coverage and verified city office statistics.',
    action: 'Explore government',
  },
  {
    href: '/statistics/public-records',
    title: 'Public Records Statistics',
    description:
      'Track published datasets, coverage periods, and evidence units.',
    action: 'View public records',
  },
] as const;

export default function CityProfile() {
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
              { label: 'City Profile' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                STATISTICS · CITY PROFILE
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                City of San Fernando
              </h1>
              <p className="mt-2 text-xl font-semibold text-primary-800">
                Pampanga, Philippines
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                A source-aware overview of the verified city facts
                BetterSanFernando currently publishes, including population,
                barangays, geographic coverage, and institutional records.
              </p>

              {/* CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#at-a-glance"
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC]"
                >
                  Explore the City Profile
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/barangays"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  Browse Barangays
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* RIGHT-SIDE SCOPE MODULE */}
            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
              <p className="text-eyebrow text-[#0066EB]">PROFILE SCOPE</p>
              <h2 className="mt-1.5 text-base font-bold text-gray-950">
                San Fernando, Pampanga
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                This profile refers to the City of San Fernando in Pampanga—not
                San Fernando, La Union. It is a bounded civic profile, not a
                complete socioeconomic or legal profile of the City.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* 2. AT A GLANCE */}
      <section
        id="at-a-glance"
        className="border-b border-gray-200 bg-white"
        aria-labelledby="at-a-glance-heading"
      >
        <div className="container mx-auto px-4 py-8 sm:py-10">
          <div className="max-w-3xl">
            <h2
              id="at-a-glance-heading"
              className="text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              At a Glance
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Verified baseline measures from BetterSanFernando’s current public
              datasets. Each figure keeps its own source and scope.
            </p>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-6 border-y border-gray-200 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-gray-200">
            <div className="lg:pr-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Population
              </dt>
              <dd className="mt-1.5 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {numberFormatter.format(population.totalPopulation)}
              </dd>
              <p className="mt-1 text-xs text-gray-600">2024 POPCEN</p>
            </div>

            <div className="lg:px-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Barangays
              </dt>
              <dd className="mt-1.5 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {population.barangayCount}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Complete published barangay set
              </p>
            </div>

            <div className="lg:px-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Barangay Classification
              </dt>
              <dd className="mt-1.5 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {population.urbanBarangayCount} Urban
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                {population.ruralBarangayCount} Rural · Lourdes
              </p>
            </div>

            <div className="lg:pl-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Published Office Records
              </dt>
              <dd className="mt-1.5 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {officesMetadata.officeCount}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Bounded institutional directory
              </p>
            </div>
          </dl>
        </div>
      </section>

      {/* 3. PEOPLE & BARANGAYS */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="people-barangays-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              PEOPLE &amp; BARANGAYS
            </p>
            <h2
              id="people-barangays-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              Population and Barangay Classification
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Population and classification use the PSA 2024 POPCEN baseline and
              the currently published 35-barangay set.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
            {/* LEFT: Population summary */}
            <div className="flex flex-col rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
              <h3 className="text-base font-bold text-gray-950">
                Population Summary
              </h3>

              {/* Primary statistic group */}
              <div className="mt-6">
                <p className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                  {numberFormatter.format(population.totalPopulation)}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-700">
                  Population
                </p>
                <p className="text-xs text-gray-500">2024 POPCEN</p>
              </div>

              {/* Secondary statistic group */}
              <div className="mt-5">
                <p className="text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                  {population.barangayCount}
                </p>
                <p className="mt-0.5 text-sm font-medium text-gray-700">
                  Barangays
                </p>
              </div>

              {/* Short contextual explanation */}
              <p className="mt-6 text-sm leading-relaxed text-gray-600">
                San Fernando’s published population baseline comes from the PSA
                2024 POPCEN and covers all 35 component barangays.
              </p>

              {/* CTA at bottom */}
              <div className="mt-auto pt-6 border-t border-gray-100">
                <Link
                  href="/statistics/population"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  Explore Population Statistics
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* RIGHT: Barangay Classification */}
            <div className="flex flex-col rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
              <h3 className="text-base font-bold text-gray-950">
                Barangay Classification
              </h3>

              {/* Primary statistic group */}
              <div className="mt-6">
                <p className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                  {population.urbanBarangayCount}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-700">
                  Urban Barangays
                </p>
              </div>

              {/* Secondary statistic group */}
              <div className="mt-5">
                <p className="text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                  {population.ruralBarangayCount}
                </p>
                <p className="mt-0.5 text-sm font-medium text-gray-700">
                  Rural Barangay
                </p>
                <p className="text-xs text-gray-500">Lourdes</p>
              </div>

              {/* Short contextual explanation */}
              <p className="mt-6 text-sm leading-relaxed text-gray-600">
                Classification applies to the currently published 35-barangay
                set.
              </p>

              {/* CTA at bottom */}
              <div className="mt-auto pt-6 border-t border-gray-100">
                <Link
                  href="/barangays"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  Browse Barangay Directory
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CITY COVERAGE */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="coverage-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">CITY COVERAGE</p>
            <h2
              id="coverage-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              Published Geographic and Institutional Coverage
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              These figures describe BetterSanFernando’s current published
              coverage, not the City’s complete legal or organizational
              structure.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
            {/* LEFT — GEOGRAPHIC COVERAGE */}
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Geographic Coverage
                </h3>
                <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-gray-200 py-4">
                  <div>
                    <dd className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                      {geography.cityBoundaryCount}
                    </dd>
                    <dt className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      City Boundary
                    </dt>
                  </div>
                  <div>
                    <dd className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                      {geography.barangayBoundaryCount}
                    </dd>
                    <dt className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Barangay Boundaries
                    </dt>
                  </div>
                </dl>
                <div className="mt-4 space-y-2 text-sm leading-relaxed text-gray-600">
                  <p>
                    The frontend-safe geography release contains the verified
                    City boundary and published barangay boundary features.
                  </p>
                  <p className="text-xs text-gray-500">
                    Polygon geometry is not an official PSA shapefile. It comes
                    from a community-maintained source; PSGC codes and names are
                    matched to PSA identity data.
                  </p>
                </div>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <Link
                  href="/projects/map"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  Explore Project &amp; Barangay Map
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* RIGHT — INSTITUTIONAL DIRECTORY */}
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Institutional Directory
                </h3>
                <dl className="mt-4 border-y border-gray-200 py-4">
                  <div>
                    <dd className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                      {officesMetadata.officeCount}
                    </dd>
                    <dt className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Published Office Records
                    </dt>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                    <span>Directory Last Verified</span>
                    <span className="font-semibold text-gray-700">
                      {formatIsoDate(officesMetadata.lastVerified)}
                    </span>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  This is directory coverage, not a claim that the City
                  Government has only this number of offices or units, and it is
                  not an organizational hierarchy.
                </p>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <Link
                  href="/government/offices"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  Browse City Offices
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXPLORE CITY INFORMATION */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="explore-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">EXPLORE</p>
            <h2
              id="explore-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              Explore City Information
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Continue to the page that owns each detailed comparison,
              directory, map, or dataset.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-sm border border-gray-200 bg-white">
            {/* 2x2 Grid for first 4 destinations */}
            <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-y-0">
              {exploreDestinations.map((item, index) => {
                const isFirstCol = index % 2 === 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex flex-col justify-between p-5 transition-colors hover:bg-[#F3F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] sm:p-6 ${
                      isFirstCol
                        ? 'md:border-r md:border-b md:border-gray-200'
                        : 'md:border-b md:border-gray-200'
                    }`}
                  >
                    <div>
                      <p className="text-eyebrow text-xs text-[#0066EB]">
                        {item.category}
                      </p>
                      <div className="mt-2 flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                          {item.title}
                        </h3>
                        <ArrowRight
                          className="mt-1 h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                        {item.question}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Full-width City Offices Row */}
            <Link
              href="/government/offices"
              className="group flex flex-col justify-between gap-4 border-t border-gray-200 p-5 transition-colors hover:bg-[#F3F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] sm:flex-row sm:items-center sm:p-6 md:border-t-0"
            >
              <div className="max-w-2xl">
                <p className="text-eyebrow text-xs text-[#0066EB]">
                  GOVERNMENT
                </p>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                    City Offices
                  </h3>
                  <span className="text-xs font-semibold tabular-nums text-gray-500">
                    {officesMetadata.officeCount} published office records
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Find published institutional office records and their public
                  sources.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#0066EB]">
                Browse City Offices
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. HOW TO READ THIS PROFILE */}
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
              How to Read This Profile
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

      {/* 7. SOURCES & REFERENCE DATES */}
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
              Sources &amp; Reference Dates
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Different facts rely on different authorities and reference
              periods. BetterSanFernando keeps those source roles visible.
            </p>
          </div>

          <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
            {/* POPULATION & PSGC */}
            <article className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
              <h3 className="text-sm font-bold text-gray-950">
                Population &amp; PSGC
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {populationSource.publisher} · {populationSource.census} · Last
                verified {formatIsoDate(populationSource.lastVerified)}
              </p>
              <div>
                <a
                  href={populationSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  Official PSA Source
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>

            {/* BOUNDARY GEOMETRY */}
            <article className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
              <h3 className="text-sm font-bold text-gray-950">
                Boundary Geometry
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {geography.geometryPublisher} · Geometry reference: 31 December
                2023
              </p>
              <div>
                <a
                  href={geography.geometryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  View Geometry Source
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>

            {/* OFFICE DIRECTORY */}
            <article className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
              <h3 className="text-sm font-bold text-gray-950">
                Office Directory
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Published institutional records · Record-specific official
                source links · Last verified{' '}
                {formatIsoDate(officesMetadata.lastVerified)}
              </p>
              <div>
                <Link
                  href="/government/offices"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  Review Office Sources
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 8. KEEP EXPLORING */}
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
