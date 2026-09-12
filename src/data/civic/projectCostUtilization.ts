import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import projectCostUtilizationJson from '../generated/civic/projects/project-cost-utilization.json' with { type: 'json' };
import { getProjectById } from './projects.ts';

const NonEmptyString = z.string().trim().min(1);
const PublicHttpsUrl = z.url().refine(url => url.startsWith('https://'), {
  message: 'Expected a public HTTPS URL',
});
const Percent = z.number().nonnegative();

export const ProjectCostUtilizationObservationSchema = z
  .object({
    canonical_project_id: NonEmptyString,
    cost_incurred_to_date_percent_derived: Percent.nullable(),
    currency_unit: z.null(),
    id: NonEmptyString,
    official_attachment_url: PublicHttpsUrl,
    official_page_url: PublicHttpsUrl.nullable(),
    period_basis: z.literal('year_to_date'),
    physical_completion_percent: Percent,
    reporting_quarter: z.number().int().min(1).max(4),
    reporting_year: z.number().int(),
    status_remarks: NonEmptyString,
    total_cost: z.number().nonnegative().nullable(),
    total_cost_incurred_to_date: z.number().nonnegative().nullable(),
    verification_date: IsoDateString,
  })
  .strict();
export type ProjectCostUtilizationObservation = z.infer<
  typeof ProjectCostUtilizationObservationSchema
>;

const ProjectCostUtilizationFileSchema = z
  .object({
    coverage_limitation: NonEmptyString,
    dataset: z.literal('project-cost-utilization'),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    observations: z.array(ProjectCostUtilizationObservationSchema),
    publication_status: z.literal(
      'PUBLICATION_REVIEW_COMPLETE_FOR_BOUNDED_SUBSET'
    ),
    record_count: z.number().int().nonnegative(),
    schema_version: z.number().int(),
    title: NonEmptyString,
    unique_project_count: z.number().int().nonnegative(),
  })
  .strict()
  .refine(
    file => file.record_count === file.observations.length,
    'record_count must match observations length'
  )
  .refine(file => {
    const ids = file.observations.map(observation => observation.id);
    return new Set(ids).size === ids.length;
  }, 'observation ids must be unique')
  .refine(file => {
    const projectIds = new Set(
      file.observations.map(observation => observation.canonical_project_id)
    );
    return projectIds.size === file.unique_project_count;
  }, 'unique_project_count must match the distinct canonical_project_id count');

const file = ProjectCostUtilizationFileSchema.parse(projectCostUtilizationJson);

// Every observation must resolve against the published city-projects export.
// This intentionally throws at load time — an unresolved reference means the
// two synced exports have drifted, which must fail loudly, not silently drop
// a record.
for (const observation of file.observations) {
  if (!getProjectById(observation.canonical_project_id)) {
    throw new Error(
      `project-cost-utilization observation ${observation.id} references unknown project ${observation.canonical_project_id}`
    );
  }
}

const observations: readonly ProjectCostUtilizationObservation[] =
  Object.freeze(file.observations);

function sortChronologically(
  list: readonly ProjectCostUtilizationObservation[]
): ProjectCostUtilizationObservation[] {
  return [...list].sort(
    (a, b) =>
      a.reporting_year - b.reporting_year ||
      a.reporting_quarter - b.reporting_quarter
  );
}

const observationsByProject = new Map<
  string,
  ProjectCostUtilizationObservation[]
>();
for (const observation of observations) {
  const list = observationsByProject.get(observation.canonical_project_id);
  if (list) {
    list.push(observation);
  } else {
    observationsByProject.set(observation.canonical_project_id, [observation]);
  }
}
for (const [projectId, list] of observationsByProject) {
  observationsByProject.set(
    projectId,
    Object.freeze(
      sortChronologically(list)
    ) as ProjectCostUtilizationObservation[]
  );
}

const coveredProjectIds: readonly string[] = Object.freeze([
  ...observationsByProject.keys(),
]);

const repeatedObservationProjectIds: readonly string[] = Object.freeze(
  coveredProjectIds.filter(
    projectId => (observationsByProject.get(projectId)?.length ?? 0) > 1
  )
);

export type ProjectCostUtilizationMetadata = Readonly<{
  recordCount: number;
  uniqueProjectCount: number;
  repeatedObservationProjectCount: number;
  canonicalProjectCount: number;
  coverageLimitation: string;
  lastVerified: string;
  jurisdictionPsgc: string;
  title: string;
}>;

export function getProjectCostUtilizationObservations(): readonly ProjectCostUtilizationObservation[] {
  return observations;
}

export function getProjectCostUtilizationMetadata(
  canonicalProjectCount: number
): ProjectCostUtilizationMetadata {
  return Object.freeze({
    recordCount: file.record_count,
    uniqueProjectCount: file.unique_project_count,
    repeatedObservationProjectCount: repeatedObservationProjectIds.length,
    canonicalProjectCount,
    coverageLimitation: file.coverage_limitation,
    lastVerified: file.last_verified,
    jurisdictionPsgc: file.jurisdiction_psgc,
    title: file.title,
  });
}

export function getCoveredProjectIds(): readonly string[] {
  return coveredProjectIds;
}

export function getRepeatedObservationProjectIds(): readonly string[] {
  return repeatedObservationProjectIds;
}

export function getObservationsForProject(
  projectId: string
): readonly ProjectCostUtilizationObservation[] {
  return observationsByProject.get(projectId) ?? [];
}

export function getLatestObservationForProject(
  projectId: string
): ProjectCostUtilizationObservation | undefined {
  const list = observationsByProject.get(projectId);
  return list?.at(-1);
}
