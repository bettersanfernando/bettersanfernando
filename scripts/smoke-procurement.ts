import assert from 'node:assert/strict';
import { getProcurementStatistics } from '../src/data/civic/procurementStatistics.ts';
import {
  getProjects,
  getAllProjectEvidence,
} from '../src/data/civic/projects.ts';
import { getBidResultEvidence } from '../src/data/civic/bidResults.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { assertNextRedirect, readNextRoute } from './smoke-next-route.ts';

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

const pageSource = readNextRoute('/procurement');
for (const href of [
  '/procurement/bid-results',
  '/procurement/contracts',
  '/statistics/procurement',
]) {
  assert.ok(pageSource.includes(href), `${href} must be a hub destination`);
}
assert.match(
  pageSource,
  /Four types of procurement records you may encounter/,
  'the hub must explain documentary relationships before destinations'
);
assert.match(
  pageSource,
  /Project record[\s\S]{0,1000}Bid-result evidence[\s\S]{0,1000}Award evidence[\s\S]{0,1000}Contract evidence/,
  'the relationship flow must retain the documented project-to-contract record concepts'
);
assert.match(
  pageSource,
  /A winning bid[\s\S]{0,500}does not by itself establish contract execution/i,
  'the flow must not imply that bid evidence proves a contract'
);
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

await assertNextRedirect('/transparency/procurement', '/procurement');

console.log('[smoke-procurement] OK');
console.log(
  `  projects: ${statistics.projects.total}; evidence: ${statistics.evidence.total}; bid results: ${statistics.bidResults.total}; awarded: ${statistics.awardsAndContracts.awarded}; contracted: ${statistics.awardsAndContracts.contracted}`
);
