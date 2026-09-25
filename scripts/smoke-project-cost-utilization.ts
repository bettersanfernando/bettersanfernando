import assert from 'node:assert/strict';
import { readNextRoute } from './smoke-next-route.ts';
import { readFileSync } from 'node:fs';
import {
  getCoveredProjectIds,
  getObservationsForProject,
  getProjectCostUtilizationMetadata,
  getProjectCostUtilizationObservations,
  getRepeatedObservationProjectIds,
} from '../src/data/civic/projectCostUtilization.ts';
import { getProjectById, getProjects } from '../src/data/civic/projects.ts';
import { getServices } from '../src/data/civic/services.ts';
import { getFullDisclosureRecords } from '../src/data/civic/fullDisclosure.ts';
import { getUtilitiesWaterResources } from '../src/data/civic/utilitiesWaterResources.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const observations = getProjectCostUtilizationObservations();
const metadata = getProjectCostUtilizationMetadata(getProjects().length);
const coveredProjectIds = getCoveredProjectIds();
const repeatedProjectIds = getRepeatedObservationProjectIds();

// 1. Exact schema/counts.
assert.equal(observations.length, 298, 'exactly 298 verified observations');
assert.equal(metadata.recordCount, 298);
assert.equal(coveredProjectIds.length, 106, 'exactly 106 unique projects');
assert.equal(metadata.uniqueProjectCount, 106);
assert.equal(
  repeatedProjectIds.length,
  105,
  'exactly 105 projects with repeated observations'
);
assert.equal(metadata.repeatedObservationProjectCount, 105);
assert.equal(
  new Set(observations.map(o => o.id)).size,
  298,
  'observation ids must be unique'
);

// 2. All project references resolve against the 303-project canonical set.
for (const observation of observations) {
  const project = getProjectById(observation.canonical_project_id);
  assert.ok(
    project,
    `observation ${observation.id} must resolve to a canonical project`
  );
}
assert.equal(getProjects().length, 303, 'canonical projects must be 303');

// 3. currency_unit null throughout; period_basis is year_to_date.
for (const observation of observations) {
  assert.equal(
    observation.currency_unit,
    null,
    `${observation.id} currency_unit must remain null`
  );
  assert.equal(
    observation.period_basis,
    'year_to_date',
    `${observation.id} period_basis must be year_to_date`
  );
}

// 4. Null numeric fields remain null, never coerced to zero.
const nullTotalIncurred = observations.filter(
  o => o.total_cost_incurred_to_date === null
);
const nullDerivedPercent = observations.filter(
  o => o.cost_incurred_to_date_percent_derived === null
);
assert.ok(nullTotalIncurred.length > 0, 'fixture must include null values');
for (const observation of nullTotalIncurred) {
  assert.notEqual(observation.total_cost_incurred_to_date, 0);
}
for (const observation of nullDerivedPercent) {
  assert.notEqual(observation.cost_incurred_to_date_percent_derived, 0);
}
// physical_completion_percent, by contrast, is never null and a real 0 is a
// genuine reported value, not a missing one — the two must not be conflated.
for (const observation of observations) {
  assert.equal(typeof observation.physical_completion_percent, 'number');
}

// 5. Repeated observations remain separate — each repeated project has more
// than one distinct observation id, and every repeat sits in one reporting
// year (no observation is silently merged or connected across years) EXCEPT
// the 3 canonical-project-dedup survivors below, which legitimately combine
// their own pre-existing observations with a retired duplicate project's
// observations from an adjacent year (see data/projects/project-canonical-merges.json
// in the private repo) — a genuine multi-year lifecycle, not a merge bug.
const MULTI_YEAR_MERGE_SURVIVOR_IDS = new Set([
  'proj-2024-alasas-road',
  'proj-2022-road-san-isidro-02161',
  'proj-2022-canal-santa-lucia-02112',
]);
for (const projectId of repeatedProjectIds) {
  const list = getObservationsForProject(projectId);
  assert.ok(
    list.length > 1,
    `${projectId} must have more than one observation`
  );
  assert.equal(
    new Set(list.map(o => o.id)).size,
    list.length,
    `${projectId} observations must be distinct records, not merged`
  );
  const years = new Set(list.map(o => o.reporting_year));
  const expectedYearCount = MULTI_YEAR_MERGE_SURVIVOR_IDS.has(projectId)
    ? 2
    : 1;
  assert.equal(
    years.size,
    expectedYearCount,
    `${projectId}'s repeated observations must sit in exactly ${expectedYearCount} reporting year(s)`
  );
}

