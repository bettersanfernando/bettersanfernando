import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import cityOfficesJson from '../generated/civic/directories/city-offices.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const OfficeId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const PublicUrl = z.url().refine(url => /^https?:\/\//.test(url), {
  message: 'Expected a public HTTP(S) URL',
});
const Email = z.email();

const SocialAccount = z
  .object({
    platform: z.literal('Facebook'),
    url: PublicUrl,
  })
  .strict();

export const VerificationStatus = z.literal('verified');

export const CityOfficeSchema = z
  .object({
    office_id: OfficeId,
    office_name: NonEmptyString,
    acronym: NonEmptyString.optional(),
    alternate_names: z.array(NonEmptyString).min(1).optional(),
    name_status: z.literal('alternate_current_usage').optional(),
    organization_status: z.literal('possible_reorganization').optional(),
    jurisdiction_psgc: PsgcCode,
    parent_office_id: OfficeId.nullable(),
    child_office_ids: z.array(OfficeId),
    physical_address: NonEmptyString.optional(),
    primary_phone: NonEmptyString.optional(),
    phone_extensions: z.array(NonEmptyString).min(1).optional(),
    emergency_hotlines: z.array(NonEmptyString).min(1).optional(),
    institutional_email: Email.optional(),
    operational_email: Email.optional(),
    additional_emails: z.array(Email).min(1).optional(),
    social_accounts: z.array(SocialAccount),
    official_page_url: PublicUrl.optional(),
    source_urls: z.array(PublicUrl).min(1),
    verification_status: VerificationStatus,
    last_verified_at: IsoDateString.optional(),
  })
  .strict();
export type CityOffice = z.infer<typeof CityOfficeSchema>;

export const CityOfficesFileSchema = z
  .object({
    city_name: NonEmptyString,
    city_psgc_code: PsgcCode,
    province: NonEmptyString,
    office_count: z.number().int().nonnegative(),
    last_verified: IsoDateString,
    structure_status: z.literal('partial_verified_relationships'),
    offices: z.array(CityOfficeSchema),
  })
  .strict()
  .superRefine((file, context) => {
    const officeById = new Map<string, CityOffice>();

    for (const [index, office] of file.offices.entries()) {
      if (officeById.has(office.office_id)) {
        context.addIssue({
          code: 'custom',
          path: ['offices', index, 'office_id'],
          message: `Duplicate office ID: ${office.office_id}`,
        });
      }
      officeById.set(office.office_id, office);
    }

    if (file.office_count !== file.offices.length) {
      context.addIssue({
        code: 'custom',
        path: ['office_count'],
        message: 'office_count must match offices length',
      });
    }

    for (const [index, office] of file.offices.entries()) {
      if (office.parent_office_id === office.office_id) {
        context.addIssue({
          code: 'custom',
          path: ['offices', index, 'parent_office_id'],
          message: 'An office cannot be its own parent',
        });
      } else if (
        office.parent_office_id &&
        !officeById.has(office.parent_office_id)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['offices', index, 'parent_office_id'],
          message: `Unknown parent office: ${office.parent_office_id}`,
        });
      }

      const childIds = new Set<string>();
      for (const [childIndex, childId] of office.child_office_ids.entries()) {
        const child = officeById.get(childId);
        const path = ['offices', index, 'child_office_ids', childIndex];
        if (childId === office.office_id) {
          context.addIssue({
            code: 'custom',
            path,
            message: 'An office cannot be its own child',
          });
        } else if (childIds.has(childId)) {
          context.addIssue({
            code: 'custom',
            path,
            message: `Duplicate child office: ${childId}`,
          });
        } else if (!child) {
          context.addIssue({
            code: 'custom',
            path,
            message: `Unknown child office: ${childId}`,
          });
        } else if (child.parent_office_id !== office.office_id) {
          context.addIssue({
            code: 'custom',
            path,
            message: `Child ${childId} does not reference ${office.office_id} as parent`,
          });
        }
        childIds.add(childId);
      }

      if (office.parent_office_id) {
        const parent = officeById.get(office.parent_office_id);
        if (parent && !parent.child_office_ids.includes(office.office_id)) {
          context.addIssue({
            code: 'custom',
            path: ['offices', index, 'parent_office_id'],
            message: `Parent ${parent.office_id} does not reference ${office.office_id} as child`,
          });
        }
      }

      const ancestors = new Set([office.office_id]);
      let current = office;
      while (current.parent_office_id) {
        if (ancestors.has(current.parent_office_id)) {
          context.addIssue({
            code: 'custom',
            path: ['offices', index, 'parent_office_id'],
            message: `Organization cycle found from ${office.office_id}`,
          });
          break;
        }
        ancestors.add(current.parent_office_id);
        const parent = officeById.get(current.parent_office_id);
        if (!parent) break;
        current = parent;
      }
    }
  });

const cityOfficesFile = CityOfficesFileSchema.parse(cityOfficesJson);
const offices: readonly CityOffice[] = Object.freeze(cityOfficesFile.offices);
const officeById = new Map(offices.map(office => [office.office_id, office]));

export type CityOfficesMetadata = Readonly<{
  cityName: string;
  province: string;
  officeCount: number;
  lastVerified: string;
}>;

const metadata: CityOfficesMetadata = Object.freeze({
  cityName: cityOfficesFile.city_name,
  province: cityOfficesFile.province,
  officeCount: cityOfficesFile.office_count,
  lastVerified: cityOfficesFile.last_verified,
});

export function getCityOffices(): readonly CityOffice[] {
  return offices;
}

export function getCityOfficeById(officeId: string): CityOffice | undefined {
  return officeById.get(officeId);
}

export function getParentOffice(office: CityOffice): CityOffice | undefined {
  return office.parent_office_id
    ? officeById.get(office.parent_office_id)
    : undefined;
}

export function getChildOffices(office: CityOffice): readonly CityOffice[] {
  return office.child_office_ids.map(officeId => officeById.get(officeId)!);
}

export function getCityOfficesMetadata(): CityOfficesMetadata {
  return metadata;
}
