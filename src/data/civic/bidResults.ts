import { z } from 'zod';
import {
  getAllProjectEvidence,
  getProjectById,
  type Project,
  type ProjectEvidence,
} from './projects.ts';
import { hasAttachment } from './sources.ts';

const BidResultFactsSchema = z.object({
  approved_budget_for_contract: z.number().nullable().optional(),
  bid_amount: z.number().nullable(),
  bidding_date_normalized: z.string().nullable().optional(),
  location_raw: z.string().nullable().optional(),
  reference_number: z.string(),
  report_year: z.number().int(),
  winning_bidder: z.string().nullable(),
});

export interface BidResultFacts {
  approvedBudgetAbc: number | null;
  winningBidAmount: number | null;
  winningBidder: string | null;
  bacReference: string;
  location: string | null;
  biddingDate: string | null;
  reportYear: number;
}

export interface BidResultRecord {
  evidence: ProjectEvidence;
  project: Project;
  facts: BidResultFacts;
}

export const BID_RESULT_SORTS = [
  'date-desc',
  'date-asc',
  'bid-desc',
  'bid-asc',
  'identifier-asc',
] as const;
export type BidResultSort = (typeof BID_RESULT_SORTS)[number];

export interface BidResultFilters {
  query?: string;
  year?: string;
  approvedBudget?: 'available' | 'unavailable' | '';
  attachment?: 'available' | 'unavailable' | '';
  sort?: BidResultSort;
}

function parseBidResultFacts(evidence: ProjectEvidence): BidResultFacts {
  const facts = BidResultFactsSchema.parse(evidence.facts);

  return {
    approvedBudgetAbc: evidence.fields_established.includes(
      'approved_budget_abc'
    )
      ? (facts.approved_budget_for_contract ?? null)
      : null,
    winningBidAmount: evidence.fields_established.includes('winning_bid_amount')
      ? facts.bid_amount
      : null,
    winningBidder:
      evidence.fields_established.includes('winning_bidder') ||
      evidence.fields_established.includes('contractor')
        ? facts.winning_bidder
        : null,
    bacReference: facts.reference_number,
    location: evidence.fields_established.includes('location_text')
      ? (facts.location_raw ?? null)
      : null,
    biddingDate: facts.bidding_date_normalized ?? evidence.document_date,
    reportYear: facts.report_year,
  };
}

export function getBidResultEvidence(): BidResultRecord[] {
  return getAllProjectEvidence()
    .filter(evidence => evidence.stage === 'BID_RESULTS')
    .map(evidence => {
      const project = getProjectById(evidence.project_id);
      if (!project) {
        throw new Error(
          `BID_RESULTS evidence ${evidence.id} references an unknown project`
        );
      }

      return {
        evidence,
        project,
        facts: parseBidResultFacts(evidence),
      };
    });
}

function matchesQuery(record: BidResultRecord, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  const { evidence, facts, project } = record;
  return [
    project.id,
    project.project_name,
    project.barangay,
    evidence.id,
    evidence.source_identifier,
    evidence.document_date,
    facts.bacReference,
    facts.location,
    facts.winningBidder,
    facts.reportYear.toString(),
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

export function filterAndSortBidResults(
  records: readonly BidResultRecord[],
  filters: BidResultFilters
): BidResultRecord[] {
  const filtered = records.filter(record => {
    const hasApprovedBudget = record.facts.approvedBudgetAbc !== null;
    const attachmentAvailable = hasAttachment(record.evidence);

    return (
      matchesQuery(record, filters.query ?? '') &&
      (!filters.year || record.facts.reportYear.toString() === filters.year) &&
      (!filters.approvedBudget ||
        (filters.approvedBudget === 'available') === hasApprovedBudget) &&
      (!filters.attachment ||
        (filters.attachment === 'available') === attachmentAvailable)
    );
  });

  return filtered.sort((left, right) => {
    let result: number;
    switch (filters.sort) {
      case 'date-asc':
        result = compareNullable(
          left.facts.biddingDate,
          right.facts.biddingDate,
          (a, b) => a.localeCompare(b)
        );
        break;
      case 'bid-desc':
      case 'bid-asc':
        result = compareNullable(
          left.facts.winningBidAmount,
          right.facts.winningBidAmount,
          (a, b) => (filters.sort === 'bid-asc' ? a - b : b - a)
        );
        break;
      case 'identifier-asc':
        result = left.evidence.source_identifier.localeCompare(
          right.evidence.source_identifier
        );
        break;
      case 'date-desc':
      default:
        result = compareNullable(
          left.facts.biddingDate,
          right.facts.biddingDate,
          (a, b) => b.localeCompare(a)
        );
    }

    return (
      result ||
      left.evidence.source_identifier.localeCompare(
        right.evidence.source_identifier
      )
    );
  });
}

export function getBidResultsSummary(records: readonly BidResultRecord[]) {
  return {
    totalRecords: records.length,
    projectsRepresented: new Set(records.map(record => record.project.id)).size,
    withApprovedBudget: records.filter(
      record => record.facts.approvedBudgetAbc !== null
    ).length,
    withWinningBid: records.filter(
      record => record.facts.winningBidAmount !== null
    ).length,
    withWinningBidder: records.filter(record => record.facts.winningBidder)
      .length,
    withAttachment: records.filter(record => hasAttachment(record.evidence))
      .length,
  };
}
