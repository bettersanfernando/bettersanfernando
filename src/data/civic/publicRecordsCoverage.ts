import { z } from 'zod';
import publicRecordsCoverageJson from '../generated/civic/statistics/public-records-coverage.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const PublicHttpsUrl = z.url().refine(url => url.startsWith('https://'), {
  message: 'Expected a public HTTPS URL',
});
const Year = z.number().int();

const PeriodCoverage = z.object({
  end_year: Year,
  start_year: Year,
  years: z.array(Year),
});

// One record type/unit per metric — different record types (projects,
// evidence, services, documents, legislation) must never be summed into a
// single "total public records" figure; each keeps its own unit_label.
export const PublicRecordsCoverageMetricSchema = z.object({
  availability_status: z.literal('available'),
  canonical_route: NonEmptyString,
  count: z.number().int().nonnegative(),
  count_basis: NonEmptyString,
  coverage_note: NonEmptyString,
  metadata_granularity: NonEmptyString,
  official_source_url: PublicHttpsUrl,
  period_coverage: PeriodCoverage,
  record_class: NonEmptyString,
  record_type: NonEmptyString,
  source_family: NonEmptyString,
  unit_label: NonEmptyString,
  verification_status: NonEmptyString,
});
export type PublicRecordsCoverageMetric = z.infer<
  typeof PublicRecordsCoverageMetricSchema
>;

export const PublicRecordsArchiveCoverageSchema = z.object({
  availability_status: z.literal('metadata_only'),
  canonical_route: NonEmptyString,
  complete_calendar_year: z.boolean(),
  count: z.number().int().nonnegative(),
  count_basis: z.literal('archive_range_only'),
  coverage_note: NonEmptyString,
  metadata_granularity: z.literal('archive_range'),
  official_source_url: PublicHttpsUrl,
  period_end: z.string(),
  period_start: z.string(),
  range_end: z.number().int(),
  range_start: z.number().int(),
  record_class: z.literal('archive_coverage_evidence'),
  record_type: NonEmptyString,
  source_family: NonEmptyString,
  unit_label: NonEmptyString,
  verification_status: z.literal('verified_archive_range'),
  year: Year,
});
export type PublicRecordsArchiveCoverage = z.infer<
  typeof PublicRecordsArchiveCoverageSchema
>;

export const PublicRecordsRelatedCollectionSchema = z.object({
  canonical_route: NonEmptyString,
  count: z.number().int().nonnegative(),
  count_basis: NonEmptyString,
  coverage_note: NonEmptyString,
  record_class: NonEmptyString,
  record_type: NonEmptyString,
  unit_label: NonEmptyString,
});
export type PublicRecordsRelatedCollection = z.infer<
  typeof PublicRecordsRelatedCollectionSchema
>;

const PublicRecordsCoverageFileSchema = z
  .object({
    archive_coverage: z.array(PublicRecordsArchiveCoverageSchema),
    as_of: z.string(),
    dataset: z.literal('public-records-coverage'),
    metrics: z.array(PublicRecordsCoverageMetricSchema),
    overall_limitation: NonEmptyString,
    related_collections: z.array(PublicRecordsRelatedCollectionSchema),
    route: z.literal('/statistics/public-records'),
    schema_version: z.literal(1),
    scope: NonEmptyString,
    title: NonEmptyString,
    verification_date: z.string(),
  })
  .refine(
    file =>
      new Set(file.metrics.map(metric => metric.record_type)).size ===
      file.metrics.length,
    'metric record_type values must be unique'
  );

const file = PublicRecordsCoverageFileSchema.parse(publicRecordsCoverageJson);

const metrics: readonly PublicRecordsCoverageMetric[] = Object.freeze(
  file.metrics
);
const archiveCoverage: readonly PublicRecordsArchiveCoverage[] = Object.freeze(
  file.archive_coverage
);
const relatedCollections: readonly PublicRecordsRelatedCollection[] =
  Object.freeze(file.related_collections);

export function getPublicRecordsMetrics(): readonly PublicRecordsCoverageMetric[] {
  return metrics;
}

export function getPublicRecordsArchiveCoverage(): readonly PublicRecordsArchiveCoverage[] {
  return archiveCoverage;
}

export function getPublicRecordsRelatedCollections(): readonly PublicRecordsRelatedCollection[] {
  return relatedCollections;
}

export type PublicRecordsCoverageMetadata = Readonly<{
  asOf: string;
  overallLimitation: string;
  scope: string;
  title: string;
  verificationDate: string;
}>;

export function getPublicRecordsCoverageMetadata(): PublicRecordsCoverageMetadata {
  return Object.freeze({
    asOf: file.as_of,
    overallLimitation: file.overall_limitation,
    scope: file.scope,
    title: file.title,
    verificationDate: file.verification_date,
  });
}
