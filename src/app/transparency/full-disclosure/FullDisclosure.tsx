'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Search,
  SearchX,
  ShieldCheck,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getFullDisclosureMetadata,
  getFullDisclosureRecords,
  type FullDisclosureRecord,
} from '../../../data/civic/fullDisclosure';

type ReportTypeFilter = 'ALL' | FullDisclosureRecord['report_type'];

const eyebrowTracking = { letterSpacing: '0.08em' };

const selectClass =
  'h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20';

const records = getFullDisclosureRecords();
const metadata = getFullDisclosureMetadata();

const reportTypeOrder: FullDisclosureRecord['report_type'][] = [
  'Annual Procurement Plan',
  'Procurement Monitoring Report',
  'Trust Fund Utilization',
  'Special Education Fund Utilization',
];

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

function periodLabel(record: FullDisclosureRecord): string {
  return record.quarter ? record.quarter : 'Annual';
}

function matchesQuery(record: FullDisclosureRecord, query: string): boolean {
  const normalized = query.toLowerCase();
  return [
    record.title,
    record.report_type,
    record.publishing_agency,
    String(record.reporting_year),
    periodLabel(record),
  ].some(value => value.toLowerCase().includes(normalized));
}

export default function FullDisclosure() {
  const [query, setQuery] = useState('');
  const [reportType, setReportType] = useState<ReportTypeFilter>('ALL');
  const [year, setYear] = useState<'ALL' | number>('ALL');

  const hasFilters = Boolean(
    query.trim() || reportType !== 'ALL' || year !== 'ALL'
  );

  const years = useMemo(
    () =>
      [...new Set(records.map(record => record.reporting_year))].sort(
        (a, b) => b - a
      ),
    []
  );

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim();
    return records.filter(record => {
      const matchesType =
        reportType === 'ALL' || record.report_type === reportType;
      const matchesYear = year === 'ALL' || record.reporting_year === year;
      return (
        matchesType &&
        matchesYear &&
        (!normalizedQuery || matchesQuery(record, normalizedQuery))
      );
    });
  }, [query, reportType, year]);

  const groupedByYear = useMemo(() => {
    const yearsDescending = [
      ...new Set(filteredRecords.map(record => record.reporting_year)),
    ].sort((a, b) => b - a);
    return yearsDescending.map(y => ({
      year: y,
      items: filteredRecords.filter(record => record.reporting_year === y),
    }));
  }, [filteredRecords]);

  function resetFilters() {
    setQuery('');
    setReportType('ALL');
    setYear('ALL');
  }

  return (
    <main className="flex-grow bg-white">
      {/* 1. Editorial Hero & Archive Scope Intro */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Transparency', href: '/transparency' },
              { label: 'Full Disclosure Reports' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                TRANSPARENCY · FULL DISCLOSURE
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl">
                Full Disclosure Reports
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
                Browse individually verified Full Disclosure Policy report
                records, with direct links to each official City page and
                available attachment.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href="#browse-reports"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition hover:bg-[#0052BC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB]"
                >
                  <span>Browse verified reports</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/transparency"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition hover:text-[#0052BC] hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  <span>Transparency overview</span>
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                ARCHIVE SCOPE
              </p>
              <h2 className="mt-1 text-sm font-bold text-gray-950">
                Verified, bounded collection
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                BetterSanFernando currently publishes {metadata.recordCount}{' '}
                individually verified Full Disclosure report records. This is
                not a complete Full Disclosure archive.
              </p>
              <p className="mt-3 border-t border-gray-200/80 pt-2 text-[11px] text-gray-500">
                Independent and community-run. Not an official City Government
                website.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-12 px-4 pb-20 sm:space-y-16 sm:pb-24 lg:pb-28">
        {/* 2. Archive Snapshot */}
        <section aria-labelledby="snapshot-heading" className="pt-8 sm:pt-10">
          <h2 id="snapshot-heading" className="sr-only">
            Archive snapshot
          </h2>
          <dl className="grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 py-6 sm:grid-cols-2 sm:divide-y-0 sm:gap-6 lg:grid-cols-5 lg:gap-0 lg:divide-x lg:py-7">
            <div className="pb-4 sm:pb-0 lg:pr-5">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total reports
              </dt>
              <dd className="mt-2 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                {metadata.recordCount}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Verified report records
              </p>
            </div>

            <div className="py-4 sm:py-0 lg:px-5">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Annual Procurement Plans
              </dt>
              <dd className="mt-2 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                {metadata.reportTypeBreakdown['Annual Procurement Plan'] ?? 0}
              </dd>
              <p className="mt-1 text-xs text-gray-600">APP documents</p>
            </div>

            <div className="py-4 sm:py-0 lg:px-5">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Procurement Monitoring Reports
              </dt>
              <dd className="mt-2 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                {metadata.reportTypeBreakdown[
                  'Procurement Monitoring Report'
                ] ?? 0}
              </dd>
              <p className="mt-1 text-xs text-gray-600">PMR filings</p>
            </div>

            <div className="py-4 sm:py-0 lg:px-5">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Trust Fund Utilization
              </dt>
              <dd className="mt-2 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                {metadata.reportTypeBreakdown['Trust Fund Utilization'] ?? 0}
              </dd>
              <p className="mt-1 text-xs text-gray-600">Quarterly reports</p>
            </div>

            <div className="pt-4 sm:pt-0 lg:pl-5">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                SEF Utilization
              </dt>
              <dd className="mt-2 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                {metadata.reportTypeBreakdown[
                  'Special Education Fund Utilization'
                ] ?? 0}
              </dd>
              <p className="mt-1 text-xs text-gray-600">Quarterly reports</p>
            </div>
          </dl>
          <p className="mt-3 text-xs text-gray-500 sm:text-sm">
            Last verified: {formatDate(metadata.lastVerified)}
          </p>
        </section>

        {/* 3. Collection / Coverage Explanation */}
        <section aria-labelledby="collection-scope-heading">
          <div className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              COLLECTION SCOPE
            </p>
            <h2
              id="collection-scope-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              What this archive contains
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Published here
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  BetterSanFernando publishes metadata for individually verified
                  Full Disclosure Policy report records, accompanied by direct
                  links to each official City Government web page and available
                  official file attachment.
                </p>
              </div>

              <div className="md:border-l md:border-gray-200 md:pl-8">
                <h3 className="text-base font-bold text-gray-950">
                  What is not included
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {metadata.overallPublicLimitation}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Search / Filter Toolbar and Live Counter */}
        <section id="browse-reports" aria-labelledby="browse-reports-heading">
          <div className="mb-3">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              BROWSE REPORTS
            </p>
            <h2 id="browse-reports-heading" className="sr-only">
              Search and filter reports
            </h2>
          </div>

          <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_14rem_10rem_auto] md:items-end">
              <div>
                <label
                  htmlFor="reports-search"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Search reports
                </label>
                <div className="relative mt-1.5">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="reports-search"
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Search title, report type, agency, year, or period..."
                    className="h-10 w-full rounded-sm border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="report-type-select"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Report type
                </label>
                <div className="mt-1.5">
                  <select
                    id="report-type-select"
                    value={reportType}
                    onChange={event =>
                      setReportType(event.target.value as ReportTypeFilter)
                    }
                    className={selectClass}
                  >
                    <option value="ALL">All types</option>
                    {reportTypeOrder.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="year-select"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Year
                </label>
                <div className="mt-1.5">
                  <select
                    id="year-select"
                    value={year}
                    onChange={event =>
                      setYear(
                        event.target.value === 'ALL'
                          ? 'ALL'
                          : Number(event.target.value)
                      )
                    }
                    className={selectClass}
                  >
                    <option value="ALL">All years</option>
                    {years.map(y => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasFilters}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-4 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB] disabled:cursor-not-allowed disabled:opacity-45 md:w-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-600 sm:text-sm" aria-live="polite">
              Showing {filteredRecords.length} of {metadata.recordCount}{' '}
              verified records
            </p>
          </div>
        </section>

        {/* 5. Report Archive Grouped by Year */}
        <section aria-labelledby="archive-list-heading">
          <h2 id="archive-list-heading" className="sr-only">
            Full Disclosure reports list
          </h2>

          {groupedByYear.length === 0 ? (
            <div className="rounded-sm border border-dashed border-gray-300 bg-white p-8 text-center sm:p-12">
              <SearchX
                className="mx-auto h-8 w-8 text-gray-400"
                aria-hidden="true"
              />
              <p className="mt-2 text-base font-semibold text-gray-950">
                No reports match these filters
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Try a different search term or reset the filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-10 sm:space-y-12">
              {groupedByYear.map(group => (
                <div key={group.year}>
                  {/* Year Header */}
                  <div className="flex items-baseline justify-between border-b border-gray-200 pb-2.5">
                    <h3 className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
                      {group.year}
                    </h3>
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gray-500 sm:text-sm">
                      {group.items.length}{' '}
                      {group.items.length === 1 ? 'record' : 'records'}
                    </span>
                  </div>

                  {/* Reports in Year */}
                  <ol className="divide-y divide-gray-200 border-b border-gray-200 bg-white sm:border-x sm:rounded-sm">
                    {group.items.map(record => (
                      <li
                        key={record.id}
                        className="p-5 transition-colors hover:bg-[#F3F6FB]/50 sm:p-6"
                      >
                        <article aria-labelledby={`${record.id}-title`}>
                          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
                            {/* Main Report Content */}
                            <div className="min-w-0">
                              {/* Top row: Report type + Period + Verified badge */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                <span className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700">
                                  {record.report_type} · {periodLabel(record)}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-xs bg-[#F3F6FB] px-2 py-0.5 text-xs font-medium text-emerald-800">
                                  <ShieldCheck
                                    className="h-3.5 w-3.5 text-emerald-600"
                                    aria-hidden="true"
                                  />
                                  Verified
                                </span>
                              </div>

                              {/* Title */}
                              <h4
                                id={`${record.id}-title`}
                                className="mt-2 text-base font-bold leading-snug text-gray-950 sm:text-lg"
                              >
                                {record.title}
                              </h4>

                              {/* Publishing Agency */}
                              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                                {record.publishing_agency}
                              </p>

                              {/* Structured Metadata */}
                              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs sm:text-sm">
                                <div>
                                  <dt className="text-gray-500">File type</dt>
                                  <dd className="font-medium text-gray-900">
                                    {record.file_type}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-gray-500">Verified</dt>
                                  <dd className="font-medium text-gray-900">
                                    {formatDate(record.verification_date)}
                                  </dd>
                                </div>
                              </dl>
                            </div>

                            {/* Right Rail: Source & File */}
                            <div className="border-t border-gray-200 pt-4 text-xs sm:text-sm lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                SOURCE &amp; FILE
                              </p>
                              <p className="mt-1.5 text-gray-700">
                                Official City page
                              </p>
                              <p className="mt-0.5 text-gray-600">
                                {record.official_attachment_url
                                  ? `${record.file_type} attachment available`
                                  : 'No direct attachment published'}
                              </p>

                              <div className="mt-3.5 flex flex-col items-start gap-2 font-semibold">
                                <a
                                  href={record.official_page_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Open the official page for ${record.title} (opens in a new tab)`}
                                  className="inline-flex items-center gap-1 text-[#0066EB] hover:text-[#0052BC] hover:underline"
                                >
                                  View official page
                                  <ExternalLink
                                    className="h-3.5 w-3.5 shrink-0"
                                    aria-hidden="true"
                                  />
                                </a>
                                {record.official_attachment_url && (
                                  <a
                                    href={record.official_attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Open the official ${record.file_type} attachment for ${record.title} on the City Government's website (opens in a new tab)`}
                                    className="inline-flex items-center gap-1 text-[#0066EB] hover:text-[#0052BC] hover:underline"
                                  >
                                    Open {record.file_type} attachment
                                    <ExternalLink
                                      className="h-3.5 w-3.5 shrink-0"
                                      aria-hidden="true"
                                    />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. Understanding This Archive */}
        <section
          aria-labelledby="understanding-archive-heading"
          className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            COVERAGE &amp; VERIFICATION
          </p>
          <h2
            id="understanding-archive-heading"
            className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
          >
            Understanding this archive
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-3 md:gap-8">
            <div>
              <h3 className="text-base font-bold text-gray-950">
                Verification
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Each published record has been individually verified and
                directly tied to an official City Government webpage and/or
                official file attachment.
              </p>
            </div>

            <div className="md:border-l md:border-gray-200 md:pl-8">
              <h3 className="text-base font-bold text-gray-950">Coverage</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                The current {metadata.recordCount}-record collection is bounded
                and represents verified public records. It is not presented as
                the complete Full Disclosure archive.
              </p>
            </div>

            <div className="md:border-l md:border-gray-200 md:pl-8">
              <h3 className="text-base font-bold text-gray-950">
                Document contents
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                This page publishes verified report metadata and direct links to
                official sources. It does not extract, calculate, aggregate, or
                summarize financial figures from within the attached documents.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Keep Exploring */}
        <section aria-labelledby="keep-exploring-heading">
          <div className="border-t border-gray-200 pt-10 sm:pt-12">
            <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
              KEEP EXPLORING
            </p>
            <h2
              id="keep-exploring-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Related transparency resources
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/transparency"
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                    Transparency overview
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    City transparency portal, disclosure policies, and public
                    information.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>Browse overview</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              <Link
                href="/transparency/finance"
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                    City Finances
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Verified municipal budget, expenditure, and fund utilization
                    summaries.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>Browse finances</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              <Link
                href="/statistics/public-records"
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                    Public Records Statistics
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Metrics, coverage depth, and verification rates across
                    public archives.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>View statistics</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              <Link
                href="/transparency/sources"
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                    Data Sources
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Full registry of official City web origins, portals, and
                    gazettes.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>Explore sources</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
