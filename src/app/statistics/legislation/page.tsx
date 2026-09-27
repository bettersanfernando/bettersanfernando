import { ArrowDown, ArrowRight, ExternalLink } from 'lucide-react';
import Link from '../../../components/i18n/LocaleLink';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getExecutiveOrders,
  getOrdinances,
  getResolutions,
  hasLegislationFullText,
} from '../../../data/civic/legislation';
import {
  getPublicRecordsArchiveCoverage,
  getPublicRecordsMetrics,
} from '../../../data/civic/publicRecordsCoverage';
import { buildPageMetadata } from '../../../lib/metadata';
import type { PageT } from '../../../i18n/page-t';
import { getPageT } from '../../../i18n/server';

export async function generateMetadata() {
  const { t, locale } = await getPageT('statistics-legislation');
  return buildPageMetadata({
    title: t('Legislation Statistics'),
    description: t(
      "Coverage statistics for BetterSanFernando's published Executive Order, Ordinance, and Resolution collections."
    ),
    path: '/statistics/legislation',
    locale,
  });
}

// Dynamic canonical datasets
const executiveOrders = getExecutiveOrders();
const ordinances = getOrdinances();
const resolutions = getResolutions();

const legislationMetrics = getPublicRecordsMetrics().filter(metric =>
  ['executive_order', 'ordinance', 'resolution'].includes(metric.record_type)
);

const archiveRanges = getPublicRecordsArchiveCoverage().filter(entry =>
  [
    'resolution_archive_range',
    'ordinance_archive_range',
    'appropriation_ordinance_archive_range',
  ].includes(entry.record_type)
);

// Curated UI display labels for archive range evidence record types
const ARCHIVE_RECORD_LABELS = (t: PageT): Record<string, string> => ({
  resolution_archive_range: t('Resolution archive'),
  ordinance_archive_range: t('Ordinance archive'),
  appropriation_ordinance_archive_range: t('Appropriation ordinance archive'),
});

