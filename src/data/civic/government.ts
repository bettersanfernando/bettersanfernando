import { z } from 'zod';
import { PsgcCode } from './schemas.ts';
import cityOfficesJson from '../generated/civic/directories/city-offices.json' with { type: 'json' };

const SocialAccount = z.object({
  platform: z.string(),
  account_name: z.string(),
  url: z.url(),
  role: z.string().optional(),
});

export const VerificationStatus = z.enum(['verified']);

export const CityOfficeSchema = z.object({
  office_id: z.string(),
  office_name: z.string(),
  acronym: z.string().optional(),
  jurisdiction_psgc: PsgcCode,
  head_of_office: z.string().optional(),
  parent_facility: z.string().nullable(),
  physical_address: z.string(),
  primary_phone: z.string().optional(),
  phone_extensions: z.array(z.string()).optional(),
  emergency_hotlines: z.array(z.string()).optional(),
  institutional_email: z.string().optional(),
  operational_email: z.string().optional(),
  additional_emails: z.array(z.string()).optional(),
  social_accounts: z.array(SocialAccount),
  source_urls: z.array(z.url()),
  verification_status: VerificationStatus,
  last_verified_at: z.string(),
});
export type CityOffice = z.infer<typeof CityOfficeSchema>;

const CityOfficesFileSchema = z.object({
  city_name: z.string(),
  city_psgc_code: PsgcCode,
  province: z.string(),
  office_count: z.number().int(),
  last_verified: z.string(),
  offices: z.array(CityOfficeSchema),
});

const cityOfficesFile = CityOfficesFileSchema.parse(cityOfficesJson);

const offices: readonly CityOffice[] = Object.freeze(cityOfficesFile.offices);
const officeById = new Map(offices.map(o => [o.office_id, o]));

export function getCityOffices(): readonly CityOffice[] {
  return offices;
}

export function getCityOfficeById(officeId: string): CityOffice | undefined {
  return officeById.get(officeId);
}
