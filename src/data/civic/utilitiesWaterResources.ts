import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import resourcesJson from '../generated/civic/services/utilities-water-resources.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const PublicUrl = z.url().refine(url => /^https?:\/\//.test(url), {
  message: 'Expected a public HTTP(S) URL',
});

const DigitalUtilityResourceSchema = z.strictObject({
  category: z.literal('utilities-water'),
  channels: z.null(),
  contact: z.strictObject({ phone: NonEmptyString }),
  description: NonEmptyString,
  function_note: NonEmptyString,
  id: NonEmptyString,
  public_notes: z.array(NonEmptyString).min(1),
  reply_standard: z.null(),
  resource_type: z.literal('digital_utility'),
  title: NonEmptyString,
  url: PublicUrl,
});

const SharedSupportResourceSchema = z.strictObject({
  category: z.literal('utilities-water'),
  channels: z.strictObject({
    email: z.email(),
    phone: NonEmptyString,
    walk_in: NonEmptyString,
  }),
  contact: z.null(),
  description: NonEmptyString,
  function_note: z.null(),
  id: NonEmptyString,
  public_notes: z.array(NonEmptyString).min(1),
  reply_standard: NonEmptyString,
  resource_type: z.literal('shared_support_resource'),
  title: NonEmptyString,
  url: z.null(),
});

const UtilitiesWaterResourceSchema = z.union([
  DigitalUtilityResourceSchema,
  SharedSupportResourceSchema,
]);
export type UtilitiesWaterResource = z.infer<
  typeof UtilitiesWaterResourceSchema
>;

const UtilitiesWaterResourcesFileSchema = z.strictObject({
  category: z.literal('utilities-water'),
  dataset: z.literal('utilities-water-resources'),
  jurisdiction_psgc: PsgcCode,
  last_verified: IsoDateString,
  publication_status: z.literal('PUBLICATION_REVIEW_COMPLETE'),
  record_count: z.literal(2),
  resources: z.array(UtilitiesWaterResourceSchema).length(2),
  schema_version: z.literal(1),
});

const resourcesFile = UtilitiesWaterResourcesFileSchema.parse(resourcesJson);
const resources: readonly UtilitiesWaterResource[] = Object.freeze(
  resourcesFile.resources
);

export function getUtilitiesWaterResources(): readonly UtilitiesWaterResource[] {
  return resources;
}
