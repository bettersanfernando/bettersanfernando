#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { aggregateProjectStatistics } from '../src/data/civic/projectStatistics.ts';
import { getProjects, type Project } from '../src/data/civic/projects.ts';

const projects = getProjects();
const statistics = aggregateProjectStatistics(projects);

assert.equal(statistics.totalProjects, 239);
assert.equal(
  statistics.lifecycle.reduce((sum, item) => sum + item.count, 0),
  statistics.totalProjects,
  'lifecycle counts must include every published project exactly once'
);
assert.equal(
  statistics.barangayAttribution.attributed +
    statistics.barangayAttribution.unattributed,
  statistics.totalProjects,
  'barangay attribution counts must include every published project'
);

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

console.log('[smoke-project-statistics] OK');
console.log(`  projects: ${statistics.totalProjects}`);
console.log(
  `  barangay attribution: ${statistics.barangayAttribution.attributed} attributed, ${statistics.barangayAttribution.unattributed} unattributed`
);
console.log(
  `  amount coverage: ${statistics.amountCoverage.map(item => `${item.field}=${item.count}`).join(', ')}`
);
