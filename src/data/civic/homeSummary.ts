import { getGovernmentSummary } from './governmentSummary.ts';
import { getStatisticsSummary } from './statisticsSummary.ts';

export function getHomeSummary() {
  const statistics = getStatisticsSummary();
  const government = getGovernmentSummary();

  return Object.freeze({
    population: Object.freeze({ ...statistics.population }),
    projects: Object.freeze({
      total: statistics.projects.total,
      evidence: statistics.procurement.evidence,
      bidResults: statistics.procurement.bidResults,
    }),
    government: Object.freeze({ ...government }),
  });
}
