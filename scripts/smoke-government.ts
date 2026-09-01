import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCityOffices } from '../src/data/civic/government.ts';
import { getGovernmentSummary } from '../src/data/civic/governmentSummary.ts';
import {
  getExecutiveOrders,
  getOrdinances,
} from '../src/data/civic/legislation.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const summary = getGovernmentSummary();
const pageSource = readFileSync('src/pages/Government.tsx', 'utf8');
const appSource = readFileSync('src/App.tsx', 'utf8');

assert.equal(summary.officeRecords, getCityOffices().length);
assert.equal(summary.executiveOrders, getExecutiveOrders().length);
assert.equal(summary.ordinances, getOrdinances().length);
assert.equal(summary.officeRecords, 22);
assert.equal(summary.executiveOrders, 11);
assert.equal(summary.ordinances, 6);
assert.deepEqual(
  getGovernmentSummary(),
  summary,
  'summary must be deterministic'
);

assert.match(appSource, /path="\/government" element={<Government \/>}/);
assert.ok(!plannedPages.some(page => page.path === '/government'));
assert.ok(!plannedPages.some(page => page.path === '/government/structure'));
assert.equal(mainNavigation.length, 7);

for (const href of [
  '/government/offices',
  '/government/contact',
  '/legislation',
  '/statistics',
  '/transparency',
]) {
  assert.match(pageSource, new RegExp(`href: ["']${href}["']`));
}

for (const href of ['/transparency/sources', '/transparency/methodology']) {
  assert.match(pageSource, new RegExp(`to=["']${href}["']`));
}

assert.doesNotMatch(pageSource, /to=["']\/government\/structure["']/);
assert.doesNotMatch(pageSource, /22 City Government offices/i);
assert.match(pageSource, /published office records/i);
assert.match(pageSource, /not (?:an|the) official City\s+Government website/i);
assert.match(
  pageSource,
  /not asserted to represent the complete City\s+organizational structure/i
);
assert.match(pageSource, /not a\s+complete City legislative archive/i);

const governmentNavigation = mainNavigation.find(
  item => item.id === 'government'
);
assert.ok(
  !governmentNavigation?.sections
    ?.flatMap(section => section.items)
    .some(item => item.href === '/government/structure')
);

console.log('[smoke-government] OK');
console.log(
  `  office records: ${summary.officeRecords}; executive orders: ${summary.executiveOrders}; ordinances: ${summary.ordinances}`
);
