import assert from 'node:assert/strict';
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
assert.equal(observations.length, 54, 'exactly 54 verified observations');
assert.equal(metadata.recordCount, 54);
assert.equal(coveredProjectIds.length, 19, 'exactly 19 unique projects');
assert.equal(metadata.uniqueProjectCount, 19);
assert.equal(
  repeatedProjectIds.length,
  18,
  'exactly 18 projects with repeated observations'
);
assert.equal(metadata.repeatedObservationProjectCount, 18);
assert.equal(
  new Set(observations.map(o => o.id)).size,
  54,
  'observation ids must be unique'
);

// 2. All project references resolve against the 239-project canonical set.
for (const observation of observations) {
  const project = getProjectById(observation.canonical_project_id);
  assert.ok(
    project,
    `observation ${observation.id} must resolve to a canonical project`
  );
}
assert.equal(getProjects().length, 239, 'canonical projects must remain 239');

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
// year (no observation is silently merged or connected across years).
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
  assert.equal(
    years.size,
    1,
    `${projectId}'s repeated observations must currently sit in one reporting year`
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
const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/statistics\/project-spending"[\s\S]{0,80}element={<ProjectSpendingStatistics \/>}/,
  '/statistics/project-spending must be a real <Route>'
);

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

// 8. Project-detail sections limited to exactly the 19 matched projects.
const projectDetailSource = readFileSync('src/pages/ProjectDetail.tsx', 'utf8');
assert.match(
  projectDetailSource,
  /getObservationsForProject/,
  'ProjectDetail must resolve observations per project instead of hardcoding them'
);
for (const project of getProjects()) {
  const list = getObservationsForProject(project.id);
  if (coveredProjectIds.includes(project.id)) {
    assert.ok(list.length > 0, `${project.id} should have observations`);
  } else {
    assert.equal(
      list.length,
      0,
      `${project.id} is not one of the 19 matched projects and must have no observations`
    );
  }
}
assert.equal(coveredProjectIds.length + (239 - coveredProjectIds.length), 239);

// 9. No affirmative actual-spending/payment/disbursement claims, and no PHP
// currency formatting, across the data module, page, and detail integration.
const pageSource = readFileSync(
  'src/pages/ProjectSpendingStatistics.tsx',
  'utf8'
);
for (const source of [pageSource, projectDetailSource]) {
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
  /not proof of cash payment/i,
  'the non-payment limitation must be present'
);

// 10. Safe external links.
for (const source of [pageSource, projectDetailSource]) {
  assert.match(source, /target="_blank"/);
  assert.match(source, /rel="noopener noreferrer"/);
}

// 12. UI presentation: compact initial comparison view, View all/Show fewer
// toggle, all 19 projects still reachable, pagination, and a Browse-all-239
// link — the smaller-footprint redesign must not drop any underlying data.
assert.match(
  pageSource,
  /COMPARISON_PREVIEW_COUNT\s*=\s*6/,
  'the comparison section must initially show exactly 6 projects'
);
assert.match(
  pageSource,
  /showAllComparisons/,
  'the page must track a show-all/show-fewer toggle for the comparison section'
);
assert.match(
  pageSource,
  /View all \$\{latestByProject\.length\} projects/,
  'the toggle must offer to reveal all 19 projects, derived from the data, not hardcoded'
);
assert.match(pageSource, /Show fewer/);
assert.match(
  pageSource,
  /latestByProject/,
  'the full 19-project comparison list must remain in memory, not truncated at the source'
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
  'the page must link to /projects labeled to browse all 239 projects'
);
assert.match(
  pageSource,
  /to="\/projects"[\s\S]{0,300}Browse all/,
  'the Browse-all-239 control must link to /projects'
);
assert.match(
  pageSource,
  /projects with verified\s+utilization observations out of/i,
  'the coverage clarifier sentence must state 19 of 239 explicitly'
);
assert.doesNotMatch(
  pageSource,
  /best|worst|highest[- ]spending|lowest[- ]spending|top spending|ranked/i,
  'the comparison section must not rank projects'
);

// The redesign must not drop or paginate away any of the 54 underlying
// observations or 19 projects — only the rendered slice per page/view.
assert.match(pageSource, /filteredObservations\.slice/);
assert.match(pageSource, /pagedObservations/);

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
