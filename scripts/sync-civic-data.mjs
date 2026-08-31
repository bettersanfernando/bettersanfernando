#!/usr/bin/env node
/**
 * Vendors the frontend-safe civic data export from the private
 * bettersanfernando-data repository into src/data/generated/civic/.
 *
 * This is a LOCAL MAINTAINER script. It requires a local checkout of the
 * private data repo and is never run as part of the production build.
 *
 * Usage:
 *   pnpm data:sync
 *   pnpm data:sync -- --source=/path/to/bettersanfernando-data
 *   CIVIC_DATA_SOURCE_REPO=/path/to/bettersanfernando-data pnpm data:sync
 */

import { createHash } from 'crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  copyFileSync,
  statSync,
} from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function fail(message) {
  console.error(`[sync-civic-data] FAILED: ${message}`);
  process.exit(1);
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function resolveSourceRepo() {
  const cliArg = process.argv.find(arg => arg.startsWith('--source='));
  const fromCli = cliArg ? cliArg.slice('--source='.length) : null;
  const fromEnv = process.env.CIVIC_DATA_SOURCE_REPO;
  const raw = fromCli ?? fromEnv ?? join(ROOT, '..', 'bettersanfernando-data');
  return resolve(raw);
}

const config = JSON.parse(readFileSync(join(ROOT, 'civic-data.config.json'), 'utf8'));

const sourceRepo = resolveSourceRepo();
if (!existsSync(sourceRepo)) {
  fail(`Source data repo not found at ${sourceRepo}. Set CIVIC_DATA_SOURCE_REPO or --source=<path>.`);
}

const exportDir = join(sourceRepo, config.export_dir);
if (!existsSync(exportDir)) {
  fail(`Expected export directory not found: ${exportDir}`);
}

const manifestPath = join(exportDir, 'manifest.json');
if (!existsSync(manifestPath)) {
  fail(`Export manifest not found: ${manifestPath}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

if (manifest.export_version !== config.expected_export_version) {
  fail(
    `Export version mismatch: manifest has "${manifest.export_version}", expected "${config.expected_export_version}"`
  );
}
if (manifest.source_data_version !== config.expected_source_data_version) {
  fail(
    `Source data version mismatch: manifest has "${manifest.source_data_version}", expected "${config.expected_source_data_version}"`
  );
}

const datasetEntries = Object.entries(manifest.datasets ?? {});
if (datasetEntries.length === 0) {
  fail('Manifest declares no datasets.');
}

console.log(`[sync-civic-data] Source: ${exportDir}`);
console.log(`[sync-civic-data] export_version=${manifest.export_version} source_data_version=${manifest.source_data_version}`);

// Verify every declared file exists and its checksum matches before copying anything.
for (const [relPath, meta] of datasetEntries) {
  const filePath = join(exportDir, relPath);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    fail(`Manifest references missing file: ${relPath}`);
  }
  const actual = sha256(filePath);
  if (actual !== meta.sha256) {
    fail(`Checksum mismatch for ${relPath}: expected ${meta.sha256}, got ${actual}`);
  }
}
console.log(`[sync-civic-data] Verified ${datasetEntries.length} dataset checksum(s).`);

const destDir = join(ROOT, config.generated_target);

// Remove stale contents of the generated destination only — never touches
// unrelated src/data files, since destDir is a dedicated namespace.
if (existsSync(destDir)) {
  rmSync(destDir, { recursive: true, force: true });
}
mkdirSync(destDir, { recursive: true });

// Copy only the files the manifest declares (the frontend-safe export tree),
// plus the manifest itself so the public repo can self-validate.
for (const [relPath] of datasetEntries) {
  const srcFile = join(exportDir, relPath);
  const destFile = join(destDir, relPath);
  mkdirSync(dirname(destFile), { recursive: true });
  copyFileSync(srcFile, destFile);
}
copyFileSync(manifestPath, join(destDir, 'manifest.json'));

// Guard against anything unexpected in the export dir leaking in (e.g. a
// stray private file). Only the manifest-declared files and manifest.json
// itself may exist in exportDir's file listing that we copy from.
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

const declaredFiles = new Set(datasetEntries.map(([relPath]) => join(exportDir, relPath)));
declaredFiles.add(manifestPath);
const actualFiles = listFilesRecursive(exportDir);
const undeclared = actualFiles.filter(f => !declaredFiles.has(f));
if (undeclared.length > 0) {
  fail(
    `Export directory contains undeclared file(s) not in manifest — refusing to sync:\n${undeclared.join('\n')}`
  );
}

console.log(`[sync-civic-data] Copied ${datasetEntries.length} file(s) to ${destDir}`);
console.log('[sync-civic-data] Done.');
