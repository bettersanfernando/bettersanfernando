import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  RotateCcw,
  Search,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getFinanceMetadata,
  getFinanceObservations,
  getFinanceReports,
  type FinanceObservation,
  type FinanceReport,
} from '../data/civic/finance';
import {
  formatIsoDate,
  formatUnstatedAmount,
  titleCaseEnum,
} from '../lib/utils';

const reports = getFinanceReports();
const observations = getFinanceObservations();
const metadata = getFinanceMetadata();

function findObservation(
  reportId: string,
  valueBasis: FinanceObservation['value_basis']
): FinanceObservation | undefined {
  return observations.find(
    observation =>
      observation.report_id === reportId &&
      observation.value_basis === valueBasis
  );
}

function periodLabel(report: FinanceReport): string {
  if (report.period_type === 'point_in_time') {
    return report.as_of_date
      ? formatIsoDate(report.as_of_date)
      : `${report.reporting_year}`;
  }
  return report.quarter
    ? `${report.reporting_year} Q${report.quarter}`
    : `${report.reporting_year}`;
}

function sortByPeriod<T extends { report: FinanceReport }>(list: T[]): T[] {
  return [...list].sort(
    (a, b) =>
      a.report.reporting_year - b.report.reporting_year ||
      (a.report.quarter ?? 0) - (b.report.quarter ?? 0) ||
      (a.report.as_of_date ?? '').localeCompare(b.report.as_of_date ?? '')
  );
}

// Receipts vs. expenditures compared only within the SAME report (same
// fund, period, and accounting basis) — never across reports.
const receiptsVsExpenditures = sortByPeriod(
  reports
    .filter(
      report => report.report_type === 'statement_of_receipts_and_expenditures'
    )
    .map(report => ({
      report,
      receipt: findObservation(report.id, 'receipt'),
      expenditure: findObservation(report.id, 'expenditure'),
    }))
    .filter(
      (
        entry
      ): entry is typeof entry & {
        receipt: FinanceObservation;
        expenditure: FinanceObservation;
      } => Boolean(entry.receipt && entry.expenditure)
    )
);

const authorizedBudget = sortByPeriod(
  reports
    .filter(report => report.report_type === 'annual_budget')
    .map(report => ({
      report,
      authorized: findObservation(report.id, 'authorized_budget'),
      appropriation: findObservation(report.id, 'appropriation'),
    }))
    .filter(entry => entry.authorized || entry.appropriation)
);

const endingCashBalance = sortByPeriod(
  reports
    .filter(report => report.report_type === 'statement_of_cash_flows')
    .map(report => ({
      report,
      endingBalance: findObservation(report.id, 'ending_balance'),
    }))
    .filter(
      (entry): entry is typeof entry & { endingBalance: FinanceObservation } =>
        Boolean(entry.endingBalance)
    )
);

const outstandingDebt = sortByPeriod(
  reports
    .filter(
      report =>
        report.report_type === 'statement_of_indebtedness_payments_and_balances'
    )
    .map(report => ({
      report,
      debt: findObservation(report.id, 'outstanding_debt'),
    }))
    .filter((entry): entry is typeof entry & { debt: FinanceObservation } =>
      Boolean(entry.debt)
    )
);

const sefUtilization = sortByPeriod(
  reports
    .filter(report => report.report_type === 'sef_utilization')
    .map(report => ({
      report,
      receipt: findObservation(report.id, 'receipt'),
      disbursement: findObservation(report.id, 'disbursement'),
      endingBalance: findObservation(report.id, 'ending_balance'),
    }))
    .filter(entry => entry.receipt || entry.disbursement)
);

function derivePercent(
  numerator: FinanceObservation | undefined,
  denominator: FinanceObservation | undefined
): number | null {
  if (!numerator || !denominator || denominator.amount <= 0) return null;
  return Math.round((numerator.amount / denominator.amount) * 1000) / 10;
}

