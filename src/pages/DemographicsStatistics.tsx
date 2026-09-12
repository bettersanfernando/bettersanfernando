import {
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getAgeBandPopulation2020,
  getAgeSexPopulation2020,
  getDemographicProfileMetadata,
  getHouseholdPopulation2024,
  getPovertyIncidence2023,
} from '../data/civic/demographicProfile';
import { getCityTotalPopulation } from '../data/civic/demographics';
import { formatIsoDate } from '../lib/utils';

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

export default function DemographicsStatistics() {
  return (
    <>
      <SEO
        title="Demographics"
        description="Explore official 2024 POPCEN household population, 2020 CPH age and sex structure, and 2023 poverty small area estimates for San Fernando, Pampanga, each kept in its own reference period."
        keywords="San Fernando Pampanga demographics, household population, 2020 census age sex, 2023 poverty small area estimate"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/statistics/demographics`}
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
                { label: 'Demographics' },
              ]}
            />
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
              <UsersRound className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
              Demographics
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700 md:text-lg">
              This page presents three separate official measures &mdash; 2024
              household population, 2020 age-and-sex structure, and 2023 poverty
              estimates &mdash; each in its own reference period. It does not
              repeat the {formatCount(totalPopulation2024)} total population
              figure shown on{' '}
              <Link
                to="/statistics/population"
                className="font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900"
              >
                Population statistics
              </Link>
              .
            </p>

            <div className="mt-6 rounded-xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold">
                    Household population is not total population
                  </p>
                  <p className="mt-1">
                    The {formatCount(totalPopulation2024)} total population
                    (2024 POPCEN, on Population statistics) and the{' '}
                    {formatCount(households2024.cityHouseholdPopulation)}{' '}
                    household population below (this page) are different
                    universes: household population excludes institutional and
                    other non-household population. Never add or compare them as
                    if they measure the same thing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto space-y-12 px-4 py-10 md:py-14">
          <section aria-labelledby="popcen-heading">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-700">
                2024 POPCEN &middot; reference date{' '}
                {formatIsoDate(households2024.referenceDate)}
              </p>
              <h2
                id="popcen-heading"
                className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-900 md:text-3xl"
              >
                Household population and households
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Philippine Statistics Authority 2024 Census of Population,
                citywide and across all 35 barangays.
              </p>
            </div>

            <dl className="mt-6 grid gap-x-8 gap-y-5 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-600">
                  City household population
                </dt>
                <dd className="mt-1 text-4xl font-bold tabular-nums text-gray-900">
                  {formatCount(households2024.cityHouseholdPopulation)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Number of households</dt>
                <dd className="mt-1 text-4xl font-bold tabular-nums text-gray-900">
                  {formatCount(households2024.cityNumberOfHouseholds)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                  <caption className="sr-only">
                    2024 POPCEN household population and number of households
                    for all 35 barangays
                  </caption>
                  <thead className="bg-gray-100 text-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Barangay
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-semibold"
                      >
                        Household population
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {households2024.barangays.map(barangay => (
                      <tr key={barangay.psgc}>
                        <th
                          scope="row"
                          className="px-4 py-2.5 font-medium text-gray-900"
                        >
                          {barangay.name}
                        </th>
                        <td className="px-4 py-2.5 text-right tabular-nums text-gray-800">
                          {formatCount(barangay.householdPopulation)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              {households2024.barangayCount} of 35 barangays shown. Average
              household size and population density are not published in this
              release.
            </p>
          </section>

          <section aria-labelledby="cph-heading">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-700">
                2020 CPH &middot; different census vintage from 2024
              </p>
              <h2
                id="cph-heading"
                className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-900 md:text-3xl"
              >
                Household population by sex
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Describes the 2020 household population (352,801), not the 2024
                population. Do not blend this with the 2024 figures above.
              </p>
            </div>

            <dl className="mt-6 grid gap-x-8 gap-y-5 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-gray-600">Male</dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {formatCount(ageSexTotals.male?.value)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Female</dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {formatCount(ageSexTotals.female?.value)}
                </dd>
              </div>
              <div className="border-t border-gray-200 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
                <dt className="text-sm text-gray-600">
                  Total (2020 household population)
                </dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                  {formatCount(ageSexTotals.both?.value)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                  Age bands &mdash; derived
                </p>
                <p className="text-xs text-gray-600">
                  Summed from official 5-year age groups
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Derived 2020 CPH age bands by sex
                  </caption>
                  <thead className="bg-gray-100 text-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Age band
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-semibold"
                      >
                        Male
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-semibold"
                      >
                        Female
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-semibold"
                      >
                        Both sexes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ageBandRows.map(row => (
                      <tr key={row.band}>
                        <th
                          scope="row"
                          className="px-4 py-2.5 font-medium text-gray-900"
                        >
                          {row.band}
                        </th>
                        <td className="px-4 py-2.5 text-right tabular-nums text-gray-800">
                          {formatCount(row.male?.value)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-gray-800">
                          {formatCount(row.female?.value)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-gray-900">
                          {formatCount(row.both?.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section aria-labelledby="poverty-heading">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-700">
                2023 city/municipal poverty SAE
              </p>
              <h2
                id="poverty-heading"
                className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-900 md:text-3xl"
              >
                Poverty incidence (model-based estimate)
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                A 2023 model-based Small Area Estimate with uncertainty, not a
                census count. It does not identify individual poor households
                and is not part of the 2020 or 2024 figures above.
              </p>
            </div>

            {poverty2023 ? (
              <dl className="mt-6 grid gap-x-8 gap-y-5 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-4">
                <div>
                  <dt className="text-sm text-gray-600">
                    Poverty incidence estimate
                  </dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                    {percentFormatter.format(poverty2023.value)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Standard error</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums text-gray-900">
                    {poverty2023.standard_error !== null
                      ? percentFormatter.format(poverty2023.standard_error)
                      : 'Not available'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">
                    Coefficient of variation
                  </dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums text-gray-900">
                    {poverty2023.coefficient_of_variation !== null
                      ? percentFormatter.format(
                          poverty2023.coefficient_of_variation
                        )
                      : 'Not available'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">
                    90% confidence interval
                  </dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums text-gray-900">
                    {poverty2023.confidence_interval_lower !== null &&
                    poverty2023.confidence_interval_upper !== null
                      ? `${percentFormatter.format(poverty2023.confidence_interval_lower)}% – ${percentFormatter.format(poverty2023.confidence_interval_upper)}%`
                      : 'Not available'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
                Not available.
              </p>
            )}
          </section>

          <section
            aria-labelledby="limitations-heading"
            className="rounded-xl bg-primary-900 p-6 text-white md:p-8"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck
                className="h-6 w-6 text-primary-200"
                aria-hidden="true"
              />
              <h2 id="limitations-heading" className="text-xl font-bold">
                Coverage and limitations
              </h2>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-primary-100">
              {metadata.publicLimitations.map(limitation => (
                <li key={limitation}>{limitation}</li>
              ))}
              {metadata.heldDimensions.map(held => (
                <li key={held.dimension}>
                  <span className="font-semibold text-white">
                    Population density
                  </span>{' '}
                  is held: {held.reason}
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-primary-700 pt-4 text-xs text-primary-200">
              Last verified {formatIsoDate(metadata.lastVerified)}.
            </p>
          </section>

          <section className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-700">
              For the existing total-population and barangay-ranking view, see
            </p>
            <Link
              to="/statistics/population"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-900"
            >
              Population statistics
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="https://psa.gov.ph/statistics/population-and-housing/node/167965"
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900"
            >
              View the PSA 2020 CPH source
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </section>
        </div>
      </main>
    </>
  );
}
