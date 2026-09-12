import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import governmentStructureSummaryJson from '../generated/civic/directories/government-structure-summary.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const EntityId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const PublicUrl = z.url().refine(url => /^https?:\/\//.test(url), {
  message: 'Expected a public HTTP(S) URL',
});

export const EntityBranch = z.enum(['executive', 'legislative']);
export const EntityType = z.enum([
  'office',
  'institution',
  'division',
  'board',
  'facility',
  'service_unit',
]);
export const RelationshipVerificationStatus = z.enum([
  'MATCHED_CURRENT_DEPARTMENTS_DIRECTORY',
  'VERIFIED_PUBLIC_FACILITY_OR_SERVICE_UNIT',
  'HOLD_UNRESOLVED_CLASSIFICATION',
]);
export const SourceScope = z.enum([
  'OFFICIAL_DEPARTMENTS_DIRECTORY',
  'OFFICIAL_OFFICE_PAGE',
  'INTERNAL_UMBRELLA',
  'PRIOR_RESEARCH_NOT_REVERIFIED_THIS_PASS',
]);
export const RelationshipType = z.enum([
  'division_of',
  'facility_of',
  'unit_of',
]);

export const GovernmentEntitySchema = z
  .object({
    branch: EntityBranch.nullable(),
    entity_type: EntityType,
    government_level: z.literal('city'),
    id: EntityId,
    is_city_government_unit: z.boolean(),
    name: NonEmptyString,
    notes: NonEmptyString,
    official_page_url: PublicUrl.nullable(),
    parent_id: EntityId.nullable(),
    relationship_verification_status: RelationshipVerificationStatus,
    source_scope: SourceScope,
  })
  .strict();
export type GovernmentEntity = z.infer<typeof GovernmentEntitySchema>;

export const GovernmentRelationshipSchema = z
  .object({
    child_id: EntityId,
    parent_id: EntityId,
    relationship_type: RelationshipType,
    source_url: PublicUrl,
    verification_status: z.enum([
      'MATCHED_CURRENT_DEPARTMENTS_DIRECTORY',
      'VERIFIED_PUBLIC_FACILITY_OR_SERVICE_UNIT',
    ]),
  })
  .strict();
export type GovernmentRelationship = z.infer<
  typeof GovernmentRelationshipSchema
>;

const GovernanceCategoriesSchema = z
  .object({
    executive: NonEmptyString,
    legislative: NonEmptyString,
    quasi_judicial_note: NonEmptyString,
  })
  .strict();

