#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getFinanceMetadata,
  getFinanceObservations,
  getFinanceReports,
} from '../src/data/civic/finance.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const reports = getFinanceReports();
const observations = getFinanceObservations();
const metadata = getFinanceMetadata();

assert.equal(reports.length, 53, 'expected exactly 53 finance reports');
assert.equal(
  observations.length,
  121,
  'expected exactly 121 finance observations'
);
assert.equal(metadata.reportCount, 53);
assert.equal(metadata.observationCount, 121);

// Currency/unit is never verified in the source — every amount must render
// as a plain number, never assumed to be PHP/pesos/thousands/millions.
assert.ok(
  reports.every(
    report => report.currency_code === null && report.unit_text === null
  ),
  'every finance report must carry a null currency_code/unit_text'
);
assert.ok(
  observations.every(
    observation =>
      observation.currency_code === null && observation.unit_text === null
  ),
  'every finance observation must carry a null currency_code/unit_text'
);

// Every observation must resolve to a real, published report.
const reportIds = new Set(reports.map(report => report.id));
const orphanObservations = observations.filter(
  observation => !reportIds.has(observation.report_id)
);
assert.equal(orphanObservations.length, 0, 'no orphaned finance observations');

// Cumulative YTD quarters exist and must never be flagged as safely summable.
const cumulativeObservations = observations.filter(
  observation => observation.is_cumulative
);
assert.ok(cumulativeObservations.length > 0);

const uca = reports.filter(
  report => report.report_type === 'unliquidated_cash_advances'
);
assert.ok(uca.length > 0);
assert.ok(
  uca.every(report => report.privacy_treatment === 'aggregate_only'),
  'UCA reports must remain aggregate-only, never row-level'
);

assert.ok(
  !plannedPages.some(page => page.path === '/transparency/finance'),
  '/transparency/finance must no longer be a planned page'
);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/transparency\/finance"[\s\S]{0,40}element={<CityFinances \/>}/
);

const pageSource = readFileSync('src/pages/CityFinances.tsx', 'utf8');
assert.match(pageSource, /City Finances/);
assert.doesNotMatch(pageSource, /City Spending/);
assert.match(
  pageSource,
  /never summed into an annual or citywide total/i,
  'the page must explicitly disclaim a citywide spending total, never present one'
);
assert.match(pageSource, /never summed|not additive|non-additive/i);
assert.match(pageSource, /formatUnstatedAmount/);
for (const privateTerm of [
  'sha256',
  'source_commit',
  'recovery-queue',
  'reviewer notes',
  'reconciliation-diagnostics',
]) {
  assert.ok(
    !pageSource.toLowerCase().includes(privateTerm.toLowerCase()),
    `${privateTerm} must not be surfaced by the page`
  );
}

console.log('[smoke-finance] OK');
console.log(
  `  reports: ${reports.length}; observations: ${observations.length}; cumulative: ${cumulativeObservations.length}`
);
