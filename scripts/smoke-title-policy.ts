import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getProjects } from '../src/data/civic/projects.ts';
import {
  getServices,
  getServiceCategory,
  getServiceHref,
} from '../src/data/civic/services.ts';
import { getCityOffices } from '../src/data/civic/government.ts';
import { getCategoryDisplay } from '../src/app/[locale]/services/categories.ts';
import { createPageT } from '../src/i18n/page-t.ts';
import {
  TITLE_LIMIT,
  HOME_TITLE,
  HOME_TITLE_FIL,
  finalDetailTitle,
  projectSeoTitle,
  serviceSeoTitle,
  officeSeoTitle,
} from '../src/lib/detailTitles.ts';

const projects = getProjects();
const services = getServices();
const offices = getCityOffices();
const translations = (names: string[]) =>
  createPageT(
    Object.assign(
      {},
      ...names.map(name =>
        JSON.parse(readFileSync(`public/locales/fil/${name}.json`, 'utf8'))
      )
    )
  );
let analyzed = 0;
const summary: Record<string, { count: number; maxLength: number }> = {};
for (const locale of ['en', 'fil'] as const) {
  const projectT =
    locale === 'fil'
      ? translations(['shared', 'projects-shared', 'projects-detail'])
      : createPageT({});
  const serviceT =
    locale === 'fil'
      ? translations(['shared', 'services-shared', 'services-detail'])
      : createPageT({});
  const titles = new Map<string, string>();
  const check = (title: string, route: string, family: string) => {
    assert.ok(title.trim(), `Empty title: ${route}`);
    assert.ok(
      title.length <= TITLE_LIMIT,
      `Long title (${title.length}): ${route}: ${title}`
    );
    assert.ok(
      !titles.has(title),
      `Duplicate title: ${titles.get(title)} and ${route}: ${title}`
    );
    titles.set(title, route);
    analyzed++;
    const key = `${locale}/${family}`;
    const result = summary[key] ?? { count: 0, maxLength: 0 };
    result.count++;
    result.maxLength = Math.max(result.maxLength, title.length);
    summary[key] = result;
  };
  for (const project of projects) {
    const typeLabel = projectT(
      project.project_type
        .toLowerCase()
        .replace(/(^|_)\w/g, match => match.replace('_', ' ').toUpperCase())
    );
    const title = projectSeoTitle(project, projects, typeLabel, projectT);
    check(
      finalDetailTitle(title),
      `${locale}/projects/${project.id}`,
      'projects'
    );
  }
  for (const service of services) {
    const category = getServiceCategory(service);
    const title = serviceSeoTitle(
      service,
      services,
      getCategoryDisplay(category, serviceT).name
    );
    check(
      finalDetailTitle(title),
      `${locale}${getServiceHref(service)}`,
      'services'
    );
  }
  for (const office of offices) {
    const title = officeSeoTitle(office);
    if (office.office_name.length > TITLE_LIMIT)
      assert.ok(office.acronym, `Missing office acronym: ${office.office_id}`);
    check(
      finalDetailTitle(title),
      `${locale}/government/offices/${office.office_id}`,
      'offices'
    );
  }
  check(locale === 'fil' ? HOME_TITLE_FIL : HOME_TITLE, `${locale}/`, 'home');
}
console.log(
  `[smoke-title-policy] ${analyzed} titles are unique, nonempty, and <=${TITLE_LIMIT}`
);
console.log(summary);
