import {
  getProjectEvidence,
  getProjects,
  type Project,
  type ProjectEvidence,
} from './projects.ts';

export interface AwardAndContractRecord {
  project: Project;
  evidence: readonly ProjectEvidence[];
  sourceEvidence: ProjectEvidence | null;
  relevantDate: string;
}

export const CONTRACT_RECORD_SORTS = [
  'date-desc',
  'date-asc',
  'contract-amount-desc',
  'contract-amount-asc',
  'winning-bid-desc',
  'title-asc',
  'contract-number-asc',
] as const;
export type ContractRecordSort = (typeof CONTRACT_RECORD_SORTS)[number];

export interface ContractRecordFilters {
  query?: string;
  lifecycle?: 'AWARDED' | 'CONTRACTED' | '';
  year?: string;
  contractNumber?: 'available' | 'unavailable' | '';
  contractAmount?: 'available' | 'unavailable' | '';
  sort?: ContractRecordSort;
}

function selectSourceEvidence(
  evidence: readonly ProjectEvidence[]
): ProjectEvidence | null {
  return (
    evidence.find(item => item.stage === 'NOTICE_OF_AWARD') ??
    evidence.find(item => item.stage === 'BID_RESULTS') ??
    evidence[0] ??
    null
  );
}

export function getAwardAndContractRecords(): AwardAndContractRecord[] {
  return getProjects()
    .filter(project =>
      ['AWARDED', 'CONTRACTED'].includes(project.lifecycle_status)
    )
    .map(project => {
      const evidence = getProjectEvidence(project.id);
      return {
        project,
        evidence,
        sourceEvidence: selectSourceEvidence(evidence),
        relevantDate:
          project.contract_effectivity_date ??
          project.award_date ??
          project.status_as_of,
      };
    });
}

export function hasContractNumber(project: Project): boolean {
  return project.identifiers.contract_number !== null;
}

export function hasContractAmount(project: Project): boolean {
  return project.contract_amount !== null;
}

function matchesQuery(record: AwardAndContractRecord, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  const { evidence, project } = record;
  return [
    project.id,
    project.project_name,
    project.barangay,
    project.contractor,
    project.year.toString(),
    project.award_date,
    project.contract_effectivity_date,
    project.identifiers.app_code,
    project.identifiers.bid_reference,
    project.identifiers.philgeps_reference,
    project.identifiers.contract_number,
    ...evidence.flatMap(item => [item.id, item.source_identifier]),
  ].some(value => value?.toLocaleLowerCase().includes(normalizedQuery));
}

function compareNullable<T>(
  left: T | null,
  right: T | null,
  compare: (a: T, b: T) => number
): number {
  if (left === null) return right === null ? 0 : 1;
  if (right === null) return -1;
  return compare(left, right);
}

export function filterAndSortContractRecords(
  records: readonly AwardAndContractRecord[],
  filters: ContractRecordFilters
): AwardAndContractRecord[] {
  const filtered = records.filter(record => {
    const { project } = record;
    return (
      matchesQuery(record, filters.query ?? '') &&
      (!filters.lifecycle || project.lifecycle_status === filters.lifecycle) &&
      (!filters.year || project.year.toString() === filters.year) &&
      (!filters.contractNumber ||
        (filters.contractNumber === 'available') ===
          hasContractNumber(project)) &&
      (!filters.contractAmount ||
        (filters.contractAmount === 'available') === hasContractAmount(project))
    );
  });

  return filtered.sort((left, right) => {
    let result: number;
    switch (filters.sort) {
      case 'date-asc':
        result = left.relevantDate.localeCompare(right.relevantDate);
        break;
      case 'contract-amount-desc':
      case 'contract-amount-asc':
        result = compareNullable(
          left.project.contract_amount,
          right.project.contract_amount,
          (a, b) => (filters.sort === 'contract-amount-asc' ? a - b : b - a)
        );
        break;
      case 'winning-bid-desc':
        result = compareNullable(
          left.project.winning_bid_amount,
          right.project.winning_bid_amount,
          (a, b) => b - a
        );
        break;
      case 'title-asc':
        result = left.project.project_name.localeCompare(
          right.project.project_name
        );
        break;
      case 'contract-number-asc':
        result = compareNullable(
          left.project.identifiers.contract_number,
          right.project.identifiers.contract_number,
          (a, b) => a.localeCompare(b)
        );
        break;
      case 'date-desc':
      default:
        result = right.relevantDate.localeCompare(left.relevantDate);
    }

    return result || left.project.id.localeCompare(right.project.id);
  });
}

export function getContractsSummary(
  records: readonly AwardAndContractRecord[],
  totalPublishedProjects: number
) {
  return {
    totalPublishedProjects,
    recordsInArchive: records.length,
    awarded: records.filter(
      record => record.project.lifecycle_status === 'AWARDED'
    ).length,
    contracted: records.filter(
      record => record.project.lifecycle_status === 'CONTRACTED'
    ).length,
    withContractAmount: records.filter(record =>
      hasContractAmount(record.project)
    ).length,
    withContractNumber: records.filter(record =>
      hasContractNumber(record.project)
    ).length,
  };
}
