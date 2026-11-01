import { z } from 'zod';
import type { PageT } from '../../i18n/page-t.ts';
import { IsoDateString, PsgcCode } from './schemas.ts';
import nationalBudgetJson from '../generated/civic/transparency/national-budget-fy2027.json' with { type: 'json' };

// FY2027 proposed national appropriations (NEP vs House Bill 10858). This
// module is deliberately independent of projects, finance, procurement and
// cost/utilization: nothing here is City spending, and NEP and House amounts
// are alternative versions of one budget that must never be added together.

const NonEmptyString = z.string().trim().min(1);
const HttpsUrl = z
  .url()
  .refine(url => url.startsWith('https://'), 'Expected a public HTTPS URL')
  .refine(url => !url.includes('?'), 'Expected a URL with no query string');
const Pesos = z.number().int().positive();

export const NationalBudgetStatus = z.enum([
  'SAME_AMOUNT_IN_BOTH',
  'HOUSE_BILL_ONLY_CANDIDATE',
  'NEP_ONLY_CANDIDATE',
  'HIGHER_IN_HOUSE_BILL',
  'LOWER_IN_HOUSE_BILL',
]);
export type NationalBudgetStatusValue = z.infer<typeof NationalBudgetStatus>;

const SourcePageSchema = z
  .object({
    document: NonEmptyString,
    page: z.number().int().positive(),
    url: HttpsUrl,
  })
  .strict();

export const NationalBudgetRecordSchema = z
  .object({
    agency: NonEmptyString,
    bettergov_record_id: NonEmptyString,
    bettergov_source_url: HttpsUrl,
    bettergov_status_label: NonEmptyString,
    comparison_status: NationalBudgetStatus,
    fiscal_year: z.literal(2027),
    house_amount_php: Pesos.nullable(),
    house_source: SourcePageSchema.nullable(),
    id: NonEmptyString,
    implementing_office: NonEmptyString,
    location_evidence: NonEmptyString,
    nep_amount_php: Pesos.nullable(),
    nep_source: SourcePageSchema.nullable(),
    program: NonEmptyString,
    program_line: NonEmptyString,
    title: NonEmptyString,
    unconfirmed_match: z.boolean(),
    verified_at: IsoDateString,
  })
  .strict()
  .refine(
    r => (r.nep_amount_php === null) === (r.nep_source === null),
    'NEP amount and NEP source must both be present or both be null'
  )
  .refine(
    r => (r.house_amount_php === null) === (r.house_source === null),
    'House amount and House source must both be present or both be null'
  )
  .refine(
    r => r.nep_amount_php !== null || r.house_amount_php !== null,
    'a record needs at least one budget version'
  )
  .refine(
    r =>
      r.comparison_status !== 'SAME_AMOUNT_IN_BOTH' ||
      (r.nep_amount_php !== null && r.nep_amount_php === r.house_amount_php),
    'SAME_AMOUNT_IN_BOTH requires equal NEP and House amounts'
  )
  .refine(
    r =>
      r.comparison_status !== 'HOUSE_BILL_ONLY_CANDIDATE' ||
      (r.nep_amount_php === null && r.house_amount_php !== null),
    'HOUSE_BILL_ONLY_CANDIDATE requires a House amount and no NEP amount'
  )
  .refine(
    r =>
      r.comparison_status !== 'NEP_ONLY_CANDIDATE' ||
      (r.house_amount_php === null && r.nep_amount_php !== null),
    'NEP_ONLY_CANDIDATE requires a NEP amount and no House amount'
  );
export type NationalBudgetRecord = z.infer<typeof NationalBudgetRecordSchema>;

const NationalBudgetFileSchema = z
  .object({
    attribution: z
      .object({
        api_url: HttpsUrl,
        bettergov_notice: NonEmptyString,
        disclaimer_url: HttpsUrl,
        license: z.literal('CC-BY-4.0'),
        license_url: HttpsUrl,
        text: NonEmptyString,
      })
      .strict(),
    comparison_status_breakdown: z.partialRecord(
      NationalBudgetStatus,
      z.number().int()
    ),
    dataset: z.literal('national-budget-fy2027'),
    documents: z.record(
      z.string(),
      z.object({ label: NonEmptyString, pdf_url: HttpsUrl }).strict()
    ),
    fiscal_year: z.literal(2027),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    overall_public_limitation: NonEmptyString,
    publication_status: z.literal('PUBLICATION_REVIEW_COMPLETE'),
    record_count: z.number().int().nonnegative(),
    records: z.array(NationalBudgetRecordSchema),
    route: z.literal('/transparency/2027-budget'),
    schema_version: z.literal(1),
    scope_note: NonEmptyString,
    source_snapshot: z
      .object({
        api_endpoint: NonEmptyString,
        built_at: NonEmptyString,
        house_version: NonEmptyString,
        retrieved_at: IsoDateString,
        source_commit: NonEmptyString,
        source_repo: HttpsUrl,
      })
      .strict(),
  })
  .strict()
  .refine(
    file => file.record_count === file.records.length,
    'record_count must match records length'
  )
  .refine(file => {
    const ids = file.records.map(r => r.id);
    const sourceIds = file.records.map(r => r.bettergov_record_id);
    return (
      new Set(ids).size === ids.length &&
      new Set(sourceIds).size === sourceIds.length
    );
  }, 'record ids and BetterGov record ids must be unique')
  .refine(
    file =>
      file.records.every(
        r =>
          (r.nep_source === null || r.nep_source.document in file.documents) &&
          (r.house_source === null || r.house_source.document in file.documents)
      ),
    'every source document must be listed in documents'
  )
  .refine(
    file =>
      NationalBudgetStatus.options.every(
        status =>
          file.records.filter(r => r.comparison_status === status).length ===
          (file.comparison_status_breakdown[status] ?? 0)
      ),
    'comparison_status_breakdown must match the records'
  );