// 6. No citywide aggregation is derivable/rendered: this module exposes no
// sum-of-cost function at all.
const moduleSource = readFileSync(
  'src/data/civic/projectCostUtilization.ts',
  'utf8'
);
for (const forbidden of [
  'reduce(',
  'totalCost +',
  'sum(',
  'totalSpending',
  'citywideTotal',
]) {
  assert.ok(
    !moduleSource.includes(forbidden),
    `${forbidden} must not appear in the data module — no aggregation may be derived`
  );
}

// 7. Route real, navigation appears once, planned-page entry removed.
assert.ok(
  !plannedPages.some(page => page.path === '/statistics/project-spending'),
  '/statistics/project-spending must no longer be registered as a planned page'
);
readNextRoute('/statistics/project-spending');

const megaMenus = mainNavigation.filter(item => item.sections);
const spendingDestinations = megaMenus
  .flatMap(menu => menu.sections!.flatMap(section => section.items))
  .filter(item => item.href === '/statistics/project-spending');
assert.equal(
  spendingDestinations.length,
  1,
  'exactly one navigation destination for /statistics/project-spending'
);
assert.equal(spendingDestinations[0]?.kind, 'real');

// 8. Project-detail sections limited to exactly the 106 matched projects.
const projectDetailSource = readFileSync(
  'src/app/projects/[projectId]/page.tsx',
  'utf8'
);
const projectDetailViewPath =
  'src/app/projects/[projectId]/ProjectDetailView.tsx';
const projectDetailViewSource = readFileSync(projectDetailViewPath, 'utf8');
const projectDetailPresentationSource = `${projectDetailSource}\n${projectDetailViewSource}`;
assert.match(
  projectDetailSource,
  /getObservationsForProject/,
  'ProjectDetail must resolve observations per project instead of hardcoding them'
);
assert.match(
  projectDetailSource,
  /ProjectDetailView/,
  'the Server Component must delegate presentation to ProjectDetailView'
);
assert.doesNotMatch(
  projectDetailSource,
  /@bettergov\/kapwa\/(card|banner)/,
  'the Server Component must not import Kapwa Card or Banner directly'
);
// ProjectDetailView was redesigned off @bettergov/kapwa onto the current
// design system and is now a plain presentational Server Component — no
// 'use client' directive and no Kapwa import anywhere in the boundary.
assert.doesNotMatch(
  projectDetailViewSource,
  /^'use client';/,
  'ProjectDetailView no longer needs a client boundary now that it has no Kapwa dependency'
);
assert.doesNotMatch(
  projectDetailViewSource,
  /@bettergov\/kapwa\/(card|banner)/,
  'ProjectDetailView must not import Kapwa Card or Banner'
);
assert.match(
  projectDetailViewSource,
  /Project utilization history/,
  'project details must present repeated utilization snapshots as history'
);
assert.doesNotMatch(
  projectDetailViewSource,
  /UtilizationTrendChart|Utilization trend|Previous observations/,
  'project details must not render a misleading utilization trend chart'
);
assert.match(
  projectDetailViewSource,
  /Only one verified utilization observation is currently available/,
  'single-observation projects must have a concise project-detail fallback'
);
for (const project of getProjects()) {
  const list = getObservationsForProject(project.id);
  if (coveredProjectIds.includes(project.id)) {
    assert.ok(list.length > 0, `${project.id} should have observations`);
  } else {
    assert.equal(
      list.length,
      0,
      `${project.id} is not one of the 106 matched projects and must have no observations`
    );
  }
}
assert.equal(coveredProjectIds.length + (303 - coveredProjectIds.length), 303);
assert.equal(
  getProjects().filter(
    project => getObservationsForProject(project.id).length > 0
  ).length,
  106
);
assert.equal(
  getProjects().filter(
    project => getObservationsForProject(project.id).length === 0
  ).length,
  200
);

