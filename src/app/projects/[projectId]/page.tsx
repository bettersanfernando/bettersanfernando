import { notFound } from 'next/navigation';
import ProjectDetailView from './ProjectDetailView';
import {
  getProjectById,
  getProjectEvidence,
  getProjects,
} from '../../../data/civic/projects';
import { getObservationsForProject } from '../../../data/civic/projectCostUtilization';
import { titleCaseEnum } from '../../../lib/utils';
import { buildPageMetadata } from '../../../lib/metadata';

// Ported from src/pages/ProjectDetail.tsx: identical content/markup;
// react-router's useParams()/Link replaced with Next's params prop and
// next/link. Unknown IDs call notFound() (a real HTTP 404) instead of
// rendering an inline "Project not found" banner.
//
// Rendering (ProjectDetailView) is a client component because
// @bettergov/kapwa's Card/Banner ship without a 'use client' directive and
// crash when executed under React's react-server condition (no
// __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE). This
// page stays a Server Component only for data fetching and metadata.

export function generateStaticParams() {
  return getProjects().map(project => ({ projectId: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = getProjectById(projectId);
  if (!project) return {};
  const title = getProjects().some(
    candidate =>
      candidate.id !== project.id &&
      candidate.project_name === project.project_name
  )
    ? `${project.project_name} (${project.id})`
    : project.project_name;

  return buildPageMetadata({
    title,
    description: `${titleCaseEnum(project.project_type)} project ${project.id} in ${project.barangay ?? 'the City of San Fernando, Pampanga'} — ${titleCaseEnum(project.lifecycle_status)}.`,
    path: `/projects/${project.id}`,
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = getProjectById(projectId);

  if (!project) {
    notFound();
  }

  const evidence = getProjectEvidence(project.id);
  const costUtilizationObservations = getObservationsForProject(project.id);

  return (
    <ProjectDetailView
      project={project}
      evidence={evidence}
      costUtilizationObservations={costUtilizationObservations}
    />
  );
}
