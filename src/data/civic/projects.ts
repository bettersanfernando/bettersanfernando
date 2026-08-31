import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import cityProjectsJson from '../generated/civic/projects/city-projects.json' with { type: 'json' };
import projectEvidenceJson from '../generated/civic/projects/project-evidence.json' with { type: 'json' };

/** Evidence-domain source authority — distinct value set from legislation's. */
export const EvidenceSourceAuthority = z.enum([
  'PRIMARY_OFFICIAL',
  'PRIMARY_OFFICIAL_CSFP',
]);

/**
 * Lifecycle values as actually produced by the export (schema_version 1).
 * Do not add ONGOING. If a sync introduces a new value (e.g. COMPLETED,
 * NOTICE_TO_PROCEED, CANCELLED), this schema will fail parsing — that is
 * intentional: it forces an explicit review of the new state rather than
 * silently accepting it.
 */
export const ProjectLifecycleStatus = z.enum([
  'PLANNED',
  'PROCUREMENT',
  'AWARDED',
  'CONTRACTED',
]);
export type ProjectLifecycleStatus = z.infer<typeof ProjectLifecycleStatus>;

export const ProjectCategory = z.enum([
  'INFRASTRUCTURE_CAPITAL',
  'INFRASTRUCTURE_MAINTENANCE',
]);
export const ProjectType = z.enum([
  'BUILDING',
  'DRAINAGE',
  'ROAD',
  'SLOPE_PROTECTION',
  'WATERWAY_WORKS',
  'UTILITIES',
  'CEMETERY',
  'OTHER_INFRASTRUCTURE',
  'BRIDGE',
  'PARK_RECREATION',
  'DISASTER_MITIGATION',
]);
export const VerificationConfidence = z.enum(['HIGH', 'MEDIUM']);

/** Namespaced procurement identifiers — kept distinct, never flattened. */
export const ProjectIdentifiers = z.object({
  app_code: z.string().nullable(),
  bid_reference: z.string().nullable(),
  contract_number: z.string().nullable(),
  philgeps_reference: z.string().nullable(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  project_name: z.string(),
  project_category: ProjectCategory,
  project_type: ProjectType,
  lifecycle_status: ProjectLifecycleStatus,
  status_as_of: IsoDateString,
  year: z.number().int(),

  barangay: z.string().nullable(),
  barangay_psgc: PsgcCode.nullable(),
  jurisdiction_psgc: PsgcCode,

  // Distinct budget/money semantics — never collapsed into one "amount".
  approved_budget_abc: z.number().nullable(),
  winning_bid_amount: z.number().nullable(),
  contract_amount: z.number().nullable(),

  contractor: z.string().nullable(),
  funding_source: z.string().nullable(),
  procurement_mode: z.string().nullable(),

  award_date: IsoDateString.nullable(),
  contract_effectivity_date: IsoDateString.nullable(),
  contract_end_date: IsoDateString.nullable(),

  identifiers: ProjectIdentifiers,
  verification_confidence: VerificationConfidence,
});
export type Project = z.infer<typeof ProjectSchema>;

const CityProjectsFileSchema = z.object({
  jurisdiction_psgc: PsgcCode,
  record_count: z.number().int(),
  projects: z.array(ProjectSchema),
});

export const ProjectEvidenceStage = z.enum([
  'ITB',
  'NOTICE_OF_AWARD',
  'APP',
  'BID_RESULTS',
  'PROCUREMENT_MONITORING_REPORT',
]);

export const RetrievalStatus = z.enum([
  'ATTACHMENT_LINK_RECOVERED',
  'INSPECTED',
  'PAGE_ONLY',
  'PAGE_ONLY_RESEARCH_VERIFIED',
  'URL_RECORDED_NOT_DOWNLOADED',
  'ARCHIVED_SIGNATURE_VERIFIED',
]);

export const ProjectEvidenceSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  stage: ProjectEvidenceStage,

  // Provenance — must survive intact. See docs/DATA-POLICY.md's
  // FACT -> SOURCE -> OFFICIAL LINK trust model.
  page_url: z.url().nullable(),
  attachment_url: z.url().nullable(),
  source_identifier: z.string(),
  source_authority: EvidenceSourceAuthority,
  source_sha256: z.string().optional(),
  document_date: IsoDateString.nullable(),
  retrieval_status: RetrievalStatus,
  fields_established: z.array(z.string()),

  // Per-stage extracted facts — heterogeneous by stage, genuinely opaque.
  facts: z.record(z.string(), z.unknown()).optional(),
});
export type ProjectEvidence = z.infer<typeof ProjectEvidenceSchema>;

const ProjectEvidenceFileSchema = z.object({
  record_count: z.number().int(),
  evidence: z.array(ProjectEvidenceSchema),
});

const projectsFile = CityProjectsFileSchema.parse(cityProjectsJson);
const evidenceFile = ProjectEvidenceFileSchema.parse(projectEvidenceJson);

const projects: readonly Project[] = Object.freeze(projectsFile.projects);
const evidence: readonly ProjectEvidence[] = Object.freeze(
  evidenceFile.evidence
);

const projectsById = new Map(projects.map(p => [p.id, p]));
const evidenceById = new Map(evidence.map(e => [e.id, e]));
const evidenceByProjectId = new Map<string, ProjectEvidence[]>();
for (const e of evidence) {
  const list = evidenceByProjectId.get(e.project_id) ?? [];
  list.push(e);
  evidenceByProjectId.set(e.project_id, list);
}

export function getProjects(): readonly Project[] {
  return projects;
}

export function getProjectById(id: string): Project | undefined {
  return projectsById.get(id);
}

export function getProjectsByBarangay(
  barangayPsgc: string
): readonly Project[] {
  return projects.filter(p => p.barangay_psgc === barangayPsgc);
}

export function getProjectsByLifecycle(
  status: ProjectLifecycleStatus
): readonly Project[] {
  return projects.filter(p => p.lifecycle_status === status);
}

export function getAllProjectEvidence(): readonly ProjectEvidence[] {
  return evidence;
}

export function getEvidenceById(id: string): ProjectEvidence | undefined {
  return evidenceById.get(id);
}

export function getProjectEvidence(
  projectId: string
): readonly ProjectEvidence[] {
  return evidenceByProjectId.get(projectId) ?? [];
}
