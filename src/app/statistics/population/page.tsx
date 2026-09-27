import { ArrowDown, ArrowRight, ExternalLink } from 'lucide-react';
import Link from '../../../components/i18n/LocaleLink';

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
import { PageMessages } from '../../../components/i18n/PageMessages';
import type { PageT } from '../../../i18n/page-t';
import { getPageT } from '../../../i18n/server';
import { INTL_LOCALES } from '../../../i18n/locale';

const BARANGAY_COUNT = getBarangays().length;

export async function generateMetadata() {
  const { t, locale } = await getPageT('statistics-population');
  return buildPageMetadata({
    title: t('Population Statistics'),
    description: t(
      'Explore San Fernando’s 2024 POPCEN population across all {{barangays}} barangays, with exact counts, city shares, classifications, and official-source context.',
      { barangays: BARANGAY_COUNT }
    ),
    path: '/statistics/population',
    locale,
  });
}

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

const readingGuideItems = (t: PageT, totalPopulation: string) =>
  [
    {
      title: t('Population'),
      description: t(
        'The exact 2024 POPCEN population published for each barangay.'
      ),
    },
    {
      title: t('City Share'),
      description: t(
        'The barangay population as a share of San Fernando’s published city total of {{totalPopulation}}.',
        { totalPopulation }
      ),
    },
    {
      title: t('Classification'),
      description: t(
        'The published Urban or Rural classification associated with each barangay.'
      ),
    },
    {
      title: t('Reference Period'),
      description: t(
        'All comparisons on this page use the same 2024 POPCEN baseline.'
      ),
    },
  ] as const;

const keepExploringLinks = (t: PageT) =>
  [
    {
      href: '/statistics/city-profile',
      title: t('City Profile'),
      description: t(
        'A source-aware overview of verified city facts, boundaries, and office records.'
      ),
      action: t('View city profile'),
    },
    {
      href: '/barangays',
      title: t('Barangay Directory'),
      description: t(
        'Search verified PSGC identity, population, and classification records.'
      ),
      action: t('Browse barangays'),
    },
    {
      href: '/statistics/public-records',
      title: t('Public Records Statistics'),
      description: t(
        'Track published datasets, coverage periods, and evidence units.'
      ),
      action: t('View public records'),
    },
    {
      href: '/transparency/methodology',
      title: t('How We Publish Data'),
      description: t(
        'Learn how BetterSanFernando verifies and documents public data sources.'
      ),
      action: t('Read methodology'),
    },
  ] as const;

