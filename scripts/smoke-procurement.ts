import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getProcurementStatistics } from '../src/data/civic/procurementStatistics.ts';
import {
  getProjects,
  getAllProjectEvidence,
} from '../src/data/civic/projects.ts';
import { getBidResultEvidence } from '../src/data/civic/bidResults.ts';
import { mainNavigation } from '../src/data/navigation.ts';

const statistics = getProcurementStatistics();
const projects = getProjects();
const evidence = getAllProjectEvidence();
const bidResults = getBidResultEvidence();

assert.equal(statistics.projects.total, projects.length);
assert.equal(statistics.evidence.total, evidence.length);
assert.equal(statistics.bidResults.total, bidResults.length);
assert.equal(
  statistics.awardsAndContracts.awarded,
  projects.filter(project => project.lifecycle_status === 'AWARDED').length
);
assert.equal(
  statistics.awardsAndContracts.contracted,
  projects.filter(project => project.lifecycle_status === 'CONTRACTED').length
);
assert.equal(mainNavigation.length, 7);

const pageSource = readFileSync('src/pages/Procurement.tsx', 'utf8');
for (const href of [
  '/procurement/bid-results',
  '/procurement/contracts',
  '/statistics/procurement',
]) {
  assert.ok(pageSource.includes(href), `${href} must be a hub destination`);
}
assert.doesNotMatch(pageSource, /228 contracts|Awarded contracts/i);
assert.doesNotMatch(
  pageSource,
  /savings|performance score|efficiency ranking/i
);
assert.doesNotMatch(
  pageSource,
  /total spent|actual cost|actual expenditure:\s*[\d₱]/i
);
for (const privateTerm of [
  'raw_source_path',
  'audit_notes',
  'recovery_queue',
  'collision_notes',
  'source_hash',
]) {
  assert.ok(
    !pageSource.includes(privateTerm),
    `${privateTerm} must not be surfaced`
  );
}

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(appSource, /path="\/procurement"/);
assert.match(
  appSource,
  /path="\/transparency\/procurement"[\s\S]*?<Navigate to="\/procurement" replace \/>/
);

console.log('[smoke-procurement] OK');
console.log(
  `  projects: ${statistics.projects.total}; evidence: ${statistics.evidence.total}; bid results: ${statistics.bidResults.total}; awarded: ${statistics.awardsAndContracts.awarded}; contracted: ${statistics.awardsAndContracts.contracted}`
);
