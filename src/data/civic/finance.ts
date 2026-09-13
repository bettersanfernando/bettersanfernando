import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import financeReportsJson from '../generated/civic/finance/finance-reports.json' with { type: 'json' };
import financeObservationsJson from '../generated/civic/finance/finance-observations.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const PublicHttpsUrl = z.url().refine(url => url.startsWith('https://'), {
  message: 'Expected a public HTTPS URL',
});

export const FinanceReportType = z.enum([
  'annual_budget',
  'statement_of_receipts_and_expenditures',
  'statement_of_cash_flows',
  'statement_of_indebtedness_payments_and_balances',
  'nta_ira_utilization',
  'ldrrmf_utilization',
  'sef_utilization',
  'trust_fund_utilization',
  'unliquidated_cash_advances',
  'statement_of_financial_performance',
]);
export const FinanceFundType = z.enum([
  'general_fund',
  'general_fund_and_sef',
  'citywide_debt',
  '20_percent_nta_ira',
  'ldrrmf',
  'special_education_fund',
  'trust_fund',
  'source_stated_fund',
]);
export const FinancePeriodType = z.enum([
  'annual',
  'cumulative_ytd',
  'point_in_time',
  'quarter_only',
]);

// Every amount in both exports currently carries a null currency_code,
// currency_text, and unit_text — the source documents never state a
// normalized unit. Amounts must always be displayed as plain numbers with a
// visible "unit not stated" note, never assumed to be PHP/pesos.
export const FinanceReportSchema = z
  .object({
    accounting_basis: NonEmptyString,
    as_of_date: IsoDateString.nullable(),
    canonical_source_document_id: NonEmptyString.nullable(),
    currency_code: NonEmptyString.nullable(),
    currency_text: NonEmptyString.nullable(),
    extraction_status: NonEmptyString,
    file_type: z.enum(['XLSX', 'PDF']),
    fund_name_exact: NonEmptyString.nullable(),
    fund_type: FinanceFundType,
    id: NonEmptyString,
    is_cumulative: z.boolean(),
    official_attachment_url: PublicHttpsUrl,
    official_page_url: PublicHttpsUrl,
    period_end: IsoDateString,
    period_start: IsoDateString,
    period_type: FinancePeriodType,
    privacy_treatment: z.literal('aggregate_only'),
    public_limitation: NonEmptyString,
    publisher: NonEmptyString,
    quarter: z.number().int().min(1).max(4).nullable(),
    reconciliation_status: NonEmptyString,
    report_title_exact: NonEmptyString,
    report_type: FinanceReportType,
    reporting_year: z.number().int(),
    responsible_office: NonEmptyString.nullable(),
    source_published_at: IsoDateString.nullable(),
    unit_text: NonEmptyString.nullable(),
    verification_status: NonEmptyString,
    version_group: NonEmptyString,
    version_status: z.literal('canonical'),
  })
  .strict();
export type FinanceReport = z.infer<typeof FinanceReportSchema>;

export const FinanceObservationSchema = z
  .object({
    accounting_basis: NonEmptyString,
    amount: z.number(),
    comparability_key: NonEmptyString.nullable(),
    currency_code: NonEmptyString.nullable(),
    currency_text: NonEmptyString.nullable(),
    derivation: NonEmptyString.nullable(),
    fund_type: FinanceFundType,
    id: NonEmptyString,
    is_cumulative: z.boolean(),
    is_derived: z.boolean(),
    metric_code: NonEmptyString,
    metric_label_exact: NonEmptyString,
    period_type: FinancePeriodType,
    public_note: NonEmptyString.nullable(),
    quarter: z.number().int().min(1).max(4).nullable(),
    reconciliation_status: NonEmptyString,
    report_id: NonEmptyString,
    reporting_year: z.number().int(),
    unit_text: NonEmptyString.nullable(),
    value_basis: z.enum([
      'authorized_budget',
      'appropriation',
      'receipt',
      'expenditure',
      'surplus_deficit',
      'cash_inflow',
      'cash_outflow',
      'ending_balance',
      'outstanding_debt',
      'utilization',
      'disbursement',
      'unliquidated_cash_advance_total',
      'revenue',
      'expense',
    ]),
  })
  .strict();