export default async function PopulationStatistics() {
  const { t, locale, messages } = await getPageT('statistics-population');

  const numberFormatter = new Intl.NumberFormat(INTL_LOCALES[locale]);

  const percentFormatter = new Intl.NumberFormat(INTL_LOCALES[locale], {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return (
    <main className="flex-grow bg-white">
      {/* 1. EDITORIAL HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: t('Home'), href: '/' },
              { label: t('Statistics'), href: '/statistics' },
              { label: t('Population Statistics') },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                {t('STATISTICS · POPULATION')}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                {t('Population Statistics')}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                {t(
                  'Explore San Fernando’s {{census}} population across all {{barangayCount}} barangays, with exact counts, city shares, classifications, and official-source context.',
                  {
                    census: source.census,
                    barangayCount: statistics.barangayCount,
                  }
                )}
              </p>

              {/* Prominent primary figure */}
              <div className="mt-6">
                <p className="text-4xl font-extrabold tabular-nums text-gray-950 sm:text-5xl">
                  {numberFormatter.format(statistics.totalPopulation)}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('{{census}} Population', { census: source.census })}
                </p>
              </div>

              {/* CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#distribution"
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC]"
                >
                  {t('Explore Population Distribution')}
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  {t('View Official PSA Source')}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* RIGHT-SIDE SCOPE MODULE */}
            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
              <p className="text-eyebrow text-[#0066EB]">{t('DATA SCOPE')}</p>
              <h2 className="mt-1.5 text-base font-bold text-gray-950">
                {source.census}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {t(
                  'Official population baseline published by the Philippine Statistics Authority. These figures are census values, not estimates or projections.'
                )}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-gray-200/80 pt-3 text-xs text-gray-600">
                <span>
                  {t('{{barangayCount}} Barangays', {
                    barangayCount: statistics.barangayCount,
                  })}
                </span>
                <span>
                  {t('Last Verified: {{lastVerified}}', {
                    lastVerified: formatIsoDate(source.lastVerified, locale),
                  })}
                </span>
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
            {t('At a Glance')}
          </h2>

          <dl className="grid grid-cols-1 gap-6 border-y border-gray-200 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-gray-200">
            {/* Barangays */}
            <div className="lg:pr-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('Barangays')}
              </dt>
              <dd className="mt-1.5 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {statistics.barangayCount}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                {t('Complete published barangay set')}
              </p>
            </div>

            {/* Largest Barangay */}
            <div className="lg:px-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('Largest Barangay')}
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
                {t('{{share}} of city total', {
                  share: percentFormatter.format(
                    statistics.largestBarangay?.share ?? 0
                  ),
                })}
              </p>
            </div>

            {/* Smallest Barangay */}
            <div className="lg:px-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('Smallest Barangay')}
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
                {t('{{share}} of city total', {
                  share: percentFormatter.format(
                    statistics.smallestBarangay?.share ?? 0
                  ),
                })}
              </p>
            </div>

            {/* Classification */}
            <div className="lg:pl-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('Classification')}
              </dt>
              <dd className="mt-1.5 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {t('{{urbanBarangayCount}} Urban', {
                  urbanBarangayCount: statistics.urbanBarangayCount,
                })}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                {t('{{ruralBarangayCount}} Rural · {{ruralBarangayNames}}', {
                  ruralBarangayCount: statistics.ruralBarangayCount,
                  ruralBarangayNames,
                })}
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
            <p className="text-eyebrow text-[#0066EB]">{t('DISTRIBUTION')}</p>
            <h2
              id="distribution-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              {t('How Population Is Distributed')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {t(
                'The five most populous barangays based on the {{census}} population baseline.',
                { census: source.census }
              )}
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
                        {t('Top 5 Most Populous Barangays')}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {t('Population counts from the {{census}}.', {
                          census: source.census,
                        })}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 sm:text-right">
                      <p className="font-medium text-gray-600">
                        {t('{{census}} · {{barangayCount}} Barangays', {
                          census: source.census,
                          barangayCount: statistics.barangayCount,
                        })}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {t('Population scale · residents')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop Column Header */}
                <div className="hidden border-b border-gray-200 bg-gray-50/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:grid sm:grid-cols-[1.75rem_8.5rem_minmax(0,1fr)_5.5rem_4.5rem] sm:items-center sm:gap-4 sm:px-5">
                  <span>#</span>
                  <span>{t('Barangay')}</span>
                  <span>{t('Barangay Population')}</span>
                  <span className="text-right">{t('Population')}</span>
                  <span className="text-right">{t('City Share')}</span>
                </div>

                {/* Rows */}
                <ol className="divide-y divide-gray-100">
                  {topFiveBarangays.map(barangay => {
                    const barWidthPercent =
                      (barangay.population / populationScale.max) * 100;
                    const accessibleLabel = t(
                      '{{name}}: {{population}} residents, {{sharePercent}} percent of San Fernando’s {{census}} population.',
                      {
                        name: barangay.name,
                        population: numberFormatter.format(barangay.population),
                        sharePercent: (barangay.share * 100).toFixed(1),
                        census: source.census,
                      }
                    );

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
                              {t('{{share}} of city population', {
                                share: percentFormatter.format(barangay.share),
                              })}
                            </span>
                            <span className="tabular-nums">
                              {t('0–{{max}} scale', {
                                max: numberFormatter.format(
                                  populationScale.max
                                ),
                              })}
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
                <span>
                  {t('View all {{barangayCount}} barangays', {
                    barangayCount: statistics.barangayCount,
                  })}
                </span>
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
                  {t('Population Context')}
                </h3>

                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-950">
                      {t('Largest to Smallest')}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      {t(
                        '{{name}} has {{population}} residents, compared with {{population2}} in {{name2}}.',
                        {
                          name: statistics.largestBarangay?.name ?? '',
                          population: numberFormatter.format(
                            statistics.largestBarangay?.population ?? 0
                          ),
                          population2: numberFormatter.format(
                            statistics.smallestBarangay?.population ?? 0
                          ),
                          name2: statistics.smallestBarangay?.name ?? '',
                        }
                      )}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-semibold text-gray-950">
                      {t('Urban and Rural Classification')}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      {t(
                        '{{urbanBarangayCount}} barangays are classified Urban and {{ruralBarangayNames}} is classified Rural.',
                        {
                          urbanBarangayCount: statistics.urbanBarangayCount,
                          ruralBarangayNames,
                        }
                      )}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-semibold text-gray-950">
                      {t('One Census Baseline')}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      {t(
                        'All barangay comparisons on this page use the same {{census}} reference.',
                        { census: source.census }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pale support module */}
              <div className="mt-6 rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 text-xs leading-relaxed text-gray-700">
                <p className="text-eyebrow text-[#0066EB]">
                  {t('VERIFIED POPULATION BASELINE')}
                </p>
                <p className="mt-1.5 text-gray-700">
                  {t(
                    'Figures come from the Philippine Statistics Authority’s {{census}}. BetterSanFernando presents the published values without adding estimates or projections.',
                    { census: source.census }
                  )}
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
            <p className="text-eyebrow text-[#0066EB]">{t('ALL BARANGAYS')}</p>
            <h2
              id="barangays-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              {t('All Barangays')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {t(
                'Search and compare all {{barangayCount}} barangays using their official {{census}} population, city share, and classification.',
                {
                  barangayCount: statistics.barangayCount,
                  census: source.census,
                }
              )}
            </p>
          </div>

          <PageMessages messages={messages}>
            <BarangayTable
              barangays={statistics.rankedBarangays}
              largestPopulation={largestPopulation}
              totalPopulation={statistics.totalPopulation}
              barangayCount={statistics.barangayCount}
            />
          </PageMessages>
        </div>
      </section>

      {/* 11. HOW TO READ THESE NUMBERS */}
      <section
        className="border-b border-gray-200 bg-[#F9FAFB] py-10 sm:py-12 lg:py-14"
        aria-labelledby="reading-guide-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">{t('READING GUIDE')}</p>
            <h2
              id="reading-guide-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              {t('How to Read These Numbers')}
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {readingGuideItems(
              t,
              numberFormatter.format(statistics.totalPopulation)
            ).map(item => (
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
            <p className="text-eyebrow text-[#0066EB]">{t('PROVENANCE')}</p>
            <h2
              id="provenance-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              {t('Source & Reference Period')}
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
                      {t('Reference:')}
                    </span>{' '}
                    {source.census}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      {t('Last Verified:')}
                    </span>{' '}
                    {formatIsoDate(source.lastVerified, locale)}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {t(
                    'BetterSanFernando presents the Philippine Statistics Authority’s official census release for the City of San Fernando, Pampanga.'
                  )}
                </p>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  {t('View Official PSA Source')}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* RIGHT: What This Means */}
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  {t('What This Means')}
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
                  <li className="flex items-start gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                      aria-hidden="true"
                    />
                    <span>
                      {t(
                        'Official census values published by the national statistical agency.'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                      aria-hidden="true"
                    />
                    <span>
                      {t(
                        'One shared census reference across all {{barangays}} component barangays.',
                        { barangays: BARANGAY_COUNT }
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                      aria-hidden="true"
                    />
                    <span>
                      {t(
                        'BetterSanFernando does not add population estimates.'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066EB]"
                      aria-hidden="true"
                    />
                    <span>
                      {t('BetterSanFernando does not add projections.')}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-3 text-xs text-gray-500">
                {t(
                  'All {{barangays}} barangay populations sum exactly to the published city total.',
                  { barangays: BARANGAY_COUNT }
                )}
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
          <p className="text-eyebrow text-[#0066EB]">
            {t('RELATED RESOURCES')}
          </p>
          <h2
            id="keep-exploring-heading"
            className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
          >
            {t('Keep Exploring')}
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {keepExploringLinks(t).map(item => (
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