const GovernmentStructureSummaryFileSchema = z
  .object({
    barangay_count: z.literal(35),
    barangay_count_source_url: PublicUrl,
    barangay_count_verified_at: IsoDateString,
    betterSanFernando_directory_record_count: z.number().int().nonnegative(),
    charter_coverage_note: NonEmptyString,
    charter_coverage_summary: z.null(),
    dataset: z.literal('government_structure_summary'),
    entities: z.array(GovernmentEntitySchema),
    entity_type_breakdown: z.record(EntityType, z.number().int().nonnegative()),
    governance_categories: GovernanceCategoriesSchema,
    intended_route: z.literal('/statistics/government'),
    jurisdiction_name: NonEmptyString,
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    official_contact_coverage_count: z.number().int().nonnegative(),
    official_department_directory_count: z.number().int().nonnegative(),
    official_department_directory_url: PublicUrl,
    official_department_directory_verified_at: IsoDateString,
    official_department_nested_count: z.number().int().nonnegative(),
    official_department_top_level_count: z.number().int().nonnegative(),
    permanent_limitation: NonEmptyString,
    prohibited_claims_acknowledged: z.array(NonEmptyString).min(1),
    province: NonEmptyString,
    publication_status: z.literal('PUBLICATION_REVIEW_COMPLETE'),
    relationship_verification_status_breakdown: z.record(
      RelationshipVerificationStatus,
      z.number().int().nonnegative()
    ),
    relationships: z.array(GovernmentRelationshipSchema),
    schema_version: z.literal(1),
    source_scope_breakdown: z.record(
      SourceScope,
      z.number().int().nonnegative()
    ),
    verified_relationship_count: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine((file, context) => {
    if (
      file.entities.length !== file.betterSanFernando_directory_record_count
    ) {
      context.addIssue({
        code: 'custom',
        path: ['entities'],
        message:
          'entities length must match betterSanFernando_directory_record_count',
      });
    }
    if (file.relationships.length !== file.verified_relationship_count) {
      context.addIssue({
        code: 'custom',
        path: ['relationships'],
        message: 'relationships length must match verified_relationship_count',
      });
    }

    const entityIds = new Set<string>();
    for (const [index, entity] of file.entities.entries()) {
      if (entityIds.has(entity.id)) {
        context.addIssue({
          code: 'custom',
          path: ['entities', index, 'id'],
          message: `Duplicate entity ID: ${entity.id}`,
        });
      }
      entityIds.add(entity.id);
    }

    for (const [index, relationship] of file.relationships.entries()) {
      if (!entityIds.has(relationship.parent_id)) {
        context.addIssue({
          code: 'custom',
          path: ['relationships', index, 'parent_id'],
          message: `Unknown parent entity: ${relationship.parent_id}`,
        });
      }
      if (!entityIds.has(relationship.child_id)) {
        context.addIssue({
          code: 'custom',
          path: ['relationships', index, 'child_id'],
          message: `Unknown child entity: ${relationship.child_id}`,
        });
      }
    }

    const actualEntityTypeBreakdown: Record<string, number> = {};
    for (const entity of file.entities) {
      actualEntityTypeBreakdown[entity.entity_type] =
        (actualEntityTypeBreakdown[entity.entity_type] ?? 0) + 1;
    }
    for (const [type, count] of Object.entries(file.entity_type_breakdown)) {
      if (actualEntityTypeBreakdown[type] !== count) {
        context.addIssue({
          code: 'custom',
          path: ['entity_type_breakdown', type],
          message: `entity_type_breakdown.${type} must match actual entity count`,
        });
      }
    }

    if (
      file.official_department_top_level_count +
        file.official_department_nested_count !==
      file.official_department_directory_count
    ) {
      context.addIssue({
        code: 'custom',
        path: ['official_department_directory_count'],
        message:
          'official_department_top_level_count + official_department_nested_count must equal official_department_directory_count',
      });
    }
  });

const file = GovernmentStructureSummaryFileSchema.parse(
  governmentStructureSummaryJson
);
const entities: readonly GovernmentEntity[] = Object.freeze(file.entities);
const relationships: readonly GovernmentRelationship[] = Object.freeze(
  file.relationships
);
const entityById = new Map(entities.map(entity => [entity.id, entity]));

export function getGovernmentEntities(): readonly GovernmentEntity[] {
  return entities;
}

export function getGovernmentEntityById(
  id: string
): GovernmentEntity | undefined {
  return entityById.get(id);
}

export function getVerifiedRelationships(): readonly GovernmentRelationship[] {
  return relationships;
}

export function getVerifiedChildren(
  parentId: string
): readonly GovernmentEntity[] {
  return relationships
    .filter(r => r.parent_id === parentId)
    .map(r => entityById.get(r.child_id))
    .filter((entity): entity is GovernmentEntity => Boolean(entity));
}

export function getGovernmentStructureMetadata() {
  return Object.freeze({
    barangayCount: file.barangay_count,
    betterSanFernandoDirectoryRecordCount:
      file.betterSanFernando_directory_record_count,
    charterCoverageNote: file.charter_coverage_note,
    entityTypeBreakdown: Object.freeze({ ...file.entity_type_breakdown }),
    governanceCategories: Object.freeze({ ...file.governance_categories }),
    jurisdictionName: file.jurisdiction_name,
    jurisdictionPsgc: file.jurisdiction_psgc,
    lastVerified: file.last_verified,
    officialContactCoverageCount: file.official_contact_coverage_count,
    officialDepartmentDirectoryCount: file.official_department_directory_count,
    officialDepartmentDirectoryUrl: file.official_department_directory_url,
    officialDepartmentDirectoryVerifiedAt:
      file.official_department_directory_verified_at,
    officialDepartmentNestedCount: file.official_department_nested_count,
    officialDepartmentTopLevelCount: file.official_department_top_level_count,
    permanentLimitation: file.permanent_limitation,
    prohibitedClaimsAcknowledged: Object.freeze([
      ...file.prohibited_claims_acknowledged,
    ]),
    province: file.province,
    publicationStatus: file.publication_status,
    relationshipVerificationStatusBreakdown: Object.freeze({
      ...file.relationship_verification_status_breakdown,
    }),
    sourceScopeBreakdown: Object.freeze({ ...file.source_scope_breakdown }),
    verifiedRelationshipCount: file.verified_relationship_count,
  });
}
