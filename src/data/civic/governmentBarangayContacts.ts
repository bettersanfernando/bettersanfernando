import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import barangayContactsJson from '../generated/civic/government/barangay-contacts.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const PublicUrl = z.url().refine(url => /^https?:\/\//.test(url), {
  message: 'Expected a public HTTP(S) URL',
});

export const ContactNumberStatus = z.enum([
  'valid',
  'invalid_length',
  'non_mobile_published',
]);

export const BarangayContactType = z.enum([
  'BARANGAY_SECRETARY',
  'BHERT_MEMBER',
]);

const ContactNumberSchema = z
  .object({
    number: NonEmptyString,
    status: ContactNumberStatus,
  })
  .strict();

const ContactSourceSchema = z
  .object({
    accessed_at: IsoDateString,
    document_date: IsoDateString,
    label: NonEmptyString,
    publisher: NonEmptyString,
    url: PublicUrl,
  })
  .strict();

export const BarangayContactSchema = z
  .object({
    barangay_name: NonEmptyString,
    barangay_psgc: PsgcCode,
    contact_numbers: z.array(ContactNumberSchema),
    contact_type: BarangayContactType,
    designation: NonEmptyString,
    id: NonEmptyString,
    name: NonEmptyString.nullable(),
    source: ContactSourceSchema,
  })
  .strict();
export type BarangayContact = z.infer<typeof BarangayContactSchema>;

const BarangayContactGroupFileSchema = z
  .object({
    barangay_name: NonEmptyString,
    barangay_psgc: PsgcCode,
    contacts: z.array(BarangayContactSchema),
  })
  .strict();

const BarangayContactsFileSchema = z
  .object({
    barangay_count: z.number().int().nonnegative(),
    barangays: z.array(BarangayContactGroupFileSchema),
    dataset: z.literal('barangay-contacts'),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    overall_public_limitation: NonEmptyString,
    publication_status: z.literal('PUBLICATION_REVIEW_COMPLETE'),
    record_count: z.number().int().nonnegative(),
    route: z.literal('/government/barangay-contacts'),
    schema_version: z.number().int(),
  })
  .strict()
  .refine(
    file => file.barangay_count === file.barangays.length,
    'barangay_count must match barangays length'
  )
  .refine(file => {
    const total = file.barangays.reduce(
      (sum, group) => sum + group.contacts.length,
      0
    );
    return total === file.record_count;
  }, 'record_count must match the total contact count across all barangays');

const barangayContactsFile =
  BarangayContactsFileSchema.parse(barangayContactsJson);

export type BarangayContactGroup = Readonly<{
  barangayName: string;
  barangayPsgc: string;
  contacts: readonly BarangayContact[];
}>;

// Preserves the export's own barangay and contact ordering (Barangay
// Secretary first, then BHERT members) rather than re-sorting.
const groups: readonly BarangayContactGroup[] = Object.freeze(
  barangayContactsFile.barangays.map(group =>
    Object.freeze({
      barangayName: group.barangay_name,
      barangayPsgc: group.barangay_psgc,
      contacts: Object.freeze(group.contacts),
    })
  )
);

export type BarangayContactsMetadata = Readonly<{
  barangayCount: number;
  recordCount: number;
  jurisdictionPsgc: string;
  lastVerified: string;
  overallPublicLimitation: string;
  route: string;
}>;

const metadata: BarangayContactsMetadata = Object.freeze({
  barangayCount: barangayContactsFile.barangay_count,
  recordCount: barangayContactsFile.record_count,
  jurisdictionPsgc: barangayContactsFile.jurisdiction_psgc,
  lastVerified: barangayContactsFile.last_verified,
  overallPublicLimitation: barangayContactsFile.overall_public_limitation,
  route: barangayContactsFile.route,
});

export function getBarangayContactGroups(): readonly BarangayContactGroup[] {
  return groups;
}

export function getBarangayContactsMetadata(): BarangayContactsMetadata {
  return metadata;
}
