import {
  getProjectById,
  type Project,
  type ProjectEvidence,
} from './projects.ts';

export const PROJECT_EVIDENCE_SORTS = [
  'date-desc',
  'date-asc',
  'identifier-asc',
] as const;

export type ProjectEvidenceSort = (typeof PROJECT_EVIDENCE_SORTS)[number];

export interface ProjectEvidenceFilters {
  query?: string;
  stage?: ProjectEvidence['stage'] | '';
  authority?: ProjectEvidence['source_authority'] | '';
  projectId?: string;
  sort?: ProjectEvidenceSort;
}

export interface ProjectEvidenceRecord {
  evidence: ProjectEvidence;
  project: Project;
}

export function resolveProjectEvidence(
  evidence: readonly ProjectEvidence[]
): ProjectEvidenceRecord[] {
  return evidence.flatMap(item => {
    const project = getProjectById(item.project_id);
    return project ? [{ evidence: item, project }] : [];
  });
}

function matchesQuery(record: ProjectEvidenceRecord, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  const { evidence, project } = record;
  return [
    evidence.source_identifier,
    evidence.stage,
    evidence.source_authority,
    ...evidence.fields_established,
    project.id,
    project.project_name,
    project.identifiers.app_code,
    project.identifiers.bid_reference,
    project.identifiers.contract_number,
    project.identifiers.philgeps_reference,
  ].some(value => value?.toLocaleLowerCase().includes(normalizedQuery));
}

export function filterProjectEvidence(
  records: readonly ProjectEvidenceRecord[],
  filters: ProjectEvidenceFilters
): ProjectEvidenceRecord[] {
  const filtered = records.filter(record => {
    const { evidence } = record;
    return (
      matchesQuery(record, filters.query ?? '') &&
      (!filters.stage || evidence.stage === filters.stage) &&
      (!filters.authority || evidence.source_authority === filters.authority) &&
      (!filters.projectId || evidence.project_id === filters.projectId)
    );
  });

  return filtered.sort((a, b) => {
    if (filters.sort === 'identifier-asc') {
      return a.evidence.source_identifier.localeCompare(
        b.evidence.source_identifier
      );
    }

    const dateOrder = (a.evidence.document_date ?? '').localeCompare(
      b.evidence.document_date ?? ''
    );
    if (dateOrder !== 0) {
      return filters.sort === 'date-asc' ? dateOrder : -dateOrder;
    }
    return a.evidence.source_identifier.localeCompare(
      b.evidence.source_identifier
    );
  });
}

export function countProjectEvidenceByStage(
  evidence: readonly ProjectEvidence[]
): Record<ProjectEvidence['stage'], number> {
  return {
    APP: evidence.filter(item => item.stage === 'APP').length,
    ITB: evidence.filter(item => item.stage === 'ITB').length,
    BID_RESULTS: evidence.filter(item => item.stage === 'BID_RESULTS').length,
    NOTICE_OF_AWARD: evidence.filter(item => item.stage === 'NOTICE_OF_AWARD')
      .length,
    PROCUREMENT_MONITORING_REPORT: evidence.filter(
      item => item.stage === 'PROCUREMENT_MONITORING_REPORT'
    ).length,
  };
}
