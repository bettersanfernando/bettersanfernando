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
// ProjectDetailView is a plain Server Component — it no longer depends on
// @bettergov/kapwa (which forced a client boundary) and has no interactive
// state of its own.

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
