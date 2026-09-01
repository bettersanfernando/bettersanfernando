import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import executiveOrdersJson from '../generated/civic/legislation/executive-orders.json' with { type: 'json' };
import ordinancesJson from '../generated/civic/legislation/ordinances.json' with { type: 'json' };
import resolutionsJson from '../generated/civic/legislation/resolutions.json' with { type: 'json' };

/**
 * Legislation-domain source authority — distinct value set from the
 * project-evidence domain's (see projects.ts EvidenceSourceAuthority).
 * SECONDARY_OFFICIAL marks a record cited by another official page rather
 * than published with its own official_page_url (see reference_url).
 */
export const LegislationSourceAuthority = z.enum([
  'PRIMARY_OFFICIAL',
  'SECONDARY_OFFICIAL',
]);

/**
 * All three legislation exports (executive orders, ordinances, resolutions)
 * are produced by the same generator field-allowlist (trimLegislationRecord
 * in bettersanfernando-data/scripts/generate-exports.js), so they share one
 * record shape; individual records only populate the fields relevant to
 * their document type (e.g. executive orders use title/issuer_*, ordinances
 * use official_title/official_alias).
 */
export const LegislationRecordSchema = z.object({
  id: z.string(),
  document_type: z.string(),
  document_number: z.string(),
  title: z.string().optional(),
  official_title: z.string().nullable().optional(),
  official_alias: z.string().optional(),
  described_context: z.string().optional(),
  described_subject: z.string().optional(),
  date_issued: IsoDateString.nullable().optional(),
  date_adopted: IsoDateString.nullable().optional(),
  date_approved: IsoDateString.nullable().optional(),
  year: z.number().int(),
  issuing_body: z.string(),
  issuer_name: z.string().optional(),
  issuer_title: z.string().optional(),
  official_page_url: z.url().optional(),
  official_pdf_url: z.url().nullable().optional(),
  reference_url: z.url().optional(),
  source_authority: LegislationSourceAuthority,
  full_text_available: z.boolean(),
});
export type LegislationRecord = z.infer<typeof LegislationRecordSchema>;

const legislationFileFields = {
  document_type: z.string(),
  jurisdiction_name: z.string(),
  jurisdiction_psgc: PsgcCode,
  province: z.string(),
  record_count: z.number().int(),
};

const ExecutiveOrdersFileSchema = z.object({
  ...legislationFileFields,
  executive_orders: z.array(LegislationRecordSchema),
});
const OrdinancesFileSchema = z.object({
  ...legislationFileFields,
  ordinances: z.array(LegislationRecordSchema),
});
const ResolutionsFileSchema = z.object({
  ...legislationFileFields,
  resolutions: z.array(LegislationRecordSchema),
});

const executiveOrders: readonly LegislationRecord[] = Object.freeze(
  ExecutiveOrdersFileSchema.parse(executiveOrdersJson).executive_orders
);
const ordinances: readonly LegislationRecord[] = Object.freeze(
  OrdinancesFileSchema.parse(ordinancesJson).ordinances
);
const resolutions: readonly LegislationRecord[] = Object.freeze(
  ResolutionsFileSchema.parse(resolutionsJson).resolutions
);

export function getExecutiveOrders(): readonly LegislationRecord[] {
  return executiveOrders;
}

export function getOrdinances(): readonly LegislationRecord[] {
  return ordinances;
}

export function getLegislationSourceUrl(
  record: LegislationRecord
): string | null {
  return record.official_page_url ?? record.reference_url ?? null;
}

export function hasLegislationFullText(record: LegislationRecord): boolean {
  return record.full_text_available && Boolean(record.official_pdf_url);
}

export function getResolutions(): readonly LegislationRecord[] {
  return resolutions;
}
