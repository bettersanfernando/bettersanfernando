#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { assertNextRedirect, readNextRoute } from './smoke-next-route.ts';
import {
  getAllProjectEvidence,
  getProjectById,
  getProjects,
} from '../src/data/civic/projects.ts';
import {
  countProjectEvidenceByStage,
  EVIDENCE_STAGE_METADATA,
  filterProjectEvidence,
  resolveProjectEvidence,
} from '../src/data/civic/projectSources.ts';
import {
  getEvidenceSourceUrl,
  hasAttachment,
  isPrimaryOfficialSource,
} from '../src/data/civic/sources.ts';

const evidence = getAllProjectEvidence();
const projects = getProjects();
const records = resolveProjectEvidence(evidence);
const counts = countProjectEvidenceByStage(evidence);

// 1. Evidence and project integrity
assert.equal(evidence.length, 572);
assert.equal(projects.length, 306);
assert.equal(counts.BID_RESULTS, 233);
assert.equal(counts.NTA_UTILIZATION_REPORT, 229);
assert.equal(counts.PROCUREMENT_MONITORING_REPORT, 74);
assert.equal(counts.NOTICE_OF_AWARD, 12);
assert.equal(counts.ITB, 17);
assert.equal(counts.APP, 7);
assert.equal(records.length, evidence.length, 'no evidence may be orphaned');
assert.equal(new Set(evidence.map(item => item.project_id)).size, 306);

// 2. Document coverage derivation
const withAttachmentCount = evidence.filter(hasAttachment).length;
const withoutAttachmentCount = evidence.length - withAttachmentCount;
assert.equal(withAttachmentCount, 568);
assert.equal(withoutAttachmentCount, 4);
const coveragePct = ((withAttachmentCount / evidence.length) * 100).toFixed(1);
assert.equal(coveragePct, '99.3');

// 3. Provenance and link validation
for (const item of evidence) {
  assert.ok(
    getProjectById(item.project_id),
    `${item.id} must resolve to a project`
  );
  assert.equal(isPrimaryOfficialSource(item), true);
  assert.equal(hasAttachment(item), item.attachment_url !== null);
  assert.equal(
    getEvidenceSourceUrl(item),
    item.attachment_url ?? item.page_url ?? null
  );
}

// 4. Filtering: Stage / Evidence Type
assert.equal(
  filterProjectEvidence(records, { stage: 'APP' }).length,
  counts.APP
);
assert.equal(
  filterProjectEvidence(records, { stage: 'BID_RESULTS' }).length,
  counts.BID_RESULTS
);
assert.equal(
  filterProjectEvidence(records, { stage: 'NTA_UTILIZATION_REPORT' }).length,
  counts.NTA_UTILIZATION_REPORT
);

// 5. Filtering: Source Authority
assert.equal(
  filterProjectEvidence(records, { authority: 'PRIMARY_OFFICIAL' }).length,
  28
);
assert.equal(
  filterProjectEvidence(records, { authority: 'PRIMARY_OFFICIAL_CSFP' }).length,
  544
);

// 6. Filtering: Document availability
assert.equal(
  filterProjectEvidence(records, { document: 'attachment' }).length,
  568
);
assert.equal(
  filterProjectEvidence(records, { document: 'page-only' }).length,
  4
);

// 7. Filtering: Year & Undated
assert.equal(filterProjectEvidence(records, { year: '2024' }).length, 67);
assert.equal(filterProjectEvidence(records, { year: 'undated' }).length, 339);

// 8. Search query matching
assert.equal(
  filterProjectEvidence(records, { query: evidence[0].source_identifier })[0]
    .evidence.id,
  evidence[0].id
);
const testProject = projects[0];
const projectMatches = filterProjectEvidence(records, {
  query: testProject.project_name,
});
assert.ok(projectMatches.length > 0);
assert.ok(
  projectMatches.every(
    m =>
      m.project.project_name
        .toLowerCase()
        .includes(testProject.project_name.toLowerCase()) || m.evidence.id
  )
);

// 9. Sorting determinism
for (const sortOption of [
  'date-desc',
  'date-asc',
  'project-asc',
  'type-asc',
  'identifier-asc',
] as const) {
  const sorted1 = filterProjectEvidence(records, { sort: sortOption }).map(
    item => item.evidence.id
  );
  const sorted2 = filterProjectEvidence(records, { sort: sortOption }).map(
    item => item.evidence.id
  );
  assert.deepEqual(
    sorted1,
    sorted2,
    `sorting by ${sortOption} must be deterministic`
  );
}

// 10. Pagination: 10 per page
const PAGE_SIZE = 10;
const totalPages = Math.ceil(records.length / PAGE_SIZE);
assert.equal(totalPages, 58);
const page1 = records.slice(0, PAGE_SIZE);
assert.equal(page1.length, 10);

// 11. User-friendly labels
assert.equal(EVIDENCE_STAGE_METADATA.BID_RESULTS.label, 'Bid Results');
assert.equal(
  EVIDENCE_STAGE_METADATA.NTA_UTILIZATION_REPORT.label,
  'NTA Utilization Reports'
);
assert.equal(
  EVIDENCE_STAGE_METADATA.PROCUREMENT_MONITORING_REPORT.label,
  'Procurement Monitoring Reports'
);
assert.equal(EVIDENCE_STAGE_METADATA.NOTICE_OF_AWARD.label, 'Notice of Award');
assert.equal(EVIDENCE_STAGE_METADATA.ITB.label, 'Invitation to Bid (ITB)');
assert.equal(
  EVIDENCE_STAGE_METADATA.APP.label,
  'Annual Procurement Plan (APP)'
);

// 12. Security & privacy: No internal fields exposed
const pageSource = readNextRoute('/projects/sources');
for (const privateField of [
  'source_sha256',
  'retrieval_status',
  'archive_path',
  'research_queue',
]) {
  assert.ok(
    !pageSource.includes(privateField),
    `${privateField} must not be surfaced by the page`
  );
}
assert.ok(!/\b(?:item|evidence)\.facts\b/.test(pageSource));

// 13. Redirect parity
await assertNextRedirect('/projects/data-sources', '/projects/sources');

console.log('[smoke-project-sources] OK');
console.log(`  evidence: ${evidence.length}; projects: ${projects.length}`);
console.log(
  `  stages: ${Object.entries(counts)
    .map(([stage, count]) => `${stage}=${count}`)
    .join(', ')}`
);
console.log(
  `  document coverage: ${withAttachmentCount}/${evidence.length} (${coveragePct}%)`
);