export default async function LegislationStatistics() {
  const { t } = await getPageT('statistics-legislation');

  function formatArchiveRecordType(recordType: string): string {
    return (
      ARCHIVE_RECORD_LABELS(t)[recordType] ?? recordType.replaceAll('_', ' ')
    );
  }
  const collections = [
    {
      id: 'executive_order',
      label: t('Executive Orders'),
      count: executiveOrders.length,
      fullTextCount: executiveOrders.filter(hasLegislationFullText).length,
      href: '/legislation/executive-orders',
      metric: legislationMetrics.find(m => m.record_type === 'executive_order'),
    },
    {
      id: 'ordinance',
      label: t('Ordinances'),
      count: ordinances.length,
      fullTextCount: ordinances.filter(hasLegislationFullText).length,
      href: '/legislation/ordinances',
      metric: legislationMetrics.find(m => m.record_type === 'ordinance'),
    },
    {
      id: 'resolution',
      label: t('Resolutions'),
      count: resolutions.length,
      fullTextCount: resolutions.filter(hasLegislationFullText).length,
      href: '/legislation/resolutions',
      metric: legislationMetrics.find(m => m.record_type === 'resolution'),
    },
  ];

  // Scale for horizontal bar chart (shared 0-15 scale)
  const chartMax = 15;
  const axisTicks = [0, 5, 10, 15];

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
              { label: t('Legislation Statistics') },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                {t('STATISTICS · LEGISLATION')}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                {t('Legislation Statistics')}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                {t(
                  'Explore the coverage of BetterSanFernando’s verified Executive Order, Ordinance, and Resolution collections, including published years, document availability, and archive evidence.'
                )}
              </p>

              {/* CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#published-holdings"
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC]"
                >
                  {t('Explore published coverage')}
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/legislation"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  {t('Browse legislation')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Coverage Scope Module */}
            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
              <p className="text-eyebrow text-[#0066EB]">
                {t('COVERAGE SCOPE')}
              </p>
              <h2 className="mt-1.5 text-base font-bold text-gray-950">
                {t('Published holdings, not the City’s full record')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {t(
                  'These figures describe records BetterSanFernando currently verifies and publishes. They are not the complete legislative output of the City.'
                )}
              </p>
              <p className="mt-3 border-t border-gray-200/80 pt-3 text-xs leading-relaxed text-gray-600">
                {t(
                  'Archive ranges represent catalog positions in source summaries and are never added to published counts.'
                )}
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* 2. CORE SNAPSHOT */}
      <section
        className="border-b border-gray-200 bg-white"
        aria-labelledby="snapshot-heading"
      >
        <div className="container mx-auto px-4 py-8">
          <h2 id="snapshot-heading" className="sr-only">
            {t('Core snapshot')}
          </h2>
          <dl className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x border-y border-gray-200 py-6">
            {collections.map((collection, index) => (
              <div
                key={collection.id}
                className={
                  index === 0 ? 'sm:pr-6' : index === 1 ? 'sm:px-6' : 'sm:pl-6'
                }
              >
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {collection.label}
                </dt>
                <dd className="mt-1.5 text-3xl sm:text-4xl font-extrabold tabular-nums text-gray-950">
                  {collection.count}
                </dd>
                <p className="mt-1 text-xs text-gray-600">
                  {t('Individually published records')}
                </p>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-gray-500">
            {t(
              'Counts refer to individually published BetterSanFernando records only.'
            )}
          </p>
        </div>
      </section>

      {/* 3. READING GUIDE */}
      <section
        className="border-b border-gray-200 bg-[#F9FAFB] py-10 sm:py-12 lg:py-14"
        aria-labelledby="guide-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">{t('READING GUIDE')}</p>
            <h2
              id="guide-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('How to read these statistics')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t(
                'Three core principles governing how legislative records and holdings are verified and presented on BetterSanFernando.'
              )}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Published holdings')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Counts describe BetterSanFernando’s verified published records, not every measure issued by the City. The archive grows as documents are systematically digitized and reconciled.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Year coverage')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'A listed year means BetterSanFernando has at least one individually published record from that year. Missing years do not establish that no measure was issued.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Legal status')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Publication here does not determine whether a measure remains legally effective, has been amended or repealed, or who sponsored or authored it.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMBINED PUBLISHED COVERAGE SECTION (HOLDINGS & YEARS) */}
      <section
        id="published-holdings"
        className="border-b border-gray-200 bg-white py-10 sm:py-14 lg:py-16"
        aria-labelledby="coverage-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">
              {t('PUBLISHED COVERAGE')}
            </p>
            <h2
              id="coverage-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('Published Coverage by Collection')}
            </h2>
            <p className="mt-1.5 text-sm text-gray-600">
              {t(
                'Compare how many records BetterSanFernando currently publishes and which years those records represent.'
              )}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
            {/* LEFT PANEL: PUBLISHED HOLDINGS */}
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-7">
              <div>
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-950">
                    {t('Published Holdings')}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {t(
                      'Individually published BetterSanFernando legislation records.'
                    )}
                  </p>
                </div>

                <div className="mt-2 flex items-baseline justify-between py-1 text-xs text-gray-500">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">
                    {t('Collection')}
                  </span>
                  <span className="font-mono text-[11px]">
                    {t('Shared scale · 0–{{chartMax}} records', { chartMax })}
                  </span>
                </div>

                {/* Horizontal Bar Chart Rows */}
                <div className="mt-4 space-y-5">
                  {collections.map(item => {
                    const barWidth = `${(item.count / chartMax) * 100}%`;

                    return (
                      <div key={`chart-${item.id}`}>
                        <div className="flex items-baseline justify-between text-xs sm:text-sm font-semibold">
                          <span className="text-gray-950">{item.label}</span>
                          <span className="font-mono font-bold text-[#0066EB]">
                            {item.count}{' '}
                            <span className="text-xs font-normal text-gray-500">
                              {t('records')}
                            </span>
                          </span>
                        </div>

                        <div className="relative mt-2 flex h-7 w-full items-center rounded-none bg-gray-50 border border-gray-100">
                          {/* Scale Grid Line Overlay */}
                          <div className="pointer-events-none absolute inset-0 flex justify-between px-0">
                            {axisTicks.map(tick => (
                              <div
                                key={tick}
                                className="h-full border-r border-gray-200/60"
                                style={{ width: `${(tick / chartMax) * 100}%` }}
                              />
                            ))}
                          </div>

                          {/* Solid Blue Horizontal Bar */}
                          <div
                            className="relative z-10 h-full bg-[#0066EB]"
                            style={{ width: barWidth }}
                            role="img"
                            aria-label={t(
                              '{{label}}: {{count}} published records',
                              { label: item.label, count: item.count }
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Axis Tick Labels */}
                <div className="mt-3 flex justify-between px-0.5 font-mono text-[11px] text-gray-400 border-t border-gray-100 pt-2">
                  {axisTicks.map(tick => (
                    <span key={tick}>{tick}</span>
                  ))}
                </div>
              </div>

              {/* Guidance Below Chart */}
              <div className="mt-6 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-600">
                <p>
                  <span className="font-semibold text-gray-900">
                    {t('What you’re seeing:')}{' '}
                  </span>
                  {t(
                    'Published record counts across BetterSanFernando’s three legislation collections.'
                  )}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-gray-900">
                    {t('How to read it:')}{' '}
                  </span>
                  {t(
                    'These counts are directly comparable as published records, but they do not represent the City’s complete legislative output.'
                  )}
                </p>
              </div>
            </div>

            {/* RIGHT PANEL: PUBLISHED YEAR COVERAGE */}
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-7">
              <div>
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-950">
                    {t('Published Year Coverage')}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {t(
                      'A listed year has at least one individually published record. Missing years do not prove that no measure was issued.'
                    )}
                  </p>
                </div>

                {/* 3 Compact Editorial Rows with Dividers */}
                <div className="divide-y divide-gray-100">
                  {collections.map(item => {
                    const years = item.metric?.period_coverage.years ?? [];

                    return (
                      <div
                        key={`years-${item.id}`}
                        className="py-4 first:pt-4 last:pb-0"
                      >
                        <div className="flex items-baseline justify-between text-xs sm:text-sm">
                          <span className="font-bold text-gray-950">
                            {item.label}
                          </span>
                          <span className="font-mono text-xs text-gray-500">
                            {t('{{count}} records', { count: item.count })}
                          </span>
                        </div>

                        {/* Discrete Year Markers */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {years.map(year => (
                            <span
                              key={year}
                              className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50/70 px-2 py-0.5 font-mono text-xs text-gray-800"
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-[#0066EB]"
                                aria-hidden="true"
                              />
                              {year}
                            </span>
                          ))}
                        </div>

                        {item.metric?.coverage_note && (
                          <p className="mt-2 text-xs leading-relaxed text-gray-500">
                            {item.metric.coverage_note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
                <p>
                  {t(
                    'Discrete year markers indicate verifiable source recovery only. They do not imply continuous activity across intervening years.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. EVIDENCE AVAILABILITY */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-14 lg:py-16"
        aria-labelledby="availability-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">
              {t('DOCUMENT AVAILABILITY')}
            </p>
            <h2
              id="availability-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('Evidence Availability')}
            </h2>
            <p className="mt-1.5 text-sm text-gray-600">
              {t(
                'Breakdown of individually published records with verified official PDF attachments versus records verified through official cross-references.'
              )}
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="mt-8 hidden overflow-hidden rounded-sm border border-gray-200 md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-900">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    {t('Collection')}
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    {t('Published')}
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    {t('Full Text Available')}
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    {t('Without Recovered Full Text')}
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 font-semibold text-right"
                  >
                    {t('Action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {collections.map(item => {
                  const withoutFullText = item.count - item.fullTextCount;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/75">
                      <td className="px-5 py-4 font-bold text-gray-950">
                        {item.label}
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold tabular-nums text-gray-950">
                        {item.count}
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold tabular-nums text-emerald-700">
                        {item.fullTextCount}
                      </td>
                      <td className="px-5 py-4 font-mono tabular-nums text-gray-600">
                        {withoutFullText}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
                        >
                          {t('Browse records')}
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {collections.map(item => {
              const withoutFullText = item.count - item.fullTextCount;

              return (
                <div
                  key={`mobile-avail-${item.id}`}
                  className="rounded-sm border border-gray-200 bg-white p-4 text-xs"
                >
                  <div className="flex items-baseline justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-950">
                      {item.label}
                    </span>
                    <span className="font-mono text-gray-500">
                      {t('{{count}} total', { count: item.count })}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-sm bg-emerald-50/50 p-2 border border-emerald-100">
                      <span className="block text-[11px] text-emerald-800">
                        {t('Full text available')}
                      </span>
                      <span className="font-mono text-sm font-bold text-emerald-700">
                        {item.fullTextCount}
                      </span>
                    </div>
                    <div className="rounded-sm bg-gray-50 p-2 border border-gray-100">
                      <span className="block text-[11px] text-gray-600">
                        {t('Without recovered text')}
                      </span>
                      <span className="font-mono text-sm font-bold text-gray-800">
                        {withoutFullText}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-gray-100 pt-2 text-right">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 font-semibold text-[#0066EB]"
                    >
                      {t('Browse records')}
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            {t(
              'Without recovered full text does not mean the record is unverified. Some records are supported through official references even when BetterSanFernando has not recovered the complete document.'
            )}
          </p>
        </div>
      </section>

      {/* 7. COLLECTION COVERAGE (FLAT EDITORIAL DIRECTORY) */}
      <section
        className="border-b border-gray-200 bg-[#F9FAFB] py-10 sm:py-14 lg:py-16"
        aria-labelledby="collections-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">{t('COLLECTIONS')}</p>
            <h2
              id="collections-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('Explore the Published Collections')}
            </h2>
            <p className="mt-1.5 text-sm text-gray-600">
              {t(
                'Direct access to verified records, full-text attachments, and legislative details.'
              )}
            </p>
          </div>

          <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200 bg-white">
            {collections.map(item => {
              const years = item.metric?.period_coverage.years ?? [];

              return (
                <div
                  key={`col-cov-${item.id}`}
                  className="py-6 sm:py-7 first:pt-6 last:pb-6 px-4 sm:px-6"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {item.label}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="font-mono text-xs text-gray-500">
                          {t('Published years · {{join}}', {
                            join: years.join(', '),
                          })}
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-gray-950">
                          {item.count}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {t('published records')}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {item.metric?.coverage_note}
                      </p>
                    </div>

                    <div className="shrink-0 pt-1">
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC]"
                      >
                        {t('Browse {{label}}', { label: item.label })}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. ARCHIVE-RANGE EVIDENCE */}
      {archiveRanges.length > 0 && (
        <section
          className="border-b border-gray-200 bg-white py-10 sm:py-14 lg:py-16"
          aria-labelledby="archive-heading"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                {t('ARCHIVE EVIDENCE')}
              </p>
              <h2
                id="archive-heading"
                className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
              >
                {t('Archive-range Evidence')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Numbered positions observed in official City archive materials. These describe archive coverage only and are not individually published legislation records.'
                )}
              </p>
            </div>

            {/* Desktop Table View */}
            <div className="mt-8 hidden overflow-hidden rounded-sm border border-gray-200 md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-900">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {t('Record Type')}
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {t('Year')}
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {t('Numbered Range')}
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {t('Archive Positions')}
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {t('Calendar Coverage')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 font-semibold text-right"
                    >
                      {t('Source')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {archiveRanges.map(entry => (
                    <tr
                      key={`${entry.record_type}-${entry.year}-${entry.range_start}`}
                      className="hover:bg-gray-50/75"
                    >
                      <td className="px-4 py-3 font-medium text-gray-950">
                        {formatArchiveRecordType(entry.record_type)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{entry.year}</td>
                      <td className="px-4 py-3 font-mono text-gray-800">
                        {entry.range_start}–{entry.range_end}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold tabular-nums text-gray-950">
                        {entry.count}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-sm px-2 py-0.5 text-xs font-medium ${
                            entry.complete_calendar_year
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {entry.complete_calendar_year
                            ? t('Complete Year')
                            : t('Partial Year')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={entry.official_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t(
                            'Official source PDF for {{record_type}} {{year}} (opens in new tab)',
                            {
                              record_type: formatArchiveRecordType(
                                entry.record_type
                              ),
                              year: entry.year,
                            }
                          )}
                          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
                        >
                          {t('PDF')}
                          <ExternalLink
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Rows View */}
            <div className="mt-6 space-y-3 md:hidden">
              {archiveRanges.map(entry => (
                <div
                  key={`mobile-${entry.record_type}-${entry.year}-${entry.range_start}`}
                  className="rounded-sm border border-gray-200 bg-white p-4 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-gray-950">
                      {formatArchiveRecordType(entry.record_type)}
                    </span>
                    <span
                      className={`rounded-sm px-2 py-0.5 text-[11px] font-medium ${
                        entry.complete_calendar_year
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {entry.complete_calendar_year
                        ? t('Complete Year')
                        : t('Partial Year')}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 border-y border-gray-100 py-2.5">
                    <div>
                      <span className="block text-[11px] text-gray-500">
                        {t('Year')}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {entry.year}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-gray-500">
                        {t('Numbered range')}
                      </span>
                      <span className="font-mono text-gray-900">
                        {entry.range_start}–{entry.range_end}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-gray-500">
                        {t('Positions')}
                      </span>
                      <span className="font-mono font-semibold text-gray-950">
                        {entry.count}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      {entry.unit_label}
                    </span>
                    <a
                      href={entry.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#0066EB]"
                    >
                      {t('Official PDF')}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. COVERAGE & INTERPRETATION */}
      <section
        className="border-b border-gray-200 bg-[#F9FAFB] py-10 sm:py-12 lg:py-14"
        aria-labelledby="interpretation-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">
              {t('COVERAGE & INTERPRETATION')}
            </p>
            <h2
              id="interpretation-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('Understanding the Legislation Data')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t(
                'Safeguards and standards governing publication boundaries, legal interpretation, and archive evidence.'
              )}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Coverage')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'These are BetterSanFernando’s currently verified holdings, not the complete legislative output of the City. Absence from this archive does not prove a measure was never enacted.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Archive evidence')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Archive ranges are supporting coverage evidence and are never added to published record counts. Range numbers describe catalog boundaries only.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Legal interpretation')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'BetterSanFernando does not determine legal effect, current validity, repeal status, sponsorship, or authorship for any record shown here.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. KEEP EXPLORING */}
      <section
        className="bg-white py-10 pb-16 sm:py-12 sm:pb-24 lg:py-14 lg:pb-28"
        aria-labelledby="explore-heading"
      >
        <div className="container mx-auto px-4">
          <p className="text-eyebrow text-[#0066EB]">
            {t('RELATED RESOURCES')}
          </p>
          <h2
            id="explore-heading"
            className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
          >
            {t('Keep Exploring')}
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link
              href="/legislation"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Overview')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Legislation Overview')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t('Central directory for verified City legislative acts.')}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('View overview')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/legislation/executive-orders"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Mayoral')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Executive Orders')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t('Directives issued by the City Mayor of San Fernando.')}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('Browse EOs')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/legislation/ordinances"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Council')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Ordinances')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t('City laws passed by the Sangguniang Panlungsod.')}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('Browse ordinances')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/legislation/resolutions"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Council')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Resolutions')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t('Formal expressions of opinion or will by the Council.')}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('Browse resolutions')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/statistics/public-records"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Holdings')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Public Records')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t('Complete dataset units, coverage periods, and evidence.')}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('View statistics')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
