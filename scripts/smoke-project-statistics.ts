#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readNextRoute } from './smoke-next-route.ts';
import { aggregateProjectStatistics } from '../src/data/civic/projectStatistics.ts';
import { getProjects, type Project } from '../src/data/civic/projects.ts';

const projects = getProjects();
const statistics = aggregateProjectStatistics(projects);

// 1. Project counts & denominations
assert.equal(statistics.totalProjects, 306);
assert.equal(statistics.barangayAttribution.attributed, 281);
assert.equal(statistics.barangayAttribution.unattributed, 25);
assert.equal(statistics.barangayAttribution.representedBarangays, 34);
assert.equal(
  statistics.barangayAttribution.attributed +
    statistics.barangayAttribution.unattributed,
  statistics.totalProjects,
  'barangay attribution counts must include every published project'
);

// 2. Lifecycle status counts
assert.deepEqual(
  Object.fromEntries(statistics.lifecycle.map(item => [item.key, item.count])),
  {
    PLANNED: 2,
    PROCUREMENT: 3,
    AWARDED: 228,
    CONTRACTED: 6,
    IMPLEMENTATION_REPORTED: 67,
  }
);
assert.equal(
  statistics.lifecycle.reduce((sum, item) => sum + item.count, 0),
  statistics.totalProjects,
  'lifecycle counts must include every published project exactly once'
);

// 3. Project type totals reconcile with 324
assert.equal(
  statistics.projectTypes.reduce((sum, item) => sum + item.count, 0),
  statistics.totalProjects,
  'project type counts must sum to total published projects'
);
assert.equal(statistics.projectTypes.length, 11);

// 4. Project year totals reconcile with 324
assert.equal(
  statistics.years.reduce((sum, item) => sum + item.count, 0),
  statistics.totalProjects,
  'project year counts must sum to total published projects'
);
assert.deepEqual(
  statistics.years.map(y => y.key),
  [2022, 2023, 2024, 2025, 2026],
  'project years must be chronological'
);

// 5. Project category totals reconcile with 324
assert.deepEqual(
  Object.fromEntries(
    statistics.projectCategories.map(item => [item.key, item.count])
  ),
  {
    INFRASTRUCTURE_CAPITAL: 251,
    INFRASTRUCTURE_MAINTENANCE: 55,
  }
);
assert.equal(
  statistics.projectCategories.reduce((sum, item) => sum + item.count, 0),
  statistics.totalProjects,
  'project category counts must sum to total published projects'
);

// 6. Financial coverage
assert.deepEqual(
  statistics.amountCoverage.map(item => [
    item.field,
    item.count,
    item.unavailableCount,
  ]),
  [
    ['approved_budget_abc', 237, 69],
    ['winning_bid_amount', 232, 74],
    ['contract_amount', 10, 296],
  ]
);

// 7. Status as of is present
assert.ok(
  statistics.statusAsOf.length > 0,
  'statusAsOf must be a non-empty date string'
);

// 8. Controlled fixture test for amount coverage calculation
const amountFixture: Project[] = [
  {
    ...projects[0],
    approved_budget_abc: 100,
    winning_bid_amount: null,
    contract_amount: null,
  },
  {
    ...projects[1],
    approved_budget_abc: null,
    winning_bid_amount: 90,
    contract_amount: null,
  },
  {
    ...projects[2],
    approved_budget_abc: null,
    winning_bid_amount: null,
    contract_amount: 80,
  },
];
const fixtureCoverage =
  aggregateProjectStatistics(amountFixture).amountCoverage;

assert.deepEqual(
  fixtureCoverage.map(item => [item.field, item.count]),
  [
    ['approved_budget_abc', 1],
    ['winning_bid_amount', 1],
    ['contract_amount', 1],
  ],
  'ABC, winning bid, and contract coverage must be counted independently'
);

// 9. Page content & route checks
const pageSource = readNextRoute('/statistics/projects');

// No legacy styling
for (const legacyPattern of [
  'rounded-xl bg-primary-900',
  'shadow-[0_8px_28px',
  'DistributionTable',
  'bg-warning-50',
]) {
  assert.ok(
    !pageSource.includes(legacyPattern),
    `page source must not include legacy pattern: ${legacyPattern}`
  );
}

// Relevant section headings
for (const heading of [
  'A snapshot of San Fernando’s published project records',
  'Bounded published project collection',
  'What stands out in the current collection',
  'How projects are currently documented',
  'What kinds of projects are in the collection?',
  'Project category',
  'When are the published project records dated?',
  'How much of the collection is attributed to a barangay?',
  'Which monetary fields are available?',
  'Actual expenditure',
  'How to interpret these statistics',
  'Explore the project data',
]) {
  assert.ok(
    pageSource.includes(heading),
    `page source must include heading: "${heading}"`
  );
}

// Destination links
for (const href of [
  '/projects/city-projects',
  '/projects/map',
  '/statistics/project-spending',
  '/statistics/procurement',
  '/projects/sources',
  '/projects/methodology',
]) {
  assert.ok(
    pageSource.includes(href),
    `page must link to destination: ${href}`
  );
}

console.log('[smoke-project-statistics] OK');
console.log(`  projects: ${statistics.totalProjects}`);
console.log(
  `  barangay attribution: ${statistics.barangayAttribution.attributed} attributed, ${statistics.barangayAttribution.unattributed} unattributed`
);
console.log(
  `  amount coverage: ${statistics.amountCoverage.map(item => `${item.field}=${item.count}/${item.unavailableCount}`).join(', ')}`
);
console.log(
  `  categories: ${statistics.projectCategories.map(item => `${item.key}=${item.count}`).join(', ')}`
);
