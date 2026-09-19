#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { getBarangays } from '../src/data/civic/demographics.ts';
import { getDemographicProfileRecords } from '../src/data/civic/demographicProfile.ts';
import {
  getFinanceObservations,
  getFinanceReports,
} from '../src/data/civic/finance.ts';
import { getCityOffices } from '../src/data/civic/government.ts';
import { getBarangayContactsMetadata } from '../src/data/civic/governmentBarangayContacts.ts';
import {
  getExecutiveOrders,
  getOrdinances,
  getResolutions,
} from '../src/data/civic/legislation.ts';
import {
  getCoveredProjectIds,
  getProjectCostUtilizationObservations,
} from '../src/data/civic/projectCostUtilization.ts';
import {
  getAllProjectEvidence,
  getProjects,
} from '../src/data/civic/projects.ts';
import { getSearchDocuments } from '../src/data/civic/search.ts';
import {
  getServiceCategory,
  getServiceHref,
  getServices,
} from '../src/data/civic/services.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const manifest = JSON.parse(
  readFileSync('src/data/generated/civic/manifest.json', 'utf8')
) as { datasets: Record<string, { record_count: number }> };

assert.equal(Object.keys(manifest.datasets).length, 22);
assert.equal(getProjects().length, 324);
assert.equal(getAllProjectEvidence().length, 563);
assert.equal(getProjectCostUtilizationObservations().length, 298);
assert.equal(getCoveredProjectIds().length, 109);
assert.equal(getServices().length, 177);
assert.equal(new Set(getServices().map(getServiceCategory)).size, 16);
assert.equal(getCityOffices().length, 44);
assert.equal(getBarangays().length, 35);
assert.equal(getBarangayContactsMetadata().recordCount, 324);
assert.equal(getExecutiveOrders().length, 13);
assert.equal(getOrdinances().length, 11);
assert.equal(getResolutions().length, 2);
assert.equal(getFinanceReports().length, 53);
assert.equal(getFinanceObservations().length, 121);
assert.equal(getDemographicProfileRecords().length, 136);
assert.equal(getSearchDocuments().length, 990);
assert.equal(plannedPages.length, 0);

const staticPaths = (readdirSync('src/app', { recursive: true }) as string[])
  .filter(
    file =>
      file.endsWith('page.tsx') &&
      !file.includes('[') &&
      !file.endsWith('not-found.tsx')
  )
  .map(file => {
    const route = file.replace(/\\/g, '/').replace(/\/?page\.tsx$/, '');
    return route ? `/${route}` : '/';
  });
const dynamicPaths = [
  ...new Set(
    getServices().map(service => `/services/${getServiceCategory(service)}`)
  ),
  ...getServices().map(getServiceHref),
  ...getProjects().map(project => `/projects/${project.id}`),
  ...getCityOffices().map(office => `/government/offices/${office.office_id}`),
];
const canonicalPaths = [...staticPaths, ...dynamicPaths];
assert.equal(staticPaths.length, 38);
assert.equal(dynamicPaths.length, 561);
assert.equal(canonicalPaths.length, 599);
assert.equal(new Set(canonicalPaths).size, 599);

const queryRoutes = [
  '/search',
  '/projects',
  '/projects/sources',
  '/barangays',
  '/procurement/bid-results',
  '/procurement/contracts',
  '/legislation/executive-orders',
  '/legislation/ordinances',
  '/government/barangay-contacts',
];
for (const route of queryRoutes) {
  const source = readFileSync(`src/app${route}/page.tsx`, 'utf8');
  assert.match(source, /export const dynamic = ['"]force-dynamic['"]/);
  assert.match(source, /query string|search parameters/i);
}

const breadcrumbsSource = readFileSync(
  'src/components/ui/Breadcrumbs.tsx',
  'utf8'
);
assert.match(breadcrumbsSource, /<BreadcrumbListJsonLd/);

const navbarSource = readFileSync('src/components/layout/Navbar.tsx', 'utf8');
for (const behavior of [
  /setIsMobileOpen\(open => !open\)/,
  /document\.addEventListener\('pointerdown'/,
  /event\.key !== 'Escape'/,
  /aria-expanded=/,
  /i18n\.changeLanguage\(language\)/,
]) {
  assert.match(navbarSource, behavior);
}
const serviceCategorySource = readFileSync(
  'src/app/services/service-category-view.tsx',
  'utf8'
);
assert.match(serviceCategorySource, /categoryServices\.filter/);
assert.match(serviceCategorySource, /aria-live="polite"/);

console.log(
  'Batch 7 parity smoke passed: protected data and 599 routes, 9 justified force-dynamic pages, breadcrumb JSON-LD, navbar/mobile/keyboard/language behavior, and service filtering.'
);
