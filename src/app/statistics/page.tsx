import {
  ArrowDown,
  ArrowRight,
  FolderKanban,
  Landmark,
  Library,
  Scale,
  UsersRound,
} from 'lucide-react';
import Link from '../../components/i18n/LocaleLink';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { getStatisticsSummary } from '../../data/civic/statisticsSummary';
import { getLegislationSummary } from '../../data/civic/legislationSummary';
import { getPublicRecordsMetrics } from '../../data/civic/publicRecordsCoverage';
import { buildPageMetadata } from '../../lib/metadata';
import { getPageT, type PageT } from '../../i18n/server';

export async function generateMetadata() {
  const { t, locale } = await getPageT('statistics');
  return buildPageMetadata({
    title: t('Statistics'),
    description: t(
      'Explore BetterSanFernando’s published civic datasets through focused statistical views for population, projects, procurement, government, legislation, and public records.'
    ),
    path: '/statistics',
    locale,
  });
}

const numberFormatter = new Intl.NumberFormat('en-PH');
const summary = getStatisticsSummary();
const legislation = getLegislationSummary();
const publicRecordsDatasetCount = getPublicRecordsMetrics().length;

const scopeDescription = (t: PageT) =>
  [
    t('These pages describe BetterSanFernando’s published datasets.'),
    t(
      'They are not a City scorecard, performance ranking, or claim of complete City Government coverage.'
    ),
  ].join(' ');

const snapshot = (t: PageT) =>
  [
    {
      label: t('{{census}} Population', {
        census: summary.population.census,
      }),
      value: numberFormatter.format(summary.population.total),
    },
    { label: t('Barangays'), value: summary.population.barangays },
    { label: t('Published Project Records'), value: summary.projects.total },
    {
      label: t('Project Evidence Records'),
      value: summary.procurement.evidence,
    },
    {
      label: t('Published Office Records'),
      value: summary.government.officeRecords,
    },
  ] as const;

const topicThemes = (t: PageT) =>
  [
    {
      theme: t('PEOPLE & PLACE'),
      views: [
        {
          href: '/statistics/population',
          title: t('Population'),
          icon: UsersRound,
          measure: t('{{n}} people', {
            n: numberFormatter.format(summary.population.total),
          }),
          question: t(
            'How many people live in San Fernando, and how is population distributed across its barangays?'
          ),
          action: t('Explore Population'),
        },
        {
          href: '/statistics/city-profile',
          title: t('City Profile'),
          icon: Landmark,
          measure: t('{{n}} barangays', { n: summary.population.barangays }),
          question: t(
            'What are the City’s barangays, geographic coverage, and basic institutional statistics?'
          ),
          action: t('Explore City Profile'),
        },
      ],
    },
    {
      theme: t('PROJECTS & PROCUREMENT'),
      views: [
        {
          href: '/statistics/projects',
          title: t('Projects'),
          icon: FolderKanban,
          measure: t('{{n}} project records', { n: summary.projects.total }),
          question: t(
            'What kinds of projects are published, where are they located, and what documentary stages and financial fields are represented?'
          ),
          action: t('Explore Project Statistics'),
        },
        {
          href: '/statistics/procurement',
          title: t('Procurement'),
          icon: Scale,
          measure: t('{{n}} evidence records', {
            n: summary.procurement.evidence,
          }),
          question: t(
            'What procurement evidence is linked to published projects, and what does that evidence establish?'
          ),
          action: t('Explore Procurement Statistics'),
        },
      ],
    },
    {
      theme: t('GOVERNMENT & PUBLIC RECORDS'),
      views: [
        {
          href: '/statistics/legislation',
          title: t('Legislation'),
          icon: Scale,
          measure: t('{{eo}} EO · {{ord}} Ord · {{res}} Res', {
            eo: legislation.executiveOrders.total,
            ord: legislation.ordinances.total,
            res: legislation.resolutions.total,
          }),
          question: t(
            'What Executive Orders, Ordinances, and Resolutions does BetterSanFernando currently publish?'
          ),
          action: t('Explore Legislation Statistics'),
        },
        {
          href: '/statistics/public-records',
          title: t('Public Records'),
          icon: Library,
          measure: t('{{n}} tracked datasets', {
            n: publicRecordsDatasetCount,
          }),
          question: t(
            'What datasets does BetterSanFernando publish, and what are the coverage limits of each?'
          ),
          action: t('Explore Public Records Statistics'),
        },
      ],
    },
  ] as const;

