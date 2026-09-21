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

// Unknown IDs call notFound() (a real HTTP 404).
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

  const status = titleCaseEnum(project.lifecycle_status);
  // Leads with the page's own (guaranteed-unique) title: type/barangay/
  // status alone collide constantly (243 of 324 projects share a
  // type+barangay+status tuple with at least one other project), so every
  // page's meta description must include something that actually
  // distinguishes it — the project's own name does that naturally.
  return buildPageMetadata({
    title,
    description: `${title} — a ${titleCaseEnum(project.project_type)} project in ${project.barangay ?? 'the City of San Fernando, Pampanga'}, currently ${status.charAt(0).toLowerCase()}${status.slice(1)}.`,
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
