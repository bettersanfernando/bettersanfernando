import type { Project } from '../data/civic/projects';
import type { Service } from '../data/civic/services';
import type { CityOffice } from '../data/civic/government';
import type { PageT } from '../i18n/page-t';

export const TITLE_LIMIT = 70;
export const BRAND_SUFFIX = ' | BetterSanFernando';
export const HOME_TITLE =
  'BetterSanFernando — Civic Information for San Fernando, Pampanga';
export const HOME_TITLE_FIL =
  'BetterSanFernando — Impormasyong Pampubliko sa San Fernando';

export function finalDetailTitle(title: string): string {
  return title.length + BRAND_SUFFIX.length <= TITLE_LIMIT
    ? title + BRAND_SUFFIX
    : title;
}

export function projectSeoTitle(
  project: Project,
  projects: readonly Project[],
  typeLabel: string,
  t: PageT
): string {
  const duplicateName = projects.some(
    candidate =>
      candidate.id !== project.id &&
      candidate.project_name === project.project_name
  );
  const sourceTitle = duplicateName
    ? `${project.project_name} (${project.id})`
    : project.project_name;
  if (sourceTitle.length <= TITLE_LIMIT) return sourceTitle;

  const base = `${typeLabel} in ${project.barangay ?? t('San Fernando')} (${project.year})`;
  const collides = projects.some(
    candidate =>
      candidate.id !== project.id &&
      candidate.project_type === project.project_type &&
      candidate.barangay === project.barangay &&
      candidate.year === project.year
  );
  return collides ? `${base} — ${project.id.split('-').at(-1)}` : base;
}

export function serviceSeoTitle(
  service: Service,
  services: readonly Service[],
  categoryName: string
): string {
  const duplicateName = services.some(
    candidate =>
      candidate.id !== service.id && candidate.title === service.title
  );
  const sourceTitle = duplicateName
    ? `${service.title} (${service.id})`
    : service.title;
  if (sourceTitle.length <= TITLE_LIMIT) return sourceTitle;
  const itemNumber = service.id.match(/-(\d{2})$/)?.[1];
  if (!itemNumber)
    throw new Error(`Missing charter item number: ${service.id}`);
  return `${service.office.acronym} — ${categoryName} service ${itemNumber}`;
}

export function officeSeoTitle(office: CityOffice): string {
  return office.office_name.length > TITLE_LIMIT
    ? (office.acronym ?? office.office_name)
    : office.office_name;
}
