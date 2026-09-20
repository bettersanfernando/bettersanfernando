import {
  getProjectById,
  type Project,
  type ProjectEvidence,
} from './projects.ts';

export const PROJECT_EVIDENCE_SORTS = [
  'date-desc',
  'date-asc',
  'project-asc',
  'type-asc',
  'identifier-asc',
] as const;

export type ProjectEvidenceSort = (typeof PROJECT_EVIDENCE_SORTS)[number];

export interface ProjectEvidenceFilters {
  query?: string;
  stage?: ProjectEvidence['stage'] | '';
  authority?: ProjectEvidence['source_authority'] | '';
  document?: 'all' | 'attachment' | 'page-only' | '';
  year?: string;
  projectId?: string;
  sort?: ProjectEvidenceSort;
}

export interface ProjectEvidenceRecord {
  evidence: ProjectEvidence;
  project: Project;
}

export const EVIDENCE_STAGE_METADATA: Record<
  ProjectEvidence['stage'],
  {
    label: string;
    shortLabel: string;
    description: string;
  }
> = {
  BID_RESULTS: {
    label: 'Bid Results',
    shortLabel: 'Bid Results',
    description:
      'Official record of bidders, winning bid amounts, and ABC comparison.',
  },
  NTA_UTILIZATION_REPORT: {
    label: 'NTA Utilization Reports',
    shortLabel: 'NTA Utilization Report',
    description:
      'Reports tracking National Tax Allotment fund utilization across project lines.',
  },
  PROCUREMENT_MONITORING_REPORT: {
    label: 'Procurement Monitoring Reports',
    shortLabel: 'Procurement Monitoring Report',
    description:
      'Periodic procurement monitoring reports submitted to oversight bodies.',
  },
  NOTICE_OF_AWARD: {
    label: 'Notice of Award',
    shortLabel: 'Notice of Award',
    description:
      'Published notices communicating official contract award decisions.',
  },
  ITB: {
    label: 'Invitation to Bid (ITB)',
    shortLabel: 'Invitation to Bid (ITB)',
    description:
      'Public invitations soliciting competitive bids for city infrastructure.',
  },
  APP: {
    label: 'Annual Procurement Plan (APP)',
    shortLabel: 'Annual Procurement Plan (APP)',
    description:
      'Annual procurement plans establishing budgeted public works programs.',
  },
};

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
  const stageMeta = EVIDENCE_STAGE_METADATA[evidence.stage];
  return [
    evidence.id,
    evidence.source_identifier,
    evidence.stage,
    stageMeta?.label,
    stageMeta?.shortLabel,
    evidence.source_authority,
    ...evidence.fields_established,
    project.id,
    project.project_name,
    project.barangay,
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

    if (!matchesQuery(record, filters.query ?? '')) {
      return false;
    }
    if (filters.stage && evidence.stage !== filters.stage) {
      return false;
    }
    if (filters.authority && evidence.source_authority !== filters.authority) {
      return false;
    }
    if (filters.projectId && evidence.project_id !== filters.projectId) {
      return false;
    }
    if (filters.document === 'attachment' && evidence.attachment_url === null) {
      return false;
    }
    if (filters.document === 'page-only' && evidence.attachment_url !== null) {
      return false;
    }
    if (filters.year) {
      if (filters.year === 'undated') {
        if (evidence.document_date !== null) return false;
      } else if (!evidence.document_date?.startsWith(filters.year)) {
        return false;
      }
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === 'identifier-asc') {
      return (
        a.evidence.source_identifier.localeCompare(
          b.evidence.source_identifier
        ) || a.evidence.id.localeCompare(b.evidence.id)
      );
    }

    if (filters.sort === 'project-asc') {
      return (
        a.project.project_name.localeCompare(b.project.project_name) ||
        a.evidence.source_identifier.localeCompare(
          b.evidence.source_identifier
        ) ||
        a.evidence.id.localeCompare(b.evidence.id)
      );
    }

    if (filters.sort === 'type-asc') {
      const typeComparison = a.evidence.stage.localeCompare(b.evidence.stage);
      if (typeComparison !== 0) return typeComparison;
      const dateOrder = (b.evidence.document_date ?? '').localeCompare(
        a.evidence.document_date ?? ''
      );
      if (dateOrder !== 0) return dateOrder;
      return (
        a.evidence.source_identifier.localeCompare(
          b.evidence.source_identifier
        ) || a.evidence.id.localeCompare(b.evidence.id)
      );
    }

    const dateOrder = (a.evidence.document_date ?? '').localeCompare(
      b.evidence.document_date ?? ''
    );
    if (dateOrder !== 0) {
      return filters.sort === 'date-asc' ? dateOrder : -dateOrder;
    }
    return (
      a.evidence.source_identifier.localeCompare(
        b.evidence.source_identifier
      ) || a.evidence.id.localeCompare(b.evidence.id)
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
    NTA_UTILIZATION_REPORT: evidence.filter(
      item => item.stage === 'NTA_UTILIZATION_REPORT'
    ).length,
  };
}