const ldrrmfUtilization = sortByPeriod(
  reports
    .filter(report => report.report_type === 'ldrrmf_utilization')
    .map(report => {
      const appropriation = findObservation(report.id, 'appropriation');
      const utilization = findObservation(report.id, 'utilization');
      return {
        report,
        appropriation,
        utilization,
        percent: derivePercent(utilization, appropriation),
      };
    })
    .filter(entry => entry.percent !== null)
);

const ntaIraUtilization = sortByPeriod(
  reports
    .filter(report => report.report_type === 'nta_ira_utilization')
    .map(report => {
      const appropriation = findObservation(report.id, 'appropriation');
      const utilization = findObservation(report.id, 'utilization');
      return {
        report,
        appropriation,
        utilization,
        percent: derivePercent(utilization, appropriation),
      };
    })
    .filter(entry => entry.percent !== null)
);

function AmountBar({
  label,
  amount,
  maxAmount,
  colorClassName,
}: {
  label: string;
  amount: number;
  maxAmount: number;
  colorClassName: string;
}) {
  const width = maxAmount > 0 ? Math.min(100, (amount / maxAmount) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="font-bold tabular-nums text-gray-900">
          {formatUnstatedAmount(amount)}
        </span>
      </div>
      <div
        className="mt-1 h-2.5 overflow-hidden rounded-full bg-gray-200"
        role="img"
        aria-label={`${label}: ${formatUnstatedAmount(amount)}, unit not stated in source`}
      >
        <div
          className={`h-full rounded-full ${colorClassName}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function PercentBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="font-bold tabular-nums text-gray-900">{value}%</span>
      </div>
      <div
        className="mt-1 h-2.5 overflow-hidden rounded-full bg-gray-200"
        role="img"
        aria-label={`${label}: ${value} percent`}
      >
        <div
          className="h-full rounded-full bg-primary-600"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function ChartEmptyState() {
  return (
    <p className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-600">
      Not available for this report family.
    </p>
  );
}

function sourceLink(report: FinanceReport): {
  url: string;
  kind: 'page' | 'attachment';
} {
  return { url: report.official_page_url, kind: 'page' };
}

type ReportTypeFilter = 'ALL' | FinanceReport['report_type'];
type YearFilter = 'ALL' | number;
const REPORTS_PER_PAGE = 10;

export default function CityFinances() {
  const [query, setQuery] = useState('');
  const [reportType, setReportType] = useState<ReportTypeFilter>('ALL');
  const [year, setYear] = useState<YearFilter>('ALL');
  const [page, setPage] = useState(1);

  const years = useMemo(
    () =>
      [...new Set(reports.map(report => report.reporting_year))].sort(
        (a, b) => b - a
      ),
    []
  );
  const reportTypes = useMemo(
    () => [...new Set(reports.map(report => report.report_type))],
    []
  );

  const hasFilters = Boolean(
    query.trim() || reportType !== 'ALL' || year !== 'ALL'
  );

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reports.filter(report => {
      const matchesType =
        reportType === 'ALL' || report.report_type === reportType;
      const matchesYear = year === 'ALL' || report.reporting_year === year;
      const matchesQuery =
        !normalizedQuery ||
        report.report_title_exact.toLowerCase().includes(normalizedQuery) ||
        (report.fund_name_exact ?? '')
          .toLowerCase()
          .includes(normalizedQuery) ||
        titleCaseEnum(report.report_type)
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesType && matchesYear && matchesQuery;
    });
  }, [query, reportType, year]);

  function resetFilters() {
    setQuery('');
    setReportType('ALL');
    setYear('ALL');
    setPage(1);
  }

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReports.length / REPORTS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);
  const pagedReports = filteredReports.slice(
    (currentPage - 1) * REPORTS_PER_PAGE,
    currentPage * REPORTS_PER_PAGE
  );

  return (
    <>
      <SEO
        title="City Finances"
        description="Verified, source-reported official aggregate finance reports for the City of San Fernando, Pampanga, with safe comparisons only where funds, periods, and accounting bases match."
        keywords="San Fernando Pampanga city finances, finance reports, SRE, LDRRMF, SEF utilization, 20% NTA IRA utilization"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/transparency/finance`}
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
                { label: 'City Finances' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  City Finances
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Selected official aggregate finance reports and their
                  source-reported observations — not audited financial
                  statements or complete City financial history.
                </p>
              </div>
              <aside className="rounded-xl bg-warning-50 p-5 text-sm leading-relaxed text-warning-900">
                <p className="font-semibold">Verified partial coverage</p>
                <p className="mt-1">
                  {metadata.reportCount} reports and {metadata.observationCount}{' '}
                  observations. Funds, periods, and accounting bases are never
                  combined unless they match.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid grid-cols-2 border-y border-gray-200 lg:grid-cols-4">
              {[
                ['Reports', metadata.reportCount],
                ['Observations', metadata.observationCount],
                ['Report families', reportTypes.length],
                [
                  'Reporting years',
                  `${Math.min(...years)}–${Math.max(...years)}`,
                ],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`p-4 sm:p-5 ${index % 2 === 1 ? 'border-l border-gray-200' : ''} ${index > 1 ? 'border-t border-gray-200 lg:border-t-0' : ''} ${index > 0 ? 'lg:border-l lg:border-gray-200' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-600">{label}</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-900 lg:text-3xl">
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
            <div>
              <p>{metadata.overallPublicLimitation}</p>
              <p className="mt-2 font-semibold">Never combined or compared:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {metadata.prohibitedComparisons.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          className="border-y border-gray-200 bg-white"
          aria-labelledby="charts-heading"
        >
          <div className="container mx-auto px-4 py-10 md:py-12">
            <h2
              id="charts-heading"
              className="text-2xl font-bold text-gray-900"
            >
              Safe comparisons
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
              Every comparison below stays within one compatible fund, period,
              and accounting basis. Amounts have no stated currency or unit in
              the source documents, so they are shown as plain numbers, never as
              PHP or peso figures.
            </p>

            <div className="mt-7 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="font-bold text-gray-900">
                  Receipts vs. expenditures (SRE, same report only)
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Cumulative year-to-date figures per quarter — never summed
                  across quarters.
                </p>
                {receiptsVsExpenditures.length === 0 ? (
                  <div className="mt-4">
                    <ChartEmptyState />
                  </div>
                ) : (
                  <div className="mt-4 space-y-5">
                    {receiptsVsExpenditures.map(entry => {
                      const max = Math.max(
                        entry.receipt.amount,
                        entry.expenditure.amount
                      );
                      return (
                        <div key={entry.report.id}>
                          <p className="text-xs font-semibold text-gray-600">
                            {periodLabel(entry.report)}
                            {entry.report.is_cumulative
                              ? ' (cumulative YTD)'
                              : ''}
                          </p>
                          <div className="mt-1.5 space-y-2">
                            <AmountBar
                              label="Receipts"
                              amount={entry.receipt.amount}
                              maxAmount={max}
                              colorClassName="bg-success-600"
                            />
                            <AmountBar
                              label="Expenditures"
                              amount={entry.expenditure.amount}
                              maxAmount={max}
                              colorClassName="bg-primary-600"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="font-bold text-gray-900">
                  Authorized budget (annual, General Fund)
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Budget authority, not actual receipts or spending.
                </p>
                {authorizedBudget.length === 0 ? (
                  <div className="mt-4">
                    <ChartEmptyState />
                  </div>
                ) : (
                  <div className="mt-4 space-y-5">
                    {authorizedBudget.map(entry => {
                      const max = Math.max(
                        entry.authorized?.amount ?? 0,
                        entry.appropriation?.amount ?? 0
                      );
                      return (
                        <div key={entry.report.id}>
                          <p className="text-xs font-semibold text-gray-600">
                            {periodLabel(entry.report)}
                          </p>
                          <div className="mt-1.5 space-y-2">
                            {entry.authorized && (
                              <AmountBar
                                label="Authorized receipts (proposed)"
                                amount={entry.authorized.amount}
                                maxAmount={max}
                                colorClassName="bg-success-600"
                              />
                            )}
                            {entry.appropriation && (
                              <AmountBar
                                label="Authorized expenditures (proposed)"
                                amount={entry.appropriation.amount}
                                maxAmount={max}
                                colorClassName="bg-primary-600"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="font-bold text-gray-900">
                  Ending cash balance (General Fund)
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Each period&apos;s own reported balance — not a running or
                  connected total.
                </p>
                {endingCashBalance.length === 0 ? (
                  <div className="mt-4">
                    <ChartEmptyState />
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {endingCashBalance.map(entry => (
                      <AmountBar
                        key={entry.report.id}
                        label={periodLabel(entry.report)}
                        amount={entry.endingBalance.amount}
                        maxAmount={Math.max(
                          ...endingCashBalance.map(
                            item => item.endingBalance.amount
                          )
                        )}
                        colorClassName="bg-primary-600"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="font-bold text-gray-900">
                  Outstanding debt (Citywide debt, point-in-time)
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Snapshots as of each reported date — never summed.
                </p>
                {outstandingDebt.length === 0 ? (
                  <div className="mt-4">
                    <ChartEmptyState />
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {outstandingDebt.map(entry => (
                      <AmountBar
                        key={entry.report.id}
                        label={
                          entry.report.as_of_date
                            ? formatIsoDate(entry.report.as_of_date)
                            : periodLabel(entry.report)
                        }
                        amount={entry.debt.amount}
                        maxAmount={Math.max(
                          ...outstandingDebt.map(item => item.debt.amount)
                        )}
                        colorClassName="bg-error-600"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="font-bold text-gray-900">
                  SEF utilization (Special Education Fund)
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Receipts and disbursements per quarter — not additive across
                  quarters.
                </p>
                {sefUtilization.length === 0 ? (
                  <div className="mt-4">
                    <ChartEmptyState />
                  </div>
                ) : (
                  <div className="mt-4 space-y-5">
                    {sefUtilization.map(entry => {
                      const max = Math.max(
                        entry.receipt?.amount ?? 0,
                        entry.disbursement?.amount ?? 0
                      );
                      return (
                        <div key={entry.report.id}>
                          <p className="text-xs font-semibold text-gray-600">
                            {periodLabel(entry.report)}
                          </p>
                          <div className="mt-1.5 space-y-2">
                            {entry.receipt && (
                              <AmountBar
                                label="Receipts"
                                amount={entry.receipt.amount}
                                maxAmount={max}
                                colorClassName="bg-success-600"
                              />
                            )}
                            {entry.disbursement && (
                              <AmountBar
                                label="Disbursements"
                                amount={entry.disbursement.amount}
                                maxAmount={max}
                                colorClassName="bg-primary-600"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="font-bold text-gray-900">
                  LDRRMF and 20% NTA/IRA utilization
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Utilization derived as a percent within the same report only.
                </p>
                {ldrrmfUtilization.length === 0 &&
                ntaIraUtilization.length === 0 ? (
                  <div className="mt-4">
                    <ChartEmptyState />
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {ldrrmfUtilization.map(entry => (
                      <PercentBar
                        key={entry.report.id}
                        label={`LDRRMF · ${periodLabel(entry.report)}`}
                        value={entry.percent as number}
                      />
                    ))}
                    {ntaIraUtilization.map(entry => (
                      <PercentBar
                        key={entry.report.id}
                        label={`20% NTA/IRA · ${periodLabel(entry.report)}`}
                        value={entry.percent as number}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-10 md:py-12"
          aria-labelledby="catalog-heading"
        >
          <h2 id="catalog-heading" className="text-2xl font-bold text-gray-900">
            Official report catalog
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
            All {metadata.reportCount} verified reports, filterable and
            paginated, each linking to its official City Government source.
          </p>

          <div className="mt-5 grid gap-4 rounded-xl bg-primary-900 p-4 text-white md:grid-cols-[minmax(15rem,1fr)_12rem_10rem_auto] md:items-end md:p-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary-50">
                Search title or fund
              </span>
              <span className="relative block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={event => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. SEF, LDRRMF, cash flow"
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
                onChange={event => {
                  setReportType(event.target.value as ReportTypeFilter);
                  setPage(1);
                }}
                className="min-h-11 w-full rounded-lg border border-primary-700 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              >
                <option value="ALL">All types</option>
                {reportTypes.map(type => (
                  <option key={type} value={type}>
                    {titleCaseEnum(type)}
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
                onChange={event => {
                  setYear(
                    event.target.value === 'ALL'
                      ? 'ALL'
                      : Number(event.target.value)
                  );
                  setPage(1);
                }}
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
            Showing {filteredReports.length} of {metadata.reportCount} reports
          </p>

          {filteredReports.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
              <p className="font-medium text-gray-900">
                No report matches these filters
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Try a different search term or reset the filters.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
                <thead className="bg-gray-50 text-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Report
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Fund
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Period
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      File
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pagedReports.map(report => {
                    const { url } = sourceLink(report);
                    return (
                      <tr key={report.id}>
                        <td className="max-w-[18rem] px-4 py-3 font-semibold text-gray-900">
                          {report.report_title_exact}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {titleCaseEnum(report.report_type)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {report.fund_name_exact ??
                            titleCaseEnum(report.fund_type)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {periodLabel(report)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {report.file_type}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Open the official page for ${report.report_title_exact} (opens in a new tab)`}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                            >
                              <FileText
                                className="h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                              />
                              Page
                              <ExternalLink
                                className="h-3 w-3 shrink-0"
                                aria-hidden="true"
                              />
                            </a>
                            <a
                              href={report.official_attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Open the official ${report.file_type} attachment for ${report.report_title_exact} (opens in a new tab)`}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-gray-900"
                            >
                              <FileText
                                className="h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                              />
                              {report.file_type}
                              <ExternalLink
                                className="h-3 w-3 shrink-0"
                                aria-hidden="true"
                              />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredReports.length > 0 && totalPages > 1 && (
            <nav
              className="mt-4 flex items-center justify-between gap-3"
              aria-label="Official report catalog pagination"
            >
              <button
                type="button"
                onClick={() => setPage(current => Math.max(1, current - 1))}
                disabled={currentPage <= 1}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700" aria-hidden="true">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage(current => Math.min(totalPages, current + 1))
                }
                disabled={currentPage >= totalPages}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Next
              </button>
            </nav>
          )}
        </section>

        <section className="container mx-auto px-4 pb-10 md:pb-14">
          <h2 className="text-lg font-bold text-gray-900">
            Methodology and limitations
          </h2>
          <div className="mt-3 max-w-3xl space-y-2 text-sm leading-6 text-gray-700">
            <p>
              These reports are selected official aggregates, not audited
              financial statements or a complete City financial history. Every
              figure retains the accounting concept, fund, period, and
              cumulative treatment of its source document.
            </p>
            <p>
              Currency and unit are not stated in the source documents, so
              amounts are shown as plain numbers only — never assumed to be PHP,
              pesos, thousands, or millions. Cumulative year-to-date quarters
              are never summed into an annual or citywide total, and City
              Finances is never combined with the separate 298
              project-utilization observations published under Project Cost
              &amp; Utilization.
            </p>
            <p>{metadata.privacyBoundary}</p>
          </div>
          <p className="mt-5 text-sm">
            <a
              href="/statistics/project-spending"
              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            >
              View Project Cost &amp; Utilization
            </a>
            {' · '}
            <a
              href="/transparency/full-disclosure"
              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            >
              View Full Disclosure Reports
            </a>
          </p>
        </section>
      </main>
    </>
  );
}