const file = NationalBudgetFileSchema.parse(nationalBudgetJson);

const records: readonly NationalBudgetRecord[] = Object.freeze(file.records);

export type NationalBudgetStatusSummary = Readonly<{
  count: number;
  nepAmountPhp: number;
  houseAmountPhp: number;
}>;

// Amounts are summed only within one status group. There is intentionally no
// cross-version or cross-status aggregate.
const statusSummaries = Object.freeze(
  Object.fromEntries(
    NationalBudgetStatus.options.map(status => {
      const group = records.filter(r => r.comparison_status === status);
      const summary: NationalBudgetStatusSummary = Object.freeze({
        count: group.length,
        nepAmountPhp: group.reduce((s, r) => s + (r.nep_amount_php ?? 0), 0),
        houseAmountPhp: group.reduce(
          (s, r) => s + (r.house_amount_php ?? 0),
          0
        ),
      });
      return [status, summary];
    })
  )
) as Readonly<Record<NationalBudgetStatusValue, NationalBudgetStatusSummary>>;

export type NationalBudgetMetadata = Readonly<{
  recordCount: number;
  statusSummaries: Readonly<
    Record<NationalBudgetStatusValue, NationalBudgetStatusSummary>
  >;
  attribution: z.infer<typeof NationalBudgetFileSchema>['attribution'];
  documents: z.infer<typeof NationalBudgetFileSchema>['documents'];
  sourceSnapshot: z.infer<typeof NationalBudgetFileSchema>['source_snapshot'];
  jurisdictionPsgc: string;
  lastVerified: string;
  scopeNote: string;
  overallPublicLimitation: string;
  route: string;
}>;

const metadata: NationalBudgetMetadata = Object.freeze({
  recordCount: file.record_count,
  statusSummaries,
  attribution: Object.freeze(file.attribution),
  documents: Object.freeze(file.documents),
  sourceSnapshot: Object.freeze(file.source_snapshot),
  jurisdictionPsgc: file.jurisdiction_psgc,
  lastVerified: file.last_verified,
  scopeNote: file.scope_note,
  overallPublicLimitation: file.overall_public_limitation,
  route: file.route,
});

export function getNationalBudgetRecords(): readonly NationalBudgetRecord[] {
  return records;
}

export function getNationalBudgetMetadata(): NationalBudgetMetadata {
  return metadata;
}

// Authored English strings from the generated export are translated for
// display only, and only while the value still matches the exact text the
// translation was written against; otherwise the original is shown.
export function getNationalBudgetScopeNoteDisplay(t: PageT): string {
  if (
    metadata.scopeNote ===
    'Curated FY2027 national-budget project lines verified as associated with the City of San Fernando, Pampanga. These are proposed national appropriations and are not City spending, procurement awards, contracts, or proof of project implementation. NEP and House Bill amounts are alternative versions of one budget and are compared, never added.'
  ) {
    return t(
      'Curated FY2027 national-budget project lines verified as associated with the City of San Fernando, Pampanga. These are proposed national appropriations and are not City spending, procurement awards, contracts, or proof of project implementation. NEP and House Bill amounts are alternative versions of one budget and are compared, never added.'
    );
  }
  return metadata.scopeNote;
}

export function getNationalBudgetLimitationDisplay(t: PageT): string {
  if (
    metadata.overallPublicLimitation ===
    'Not a complete list of national projects in San Fernando. BetterGov has no structured municipality/PSGC field, so lines were found by place and barangay names in titles and checked by hand; a line whose title does not name the City or one of its barangays may be missing. "House bill only" and "NEP only" are candidates for comparison, not confirmed insertions or deletions. Independent and unofficial; not an official record of DBM, the House of Representatives or any agency.'
  ) {
    return t(
      'Not a complete list of national projects in San Fernando. BetterGov has no structured municipality/PSGC field, so lines were found by place and barangay names in titles and checked by hand; a line whose title does not name the City or one of its barangays may be missing. "House bill only" and "NEP only" are candidates for comparison, not confirmed insertions or deletions. Independent and unofficial; not an official record of DBM, the House of Representatives or any agency.'
    );
  }
  return metadata.overallPublicLimitation;
}
