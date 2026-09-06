import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import hotlinesJson from '../generated/civic/government/hotlines.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const PublicUrl = z.url().refine(url => /^https?:\/\//.test(url), {
  message: 'Expected a public HTTP(S) URL',
});

/**
 * The private repository's owner-approved review vocabulary
 * (data/government/hotlines-publication-review.json). Not every value can
 * appear in a published export — HELD_UNRESOLVED and EXCLUDED_* describe
 * candidates the review kept out of publication — but the enum stays closed
 * to the full vocabulary so a future export cannot silently introduce an
 * unreviewed classification.
 */
export const HotlineClassification = z.enum([
  'VERIFIED_EMERGENCY_HOTLINE',
  'VERIFIED_INSTITUTIONAL_CONTACT',
  'OFFICIALLY_LISTED_NOT_CALL_TESTED',
  'SINGLE_SOURCE_LIMITATION',
  'CONFLICT_RESOLVED_BY_CURRENT_CHARTER',
  'HELD_UNRESOLVED',
  'EXCLUDED_PERSON_LEVEL',
  'EXCLUDED_OUT_OF_SCOPE',
]);

export const HotlinePresentationGroupId = z.enum([
  'EMERGENCY_NUMBERS',
  'CDRRMO_COMMAND_CENTER_CONTACTS',
  'RELATED_EMERGENCY_SERVICE_OFFICE_CONTACTS',
]);

const HotlineSourceSchema = z
  .object({
    label: NonEmptyString,
    url: PublicUrl,
  })
  .strict();

export const HotlineContactSchema = z
  .object({
    id: NonEmptyString,
    organization: NonEmptyString,
    public_purpose: NonEmptyString,
    number: NonEmptyString,
    label: NonEmptyString.optional(),
    extension: NonEmptyString.optional(),
    contact_type: z.enum([
      'EMERGENCY',
      'OFFICE',
      'OFFICE_AND_EMERGENCY_LISTED_TOGETHER',
      'OFFICE_AND_PUBLIC_SAFETY',
    ]),
    operating_scope: NonEmptyString,
    address: NonEmptyString.optional(),
    classification: HotlineClassification,
    presentation_group: HotlinePresentationGroupId,
    limitation_note: NonEmptyString,
    alternate_official_label: NonEmptyString.optional(),
    sources: z.array(HotlineSourceSchema).min(1),
  })
  .strict();
export type HotlineContact = z.infer<typeof HotlineContactSchema>;

const HotlinesFileSchema = z
  .object({
    dataset: z.literal('government-hotlines'),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    publication_status: z.literal('PUBLICATION_REVIEW_COMPLETE'),
    route: z.literal('/government/hotlines'),
    schema_version: z.number().int(),
    record_count: z.number().int().nonnegative(),
    overall_public_limitation: NonEmptyString,
    presentation_groups: z
      .array(
        z.object({
          group_id: HotlinePresentationGroupId,
          label: NonEmptyString,
          candidate_ids: z.array(NonEmptyString).min(1),
        })
      )
      .min(1),
    contacts: z.array(HotlineContactSchema),
  })
  .strict()
  .refine(file => file.record_count === file.contacts.length, {
    message: 'record_count must match contacts length',
  });

const hotlinesFile = HotlinesFileSchema.parse(hotlinesJson);
const contacts: readonly HotlineContact[] = Object.freeze(
  hotlinesFile.contacts
);
const contactById = new Map(contacts.map(contact => [contact.id, contact]));

export type HotlineGroup = Readonly<{
  groupId: z.infer<typeof HotlinePresentationGroupId>;
  label: string;
  contacts: readonly HotlineContact[];
}>;

const groups: readonly HotlineGroup[] = Object.freeze(
  hotlinesFile.presentation_groups.map(group =>
    Object.freeze({
      groupId: group.group_id,
      label: group.label,
      contacts: Object.freeze(
        group.candidate_ids.map(id => contactById.get(id)!)
      ),
    })
  )
);

export type GovernmentHotlinesMetadata = Readonly<{
  jurisdictionPsgc: string;
  lastVerified: string;
  overallPublicLimitation: string;
  route: string;
}>;

const metadata: GovernmentHotlinesMetadata = Object.freeze({
  jurisdictionPsgc: hotlinesFile.jurisdiction_psgc,
  lastVerified: hotlinesFile.last_verified,
  overallPublicLimitation: hotlinesFile.overall_public_limitation,
  route: hotlinesFile.route,
});

export function getGovernmentHotlines(): readonly HotlineContact[] {
  return contacts;
}

export function getGovernmentHotlineGroups(): readonly HotlineGroup[] {
  return groups;
}

export function getGovernmentHotlinesMetadata(): GovernmentHotlinesMetadata {
  return metadata;
}
