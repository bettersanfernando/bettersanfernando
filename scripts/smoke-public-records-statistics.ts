#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getPublicRecordsArchiveCoverage,
  getPublicRecordsMetrics,
  getPublicRecordsRelatedCollections,
} from '../src/data/civic/publicRecordsCoverage.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const metrics = getPublicRecordsMetrics();
const archiveCoverage = getPublicRecordsArchiveCoverage();
const relatedCollections = getPublicRecordsRelatedCollections();

assert.equal(metrics.length, 8, 'expected 8 core public-records metrics');
assert.equal(archiveCoverage.length, 6, 'expected 6 archive-range entries');
assert.equal(relatedCollections.length, 1);

// Every metric keeps its own unit label — units must never be conflated.
const units = new Set(metrics.map(metric => metric.unit_label));
assert.ok(units.size > 1, 'metrics must use more than one distinct unit');

const projectMetric = metrics.find(metric => metric.record_type === 'project');
assert.equal(projectMetric?.count, 324);
const evidenceMetric = metrics.find(
  metric => metric.record_type === 'project_evidence'
);
assert.equal(evidenceMetric?.count, 563);
const servicesMetric = metrics.find(metric => metric.record_type === 'service');
assert.equal(servicesMetric?.count, 177);
const fullDisclosureMetric = metrics.find(
  metric => metric.record_type === 'full_disclosure_document'
);
assert.equal(fullDisclosureMetric?.count, 10);
const officialDocMetric = metrics.find(
  metric => metric.record_type === 'official_document'
);
assert.equal(officialDocMetric?.count, 9);
const eoMetric = metrics.find(
  metric => metric.record_type === 'executive_order'
);
assert.equal(eoMetric?.count, 13);
const ordMetric = metrics.find(metric => metric.record_type === 'ordinance');
assert.equal(ordMetric?.count, 11);
const resMetric = metrics.find(metric => metric.record_type === 'resolution');
assert.equal(resMetric?.count, 2);

const financeCollection = relatedCollections.find(
  collection => collection.record_type === 'finance_report'
);
assert.equal(financeCollection?.count, 53);

assert.ok(
  !plannedPages.some(page => page.path === '/statistics/public-records'),
  '/statistics/public-records must no longer be a planned page'
);

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/statistics\/public-records"[\s\S]{0,40}element={<PublicRecordsStatistics \/>}/
);

const pageSource = readFileSync(
  'src/pages/PublicRecordsStatistics.tsx',
  'utf8'
);
assert.doesNotMatch(pageSource, /total public records|grand total/i);
assert.match(pageSource, /own unit/i);

console.log('[smoke-public-records-statistics] OK');
console.log(
  `  metrics: ${metrics.length}; archive-range entries: ${archiveCoverage.length}; related collections: ${relatedCollections.length}`
);
