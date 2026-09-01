import {
  ArrowRight,
  Building2,
  ExternalLink,
  Landmark,
  MapPinned,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import {
  getBarangays,
  getCityDemographicsSource,
  getCityTotalPopulation,
} from '../data/civic/demographics';
import { getGeographyMetadata } from '../data/civic/geographyMetadata';
import { getCityOfficesMetadata } from '../data/civic/government';
import { aggregatePopulationStatistics } from '../data/civic/populationStatistics';
import { formatIsoDate } from '../lib/utils';

const numberFormatter = new Intl.NumberFormat('en-PH');
const populationSource = getCityDemographicsSource();
const geography = getGeographyMetadata();
const officesMetadata = getCityOfficesMetadata();
const population = aggregatePopulationStatistics(
  getBarangays(),
  getCityTotalPopulation()
);

const exploreLinks = [
  {
    href: '/statistics/population',
    title: 'Population statistics',
    description: 'Compare the 2024 POPCEN population across all 35 barangays.',
  },
  {
    href: '/barangays',
    title: 'Barangay directory',
    description: 'Search verified PSGC, population, and classification facts.',
  },
  {
    href: '/projects',
    title: 'Published projects',
    description: 'Browse BetterSanFernando’s bounded public-works dataset.',
  },
  {
    href: '/projects/map',
    title: 'Project distribution map',
    description: 'Explore project records aggregated by barangay boundary.',
  },
  {
    href: '/government/offices',
    title: 'City offices directory',
    description: 'Find published, verified institutional office records.',
  },
] as const;

export default function CityProfile() {
  return (
    <>
      <SEO
        title="City profile: San Fernando, Pampanga"
        description="A compact, source-aware profile of the City of San Fernando in Pampanga, Philippines, including its PSA 2024 population baseline, barangays, boundary coverage, and published office directory."
        keywords="City of San Fernando Pampanga profile, San Fernando Pampanga population, barangays, city boundary"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/statistics/city-profile`}
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
                { label: 'City profile' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Landmark className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  City of San Fernando
                </h1>
                <p className="mt-2 text-xl font-semibold text-primary-800">
                  Pampanga, Philippines
                </p>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700 md:text-lg">
                  A compact profile of the verified core city facts currently
                  published by BetterSanFernando, with reference periods and
                  source boundaries kept visible.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-6 text-primary-950">
                <div className="flex items-center gap-2">
                  <MapPinned className="h-5 w-5" aria-hidden="true" />
                  <p className="font-semibold">Location identity</p>
                </div>
                <p className="mt-2">
                  This profile covers the City of San Fernando in the Province
                  of Pampanga. It does not describe San Fernando, La Union.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <div className="container mx-auto space-y-12 px-4 py-10 md:py-14">
          <section aria-labelledby="core-profile-heading">
            <div className="max-w-3xl">
              <h2
                id="core-profile-heading"
                className="text-2xl font-bold tracking-[-0.02em] text-gray-900 md:text-3xl"
              >
                Core profile
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Population and barangay classification use the PSA{' '}
                {populationSource.census} baseline. These figures are not
                estimates, projections, or a broader socioeconomic profile.
              </p>
            </div>
            <dl className="mt-6 grid overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(0,41,94,0.08)] sm:grid-cols-3">
              <div className="p-6 sm:border-r sm:border-gray-200 md:p-7">
                <dt className="text-sm font-medium text-gray-600">
                  Population · {populationSource.referenceYear}
                </dt>
                <dd className="mt-2 text-4xl font-bold tracking-[-0.03em] tabular-nums text-gray-900">
                  {numberFormatter.format(population.totalPopulation)}
                </dd>
                <dd className="mt-2 text-sm text-gray-600">
                  {populationSource.census}
                </dd>
              </div>
              <div className="border-t border-gray-200 p-6 sm:border-r sm:border-t-0 md:p-7">
                <dt className="text-sm font-medium text-gray-600">Barangays</dt>
                <dd className="mt-2 text-4xl font-bold tracking-[-0.03em] tabular-nums text-gray-900">
                  {population.barangayCount}
                </dd>
                <dd className="mt-2 text-sm text-gray-600">
                  Complete published barangay set
                </dd>
              </div>
              <div className="border-t border-gray-200 p-6 sm:border-t-0 md:p-7">
                <dt className="text-sm font-medium text-gray-600">
                  Classification
                </dt>
                <dd className="mt-2 text-2xl font-bold tabular-nums text-gray-900">
                  {population.urbanBarangayCount} Urban ·{' '}
                  {population.ruralBarangayCount} Rural
                </dd>
                <dd className="mt-2 text-sm text-gray-600">
                  Lourdes is the one Rural barangay
                </dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-primary-900 p-6 text-white md:p-8">
              <div className="flex items-center gap-3">
                <MapPinned
                  className="h-6 w-6 text-primary-200"
                  aria-hidden="true"
                />
                <h2 className="text-2xl font-bold">Geographic context</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-primary-100">
                The frontend-safe geography release contains one verified city
                boundary feature for {geography.cityName} and{' '}
                {geography.barangayBoundaryCount} barangay boundary features.
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-5 border-y border-primary-700 py-5">
                <div>
                  <dt className="text-sm text-primary-200">City boundaries</dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums">
                    {geography.cityBoundaryCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-primary-200">
                    Barangay boundaries
                  </dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums">
                    {geography.barangayBoundaryCount}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 text-sm leading-6 text-primary-100">
                Polygon geometry is not an official PSA shapefile. It comes from
                a community-maintained source; PSGC codes and names are matched
                to PSA identity data.
              </p>
              <Link
                to="/projects/map"
                className="mt-5 inline-flex items-center gap-2 font-semibold text-white underline underline-offset-4 hover:text-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              >
                Explore the barangay map
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-8">
              <div className="flex items-center gap-3">
                <Building2
                  className="h-6 w-6 text-primary-700"
                  aria-hidden="true"
                />
                <h2 className="text-2xl font-bold text-gray-900">
                  Published office directory
                </h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-700">
                BetterSanFernando currently publishes{' '}
                <strong className="font-semibold text-gray-900">
                  {officesMetadata.officeCount} verified frontend-safe
                  institutional office records
                </strong>
                . This is directory coverage, not a claim that the City
                Government has only {officesMetadata.officeCount} offices or
                units, and it is not an organizational hierarchy.
              </p>
              <dl className="mt-6 border-y border-gray-200 py-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600">Directory last verified</dt>
                  <dd className="font-semibold text-gray-900">
                    {formatIsoDate(officesMetadata.lastVerified)}
                  </dd>
                </div>
              </dl>
              <Link
                to="/government/offices"
                className="mt-5 inline-flex items-center gap-2 font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                Browse city offices
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section aria-labelledby="explore-heading">
            <div className="max-w-3xl">
              <h2
                id="explore-heading"
                className="text-2xl font-bold tracking-[-0.02em] text-gray-900 md:text-3xl"
              >
                Explore verified civic information
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Continue to the page that owns each detailed comparison,
                directory, or project view.
              </p>
            </div>
            <ul className="mt-6 divide-y divide-gray-200 overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:grid md:grid-cols-2 md:divide-y-0">
              {exploreLinks.map((item, index) => (
                <li
                  key={item.href}
                  className={`p-5 md:p-6 ${
                    index % 2 === 0 ? 'md:border-r md:border-gray-200' : ''
                  } ${index >= 2 ? 'md:border-t md:border-gray-200' : ''}`}
                >
                  <Link
                    to={item.href}
                    className="group block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  >
                    <span className="flex items-center justify-between gap-4 font-bold text-gray-900 group-hover:text-primary-700">
                      {item.title}
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-primary-700"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-gray-600">
                      {item.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck
                className="h-6 w-6 text-primary-700"
                aria-hidden="true"
              />
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-900">
                Sources and reference dates
              </h2>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
              Different facts use different authorities. BetterSanFernando keeps
              those source roles separate and independently presents the
              verified public data.
            </p>
            <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              <article className="grid gap-3 py-5 md:grid-cols-[11rem_minmax(0,1fr)_auto] md:items-start">
                <h3 className="font-bold text-gray-900">Population and PSGC</h3>
                <p className="text-sm leading-6 text-gray-700">
                  {populationSource.publisher} · {populationSource.census} ·
                  last verified {formatIsoDate(populationSource.lastVerified)}
                </p>
                <a
                  href={populationSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  Official PSA source
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </article>
              <article className="grid gap-3 py-5 md:grid-cols-[11rem_minmax(0,1fr)_auto] md:items-start">
                <h3 className="font-bold text-gray-900">Polygon geometry</h3>
                <p className="text-sm leading-6 text-gray-700">
                  {geography.geometryPublisher} · geometry reference: 31
                  December 2023
                </p>
                <a
                  href={geography.geometryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  View geometry source
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </article>
              <article className="grid gap-3 py-5 md:grid-cols-[11rem_minmax(0,1fr)_auto] md:items-start">
                <h3 className="font-bold text-gray-900">Office directory</h3>
                <p className="text-sm leading-6 text-gray-700">
                  Published institutional records · record-specific official
                  source links · last verified{' '}
                  {formatIsoDate(officesMetadata.lastVerified)}
                </p>
                <Link
                  to="/government/offices"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  Review office sources
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            </div>
            <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-gray-700">
              <UsersRound
                className="mt-1 h-4 w-4 shrink-0 text-primary-700"
                aria-hidden="true"
              />
              This core profile does not add elected officials, historical
              narrative, economic indicators, or other unsupported city facts.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
