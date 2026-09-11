import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  Paperclip,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getFullDisclosureMetadata,
  getFullDisclosureRecords,
  type FullDisclosureRecord,
} from '../data/civic/fullDisclosure';

type ReportTypeFilter = 'ALL' | FullDisclosureRecord['report_type'];

const records = getFullDisclosureRecords();
const metadata = getFullDisclosureMetadata();

const reportTypeOrder: FullDisclosureRecord['report_type'][] = [
  'Annual Procurement Plan',
  'Procurement Monitoring Report',
  'Trust Fund Utilization',
  'Special Education Fund Utilization',
];

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

function ReportCard({ record }: { record: FullDisclosureRecord }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-[0_8px_28px_rgba(0,41,94,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-800">
              {record.report_type}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
              {periodLabel(record)}
            </span>
          </div>
          <h3 className="mt-1.5 font-bold text-gray-900">{record.title}</h3>
          <p className="mt-0.5 text-sm text-gray-700">
            {record.publishing_agency}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-2.5 py-1 text-xs font-bold text-success-900">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Verified accessible
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 sm:grid-cols-3">
        <div>
          <dt className="font-semibold text-gray-500">File type</dt>
          <dd>{record.file_type}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-500">Verified</dt>
          <dd>{record.verification_date}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={record.official_page_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open the official page for ${record.title} (opens in a new tab)`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800 underline-offset-4 hover:underline"
        >
          <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
          Official page
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </a>
        {record.official_attachment_url && (
          <a
            href={record.official_attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open the official ${record.file_type} attachment for ${record.title} on the City Government's website (opens in a new tab)`}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 underline-offset-4 hover:underline"
          >
            <Paperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
            Official {record.file_type} attachment
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
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
    <>
      <SEO
        title="Full Disclosure Reports"
        description="Verified Full Disclosure Policy report metadata — Annual Procurement Plans, Procurement Monitoring Reports, and Trust Fund and Special Education Fund utilization reports — for the City Government of San Fernando, Pampanga."
        keywords="San Fernando Pampanga full disclosure policy, annual procurement plan, procurement monitoring report, trust fund utilization, special education fund"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/transparency/full-disclosure`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Transparency', href: '/transparency' },
                { label: 'Full Disclosure Reports' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <FileText className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Full Disclosure Reports
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Individually verified Full Disclosure Policy report metadata,
                  with links to each report's official City Government page and
                  file.
                </p>
              </div>
              <aside className="rounded-xl bg-warning-50 p-5 text-sm leading-relaxed text-warning-900">
                <p className="font-semibold">Verified partial collection</p>
                <p className="mt-1">
                  This is not the complete Full Disclosure archive — it is a
                  bounded set of {metadata.recordCount} individually verified
                  report records.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid grid-cols-2 border-y border-gray-200 lg:grid-cols-5">
              {[
                ['Total reports', metadata.recordCount],
                [
                  'Annual Procurement Plans',
                  metadata.reportTypeBreakdown['Annual Procurement Plan'] ?? 0,
                ],
                [
                  'Procurement Monitoring Reports',
                  metadata.reportTypeBreakdown[
                    'Procurement Monitoring Report'
                  ] ?? 0,
                ],
                [
                  'Trust Fund Utilization',
                  metadata.reportTypeBreakdown['Trust Fund Utilization'] ?? 0,
                ],
                [
                  'SEF Utilization',
                  metadata.reportTypeBreakdown[
                    'Special Education Fund Utilization'
                  ] ?? 0,
                ],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`p-4 sm:p-5 ${index % 2 === 1 ? 'border-l border-gray-200' : ''} ${index > 1 ? 'border-t border-gray-200 lg:border-t-0' : ''} ${index > 0 ? 'lg:border-l lg:border-gray-200' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-600">{label}</dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-10">
          <div
            className="flex items-start gap-3 rounded-xl bg-warning-50 p-5 text-sm leading-6 text-warning-900"
            role="note"
          >
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <p>{metadata.overallPublicLimitation}</p>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-8 md:pb-10">
          <div className="grid gap-4 rounded-xl bg-primary-900 p-4 text-white shadow-[0_8px_28px_rgba(0,41,94,0.14)] md:grid-cols-[minmax(15rem,1fr)_12rem_10rem_auto] md:items-end md:p-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary-50">
                Search title, report type, agency, year, or period
              </span>
              <span className="relative block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="e.g. APP 2026, BAC, or Q2"
                  className="min-h-11 w-full rounded-lg border border-primary-700 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary-50">
                Report type
              </span>
              <select
                value={reportType}
                onChange={event =>
                  setReportType(event.target.value as ReportTypeFilter)
                }
                className="min-h-11 w-full rounded-lg border border-primary-700 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              >
                <option value="ALL">All types</option>
                {reportTypeOrder.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary-50">
                Year
              </span>
              <select
                value={year}
                onChange={event =>
                  setYear(
                    event.target.value === 'ALL'
                      ? 'ALL'
                      : Number(event.target.value)
                  )
                }
                className="min-h-11 w-full rounded-lg border border-primary-700 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              >
                <option value="ALL">All years</option>
                {years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilters}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <p
            className="mt-4 text-sm font-semibold text-gray-800"
            aria-live="polite"
          >
            Showing {filteredRecords.length} of {metadata.recordCount} reports
          </p>

          {groupedByYear.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
              <p className="font-medium text-gray-900">
                No report matches these filters
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Try a different search term or reset the filters.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-10">
              {groupedByYear.map(group => (
                <div key={group.year}>
                  <h2 className="mb-3 text-xl font-bold text-gray-900">
                    {group.year}{' '}
                    <span className="text-base font-normal text-gray-600">
                      ({group.items.length})
                    </span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {group.items.map(record => (
                      <ReportCard key={record.id} record={record} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
