'use client';

import { useMemo, useState } from 'react';
import Link from '../../../components/i18n/LocaleLink';
import {
  ArrowDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  RotateCcw,
  Search,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getFinanceMetadata,
  getFinanceObservations,
  getFinanceReports,
  type FinanceObservation,
  type FinanceReport,
} from '../../../data/civic/finance';
import {
  formatIsoDate,
  formatUnstatedAmount,
  titleCaseEnum,
} from '../../../lib/utils';
import type { PageT } from '../../../i18n/page-t';
import { usePageT } from '../../../components/i18n/PageMessages';

const reports = getFinanceReports();
const observations = getFinanceObservations();
const metadata = getFinanceMetadata();

// Curated public-facing report type display labels
const REPORT_TYPE_LABELS = (
  t: PageT
): Record<FinanceReport['report_type'], string> => ({
  annual_budget: t('Annual Budget'),
  statement_of_receipts_and_expenditures: t(
    'Statement of Receipts and Expenditures'
  ),
  statement_of_cash_flows: t('Statement of Cash Flows'),
  statement_of_indebtedness_payments_and_balances: t(
    'Statement of Indebtedness, Payments and Balances'
  ),
  nta_ira_utilization: t('20% NTA/IRA Utilization'),
  ldrrmf_utilization: t('LDRRMF Utilization'),
  sef_utilization: t('SEF Utilization'),
  trust_fund_utilization: t('Trust Fund Utilization'),
  unliquidated_cash_advances: t('Unliquidated Cash Advances'),
  statement_of_financial_performance: t('Statement of Financial Performance'),
});

function formatReportType(
  type: FinanceReport['report_type'],
  t: PageT
): string {
  return REPORT_TYPE_LABELS(t)[type] ?? titleCaseEnum(type);
}

// Curated public-facing fund display labels
const FUND_TYPE_LABELS = (
  t: PageT
): Record<FinanceReport['fund_type'], string> => ({
  general_fund: t('General Fund'),
  general_fund_and_sef: t('General Fund / Special Education Fund'),
  citywide_debt: t('Citywide Debt'),
  '20_percent_nta_ira': t(
    '20% National Tax Allotment / Internal Revenue Allotment'
  ),
  ldrrmf: 'LDRRMF',
  special_education_fund: t('Special Education Fund'),
  trust_fund: t('Trust Fund'),
  source_stated_fund: t('Source-Stated Fund'),
});

function formatFundDisplay(report: FinanceReport, t: PageT): string {
  if (report.fund_type === 'citywide_debt') {
    return t('Citywide Debt');
  }
  if (report.fund_type === 'ldrrmf') {
    return 'LDRRMF';
  }
  if (report.fund_name_exact) {
    return report.fund_name_exact;
  }
  return (
    FUND_TYPE_LABELS(t)[report.fund_type] ?? titleCaseEnum(report.fund_type)
  );
}

function formatProhibitedComparison(item: string, t: PageT): string {
  const lower = item.toLowerCase();
  if (lower.includes('generic') && lower.includes('total')) {
    return t('Generic City spending total');
  }
  if (lower.startsWith('budgets plus')) {
    return t('Budgets plus obligations, disbursements, or expenditures');
  }
  if (lower.startsWith('different funds')) {
    return t('Different funds combined');
  }
  if (lower.startsWith('cumulative quarterly')) {
    return t('Cumulative quarterly reports summed');
  }
  if (lower.startsWith('audited and unaudited')) {
    return t('Audited and unaudited figures mixed');
  }
  if (lower.includes('project') && lower.includes('contracts')) {
    return t('Project ABC/contracts combined with aggregate finance');
  }
  if (lower.includes('incompatible or unstated')) {
    return t('Values with incompatible or unstated units compared');
  }
  return item.charAt(0).toUpperCase() + item.slice(1);
}

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
    .filter(entry => entry.receipt && entry.disbursement)
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
    .filter(
      (entry): entry is typeof entry & { percent: number } =>
        entry.percent !== null
    )
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
    .filter(
      (entry): entry is typeof entry & { percent: number } =>
        entry.percent !== null
    )
);

function sourceLink(report: FinanceReport): {
  url: string;
  kind: 'page' | 'attachment';
} {
  return { url: report.official_page_url, kind: 'page' };
}

