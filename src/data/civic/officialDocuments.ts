import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import officialDocumentsJson from '../generated/civic/transparency/official-documents.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const PublicHttpsUrl = z
  .url()
  .refine(url => url.startsWith('https://'), 'Expected a public HTTPS URL')
  .refine(url => !url.includes('?') && !url.includes('#'), {
    message: 'Expected a URL with no tracking parameters or fragments',
  });

export const OfficialDocumentType = z.enum([
  'BUSINESS_FORM',
  'CITIZENS_CHARTER',
  'PRIVACY_MANUAL',
  'PRIVACY_NOTICE',
  'PRIVACY_POLICY',
]);
export const OfficialDocumentStatus = z.enum(['CURRENT', 'SUPERSEDED']);
export const OfficialDocumentFileType = z.enum(['HTML', 'PDF']);
export const OfficialDocumentAccessStatus = z.enum(['ACCESSIBLE']);
export const OfficialDocumentSourceCollection = z.enum([
  'BLPD_FORMS',
  'CITIZENS_CHARTER',
  'DATA_PRIVACY',
]);

export const OfficialDocumentSchema = z
  .object({
    access_status: OfficialDocumentAccessStatus,
    canonical_bsf_route: z.literal('/services/business').nullable(),
    covered_period: NonEmptyString.nullable(),
    covered_year: z.number().int().nullable(),
    document_date: IsoDateString.nullable(),
    document_number: NonEmptyString.nullable(),
    document_type: OfficialDocumentType,
    edition: NonEmptyString.nullable(),
    file_type: OfficialDocumentFileType,
    id: NonEmptyString,
    issuing_office: NonEmptyString,
    official_attachment_url: PublicHttpsUrl.nullable(),
    official_page_url: PublicHttpsUrl,
    publication_date: IsoDateString.nullable(),
    revision: NonEmptyString.nullable(),
    slug: NonEmptyString,
    source_collection: OfficialDocumentSourceCollection,
    source_verified_at: IsoDateString,
    status: OfficialDocumentStatus,
    title: NonEmptyString,
  })
  .strict();
export type OfficialDocument = z.infer<typeof OfficialDocumentSchema>;

const OfficialDocumentsFileSchema = z
  .object({
    dataset: z.literal('transparency-official-documents'),
    document_type_breakdown: z.record(
      OfficialDocumentType,
      z.number().int().nonnegative()
    ),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    overall_public_limitation: NonEmptyString,
    publication_status: z.literal('PUBLICATION_REVIEW_COMPLETE'),
    record_count: z.number().int().nonnegative(),
    records: z.array(OfficialDocumentSchema),
    route: z.literal('/transparency/documents'),
    schema_version: z.literal(1),
    status_breakdown: z.record(
      OfficialDocumentStatus,
      z.number().int().nonnegative()
    ),
  })
  .strict()
  .refine(file => file.record_count === file.records.length, {
    message: 'record_count must match records length',
  })
  .refine(
    file =>
      new Set(file.records.map(record => record.id)).size ===
      file.records.length,
    {
      message: 'record IDs must be unique',
    }
  )
  .refine(
    file =>
      new Set(file.records.map(record => record.slug)).size ===
      file.records.length,
    {
      message: 'record slugs must be unique',
    }
  );

const file = OfficialDocumentsFileSchema.parse(officialDocumentsJson);
const records: readonly OfficialDocument[] = Object.freeze(file.records);

export function getOfficialDocuments(): readonly OfficialDocument[] {
  return records;
}

export function getOfficialDocumentsMetadata() {
  return Object.freeze({
    documentTypeBreakdown: Object.freeze({ ...file.document_type_breakdown }),
    jurisdictionPsgc: file.jurisdiction_psgc,
    lastVerified: file.last_verified,
    overallPublicLimitation: file.overall_public_limitation,
    publicationStatus: file.publication_status,
    recordCount: file.record_count,
    route: file.route,
    statusBreakdown: Object.freeze({ ...file.status_breakdown }),
  });
}