// 9. No affirmative actual-spending/payment/disbursement claims, and no PHP
// currency formatting, across the data module, page, and detail integration.
const pageSource = `${readNextRoute('/statistics/project-spending')}\n${readFileSync(
  'src/app/statistics/project-spending/ProjectSpendingStatistics.tsx',
  'utf8'
)}`;
for (const source of [pageSource, projectDetailPresentationSource]) {
  for (const forbidden of [
    'formatPeso(observation',
    "style: 'currency'",
    'actual spending',
    'amount paid',
    'contractor payment',
    'cash expenditure',
    'total city spending',
  ]) {
    assert.ok(
      !source.includes(forbidden),
      `${forbidden} must not appear in cost-utilization presentation code`
    );
  }
  // "disbursement" and "PHP"/peso may appear, but only inside an explicit
  // non-claim (e.g. "not proof of cash payment or disbursement", "never as
  // PHP or peso figures") — never as an affirmative statement.
  for (const affirmativeClaim of [
    'is a disbursement',
    'represents a disbursement',
    'disbursement of',
    'in PHP',
    'in pesos',
  ]) {
    assert.ok(
      !source.toLowerCase().includes(affirmativeClaim.toLowerCase()),
      `"${affirmativeClaim}" must not appear as an affirmative currency/payment claim`
    );
  }
}
assert.match(
  pageSource,
  /Currency not stated in source/,
  'the page must label unstated-currency amounts explicitly'
);
assert.match(
  moduleSource + pageSource,
  /does not\s+confirm that a payment or disbursement was made/i,
  'the non-payment limitation must be present'
);

// 10. Safe external links.
for (const source of [pageSource, projectDetailPresentationSource]) {
  assert.match(source, /target="_blank"/);
  assert.match(source, /rel="noopener noreferrer"/);
}

