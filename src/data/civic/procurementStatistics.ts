import { getBidResultEvidence, getBidResultsSummary } from './bidResults.ts';
import {
  getAwardAndContractRecords,
  getContractsSummary,
} from './contracts.ts';
import { getAllProjectEvidence, getProjects } from './projects.ts';

export interface CoverageStatistic<T extends string> {
  key: T;
  count: number;
  denominator: number;
  percentage: number;
}

function percentage(count: number, denominator: number): number {
  return denominator === 0
    ? 0
    : Number(((count / denominator) * 100).toFixed(1));
}

function coverage<T extends string>(
  key: T,
  count: number,
  denominator: number
): CoverageStatistic<T> {
  return {
    key,
    count,
    denominator,
    percentage: percentage(count, denominator),
  };
}

export function getProcurementStatistics() {
  const projects = getProjects();
  const evidence = getAllProjectEvidence();
  const bidResults = getBidResultEvidence();
  const bidResultsSummary = getBidResultsSummary(bidResults);
  const contractsSummary = getContractsSummary(
    getAwardAndContractRecords(),
    projects.length
  );

  const lifecycle = (
    ['PLANNED', 'PROCUREMENT', 'AWARDED', 'CONTRACTED'] as const
  ).map(key =>
    coverage(
      key,
      projects.filter(project => project.lifecycle_status === key).length,
      projects.length
    )
  );

  const yearCounts = new Map<number, number>();
  let unknownDocumentDate = 0;
  for (const record of bidResults) {
    if (!record.evidence.document_date) {
      unknownDocumentDate += 1;
      continue;
    }
    const year = Number(record.evidence.document_date.slice(0, 4));
    yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
  }

  return {
    projects: {
      total: projects.length,
      lifecycle,
      fieldCoverage: [
        coverage(
          'approvedBudgetAbc',
          projects.filter(project => project.approved_budget_abc !== null)
            .length,
          projects.length
        ),
        coverage(
          'winningBidAmount',
          projects.filter(project => project.winning_bid_amount !== null)
            .length,
          projects.length
        ),
        coverage(
          'contractAmount',
          projects.filter(project => project.contract_amount !== null).length,
          projects.length
        ),
        coverage(
          'contractNumber',
          projects.filter(
            project => project.identifiers.contract_number !== null
          ).length,
          projects.length
        ),
      ],
    },
    evidence: {
      total: evidence.length,
    },
    bidResults: {
      total: bidResultsSummary.totalRecords,
      projectsRepresented: bidResultsSummary.projectsRepresented,
      fieldCoverage: [
        coverage(
          'approvedBudgetAbc',
          bidResultsSummary.withApprovedBudget,
          bidResultsSummary.totalRecords
        ),
        coverage(
          'winningBidAmount',
          bidResultsSummary.withWinningBid,
          bidResultsSummary.totalRecords
        ),
        coverage(
          'winningBidder',
          bidResultsSummary.withWinningBidder,
          bidResultsSummary.totalRecords
        ),
        coverage(
          'attachment',
          bidResultsSummary.withAttachment,
          bidResultsSummary.totalRecords
        ),
      ],
      byDocumentYear: [...yearCounts]
        .map(([year, count]) => ({ year, count }))
        .sort((left, right) => left.year - right.year),
      unknownDocumentDate,
    },
    awardsAndContracts: {
      awarded: contractsSummary.awarded,
      contracted: contractsSummary.contracted,
      withContractAmount: contractsSummary.withContractAmount,
      withContractNumber: contractsSummary.withContractNumber,
      denominator: projects.length,
    },
  };
}