const explorationLinks = (t: PageT) =>
  [
    {
      href: '/transparency/sources',
      title: t('Data Sources'),
      description: t(
        'How BetterSanFernando’s public datasets connect back to original sources.'
      ),
    },
    {
      href: '/transparency/methodology',
      title: t('How We Publish Data'),
      description: t(
        'How BetterSanFernando verifies, normalizes, limits, and publishes civic information.'
      ),
    },
    {
      href: '/statistics/public-records',
      title: t('Public Records Statistics'),
      description: t(
        'See dataset coverage, publication status, and record-unit boundaries.'
      ),
    },
    {
      href: '/transparency/finance',
      title: t('City Finances'),
      description: t(
        'Explore selected official aggregate finance reports and compatible observations.'
      ),
    },
  ] as const;

export default async function Statistics() {
  const { t } = await getPageT('statistics');
  return (
    <main className="flex-grow bg-white pb-16 md:pb-24">
      {/* 1. EDITORIAL HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: t('Home'), href: '/' },
              { label: t('Transparency'), href: '/transparency' },
              { label: t('Statistics') },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                {t('STATISTICS · CIVIC DATA')}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                {t('Statistics')}
              </h1>
              <p className="mt-4 max-w-[70ch] text-base leading-relaxed text-gray-700 sm:text-lg">
                {t(
                  'Explore BetterSanFernando’s published civic datasets through focused statistical views for population, projects, procurement, government, legislation, and public records.'
                )}
              </p>

              {/* CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#explore-by-topic"
                  className="inline-flex h-10 items-center gap-2 rounded-sm bg-[#0066EB] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
                >
                  {t('Explore Statistical Views')}
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="#before-you-compare"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] underline decoration-primary-300 underline-offset-4 transition-colors hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
                >
                  {t('How to Read the Numbers')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Right-side scope module */}
            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
              <p className="text-eyebrow text-gray-600">
                {t('ABOUT THESE STATISTICS')}
              </p>
              <h2 className="mt-1.5 text-base font-bold text-gray-950">
                {t('A Civic Data Directory')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {scopeDescription(t)}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* 2. AT A GLANCE */}
        <section aria-labelledby="snapshot-heading" className="mt-10 sm:mt-12">
          <h2
            id="snapshot-heading"
            className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl"
          >
            {t('At a Glance')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
            {t(
              'Independent measures from different published datasets. These numbers use different units and should not be added or ranked against one another.'
            )}
          </p>

          <dl className="mt-6 grid grid-cols-1 rounded-sm border border-gray-200 bg-white sm:grid-cols-2 lg:grid-cols-5">
            {snapshot(t).map((metric, index) => (
              <div
                key={metric.label}
                className={`flex min-w-0 flex-col justify-between p-4 sm:p-5 ${
                  index !== 0 ? 'border-t border-gray-200' : ''
                } ${index % 2 === 1 ? 'sm:border-l sm:border-gray-200' : ''} ${
                  index > 1 ? 'sm:border-t sm:border-gray-200' : 'sm:border-t-0'
                } ${
                  index !== 0
                    ? 'lg:border-l lg:border-t-0 lg:border-gray-200'
                    : ''
                }`}
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {metric.label}
                </dt>
                <dd className="mt-2 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 3. MAIN SECTION — EXPLORE BY TOPIC */}
        <section
          id="explore-by-topic"
          aria-labelledby="views-heading"
          className="mt-14 sm:mt-16"
        >
          <p className="text-eyebrow text-[#0066EB]">
            {t('STATISTICAL VIEWS')}
          </p>
          <h2
            id="views-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl"
          >
            {t('Explore by Topic')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
            {t(
              'Choose the question you want to answer. Each detailed view owns its own comparisons, denominators, source periods, and limitations.'
            )}
          </p>

          <div className="mt-8 space-y-8">
            {topicThemes(t).map(topic => (
              <div key={topic.theme}>
                <div className="border-t border-gray-200 pb-2 pt-4">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {topic.theme}
                  </h3>
                </div>

                <div className="mt-2 grid grid-cols-1 divide-y divide-gray-200 rounded-sm border border-gray-200 bg-white md:grid-cols-2 md:divide-x md:divide-y-0">
                  {topic.views.map(view => {
                    const Icon = view.icon;
                    return (
                      <Link
                        key={view.href}
                        href={view.href}
                        className="group flex flex-col justify-between p-5 transition-colors hover:bg-[#F3F6FB]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB] sm:p-6"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Icon
                              className="h-4 w-4 shrink-0 text-[#0066EB]"
                              aria-hidden="true"
                            />
                            <h4 className="text-lg font-bold text-gray-950 transition-colors group-hover:text-[#0066EB] sm:text-xl">
                              {view.title}
                            </h4>
                          </div>
                          <p className="mt-2 text-base font-extrabold tabular-nums text-primary-800">
                            {view.measure}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-gray-600">
                            {view.question}
                          </p>
                        </div>
                        <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors group-hover:text-[#0052BC]">
                          <span>{view.action}</span>
                          <ArrowRight
                            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. BEFORE YOU COMPARE */}
        <section
          id="before-you-compare"
          aria-labelledby="compare-heading"
          className="mt-14 border-t border-gray-200 pt-10 sm:mt-16"
        >
          <p className="text-eyebrow text-[#0066EB]">{t('READING GUIDE')}</p>
          <h2
            id="compare-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl"
          >
            {t('Before You Compare')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
            {t(
              'Different statistical views describe different datasets, periods, and units. Keep these rules in mind when reading across pages.'
            )}
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
            <div>
              <dt className="text-base font-bold text-gray-950">
                {t('Coverage Is Bounded')}
              </dt>
              <dd className="mt-2 text-sm leading-6 text-gray-700">
                {t(
                  'A published dataset count describes BetterSanFernando’s current coverage, not necessarily every City Government record or activity.'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-base font-bold text-gray-950">
                {t('Reference Periods Differ')}
              </dt>
              <dd className="mt-2 text-sm leading-6 text-gray-700">
                {t(
                  'Population uses the current census reference, while project, procurement, legislation, and other datasets use their own reporting or evidence periods.'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-base font-bold text-gray-950">
                {t('States Have Specific Meanings')}
              </dt>
              <dd className="mt-2 text-sm leading-6 text-gray-700">
                {t(
                  'Documentary lifecycle is not physical progress. AWARDED does not mean CONTRACTED, completed, paid, or operational.'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-base font-bold text-gray-950">
                {t('Missing Is Not Zero')}
              </dt>
              <dd className="mt-2 text-sm leading-6 text-gray-700">
                {t(
                  'Unavailable or unsupported values remain unknown rather than being inferred or treated as zero.'
                )}
              </dd>
            </div>
          </dl>
        </section>

        {/* 5. CURRENT COVERAGE GAPS */}
        <section
          aria-labelledby="gaps-heading"
          className="mt-14 border-t border-gray-200 pt-10 sm:mt-16"
        >
          <p className="text-eyebrow text-[#0066EB]">{t('CURRENT COVERAGE')}</p>
          <h2
            id="gaps-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl"
          >
            {t('Current Coverage Gaps')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
            {t(
              'These gaps describe the current public release, not an absence of City activity or records.'
            )}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Broader Demographics')}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {t(
                  'Current public data supports population and barangay classification, but not a complete frontend-safe statistical dataset for age, sex, households, or density.'
                )}
              </p>
            </div>
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Actual Project Spending')}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {t(
                  'Current project finance fields do not establish actual expenditure. Approved budget, winning bid, and contract amount remain separate procurement fields and are not treated as spending.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* 6. KEEP EXPLORING */}
        <section
          aria-labelledby="explore-heading"
          className="mt-14 border-t border-gray-200 pt-10 sm:mt-16"
        >
          <p className="text-eyebrow text-[#0066EB]">{t('KEEP EXPLORING')}</p>
          <h2
            id="explore-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl"
          >
            {t('Keep Exploring')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
            {t(
              'Explore related transparency registers, publication standards, and governance records.'
            )}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {explorationLinks(t).map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition-colors hover:bg-[#F3F6FB]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <div>
                  <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>
                </div>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors group-hover:text-[#0052BC]">
                  <span>{t('Explore')}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
