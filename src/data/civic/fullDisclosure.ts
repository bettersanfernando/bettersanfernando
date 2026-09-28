import { z } from 'zod';
import type { PageT } from '../../i18n/page-t.ts';
import { IsoDateString, PsgcCode } from './schemas.ts';
import fullDisclosureJson from '../generated/civic/transparency/full-disclosure.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const PublicHttpsUrl = z
  .url()
  .refine(url => url.startsWith('https://'), {
    message: 'Expected a public HTTPS URL',
  })
  .refine(url => !url.includes('?') && !url.includes('#'), {
    message: 'Expected a URL with no tracking parameters or fragments',
  });

export const FullDisclosureReportType = z.enum([
  'Annual Procurement Plan',
  'Procurement Monitoring Report',
  'Special Education Fund Utilization',
  'Trust Fund Utilization',
]);

export const FullDisclosureQuarter = z.enum(['Q1', 'Q2', 'Q3', 'Q4']);

export const FullDisclosureFileType = z.enum(['PDF', 'XLSX']);

export const FullDisclosureAvailabilityStatus = z.enum(['VERIFIED_ACCESSIBLE']);

export const FullDisclosureRecordSchema = z
  .object({
    availability_status: FullDisclosureAvailabilityStatus,
    file_type: FullDisclosureFileType,
    id: NonEmptyString,
    official_attachment_url: PublicHttpsUrl.optional(),
    official_page_url: PublicHttpsUrl,
    publishing_agency: NonEmptyString,
    quarter: FullDisclosureQuarter.nullable(),
    report_type: FullDisclosureReportType,
    reporting_year: z.number().int(),
    title: NonEmptyString,
    verification_date: IsoDateString,
  })
  .strict();
export type FullDisclosureRecord = z.infer<typeof FullDisclosureRecordSchema>;

const FullDisclosureFileSchema = z
  .object({
    dataset: z.literal('transparency-full-disclosure'),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    overall_public_limitation: NonEmptyString,
    publication_status: z.literal('PUBLICATION_REVIEW_COMPLETE'),
    record_count: z.number().int().nonnegative(),
    records: z.array(FullDisclosureRecordSchema),
    report_type_breakdown: z.record(FullDisclosureReportType, z.number().int()),
    route: z.literal('/transparency/full-disclosure'),
    schema_version: z.number().int(),
    year_quarter_coverage: z.record(
      z.string(),
      z.array(z.union([FullDisclosureQuarter, z.literal('ANNUAL')]))
    ),
  })
  .strict()
  .refine(
    file => file.record_count === file.records.length,
    'record_count must match records length'
  )
  .refine(file => {
    const ids = file.records.map(record => record.id);
    return new Set(ids).size === ids.length;
  }, 'record ids must be unique');

const fullDisclosureFile = FullDisclosureFileSchema.parse(fullDisclosureJson);

// Preserves the export's own ordering; publication review already organized
// the set.
const records: readonly FullDisclosureRecord[] = Object.freeze(
  fullDisclosureFile.records
);

export type FullDisclosureMetadata = Readonly<{
  recordCount: number;
  reportTypeBreakdown: Readonly<Record<string, number>>;
  yearQuarterCoverage: Readonly<Record<string, readonly string[]>>;
  jurisdictionPsgc: string;
  lastVerified: string;
  overallPublicLimitation: string;
  publicationStatus: string;
  route: string;
}>;

const metadata: FullDisclosureMetadata = Object.freeze({
  recordCount: fullDisclosureFile.record_count,
  reportTypeBreakdown: Object.freeze({
    ...fullDisclosureFile.report_type_breakdown,
  }),
  yearQuarterCoverage: Object.freeze({
    ...fullDisclosureFile.year_quarter_coverage,
  }),
  jurisdictionPsgc: fullDisclosureFile.jurisdiction_psgc,
  lastVerified: fullDisclosureFile.last_verified,
  overallPublicLimitation: fullDisclosureFile.overall_public_limitation,
  publicationStatus: fullDisclosureFile.publication_status,
  route: fullDisclosureFile.route,
});

export function getFullDisclosureRecords(): readonly FullDisclosureRecord[] {
  return records;
}

export function getFullDisclosureMetadata(): FullDisclosureMetadata {
  return metadata;
}

// Localized display for the authored overall_public_limitation caveat in the
// generated dataset — canonical/generated data is untouched; only display
// is translated, and only when the value still matches the exact text this
// translation was written against.
export function getFullDisclosureOverallPublicLimitationDisplay(
  t: PageT
): string {
  if (
    metadata.overallPublicLimitation ===
    "This is a bounded metadata-only export of 10 Full Disclosure Policy report records (2023-2026) with complete, documented verification already present in this repository as of 2026-09-11. It is not a complete Full Disclosure archive: the canonical inventory separately tracks approximately 200 official source records across 2020-2026, of which only these 13 have individual record-level metadata, and only 10 of those 13 have a verified official URL. No report's financial contents (amounts, line items, disbursements) are extracted, summarized, or published anywhere in this repository."
  ) {
    return t(
      "This is a bounded metadata-only export of 10 Full Disclosure Policy report records (2023-2026) with complete, documented verification already present in this repository as of 2026-09-11. It is not a complete Full Disclosure archive: the canonical inventory separately tracks approximately 200 official source records across 2020-2026, of which only these 13 have individual record-level metadata, and only 10 of those 13 have a verified official URL. No report's financial contents (amounts, line items, disbursements) are extracted, summarized, or published anywhere in this repository."
    );
  }
  return metadata.overallPublicLimitation;
}