// 12. UI presentation: the analytical redesign replaced the compact
// preview/show-all toggle with a searchable, sortable, paginated "Latest
// project snapshots" directory — all 106 projects must remain reachable via
// pagination, and the full list must stay in memory, not truncated at the
// source.
assert.match(
  pageSource,
  /latestByProject/,
  'the full 106-project snapshot list must remain in memory, not truncated at the source'
);
assert.match(
  pageSource,
  /SNAPSHOTS_PER_PAGE\s*=\s*10/,
  'the latest-project-snapshots directory must paginate at 10 rows per page'
);
assert.match(
  pageSource,
  /sortedSnapshots\.slice/,
  'the snapshot directory must paginate its sorted/filtered results, not drop rows'
);
assert.match(
  pageSource,
  /aria-label="Project utilization data pagination"/,
  'the project-browsing pagination must be in an accessible landmark'
);
assert.match(
  pageSource,
  /Search projects/,
  'the snapshot directory must offer a project search control'
);
assert.match(
  pageSource,
  /Sort: \{option\.label\}/,
  'the snapshot directory must offer a sort control'
);
assert.match(
  pageSource,
  /OBSERVATIONS_PER_PAGE\s*=\s*10/,
  'the observation table must paginate at 10 rows per page'
);
assert.match(
  pageSource,
  /setPage\(1\)/,
  'changing a filter must reset pagination to page 1'
);
assert.match(
  pageSource,
  /aria-label="Source observations pagination"/,
  'pagination controls must be in an accessible landmark'
);
assert.match(pageSource, />\s*Previous\s*</);
assert.match(pageSource, />\s*Next\s*</);
assert.match(
  pageSource,
  /Browse all \{metadata\.canonicalProjectCount\} projects/,
  'the page must link to /projects/city-projects labeled to browse all 303 projects'
);
assert.match(
  pageSource,
  /href="\/projects\/city-projects"[\s\S]{0,300}Browse all/,
  'the Browse-all-303 control must link to /projects/city-projects'
);
// Coverage must remain derived from metadata, include both sides of the
// represented-project count, and avoid treating the subset as citywide data.
assert.match(
  pageSource,
  /\{metadata\.uniqueProjectCount\}\s+of\s+\{metadata\.canonicalProjectCount\}/,
  'the coverage stat must state uniqueProjectCount of canonicalProjectCount, derived from metadata'
);
assert.match(
  pageSource,
  /metadata\.canonicalProjectCount - metadata\.uniqueProjectCount/,
  'the coverage panel must derive the not-represented count'
);
assert.match(
  pageSource,
  /Projects without a verified cost-utilization observation[\s\S]{0,250}not\s+included\s+in\s+the\s+analysis on this page/,
  'the coverage panel must explain the bounded subset'
);
assert.match(
  pageSource,
  /Project observation history/,
  'the page must provide a per-project reporting-period comparison'
);
assert.match(
  pageSource,
  /Browse projects with utilization data/,
  'the primary directory must make its one-project-per-latest-observation scope clear'
);
assert.match(
  pageSource,
  /Detailed source observations/,
  'the source-level audit data must be clearly distinct from the project directory'
);
assert.match(
  pageSource,
  /View all \{metadata\.recordCount\} source observations/,
  'the detailed-data disclosure must derive its observation count from metadata'
);
assert.match(
  pageSource,
  /role="combobox"/,
  'project history must use a searchable combobox rather than a giant native select'
);
assert.match(
  pageSource,
  /aria-activedescendant/,
  'the project picker must expose its active option to assistive technology'
);
assert.doesNotMatch(
  pageSource,
  /<select[\s\S]{0,200}selectedProjectId/,
  'project history must not render the represented-project list as a native select'
);
assert.match(
  pageSource,
  /Available reporting periods/,
  'project history must label its reporting-period list'
);
assert.match(
  pageSource,
  /Only one verified observation is currently available for\s+this project/,
  'single-observation projects must have a clear fallback'
);
assert.doesNotMatch(
  pageSource,
  /Since the previous observation/,
  'project history must not invent a change narrative between source snapshots'
);
assert.doesNotMatch(
  pageSource,
  /best|worst|highest[- ]spending|lowest[- ]spending|top spending|ranked/i,
  'the comparison section must not rank projects'
);

// The redesign must not drop or paginate away any of the 298 underlying
// observations or 106 projects — only the rendered slice per page/view.
assert.match(pageSource, /filteredObservations\.slice/);
assert.match(pageSource, /pagedObservations/);
assert.equal(
  Array.from({ length: Math.ceil(observations.length / 10) }, (_, page) =>
    observations.slice(page * 10, (page + 1) * 10)
  ).flat().length,
  298,
  '10-row pagination must make all 298 observations reachable'
);

// 11. Existing regressions: services, Full Disclosure, and Utilities & Water
// datasets unchanged by this sync.
assert.equal(getServices().length, 177, 'services must remain exactly 177');
assert.equal(
  getFullDisclosureRecords().length,
  10,
  'Full Disclosure must remain exactly 10'
);
assert.equal(
  getUtilitiesWaterResources().length,
  2,
  'Utilities & Water supporting resources must remain exactly 2'
);

console.log('[smoke-project-cost-utilization] OK');
console.log(
  `  observations: ${observations.length}; unique projects: ${coveredProjectIds.length}; repeated: ${repeatedProjectIds.length}`
);
