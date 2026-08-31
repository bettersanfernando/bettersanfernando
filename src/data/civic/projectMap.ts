import type { BarangayFeature } from './geography.schemas.ts';
import type { Project, ProjectLifecycleStatus } from './projects.ts';

export interface BarangayProjectSummary {
  psgcCode: string;
  name: string;
  projectCount: number;
  lifecycleCounts: Record<ProjectLifecycleStatus, number>;
  categoryCounts: Record<Project['project_category'], number>;
}

export interface ProjectDistribution {
  barangays: readonly BarangayProjectSummary[];
  totalProjects: number;
  attributedProjects: number;
  unattributedProjects: number;
}

function emptyLifecycleCounts(): Record<ProjectLifecycleStatus, number> {
  return { PLANNED: 0, PROCUREMENT: 0, AWARDED: 0, CONTRACTED: 0 };
}

function emptyCategoryCounts(): Record<Project['project_category'], number> {
  return { INFRASTRUCTURE_CAPITAL: 0, INFRASTRUCTURE_MAINTENANCE: 0 };
}

export function aggregateProjectsByBarangay(
  projects: readonly Project[],
  boundaries: readonly BarangayFeature[]
): ProjectDistribution {
  const summaries = new Map(
    boundaries.map(boundary => [
      boundary.properties.psgc_code,
      {
        psgcCode: boundary.properties.psgc_code,
        name: boundary.properties.name,
        projectCount: 0,
        lifecycleCounts: emptyLifecycleCounts(),
        categoryCounts: emptyCategoryCounts(),
      } satisfies BarangayProjectSummary,
    ])
  );
  let attributedProjects = 0;

  for (const project of projects) {
    if (!project.barangay_psgc) continue;
    const summary = summaries.get(project.barangay_psgc);
    if (!summary) continue;

    summary.projectCount += 1;
    summary.lifecycleCounts[project.lifecycle_status] += 1;
    summary.categoryCounts[project.project_category] += 1;
    attributedProjects += 1;
  }

  return {
    barangays: [...summaries.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    totalProjects: projects.length,
    attributedProjects,
    unattributedProjects: projects.length - attributedProjects,
  };
}