export type FinanceObservation = z.infer<typeof FinanceObservationSchema>;

const FinanceReportsFileSchema = z
  .object({
    chart_ready_series: z.array(NonEmptyString),
    dataset: z.literal('city-finance-reports'),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    overall_public_limitation: NonEmptyString,
    prohibited_comparisons: z.array(NonEmptyString),
    publication_status: z.literal('PUBLICATION_REVIEW_COMPLETE'),
    record_count: z.number().int().nonnegative(),
    reports: z.array(FinanceReportSchema),
    route: z.literal('/transparency/finance'),
    schema_version: z.literal(1),
    title: NonEmptyString,
  })
  .strict()
  .refine(file => file.record_count === file.reports.length, {
    message: 'record_count must match reports length',
  })
  .refine(
    file =>
      new Set(file.reports.map(report => report.id)).size ===
      file.reports.length,
    { message: 'report ids must be unique' }
  );

const FinanceObservationsFileSchema = z
  .object({
    dataset: z.literal('city-finance-observations'),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    observations: z.array(FinanceObservationSchema),
    overall_public_limitation: NonEmptyString,
    privacy_boundary: NonEmptyString,
    publication_status: z.literal('PUBLICATION_REVIEW_COMPLETE'),
    record_count: z.number().int().nonnegative(),
    route: z.literal('/transparency/finance'),
    schema_version: z.literal(1),
    title: NonEmptyString,
  })
  .strict()
  .refine(
    file => file.record_count === file.observations.length,
    'record_count must match observations length'
  )
  .refine(
    file =>
      new Set(file.observations.map(observation => observation.id)).size ===
      file.observations.length,
    'observation ids must be unique'
  );

const reportsFile = FinanceReportsFileSchema.parse(financeReportsJson);
const observationsFile = FinanceObservationsFileSchema.parse(
  financeObservationsJson
);

const reports: readonly FinanceReport[] = Object.freeze(reportsFile.reports);
const observations: readonly FinanceObservation[] = Object.freeze(
  observationsFile.observations
);

const reportsById = new Map(reports.map(report => [report.id, report]));

// Every observation must resolve against a published report — an unresolved
// reference means the two synced exports have drifted, which must fail
// loudly at load time rather than silently rendering an orphaned figure.
for (const observation of observations) {
  if (!reportsById.has(observation.report_id)) {
    throw new Error(
      `finance-observation ${observation.id} references unknown report ${observation.report_id}`
    );
  }
}

export function getFinanceReports(): readonly FinanceReport[] {
  return reports;
}

export function getFinanceReportById(id: string): FinanceReport | undefined {
  return reportsById.get(id);
}

export function getFinanceObservations(): readonly FinanceObservation[] {
  return observations;
}

export function getObservationsForReport(
  reportId: string
): readonly FinanceObservation[] {
  return observations.filter(observation => observation.report_id === reportId);
}

export type FinanceMetadata = Readonly<{
  reportCount: number;
  observationCount: number;
  lastVerified: string;
  overallPublicLimitation: string;
  prohibitedComparisons: readonly string[];
  chartReadySeries: readonly string[];
  privacyBoundary: string;
  jurisdictionPsgc: string;
  title: string;
}>;

export function getFinanceMetadata(): FinanceMetadata {
  return Object.freeze({
    reportCount: reportsFile.record_count,
    observationCount: observationsFile.record_count,
    lastVerified: reportsFile.last_verified,
    overallPublicLimitation: reportsFile.overall_public_limitation,
    prohibitedComparisons: Object.freeze([
      ...reportsFile.prohibited_comparisons,
    ]),
    chartReadySeries: Object.freeze([...reportsFile.chart_ready_series]),
    privacyBoundary: observationsFile.privacy_boundary,
    jurisdictionPsgc: reportsFile.jurisdiction_psgc,
    title: reportsFile.title,
  });
}
