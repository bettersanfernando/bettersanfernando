'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ExternalLink, RotateCcw } from 'lucide-react';
import Link from '../../../components/i18n/LocaleLink';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getPublicRecordsArchiveCoverage,
  getPublicRecordsCoverageMetadata,
  getPublicRecordsMetrics,
  getPublicRecordsRelatedCollections,
} from '../../../data/civic/publicRecordsCoverage';
import type { PageT } from '../../../i18n/page-t';
import { usePageT } from '../../../components/i18n/PageMessages';
import { useLocale } from '../../../components/i18n/useLocale';
import type { LanguageType } from '../../../types';

const metrics = getPublicRecordsMetrics();
const archiveCoverage = getPublicRecordsArchiveCoverage();
const relatedCollections = getPublicRecordsRelatedCollections();
const metadata = getPublicRecordsCoverageMetadata();

type SourceFamilyFilter = 'ALL' | (typeof metrics)[number]['source_family'];

// Curated UI display labels for known source families
const SOURCE_FAMILY_LABELS = (t: PageT): Record<string, string> => ({
  csfp_procurement: t('Procurement & Projects'),
  csfp_citizens_charter: t('Citizen’s Charter'),
  csfp_full_disclosure: t('Full Disclosure'),
  multiple_official_csfp_collections: t('Multiple Official Collections'),
  csfp_executive_orders: t('Executive Orders'),
  csfp_legislation: t('Legislation'),
  csfp_osp_archive_books: t('OSP Archive Books'),
});

function formatSourceFamily(t: PageT, family: string): string {
  return SOURCE_FAMILY_LABELS(t)[family] ?? family.replaceAll('_', ' ');
}

// Curated UI display labels for published dataset record types
const DATASET_LABELS = (t: PageT): Record<string, string> => ({
  project: t('Projects'),
  project_evidence: t('Project Evidence'),
  service: t('Resident-Facing Services'),
  full_disclosure_document: t('Full Disclosure Reports'),
  official_document: t('Official Documents'),
  executive_order: t('Executive Orders'),
  ordinance: t('Ordinances'),
  resolution: t('Resolutions'),
});

function formatDatasetName(t: PageT, recordType: string): string {
  return DATASET_LABELS(t)[recordType] ?? recordType.replaceAll('_', ' ');
}

// Contextual action labels for browsing collections
const BROWSE_LABELS = (t: PageT): Record<string, string> => ({
  project: t('Browse Projects'),
  project_evidence: t('Browse Project Sources'),
  service: t('Browse Services'),
  full_disclosure_document: t('Browse Full Disclosure'),
  official_document: t('Browse Official Documents'),
  executive_order: t('Browse Executive Orders'),
  ordinance: t('Browse Ordinances'),
  resolution: t('Browse Resolutions'),
});

function formatBrowseLabel(t: PageT, recordType: string): string {
  return BROWSE_LABELS(t)[recordType] ?? t('Browse collection');
}

// Curated UI display labels for archive range evidence record types
const ARCHIVE_RECORD_LABELS = (t: PageT): Record<string, string> => ({
  resolution_archive_range: t('Resolution archive'),
  ordinance_archive_range: t('Ordinance archive'),
  appropriation_ordinance_archive_range: t('Appropriation ordinance archive'),
});

function formatArchiveRecordType(t: PageT, recordType: string): string {
  return (
    ARCHIVE_RECORD_LABELS(t)[recordType] ?? recordType.replaceAll('_', ' ')
  );
}

