#!/usr/bin/env node
/**
 * Validates the vendored civic data under src/data/generated/civic/.
 *
 * Public-repo only: does NOT read or require the private
 * bettersanfernando-data checkout. Safe to run in CI / production build.
 *
 * Usage:
 *   pnpm data:validate
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const errors = [];
function fail(message) {
  errors.push(message);
}

const config = JSON.parse(
  readFileSync(join(ROOT, 'civic-data.config.json'), 'utf8')
);
const destDir = join(ROOT, config.generated_target);

const manifestPath = join(destDir, 'manifest.json');
if (!existsSync(manifestPath)) {
  console.error(
    `[validate-civic-data] FAILED: no generated manifest at ${manifestPath}. Run "pnpm data:sync" first.`
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

if (manifest.export_version !== config.expected_export_version) {
  fail(
    `export_version mismatch: manifest has "${manifest.export_version}", expected "${config.expected_export_version}"`
  );
}
if (manifest.source_data_version !== config.expected_source_data_version) {
  fail(
    `source_data_version mismatch: manifest has "${manifest.source_data_version}", expected "${config.expected_source_data_version}"`
  );
}

const datasetEntries = Object.entries(manifest.datasets ?? {});
if (datasetEntries.length === 0) {
  fail('Manifest declares no datasets.');
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

const parsed = {};

for (const [relPath, meta] of datasetEntries) {
  const filePath = join(destDir, relPath);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    fail(`Missing vendored file: ${relPath}`);
    continue;
  }
  const actualHash = sha256(filePath);
  if (actualHash !== meta.sha256) {
    fail(
      `Checksum mismatch for ${relPath}: expected ${meta.sha256}, got ${actualHash}`
    );
  }
  try {
    parsed[relPath] = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    fail(`Failed to parse JSON for ${relPath}: ${err.message}`);
  }
}

// No unexpected files/directories beyond what the manifest declares + manifest.json itself.
function listFilesRecursive(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

const declaredRelPaths = new Set(datasetEntries.map(([relPath]) => relPath));
declaredRelPaths.add('manifest.json');
const actualFiles = existsSync(destDir) ? listFilesRecursive(destDir) : [];
const unexpected = actualFiles.filter(f => {
  const rel = f.slice(destDir.length + 1).replace(/\\/g, '/');
  return !declaredRelPaths.has(rel);
});
if (unexpected.length > 0) {
  fail(
    `Unexpected file(s) in vendored civic data directory:\n${unexpected.join('\n')}`
  );
}

// Baseline dataset counts (business-level sanity check, not just per-file record_count).
const barangays = parsed['demographics/barangays.json'];
const projects = parsed['projects/city-projects.json'];
const evidence = parsed['projects/project-evidence.json'];
const utilization = parsed['projects/project-cost-utilization.json'];
const redirects = parsed['projects/project-id-redirects.json'];
const services = parsed['services/services.json'];
const officialDocuments = parsed['transparency/official-documents.json'];

if (barangays) {
  if (barangays.barangay_count !== 35 || barangays.barangays?.length !== 35) {
    fail(
      `Expected 35 barangays, got barangay_count=${barangays.barangay_count}, array length=${barangays.barangays?.length}`
    );
  }
  if (barangays.total_population !== 377534) {
    fail(`Expected total_population 377534, got ${barangays.total_population}`);
  }
}

let projectIds = new Set();
if (projects) {
  const list = projects.projects ?? [];
  if (list.length !== 306) {
    fail(`Expected 306 projects, got ${list.length}`);
  }
  for (const p of list) {
    if (projectIds.has(p.id)) {
      fail(`Duplicate project id: ${p.id}`);
    }
    projectIds.add(p.id);
  }
}

if (evidence) {
  const list = evidence.evidence ?? [];
  if (list.length !== 590) {
    fail(`Expected 590 evidence records, got ${list.length}`);
  }
  for (const e of list) {
    if (!projectIds.has(e.project_id)) {
      fail(
        `Evidence record ${e.id} references unknown project_id: ${e.project_id}`
      );
    }
    if (Object.hasOwn(e, 'source_sha256')) {
      fail(`Evidence record ${e.id} exposes source_sha256`);
    }
  }
}

if (redirects) {
  const list = redirects.redirects ?? [];
  if (list.length !== 18) {
    fail(`Expected 18 project ID redirects, got ${list.length}`);
  }
  const deprecatedIds = new Set(list.map(r => r.deprecated_project_id));
  if (deprecatedIds.size !== list.length) {
    fail('Duplicate deprecated_project_id in project-id-redirects.json');
  }
  for (const r of list) {
    if (projectIds.has(r.deprecated_project_id)) {
      fail(
        `Redirect source ${r.deprecated_project_id} must not still exist as a live project`
      );
    }
    if (!projectIds.has(r.canonical_project_id)) {
      fail(
        `Redirect target ${r.canonical_project_id} does not resolve to a live project`
      );
    }
    if (deprecatedIds.has(r.canonical_project_id)) {
      fail(
        `Redirect chain/loop: ${r.deprecated_project_id} -> ${r.canonical_project_id}, but the target is itself deprecated`
      );
    }
  }
}

if (utilization) {
  const list = utilization.observations ?? [];
  const counts = new Map();
  for (const observation of list) {
    counts.set(
      observation.canonical_project_id,
      (counts.get(observation.canonical_project_id) ?? 0) + 1
    );
  }
  if (list.length !== 298 || counts.size !== 106) {
    fail(
      `Expected 298 utilization observations for 106 projects, got ${list.length} for ${counts.size}`
    );
  }
  const repeated = [...counts.values()].filter(count => count > 1).length;
  if (repeated !== 105)
    fail(`Expected 105 repeated-observation projects, got ${repeated}`);
}

if (services?.services?.length !== 177) {
  fail(`Expected 177 services, got ${services?.services?.length}`);
}

if (
  officialDocuments?.record_count !== 9 ||
  officialDocuments?.records?.length !== 9
) {
  fail(
    `Expected 9 official documents, got record_count=${officialDocuments?.record_count}, array length=${officialDocuments?.records?.length}`
  );
}

if (errors.length > 0) {
  console.error('[validate-civic-data] FAILED:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `[validate-civic-data] OK — ${datasetEntries.length} dataset(s), ${projectIds.size} projects, all checksums and references verified.`
);
