import {
  ProjectLifecycleStatus,
  ProjectType,
  type Project,
} from './projects.ts';

export interface ProjectDistributionItem<T extends string | number> {
  key: T;
  count: number;
  percentage: number;
}

export type ProjectAmountField =
  'approved_budget_abc' | 'winning_bid_amount' | 'contract_amount';

export interface ProjectAmountCoverage {
  field: ProjectAmountField;
  count: number;
  percentage: number;
}

export interface ProjectStatistics {
  totalProjects: number;
  statusAsOf: string;
  lifecycle: ProjectDistributionItem<ProjectLifecycleStatus>[];
  projectTypes: ProjectDistributionItem<Project['project_type']>[];
  years: ProjectDistributionItem<number>[];
  barangayAttribution: {
    attributed: number;
    unattributed: number;
    representedBarangays: number;
  };
  amountCoverage: ProjectAmountCoverage[];
}

function percentage(count: number, total: number): number {
  return total === 0 ? 0 : (count / total) * 100;
}

function countBy<T extends string | number>(values: readonly T[]) {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

export function aggregateProjectStatistics(
  projects: readonly Project[]
): ProjectStatistics {
  const totalProjects = projects.length;
  const lifecycleCounts = countBy(projects.map(p => p.lifecycle_status));
  const typeCounts = countBy(projects.map(p => p.project_type));
  const yearCounts = countBy(projects.map(p => p.year));
  const attributed = projects.filter(p => p.barangay_psgc !== null).length;

  return {
    totalProjects,
    statusAsOf: projects.reduce(
      (latest, project) =>
        project.status_as_of > latest ? project.status_as_of : latest,
      ''
    ),
    lifecycle: ProjectLifecycleStatus.options.map(key => {
      const count = lifecycleCounts.get(key) ?? 0;
      return { key, count, percentage: percentage(count, totalProjects) };
    }),
    projectTypes: ProjectType.options
      .map(key => {
        const count = typeCounts.get(key) ?? 0;
        return { key, count, percentage: percentage(count, totalProjects) };
      })
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
    years: [...yearCounts.entries()]
      .sort(([a], [b]) => a - b)
      .map(([key, count]) => ({
        key,
        count,
        percentage: percentage(count, totalProjects),
      })),
    barangayAttribution: {
      attributed,
      unattributed: totalProjects - attributed,
      representedBarangays: new Set(
        projects.flatMap(p => (p.barangay_psgc ? [p.barangay_psgc] : []))
      ).size,
    },
    amountCoverage: (
      ['approved_budget_abc', 'winning_bid_amount', 'contract_amount'] as const
    ).map(field => {
      const count = projects.filter(project => project[field] !== null).length;
      return { field, count, percentage: percentage(count, totalProjects) };
    }),
  };
}
