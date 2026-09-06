import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import officialLinksJson from '../generated/civic/government/official-links.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const PublicUrl = z.url().refine(url => /^https?:\/\//.test(url), {
  message: 'Expected a public HTTP(S) URL',
});

export const OfficialLinkChannelType = z.enum([
  'OFFICIAL_WEBSITE',
  'OFFICIAL_DIGITAL_SERVICE',
  'OFFICIAL_FACEBOOK_PAGE',
]);

export const OfficialLinkOwnershipStatus = z.enum(['INSTITUTION_OWNED']);

export const OfficialLinkVerificationStatus = z.enum([
  'CURRENT_VERIFIED',
  'CURRENT_VERIFIED_NAMING_OR_REORG_CONFLICT_UNRESOLVED',
]);

const OfficialLinkSourceSchema = z
  .object({
    label: NonEmptyString,
    url: PublicUrl,
  })
  .strict();

export const OfficialLinkSchema = z
  .object({
    channel_type: OfficialLinkChannelType,
    id: NonEmptyString,
    label: NonEmptyString,
    limitation_note: NonEmptyString,
    office_acronym: NonEmptyString.nullable(),
    ownership_status: OfficialLinkOwnershipStatus,
    owning_entity: NonEmptyString,
    public_purpose: NonEmptyString,
    sources: z.array(OfficialLinkSourceSchema).min(1),
    url: PublicUrl,
    verification_status: OfficialLinkVerificationStatus,
    verified_at: IsoDateString,
  })
  .strict();
export type OfficialLink = z.infer<typeof OfficialLinkSchema>;

const OfficialLinksFileSchema = z
  .object({
    channel_type_breakdown: z.record(
      OfficialLinkChannelType,
      z.number().int().nonnegative()
    ),
    dataset: z.literal('government-official-links'),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    links: z.array(OfficialLinkSchema),
    overall_public_limitation: NonEmptyString,
    publication_status: z.literal('PUBLICATION_REVIEW_COMPLETE'),
    record_count: z.number().int().nonnegative(),
    route: z.literal('/government/links'),
    schema_version: z.number().int(),
  })
  .strict()
  .refine(
    file => file.record_count === file.links.length,
    'record_count must match links length'
  )
  .refine(file => {
    const ids = file.links.map(link => link.id);
    return new Set(ids).size === ids.length;
  }, 'link ids must be unique')
  .refine(file => {
    const urls = file.links.map(link => link.url);
    return new Set(urls).size === urls.length;
  }, 'link urls must be unique');

const officialLinksFile = OfficialLinksFileSchema.parse(officialLinksJson);

// Preserves the export's own ordering; publication review already
// deduplicated and organized the set.
const links: readonly OfficialLink[] = Object.freeze(officialLinksFile.links);

export type OfficialLinksMetadata = Readonly<{
  recordCount: number;
  channelTypeBreakdown: Readonly<Record<string, number>>;
  jurisdictionPsgc: string;
  lastVerified: string;
  overallPublicLimitation: string;
  route: string;
}>;

const metadata: OfficialLinksMetadata = Object.freeze({
  recordCount: officialLinksFile.record_count,
  channelTypeBreakdown: Object.freeze({
    ...officialLinksFile.channel_type_breakdown,
  }),
  jurisdictionPsgc: officialLinksFile.jurisdiction_psgc,
  lastVerified: officialLinksFile.last_verified,
  overallPublicLimitation: officialLinksFile.overall_public_limitation,
  route: officialLinksFile.route,
});

export function getOfficialLinks(): readonly OfficialLink[] {
  return links;
}

export function getOfficialLinksMetadata(): OfficialLinksMetadata {
  return metadata;
}