// ---------------------------------------------------------------------------
// Chart Component: Receipts vs. Expenditures (2-Column on Desktop / 1-Col Mobile)
// ---------------------------------------------------------------------------
function ReceiptsVsExpendituresSection() {
  const t = usePageT();
  return (
    <article className="rounded-sm border border-gray-200 bg-white p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-950">
            {t('Receipts vs. Expenditures')}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              'Statement of Receipts and Expenditures · compatible report pairs only'
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span
              className="h-3 w-3 rounded-sm bg-[#0066EB]"
              aria-hidden="true"
            />
            {t('Receipts')}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span
              className="h-3 w-3 rounded-sm bg-slate-500"
              aria-hidden="true"
            />
            {t('Expenditures')}
          </span>
          <span className="rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-600">
            {t('Source-reported amount · unit not stated')}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {receiptsVsExpenditures.map(entry => {
          const max = Math.max(entry.receipt.amount, entry.expenditure.amount);
          const receiptPct = max > 0 ? (entry.receipt.amount / max) * 100 : 0;
          const expendPct =
            max > 0 ? (entry.expenditure.amount / max) * 100 : 0;

          return (
            <div
              key={entry.report.id}
              className="rounded-sm border border-gray-100 bg-[#F9FAFB] p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-1.5 border-b border-gray-200/70 pb-3">
                <span className="text-sm font-semibold text-gray-950">
                  {periodLabel(entry.report)}
                  {entry.report.is_cumulative && (
                    <span className="ml-1.5 inline-block font-normal text-gray-500">
                      {t('(cumulative YTD)')}
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-gray-500">
                  {t('Compare within this report only')}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {/* Receipts */}
                <div>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-semibold text-gray-700">
                      {t('Receipts')}
                    </span>
                    <span className="font-bold tabular-nums text-gray-950">
                      {formatUnstatedAmount(entry.receipt.amount)}
                    </span>
                  </div>
                  <div
                    className="mt-1 h-3 w-full overflow-hidden rounded-sm bg-gray-200"
                    role="img"
                    aria-label={t(
                      'Receipts for {{report}}: {{amount}}, unit not stated',
                      {
                        report: periodLabel(entry.report),
                        amount: formatUnstatedAmount(entry.receipt.amount),
                      }
                    )}
                  >
                    <div
                      className="h-full rounded-sm bg-[#0066EB]"
                      style={{ width: `${receiptPct}%` }}
                    />
                  </div>
                </div>

                {/* Expenditures */}
                <div>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-semibold text-gray-700">
                      {t('Expenditures')}
                    </span>
                    <span className="font-bold tabular-nums text-gray-950">
                      {formatUnstatedAmount(entry.expenditure.amount)}
                    </span>
                  </div>
                  <div
                    className="mt-1 h-3 w-full overflow-hidden rounded-sm bg-gray-200"
                    role="img"
                    aria-label={t(
                      'Expenditures for {{report}}: {{amount}}, unit not stated',
                      {
                        report: periodLabel(entry.report),
                        amount: formatUnstatedAmount(entry.expenditure.amount),
                      }
                    )}
                  >
                    <div
                      className="h-full rounded-sm bg-slate-500"
                      style={{ width: `${expendPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-600 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <div>
          <span className="font-semibold text-gray-900">
            {t('What you’re seeing:')}
          </span>
          {t(
            'Receipts and expenditures reported within the same source report.'
          )}
        </div>
        <div>
          <span className="font-semibold text-gray-900">
            {t('How to read it:')}
          </span>
          {t(
            'Compare the two values within each report. Cumulative quarterly reports are not added together.'
          )}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Snapshot Component: Budget Authority (Responsive 1-col mobile / 2-col desktop)
// ---------------------------------------------------------------------------
function BudgetAuthoritySection() {
  const t = usePageT();
  const budgetEntry = authorizedBudget[0];
  if (!budgetEntry) return null;

  return (
    <article className="rounded-sm border border-gray-200 bg-white p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-950">
            {t('Budget Authority')}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {t('Annual General Fund · {{report}}', {
              report: periodLabel(budgetEntry.report),
            })}
          </p>
        </div>
        <span className="self-start rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-600">
          {t('Source-reported amount · unit not stated')}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div className="rounded-sm border border-gray-200/80 bg-[#F9FAFB] p-4 sm:p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            {t('Authorized receipts — proposed')}
          </span>
          <p className="mt-2 text-xl font-bold tabular-nums text-gray-950 sm:text-2xl lg:text-3xl break-words">
            {budgetEntry.authorized
              ? formatUnstatedAmount(budgetEntry.authorized.amount)
              : t('Not reported')}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {t(
              'Proposed budget authorization ceiling in official annual budget report.'
            )}
          </p>
        </div>

        <div className="rounded-sm border border-gray-200/80 bg-[#F9FAFB] p-4 sm:p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            {t('Authorized expenditures — proposed')}
          </span>
          <p className="mt-2 text-xl font-bold tabular-nums text-gray-950 sm:text-2xl lg:text-3xl break-words">
            {budgetEntry.appropriation
              ? formatUnstatedAmount(budgetEntry.appropriation.amount)
              : t('Not reported')}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {t(
              'Proposed expenditure appropriation ceiling in official annual budget report.'
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-600 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <div>
          <span className="font-semibold text-gray-900">
            {t('Important distinction:')}
          </span>
          {t('Budget authority, not actual receipts or spending.')}
        </div>
        <div className="text-gray-500">
          {t('Source-reported amount · unit not stated')}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Chart Component: Ending Cash Balance (Responsive SVG Line Chart)
// ---------------------------------------------------------------------------
function EndingCashBalanceChart() {
  const t = usePageT();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const points = useMemo(() => {
    return endingCashBalance.map(entry => ({
      period: periodLabel(entry.report),
      amount: entry.endingBalance.amount,
      report: entry.report,
    }));
  }, []);

  const { minVal, maxVal } = useMemo(() => {
    if (points.length === 0) return { minVal: 0, maxVal: 1 };
    const values = points.map(p => p.amount);
    return {
      minVal: Math.min(...values),
      maxVal: Math.max(...values),
    };
  }, [points]);

  const width = 540;
  const height = 240;
  const padLeft = 48;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 55;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const range = maxVal - minVal || 1;

  const coords = points.map((p, idx) => {
    const x =
      padLeft +
      (points.length > 1 ? (idx / (points.length - 1)) * chartW : chartW / 2);
    const y = padTop + chartH - ((p.amount - minVal) / range) * chartH;
    return { ...p, x, y };
  });

  const polylineStr = coords
    .map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(' ');
  const activePoint = activeIdx !== null ? coords[activeIdx] : coords.at(-1);

  return (
    <article className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-6">
      <div>
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-950">
              {t('Ending Cash Balance')}
            </h3>
            <p className="mt-0.5 text-xs text-gray-600">
              {t('General Fund · comparable reported periods')}
            </p>
          </div>
          <span className="self-start rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-600">
            {t('Source-reported amount · unit not stated')}
          </span>
        </div>

        {/* Selected Data Point Inspector */}
        <div className="mt-4 rounded-sm border border-gray-100 bg-[#F9FAFB] p-3 text-xs">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-gray-600">
              {t('Selected period:')}{' '}
              <strong className="text-gray-950">{activePoint?.period}</strong>
            </span>
            <span className="font-mono font-bold text-gray-950">
              {activePoint ? formatUnstatedAmount(activePoint.amount) : '—'}
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="mt-4 overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full max-w-full overflow-visible"
            role="img"
            aria-label={t(
              'Ending cash balance line chart showing General Fund balances over reported periods'
            )}
          >
            {/* Subtle grid lines */}
            {[0, 0.33, 0.66, 1].map((ratio, i) => {
              const y = padTop + chartH * (1 - ratio);
              return (
                <line
                  key={i}
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray={ratio > 0 && ratio < 1 ? '3 3' : undefined}
                />
              );
            })}

            {/* Line connecting points */}
            <polyline
              fill="none"
              stroke="#0066EB"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={polylineStr}
            />

            {/* Data points with zero hover shake */}
            {coords.map((c, idx) => {
              const isSelected =
                activeIdx === idx ||
                (activeIdx === null && idx === coords.length - 1);
              return (
                <g key={c.period}>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={4.5}
                    fill={isSelected ? '#0066EB' : '#FFFFFF'}
                    stroke={isSelected ? '#004199' : '#0066EB'}
                    strokeWidth={2}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => setActiveIdx(idx)}
                    tabIndex={0}
                    onFocus={() => setActiveIdx(idx)}
                    aria-label={t('{{period}}: {{amount}}', {
                      period: c.period,
                      amount: formatUnstatedAmount(c.amount),
                    })}
                  />
                  <text
                    x={c.x}
                    y={height - 12}
                    textAnchor="middle"
                    className="text-[10px] fill-gray-500"
                    transform={
                      coords.length > 6
                        ? `rotate(-35, ${c.x}, ${height - 12})`
                        : undefined
                    }
                  >
                    {c.period}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-600">
        <p>
          <span className="font-semibold text-gray-900">
            {t('What you’re seeing:')}
          </span>
          {t(
            'General Fund ending cash balances reported at comparable period ends.'
          )}
        </p>
        <p className="mt-1">
          <span className="font-semibold text-gray-900">
            {t('How to read it:')}
          </span>
          {t(
            'Each point is the reported ending balance for that period. Values are not added together.'
          )}
        </p>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Chart Component: Outstanding Debt (Matching Responsive SVG Column Chart)
// ---------------------------------------------------------------------------
function OutstandingDebtChart() {
  const t = usePageT();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const points = useMemo(() => {
    return outstandingDebt.map(entry => ({
      date: entry.report.as_of_date ?? `${entry.report.reporting_year}`,
      label: entry.report.as_of_date
        ? formatIsoDate(entry.report.as_of_date)
        : periodLabel(entry.report),
      shortLabel: entry.report.as_of_date
        ? entry.report.as_of_date.slice(0, 7)
        : periodLabel(entry.report),
      amount: entry.debt.amount,
      report: entry.report,
    }));
  }, []);

  const maxVal = useMemo(() => {
    return Math.max(...points.map(p => p.amount), 1);
  }, [points]);

  const width = 540;
  const height = 240;
  const padLeft = 48;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 55;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const slotW = chartW / points.length;
  const barW = Math.min(42, slotW * 0.65);

  const activePoint = activeIdx !== null ? points[activeIdx] : points[0];

  return (
    <article className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-6">
      <div>
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-950">
              {t('Outstanding Debt')}
            </h3>
            <p className="mt-0.5 text-xs text-gray-600">
              {t('Citywide debt · point-in-time snapshots')}
            </p>
          </div>
          <span className="self-start rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-600">
            {t('Source-reported amount · unit not stated')}
          </span>
        </div>

        {/* Selected Data Point Inspector */}
        <div className="mt-4 rounded-sm border border-gray-100 bg-[#F9FAFB] p-3 text-xs">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-gray-600">
              {t('Snapshot as of:')}{' '}
              <strong className="text-gray-950">{activePoint?.label}</strong>
            </span>
            <span className="font-mono font-bold text-gray-950">
              {activePoint ? formatUnstatedAmount(activePoint.amount) : '—'}
            </span>
          </div>
        </div>

        {/* SVG Column Chart matching Ending Cash Balance dimensions */}
        <div className="mt-4 overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full max-w-full overflow-visible"
            role="img"
            aria-label={t(
              'Outstanding debt column chart showing point-in-time balances'
            )}
          >
            {/* Subtle grid lines matching Ending Cash Balance */}
            {[0, 0.33, 0.66, 1].map((ratio, i) => {
              const y = padTop + chartH * (1 - ratio);
              return (
                <line
                  key={i}
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray={ratio > 0 && ratio < 1 ? '3 3' : undefined}
                />
              );
            })}

            {/* Baseline */}
            <line
              x1={padLeft}
              y1={padTop + chartH}
              x2={width - padRight}
              y2={padTop + chartH}
              stroke="#D1D5DB"
              strokeWidth="1"
            />

            {/* Column bars with zero hover shake */}
            {points.map((p, idx) => {
              const barH = (p.amount / maxVal) * (chartH - 10);
              const x = padLeft + idx * slotW + (slotW - barW) / 2;
              const y = padTop + chartH - barH;
              const isSelected =
                activeIdx === idx || (activeIdx === null && idx === 0);

              return (
                <g key={p.date}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx={2}
                    fill={isSelected ? '#0066EB' : '#94A3B8'}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => setActiveIdx(idx)}
                    tabIndex={0}
                    onFocus={() => setActiveIdx(idx)}
                    aria-label={t(
                      'As of {{label}}: {{amount}}, unit not stated',
                      { label: p.label, amount: formatUnstatedAmount(p.amount) }
                    )}
                  />
                  <text
                    x={x + barW / 2}
                    y={height - 12}
                    textAnchor="middle"
                    className="text-[10px] fill-gray-500"
                    transform={`rotate(-35, ${x + barW / 2}, ${height - 12})`}
                  >
                    {p.shortLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-600">
        <p>
          <span className="font-semibold text-gray-900">
            {t('What you’re seeing:')}
          </span>
          {t('Outstanding debt reported as of specific dates.')}
        </p>
        <p className="mt-1">
          <span className="font-semibold text-gray-900">
            {t('How to read it:')}
          </span>
          {t(
            'Each bar is an independent point-in-time balance. Do not sum the bars.'
          )}
        </p>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Chart Component: SEF Receipts vs. Disbursements (Grouped Bar Chart)
// ---------------------------------------------------------------------------
function SefUtilizationSection() {
  const t = usePageT();
  return (
    <article className="rounded-sm border border-gray-200 bg-white p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-950">
            {t('SEF Receipts vs. Disbursements')}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {t('Special Education Fund only · compatible reported periods')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span
              className="h-3 w-3 rounded-sm bg-[#0066EB]"
              aria-hidden="true"
            />
            {t('Receipts')}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span
              className="h-3 w-3 rounded-sm bg-slate-500"
              aria-hidden="true"
            />
            {t('Disbursements')}
          </span>
          <span className="rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-600">
            {t('Source-reported amount · unit not stated')}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sefUtilization.map(entry => {
          const max = Math.max(
            entry.receipt?.amount ?? 0,
            entry.disbursement?.amount ?? 0
          );
          const receiptPct =
            max > 0 ? ((entry.receipt?.amount ?? 0) / max) * 100 : 0;
          const disbursePct =
            max > 0 ? ((entry.disbursement?.amount ?? 0) / max) * 100 : 0;

          return (
            <div
              key={entry.report.id}
              className="rounded-sm border border-gray-100 bg-[#F9FAFB] p-3.5 sm:p-4"
            >
              <div className="flex items-baseline justify-between border-b border-gray-200/70 pb-2 text-xs">
                <span className="font-semibold text-gray-950">
                  {periodLabel(entry.report)}
                </span>
                {entry.report.is_cumulative && (
                  <span className="text-[11px] text-gray-500">
                    {t('cumulative YTD')}
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-2.5">
                {entry.receipt && (
                  <div>
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="text-gray-600">{t('Receipts')}</span>
                      <span className="font-bold tabular-nums text-gray-950">
                        {formatUnstatedAmount(entry.receipt.amount)}
                      </span>
                    </div>
                    <div
                      className="mt-1 h-2.5 w-full overflow-hidden rounded-sm bg-gray-200"
                      role="img"
                      aria-label={t('SEF Receipts for {{report}}: {{amount}}', {
                        report: periodLabel(entry.report),
                        amount: formatUnstatedAmount(entry.receipt.amount),
                      })}
                    >
                      <div
                        className="h-full rounded-sm bg-[#0066EB]"
                        style={{ width: `${receiptPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {entry.disbursement && (
                  <div>
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="text-gray-600">
                        {t('Disbursements')}
                      </span>
                      <span className="font-bold tabular-nums text-gray-950">
                        {formatUnstatedAmount(entry.disbursement.amount)}
                      </span>
                    </div>
                    <div
                      className="mt-1 h-2.5 w-full overflow-hidden rounded-sm bg-gray-200"
                      role="img"
                      aria-label={t(
                        'SEF Disbursements for {{report}}: {{amount}}',
                        {
                          report: periodLabel(entry.report),
                          amount: formatUnstatedAmount(
                            entry.disbursement.amount
                          ),
                        }
                      )}
                    >
                      <div
                        className="h-full rounded-sm bg-slate-500"
                        style={{ width: `${disbursePct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-600 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <div>
          <span className="font-semibold text-gray-900">
            {t('What you’re seeing:')}
          </span>
          {t(
            'Receipts and disbursements reported for the Special Education Fund.'
          )}
        </div>
        <div>
          <span className="font-semibold text-gray-900">
            {t('How to read it:')}
          </span>
          {t(
            'Compare within compatible periods only. Values are never combined with the General Fund.'
          )}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Chart Component: LDRRMF Utilization (Compact Two-Period Comparison View)
// ---------------------------------------------------------------------------
function LdrrmfUtilizationCard() {
  const t = usePageT();
  const row1 = ldrrmfUtilization[0]; // 2025 Q3
  const row2 = ldrrmfUtilization[1]; // 2026 Q2

  if (!row1 || !row2) return null;

  const delta = Math.round((row2.percent - row1.percent) * 10) / 10;
  const deltaFormatted = delta < 0 ? `−${Math.abs(delta)} pp` : `+${delta} pp`;

  return (
    <article className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-6">
      <div>
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-950">
              {t('LDRRMF Utilization')}
            </h3>
            <p className="mt-0.5 text-xs text-gray-600">
              {t('Derived within each report as utilization ÷ appropriation')}
            </p>
          </div>
          <span className="self-start rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-600">
            {t('0–100% scale')}
          </span>
        </div>

        {/* Summary row */}
        <div className="mt-4 grid grid-cols-1 gap-2 rounded-sm border border-gray-100 bg-[#F9FAFB] p-3 text-xs sm:grid-cols-3 sm:gap-3">
          <div>
            <span className="block text-[11px] text-gray-500">
              {t('Latest reported')}
            </span>
            <span className="font-semibold text-gray-950">{row2.percent}%</span>
            <span className="ml-1 text-gray-500">
              ({periodLabel(row2.report)})
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-gray-500">
              {t('Previous reported')}
            </span>
            <span className="font-semibold text-gray-950">{row1.percent}%</span>
            <span className="ml-1 text-gray-500">
              ({periodLabel(row1.report)})
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-gray-500">
              {t('Change')}
            </span>
            <span className="font-mono font-bold text-gray-900">
              {deltaFormatted}
            </span>
          </div>
        </div>

        {/* Main visualization: Two horizontal progress bars on a 0–100% scale */}
        <div className="mt-5 space-y-3.5">
          {/* 0–100% scale axis markers */}
          <div className="flex justify-between px-0.5 text-[10px] text-gray-400">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>

          {/* Row 1: 2025 Q3 — 11.7% */}
          <div className="rounded-sm border border-gray-100 bg-gray-50/60 p-3">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold text-gray-950">
                {periodLabel(row1.report)}
              </span>
              <span className="font-mono font-bold text-gray-800">
                {row1.percent}%
              </span>
            </div>
            <div
              className="mt-2 h-3.5 w-full overflow-hidden rounded-sm bg-gray-200"
              role="img"
              aria-label={t('{{report}} utilization: {{percent}} percent', {
                report: periodLabel(row1.report),
                percent: row1.percent,
              })}
            >
              <div
                className="h-full rounded-sm bg-slate-400"
                style={{ width: `${Math.min(100, row1.percent)}%` }}
              />
            </div>
            {row1.utilization && row1.appropriation && (
              <p className="mt-1.5 text-[11px] text-gray-500 truncate">
                {t('{{amount}} utilization ÷ {{amount2}} appropriation', {
                  amount: formatUnstatedAmount(row1.utilization.amount),
                  amount2: formatUnstatedAmount(row1.appropriation.amount),
                })}
              </p>
            )}
          </div>

          {/* Row 2: 2026 Q2 — 2.3% */}
          <div className="rounded-sm border border-gray-100 bg-gray-50/60 p-3">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold text-gray-950">
                {periodLabel(row2.report)}
              </span>
              <span className="font-mono font-bold text-[#0066EB]">
                {row2.percent}%
              </span>
            </div>
            <div
              className="mt-2 h-3.5 w-full overflow-hidden rounded-sm bg-gray-200"
              role="img"
              aria-label={t('{{report}} utilization: {{percent}} percent', {
                report: periodLabel(row2.report),
                percent: row2.percent,
              })}
            >
              <div
                className="h-full rounded-sm bg-[#0066EB]"
                style={{ width: `${Math.min(100, row2.percent)}%` }}
              />
            </div>
            {row2.utilization && row2.appropriation && (
              <p className="mt-1.5 text-[11px] text-gray-500 truncate">
                {t('{{amount}} utilization ÷ {{amount2}} appropriation', {
                  amount: formatUnstatedAmount(row2.utilization.amount),
                  amount2: formatUnstatedAmount(row2.appropriation.amount),
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-600">
        <p>
          <span className="font-semibold text-gray-900">
            {t('What you’re seeing:')}
          </span>
          {t(
            'Reported LDRRMF utilization as a share of appropriation for each reported period.'
          )}
        </p>
        <p className="mt-1">
          <span className="font-semibold text-gray-900">
            {t('How to read it:')}
          </span>
          {t(
            'Each percentage is derived within its own source report. Horizontal bars compare reported utilization on a 0–100% scale without implying an uninterrupted trend between distant quarters.'
          )}
        </p>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Chart Component: 20% NTA/IRA Utilization (Standard Percentage Line Chart)
// ---------------------------------------------------------------------------
function NtaIraUtilizationChart() {
  const t = usePageT();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const points = useMemo(() => {
    return ntaIraUtilization.map(entry => ({
      period: periodLabel(entry.report),
      percent: entry.percent,
      appropriation: entry.appropriation?.amount,
      utilization: entry.utilization?.amount,
      report: entry.report,
    }));
  }, []);

  const width = 500;
  const height = 200;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 48;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const coords = points.map((p, idx) => {
    const x =
      padLeft +
      (points.length > 1 ? (idx / (points.length - 1)) * chartW : chartW / 2);
    const y = padTop + chartH - (p.percent / 100) * chartH;
    return { ...p, x, y };
  });

  const polylineStr = coords
    .map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(' ');
  const activePoint = activeIdx !== null ? coords[activeIdx] : coords.at(-1);

  return (
    <article className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-6">
      <div>
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-950">
              {t('20% NTA/IRA Utilization')}
            </h3>
            <p className="mt-0.5 text-xs text-gray-600">
              {t('Derived within each report as utilization ÷ appropriation')}
            </p>
          </div>
          <span className="self-start rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-600">
            {t('0–100% scale')}
          </span>
        </div>

        {/* Selected Data Point Inspector */}
        <div className="mt-4 rounded-sm border border-gray-100 bg-[#F9FAFB] p-3 text-xs">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-gray-600">
              {t('Period:')}{' '}
              <strong className="text-gray-950">{activePoint?.period}</strong>
            </span>
            <span className="font-mono text-sm font-bold text-[#0066EB]">
              {activePoint ? `${activePoint.percent}%` : '—'}
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="mt-4 overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full max-w-full overflow-visible"
            role="img"
            aria-label={t('20% NTA/IRA utilization percentage line chart')}
          >
            {/* Horizontal Grid lines at 0%, 25%, 50%, 75%, 100% */}
            {[0, 25, 50, 75, 100].map(pct => {
              const y = padTop + chartH - (pct / 100) * chartH;
              return (
                <g key={pct}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    strokeDasharray={pct > 0 && pct < 100 ? '3 3' : undefined}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-gray-400"
                  >
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Polyline */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="#0066EB"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={polylineStr}
              />
            )}

            {/* Dots with zero hover shake */}
            {coords.map((c, idx) => {
              const isSelected =
                activeIdx === idx ||
                (activeIdx === null && idx === coords.length - 1);
              return (
                <g key={c.period}>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={4}
                    fill={isSelected ? '#0066EB' : '#FFFFFF'}
                    stroke={isSelected ? '#004199' : '#0066EB'}
                    strokeWidth={2}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => setActiveIdx(idx)}
                    tabIndex={0}
                    onFocus={() => setActiveIdx(idx)}
                    aria-label={t('{{period}}: {{percent}}%', {
                      period: c.period,
                      percent: c.percent,
                    })}
                  />
                  <text
                    x={c.x}
                    y={height - 10}
                    textAnchor="middle"
                    className="text-[9px] fill-gray-500"
                    transform={
                      coords.length > 6
                        ? `rotate(-35, ${c.x}, ${height - 10})`
                        : undefined
                    }
                  >
                    {c.period}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-600">
        <p>
          <span className="font-semibold text-gray-900">
            {t('What you’re seeing:')}
          </span>
          {t(
            'Reported 20% NTA/IRA utilization as a share of appropriation across reported periods.'
          )}
        </p>
        <p className="mt-1">
          <span className="font-semibold text-gray-900">
            {t('How to read it:')}
          </span>
          {t(
            'Each percentage is derived within its own source report on a 0–100% scale.'
          )}
        </p>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
type ReportTypeFilter = 'ALL' | FinanceReport['report_type'];
type YearFilter = 'ALL' | number;
const REPORTS_PER_PAGE = 10;

export default function CityFinances() {
  const t = usePageT();
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
        formatReportType(report.report_type, t)
          .toLowerCase()
          .includes(normalizedQuery) ||
        formatFundDisplay(report, t).toLowerCase().includes(normalizedQuery);
      return matchesType && matchesYear && matchesQuery;
    });
  }, [query, reportType, year, t]);

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
    <main className="flex-grow bg-white">
      {/* ----------------------------------------------------------------- */}
      {/* 1. EDITORIAL HERO & SCOPE MODULE                                 */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: t('Home'), href: '/' },
              { label: t('Transparency'), href: '/transparency' },
              { label: t('City Finances') },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                {t('TRANSPARENCY · CITY FINANCES')}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                {t('City Finances')}
              </h1>
              <p className="mt-4 text-base leading-7 text-gray-700 sm:mt-5 md:text-lg">
                {t(
                  'Explore selected official aggregate City finance reports and source-reported observations, with comparisons shown only where fund, period, accounting basis, and reporting treatment are compatible.'
                )}
              </p>

              {/* CTA Row */}
              <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8 sm:gap-6">
                <a
                  href="#comparable-views"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#0066EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC]"
                >
                  {t('Explore comparable views')}
                  <ArrowDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>

                <a
                  href="#report-catalog"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-950"
                >
                  {t('Browse official reports')}
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Right-Side Scope Module */}
            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('COVERAGE SCOPE')}
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-950">
                {t('Verified Partial Coverage')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {t(
                  '{{reportCount}} official reports and {{observationCount}} observations across {{length}} report families. This is not an audited financial statement or a complete history of City finances.',
                  {
                    reportCount: metadata.reportCount,
                    observationCount: metadata.observationCount,
                    length: reportTypes.length,
                  }
                )}
              </p>
            </aside>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 2. COLLECTION SNAPSHOT                                        */}
          {/* ------------------------------------------------------------- */}
          <div className="mt-8 border-t border-gray-200 pt-6 sm:mt-10 sm:pt-8">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-gray-200">
              <div className="sm:pr-6">
                <dd className="text-2xl font-extrabold tabular-nums text-gray-950 sm:text-3xl">
                  {metadata.reportCount}
                </dd>
                <dt className="mt-1 text-sm text-gray-600">{t('Reports')}</dt>
              </div>

              <div className="sm:px-6">
                <dd className="text-2xl font-extrabold tabular-nums text-gray-950 sm:text-3xl">
                  {metadata.observationCount}
                </dd>
                <dt className="mt-1 text-sm text-gray-600">
                  {t('Observations')}
                </dt>
              </div>

              <div className="sm:px-6">
                <dd className="text-2xl font-extrabold tabular-nums text-gray-950 sm:text-3xl">
                  {reportTypes.length}
                </dd>
                <dt className="mt-1 text-sm text-gray-600">
                  {t('Report families')}
                </dt>
              </div>

              <div className="sm:pl-6">
                <dd className="text-2xl font-extrabold tabular-nums text-gray-950 sm:text-3xl">
                  {Math.min(...years)}–{Math.max(...years)}
                </dd>
                <dt className="mt-1 text-sm text-gray-600">
                  {t('Reporting years')}
                </dt>
              </div>
            </dl>

            <p className="mt-4 text-xs text-gray-500">
              {t('Last verified: {{lastVerified}}', {
                lastVerified: formatIsoDate(metadata.lastVerified),
              })}
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 3. HOW TO READ THIS PAGE (READING GUIDE)                          */}
      {/* ----------------------------------------------------------------- */}
      <section
        className="border-b border-gray-200 bg-[#F9FAFB] py-8 sm:py-12"
        aria-labelledby="reading-guide-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">{t('READING GUIDE')}</p>
            <h2
              id="reading-guide-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('How to Read These Figures')}
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="rounded-sm border border-gray-200 bg-white p-4 sm:p-5">
              <h3 className="text-base font-bold text-gray-950">
                {t('Source-Reported Amounts')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Source documents do not state a normalized currency or unit. Amounts remain plain source-reported numbers, never assumed to be PHP, pesos, thousands, or millions.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-4 sm:p-5">
              <h3 className="text-base font-bold text-gray-950">
                {t('Compatibility Matters')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Fund, period, accounting basis, and reporting treatment must match before any comparison is valid. Unaudited reports and separate funds are kept strictly distinct.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-4 sm:p-5">
              <h3 className="text-base font-bold text-gray-950">
                {t('Cumulative Does Not Mean Additive')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Cumulative year-to-date quarterly reports are snapshots through each quarter. They are not additive and are never summed into an annual or citywide total.'
                )}
              </p>
            </div>
          </div>

          {/* Quiet Prohibited Comparisons Box with Sentence-Cased Bullets */}
          <div className="mt-6 rounded-sm border border-gray-200 bg-white p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('STRICT COMPARABILITY SAFEGUARDS')}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {metadata.overallPublicLimitation}
                </p>
                <ul className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-gray-600 sm:grid-cols-2">
                  {metadata.prohibitedComparisons.map((item, idx) => (
                    <li key={idx} className="flex items-baseline gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{formatProhibitedComparison(item, t)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 4–12. COMPARABLE FINANCIAL VIEWS                                  */}
      {/* ----------------------------------------------------------------- */}
      <section
        id="comparable-views"
        className="scroll-mt-8 py-8 sm:py-12 lg:py-16"
        aria-labelledby="comparable-views-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              {t('COMPARABLE VIEWS')}
            </p>
            <h2
              id="comparable-views-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('Financial Views Supported by the Source Data')}
            </h2>
            <p className="mt-3 text-base text-gray-600">
              {t(
                'Only pre-vetted compatible series are visualized below. Each view explains exactly what can and cannot be inferred.'
              )}
            </p>
          </div>

          <div className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
            {/* View 1: Receipts vs. Expenditures (2-COL DESKTOP / 1-COL MOBILE) */}
            <ReceiptsVsExpendituresSection />

            {/* View 2: Budget Authority (1-COL MOBILE / 2-COL DESKTOP) */}
            <BudgetAuthoritySection />

            {/* View 3 & 4: Ending Cash Balance | Outstanding Debt (2-COL DESKTOP / 1-COL MOBILE) */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
              <EndingCashBalanceChart />
              <OutstandingDebtChart />
            </div>

            {/* View 5: SEF Receipts vs. Disbursements (FULL WIDTH) */}
            <SefUtilizationSection />

            {/* View 6 & 7: LDRRMF (Compact 2-Period Comparison) | 20% NTA/IRA (Line Chart) */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
              <LdrrmfUtilizationCard />
              <NtaIraUtilizationChart />
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 14. OFFICIAL REPORT CATALOG                                      */}
      {/* ----------------------------------------------------------------- */}
      <section
        id="report-catalog"
        className="scroll-mt-8 border-t border-gray-200 bg-[#F9FAFB] py-8 sm:py-12 lg:py-16"
        aria-labelledby="catalog-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">{t('SOURCE REPORTS')}</p>
            <h2
              id="catalog-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('Official Report Catalog')}
            </h2>
            <p className="mt-3 text-base text-gray-600">
              {t(
                'Browse every verified source report used in the City Finances collection.'
              )}
            </p>
          </div>

          {/* Filter Toolbar */}
          <div className="mt-6 sm:mt-8 rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-[minmax(12rem,1fr)_13rem_10rem_auto] md:items-end">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">
                  {t('Search Title or Fund')}
                </span>
                <span className="relative block">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={event => {
                      setQuery(event.target.value);
                      setPage(1);
                    }}
                    placeholder={t('e.g. SEF, LDRRMF, cash flow')}
                    className="min-h-11 w-full rounded-sm border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">
                  {t('Report Type')}
                </span>
                <select
                  value={reportType}
                  onChange={event => {
                    setReportType(event.target.value as ReportTypeFilter);
                    setPage(1);
                  }}
                  className="min-h-11 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  <option value="ALL">{t('All types')}</option>
                  {reportTypes.map(type => (
                    <option key={type} value={type}>
                      {formatReportType(type, t)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">
                  {t('Year')}
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
                  className="min-h-11 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  <option value="ALL">{t('All years')}</option>
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
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {t('Reset')}
              </button>
            </div>
          </div>

          <p
            className="mt-4 text-xs font-semibold text-gray-600"
            aria-live="polite"
          >
            {t('Showing {{length}} of {{reportCount}} reports', {
              length: filteredReports.length,
              reportCount: metadata.reportCount,
            })}
          </p>

          {filteredReports.length === 0 ? (
            <div className="mt-4 rounded-sm border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
              <p className="font-semibold text-gray-950">
                {t('No report matches these filters')}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {t('Try a different search term or reset the filters.')}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="mt-4 hidden overflow-x-auto rounded-sm border border-gray-200 bg-white md:block">
                <table className="w-full min-w-[54rem] border-collapse text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50/75 text-xs uppercase tracking-wider text-gray-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        {t('Report')}
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        {t('Type')}
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        {t('Fund')}
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        {t('Period')}
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        {t('File')}
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        {t('Source')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {pagedReports.map(report => {
                      const { url } = sourceLink(report);
                      return (
                        <tr
                          key={report.id}
                          className="transition-colors hover:bg-gray-50/75"
                        >
                          <td className="max-w-xs px-4 py-3 font-medium text-gray-950">
                            {report.report_title_exact}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                            {formatReportType(report.report_type, t)}
                          </td>
                          <td className="max-w-[14rem] px-4 py-3 text-gray-600">
                            {formatFundDisplay(report, t)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                            {periodLabel(report)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="rounded-sm border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700">
                              {report.file_type}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t(
                                  'Open the official page for {{report_title_exact}} (opens in a new tab)',
                                  {
                                    report_title_exact:
                                      report.report_title_exact,
                                  }
                                )}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
                              >
                                {t('View official page')}
                                <ExternalLink
                                  className="h-3 w-3 shrink-0"
                                  aria-hidden="true"
                                />
                              </a>
                              <a
                                href={report.official_attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t(
                                  'Open the official {{file_type}} attachment for {{report_title_exact}} (opens in a new tab)',
                                  {
                                    file_type: report.file_type,
                                    report_title_exact:
                                      report.report_title_exact,
                                  }
                                )}
                                className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-950"
                              >
                                {t('Open {{file_type}}', {
                                  file_type: report.file_type,
                                })}
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

              {/* Mobile Stacked List */}
              <div className="mt-4 divide-y divide-gray-200 rounded-sm border border-gray-200 bg-white md:hidden">
                {pagedReports.map(report => {
                  const { url } = sourceLink(report);
                  return (
                    <div key={report.id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-950">
                          {report.report_title_exact}
                        </h4>
                        <span className="shrink-0 rounded-sm border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700">
                          {report.file_type}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-xs text-gray-600 sm:grid-cols-2">
                        <div>
                          <span className="text-gray-400">{t('Type:')}</span>
                          {formatReportType(report.report_type, t)}
                        </div>
                        <div>
                          <span className="text-gray-400">{t('Period:')}</span>
                          {periodLabel(report)}
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-gray-400">{t('Fund:')}</span>
                          {formatFundDisplay(report, t)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 text-xs">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#0066EB]"
                        >
                          {t('View official page')}
                          <ExternalLink
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                        </a>
                        <a
                          href={report.official_attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-gray-600"
                        >
                          {t('Open {{file_type}}', {
                            file_type: report.file_type,
                          })}
                          <ExternalLink
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {filteredReports.length > 0 && totalPages > 1 && (
            <nav
              className="mt-6 flex items-center justify-between gap-3 border-t border-gray-200 pt-4"
              aria-label={t('Official report catalog pagination')}
            >
              <button
                type="button"
                onClick={() => setPage(current => Math.max(1, current - 1))}
                disabled={currentPage <= 1}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {t('Previous')}
              </button>
              <span className="text-xs text-gray-600" aria-hidden="true">
                {t('Page {{currentPage}} of {{totalPages}}', {
                  currentPage,
                  totalPages,
                })}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage(current => Math.min(totalPages, current + 1))
                }
                disabled={currentPage >= totalPages}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {t('Next')}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 15. METHODOLOGY / LIMITATIONS                                     */}
      {/* ----------------------------------------------------------------- */}
      <section
        className="border-t border-gray-200 bg-white py-8 sm:py-12 lg:py-16"
        aria-labelledby="methodology-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">{t('INTERPRETATION')}</p>
            <h2
              id="methodology-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('How to Interpret the Finance Data')}
            </h2>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="rounded-sm border border-gray-200 bg-[#F9FAFB] p-4 sm:p-5">
              <h3 className="text-base font-bold text-gray-950">
                {t('Comparable Only When Compatible')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Each observation retains the accounting basis, fund, period, and reporting treatment of its source document. Unaudited quarterly figures are never combined with annual statements, and distinct funds are never merged.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-[#F9FAFB] p-4 sm:p-5">
              <h3 className="text-base font-bold text-gray-950">
                {t('No Assumed Currency or Unit')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Because source documents omit explicit currency and unit specifications, every figure is presented strictly as a source-reported number without inferring ₱, PHP, pesos, thousands, or millions.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-[#F9FAFB] p-4 sm:p-5">
              <h3 className="text-base font-bold text-gray-950">
                {t('Separate From Project Spending')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'The {{observationCount}} aggregate finance observations must never be merged with the 298 project-utilization observations published under Project Cost & Utilization. Cumulative year-to-date quarters are never summed into an annual or citywide total.',
                  { observationCount: metadata.observationCount }
                )}
              </p>
            </div>
          </div>

          {/* Privacy Boundary */}
          <div className="mt-6 sm:mt-8 rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5 text-xs leading-relaxed text-gray-600">
            <p className="font-semibold text-gray-900">
              {t('Privacy boundary:')}
            </p>
            <p className="mt-1">{metadata.privacyBoundary}</p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 16. KEEP EXPLORING                                                */}
      {/* ----------------------------------------------------------------- */}
      <section
        className="border-t border-gray-200 bg-[#F9FAFB] py-8 pb-16 sm:py-12 sm:pb-24 lg:py-16 lg:pb-28"
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
              href="/statistics/project-spending"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Projects')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Project Cost & Utilization')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Detailed cost-utilization and completion metrics for verified City projects.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('View project statistics')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

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
                {t('View source directory')}
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
          </div>
        </div>
      </section>
    </main>
  );
}