// Formats coverage periods; lists gaps accurately without implying contiguous coverage
function formatPeriodCoverage(period: {
  start_year: number;
  end_year: number;
  years: number[];
}): string {
  const { start_year, end_year, years } = period;
  if (!years || years.length === 0) {
    return start_year === end_year
      ? `${start_year}`
      : `${start_year}–${end_year}`;
  }

  const sorted = [...years].sort((a, b) => a - b);
  const isContiguous =
    sorted.length === end_year - start_year + 1 &&
    sorted[0] === start_year &&
    sorted[sorted.length - 1] === end_year;

  if (isContiguous) {
    return start_year === end_year
      ? `${start_year}`
      : `${start_year}–${end_year}`;
  }

  const ranges: string[] = [];
  let rangeStart = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    if (curr === prev + 1) {
      prev = curr;
    } else {
      ranges.push(
        rangeStart === prev ? `${rangeStart}` : `${rangeStart}–${prev}`
      );
      rangeStart = curr;
      prev = curr;
    }
  }
  ranges.push(rangeStart === prev ? `${rangeStart}` : `${rangeStart}–${prev}`);

  return ranges.join(', ');
}

function formatVerificationDate(dateStr: string, locale: LanguageType): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString(locale === 'fil' ? 'fil-PH' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function PublicRecordsStatistics() {
  const t = usePageT();
  const locale = useLocale();
  const [sourceFamily, setSourceFamily] = useState<SourceFamilyFilter>('ALL');

  const sourceFamilies = useMemo(
    () => [...new Set(metrics.map(metric => metric.source_family))],
    []
  );

  const visibleMetrics = useMemo(
    () =>
      sourceFamily === 'ALL'
        ? metrics
        : metrics.filter(metric => metric.source_family === sourceFamily),
    [sourceFamily]
  );

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
              { label: t('Public Records Statistics') },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                {t('STATISTICS · PUBLIC RECORDS')}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                {t('Public Records Statistics')}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                {t(
                  'Explore the verified datasets BetterSanFernando currently publishes, with each collection shown in its own unit and coverage period.'
                )}
              </p>

              {/* CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#published-datasets"
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC]"
                >
                  {t('Explore published datasets')}
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/transparency"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  {t('Transparency overview')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Coverage Rule Module */}
            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
              <p className="text-eyebrow text-[#0066EB]">
                {t('COVERAGE RULE')}
              </p>
              <h2 className="mt-1.5 text-base font-bold text-gray-950">
                {t('No combined public-record total')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {t(
                  'Projects, evidence records, services, documents, and legislation describe different things. Their counts remain separate and must not be added together.'
                )}
              </p>
              <p className="mt-3 border-t border-gray-200/80 pt-3 text-xs leading-relaxed text-gray-600">
                {t(
                  'Counts describe BetterSanFernando’s current published coverage, not every record held or produced by the City Government.'
                )}
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* 2. SAFE PAGE-LEVEL SNAPSHOT */}
      <section
        className="border-b border-gray-200 bg-white"
        aria-labelledby="snapshot-heading"
      >
        <div className="container mx-auto px-4 py-8">
          <h2 id="snapshot-heading" className="sr-only">
            {t('Coverage snapshot')}
          </h2>
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-gray-200">
            <div className="lg:pr-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('Published datasets')}
              </dt>
              <dd className="mt-1.5 text-3xl font-extrabold tabular-nums text-gray-950">
                {metrics.length}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                {t('Distinct collections in own units')}
              </p>
            </div>
            <div className="lg:px-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('Related specialized collections')}
              </dt>
              <dd className="mt-1.5 text-3xl font-extrabold tabular-nums text-gray-950">
                {relatedCollections.length}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                {t('Separately maintained series')}
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4 sm:border-t-0 sm:pt-0 lg:border-t-0 lg:px-6 lg:pt-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('Archive-range entries')}
              </dt>
              <dd className="mt-1.5 text-3xl font-extrabold tabular-nums text-gray-950">
                {archiveCoverage.length}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                {t('Numbered positions as evidence only')}
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4 sm:border-t-0 sm:pt-0 lg:border-t-0 lg:pl-6 lg:pt-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('Coverage verified')}
              </dt>
              <dd className="mt-1.5 text-2xl font-extrabold text-gray-950 sm:text-3xl">
                {formatVerificationDate(metadata.verificationDate, locale)}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                {t('Official source audit baseline')}
              </p>
            </div>
          </dl>
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
                'Three core principles governing how public records and published counts are structured on BetterSanFernando.'
              )}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Each dataset keeps its own unit')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Projects, evidence records, documents, services, and legislation describe fundamentally different things and are not interchangeable counts. Different units are never added together into a single total.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Coverage is BetterSanFernando’s')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Counts describe what BetterSanFernando currently verifies and publishes from official sources, not every record ever produced or held by the City Government. Absence indicates unrecovered or unverified materials.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Archive ranges are evidence only')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Numbered archive positions observed in official summary documents verify archive range coverage only. They do not create individually published records and are never added to dataset counts.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PUBLISHED DATASETS */}
      <section
        id="published-datasets"
        className="py-10 sm:py-14 lg:py-16"
        aria-labelledby="datasets-heading"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-eyebrow text-[#0066EB]">
                {t('PUBLISHED DATASETS')}
              </p>
              <h2
                id="datasets-heading"
                className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
              >
                {t('Published coverage by dataset')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t(
                  'Each collection keeps its own count, unit, coverage period, and official source.'
                )}
              </p>
            </div>

            {/* Filter toolbar */}
            <div className="w-full sm:w-auto">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  {t('Source family')}
                </span>
                <select
                  value={sourceFamily}
                  onChange={event =>
                    setSourceFamily(event.target.value as SourceFamilyFilter)
                  }
                  className="h-10 w-full min-w-[240px] rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20"
                >
                  <option value="ALL">
                    {t('All source families ({{length}})', {
                      length: metrics.length,
                    })}
                  </option>
                  {sourceFamilies.map(family => (
                    <option key={family} value={family}>
                      {formatSourceFamily(t, family)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Live result counter */}
          <div className="mt-6 flex items-center justify-between border-b border-gray-200 pb-3">
            <p
              className="text-xs font-semibold text-gray-700"
              aria-live="polite"
            >
              {t('Showing {{length}} of {{length2}} datasets', {
                length: visibleMetrics.length,
                length2: metrics.length,
              })}
            </p>
            {sourceFamily !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSourceFamily('ALL')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
              >
                <RotateCcw className="h-3 w-3" />
                {t('Reset filter')}
              </button>
            )}
          </div>

          {/* 5. 2-Column Editorial Dataset Directory */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {visibleMetrics.map(metric => {
              const datasetName = formatDatasetName(t, metric.record_type);
              const periodText = formatPeriodCoverage(metric.period_coverage);
              const browseLabel = formatBrowseLabel(t, metric.record_type);

              return (
                <article
                  key={metric.record_type}
                  className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6 transition-colors hover:border-gray-300"
                >
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {formatSourceFamily(t, metric.source_family)}
                      </span>
                      <span className="font-mono text-xs text-gray-500">
                        {t('Coverage · {{periodText}}', { periodText })}
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline gap-2.5">
                      <span className="text-3xl font-extrabold tabular-nums text-gray-950">
                        {metric.count}
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        {metric.unit_label}
                      </span>
                    </div>

                    <h3 className="mt-1 text-lg font-bold text-gray-950">
                      {datasetName}
                    </h3>

                    <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
                      {metric.coverage_note}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs">
                    <Link
                      href={metric.canonical_route}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#0066EB] hover:text-[#0052BC]"
                    >
                      {browseLabel}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <a
                      href={metric.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t(
                        'Official source for {{datasetName}} (opens in new tab)',
                        { datasetName }
                      )}
                      className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900"
                    >
                      {t('Official source')}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. RELATED SPECIALIZED COLLECTIONS */}
      {relatedCollections.length > 0 && (
        <section
          className="border-t border-gray-200 bg-[#F9FAFB] py-10 sm:py-12 lg:py-14"
          aria-labelledby="related-heading"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                {t('RELATED COLLECTION')}
              </p>
              <h2
                id="related-heading"
                className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
              >
                {t('Related, but not part of the dataset counts')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Specialized collections may reference artifacts already represented elsewhere and are never added to the published dataset counts above.'
                )}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {relatedCollections.map(collection => {
                const isFinance = collection.record_type === 'finance_report';
                const collectionTitle = isFinance
                  ? t('City Finances')
                  : collection.record_type.replaceAll('_', ' ');
                const ctaLabel = isFinance
                  ? t('Explore City Finances')
                  : t('Browse collection');

                return (
                  <div
                    key={collection.record_type}
                    className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6"
                  >
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {t('Specialized Financial Reporting')}
                      </span>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                          {collection.count}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {collection.unit_label}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-gray-950">
                        {collectionTitle}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                        {collection.coverage_note}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <Link
                        href={collection.canonical_route}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
                      >
                        {ctaLabel}
                        <ArrowRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. ARCHIVE-RANGE EVIDENCE */}
      {archiveCoverage.length > 0 && (
        <section
          className="border-t border-gray-200 bg-white py-10 sm:py-14 lg:py-16"
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
                {t('Archive-range evidence')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Numbered positions observed in official archive materials. These describe archive coverage only and do not create individual published legislation records.'
                )}
              </p>
            </div>

            {/* Desktop Table View */}
            <div className="mt-8 hidden overflow-hidden rounded-sm border border-gray-200 md:block">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-900">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {t('Record type')}
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {t('Year')}
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {t('Numbered range')}
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {t('Archive positions')}
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {t('Calendar coverage')}
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
                  {archiveCoverage.map(entry => (
                    <tr
                      key={`${entry.record_type}-${entry.year}-${entry.range_start}`}
                      className="hover:bg-gray-50/75"
                    >
                      <td className="px-4 py-3 font-medium text-gray-950">
                        {formatArchiveRecordType(t, entry.record_type)}
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
                            ? t('Complete year')
                            : t('Partial year')}
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
                                t,
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
              {archiveCoverage.map(entry => (
                <div
                  key={`mobile-${entry.record_type}-${entry.year}-${entry.range_start}`}
                  className="rounded-sm border border-gray-200 bg-white p-4 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-gray-950">
                      {formatArchiveRecordType(t, entry.record_type)}
                    </span>
                    <span
                      className={`rounded-sm px-2 py-0.5 text-[11px] font-medium ${
                        entry.complete_calendar_year
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {entry.complete_calendar_year
                        ? t('Complete year')
                        : t('Partial year')}
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

      {/* 8. CLOSING INTERPRETATION SECTION */}
      <section
        className="border-t border-gray-200 bg-[#F9FAFB] py-10 sm:py-12 lg:py-14"
        aria-labelledby="interpretation-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">
              {t('COVERAGE & PROVENANCE')}
            </p>
            <h2
              id="interpretation-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('Understanding published coverage')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t(
                'Methodological standards protecting civic information clarity and publication integrity.'
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
                  'Counts reflect BetterSanFernando’s currently verified and published holdings. They represent an expanding public civic archive rather than an exhaustive catalog of every City transaction.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Official evidence')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Each collection is tied to identified official City sources. Records are published only when backed by accessible public documentation, audit releases, or statutory portal filings.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('No combined total')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Different record units remain separate by design and must not be added together. Combining projects, evidence records, and services produces a misleading and mathematically meaningless figure.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. KEEP EXPLORING */}
      <section
        className="border-t border-gray-200 bg-white py-10 pb-16 sm:py-12 sm:pb-24 lg:py-14 lg:pb-28"
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

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/transparency/sources"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Provenance')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Data Sources')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Complete directory of primary government portals, document origins, and verification links.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('View sources')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/transparency/methodology"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Methodology')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Verification Methodology')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Standards and criteria used for document classification, reconciliation, and audit safeguards.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('Read methodology')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/transparency/full-disclosure"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Transparency')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Full Disclosure Reports')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'DILG Full Disclosure Policy portal documents and statutory compliance reports.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('View reports')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/transparency/documents"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Archive')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Official Documents')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Executive summaries, administrative orders, and verified City documentation.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('Browse documents')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
