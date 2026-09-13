#!/usr/bin/env node
/**
 * Guards against root-level canonical/raw civic data ever returning to this
 * public frontend repo. Canonical data/, pdf/, xlsx/, and their research docs
 * live only in the private bettersanfernando-data repo (see CLAUDE.md).
 *
 * Also inspects the CONTENT of every generated dataset registered in
 * src/data/generated/civic/manifest.json — the dataset list is derived from
 * the manifest itself, never a second hardcoded list — recursively rejecting
 * private/internal keys and values consistent with the data repository's own
 * validate-exports.js (source hashes, local/Windows paths, OCR diagnostics,
 * reviewer identities/notes, matching scores, internal candidate IDs, and
 * reconciliation metadata).
 *
 * Checks currently tracked files by default, or staged files with --staged.
 *
 * Usage:
 *   pnpm check:public-data-boundary
 *   node scripts/check-no-private-data.mjs --staged
 */

import { execFileSync } from 'child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BANNED_PREFIXES = [/^data\//, /^pdf\//, /^xlsx\//];

const BANNED_FILES = new Set([
  'docs/data-audit.md',
  'docs/data-sources.md',
  'docs/project-targeted-research.md',
  'docs/bid-results-analysis.md',
  'docs/financial-transparency-analysis.md',
  'docs/social-media-verification.md',
  'docs/data-foundation-v0.1-freeze-readiness.md',
  'docs/roadmap.md',
]);

export function findViolations(paths) {
  return paths.filter(path => {
    const comparisonPath = path.replaceAll('\\', '/').toLowerCase();
    return (
      BANNED_PREFIXES.some(re => re.test(comparisonPath)) ||
      BANNED_FILES.has(comparisonPath)
    );
  });
}

/**
 * Exact key names only — never a substring/regex match — so a legitimate
 * public field is never caught by an internal-sounding neighbor (e.g. the
 * real, allowlisted `reconciliation_status` and `verification_confidence`
 * fields must never trip on the banned bare `reconciliation` or
 * `confidence` keys below). Each key here is confirmed absent from every
 * one of the 22 currently exported datasets.
 */
export const PROHIBITED_CONTENT_KEYS = new Set([
  // Source hashes / checksums of PRIVATE source documents (the manifest's
  // own per-dataset `sha256` — a checksum of the PUBLIC exported file used
  // by the sync pipeline — is a different, legitimate concept and is never
  // scanned here; only the 22 dataset files themselves are scanned).
  'source_sha256',
  'sha256',
  'hash',
  // Local/internal file paths and file-system diagnostics.
  'local_path',
  'local_pdf_path',
  'local_xlsx_path',
  'source_file_path',
  'byte_size',
  'file_size_bytes',
  // OCR diagnostics.
  'ocr_tool',
  'ocr_date',
  // Reviewer identities and private review/research notes.
  'reviewer',
  'reviewer_id',
  'reviewer_name',
  'review_notes',
  'research_notes',
  'private_note',
  'inventory_disposition',
  // Matching scores / internal match diagnostics.
  'match_method',
  'match_confidence',
  'matching_score',
  'matching_evidence',
  'confidence',
  // Internal candidate identifiers.
  'candidate_id',
  'candidate_group_id',
  'candidate_canonical_project_ids',
  // Reconciliation metadata (distinct from the public `reconciliation_status`).
  'reconciliation',
  'reconciliation_id',
  'fee_reconciliation_status',
]);

const PROHIBITED_VALUE_PATTERNS = [
  { pattern: /[A-Za-z]:\\/, description: 'a Windows filesystem path' },
  { pattern: /\/home\/|\/Users\//, description: 'a local Unix filesystem path' },
  { pattern: /\bnta-candidate-\d/i, description: 'an internal candidate-group identifier' },
];

/**
 * Recursively inspects a parsed dataset (object/array/primitive) for
 * prohibited keys or values, returning violation strings scoped to the
 * given dataset's relative path.
 */
export function findContentViolations(datasetRelPath, value, jsonPath = '') {
  const violations = [];

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      violations.push(
        ...findContentViolations(datasetRelPath, item, `${jsonPath}[${index}]`)
      );
    });
    return violations;
  }

  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      const fieldPath = jsonPath ? `${jsonPath}.${key}` : key;
      if (PROHIBITED_CONTENT_KEYS.has(key)) {
        violations.push(`${datasetRelPath}:${fieldPath} (prohibited key "${key}")`);
      }
      violations.push(
        ...findContentViolations(datasetRelPath, value[key], fieldPath)
      );
    }
    return violations;
  }

  if (typeof value === 'string') {
    for (const { pattern, description } of PROHIBITED_VALUE_PATTERNS) {
      if (pattern.test(value)) {
        violations.push(`${datasetRelPath}:${jsonPath} (${description})`);
      }
    }
  }

  return violations;
}

/**
 * Reads the generated manifest and returns { relPath -> parsed dataset }
 * for every dataset it registers — the manifest is the single source of
 * truth for which files exist, never a second hardcoded list.
 */
export function readGeneratedDatasets(civicDir) {
  const manifest = JSON.parse(
    readFileSync(resolve(civicDir, 'manifest.json'), 'utf8')
  );
  const datasets = {};
  for (const relPath of Object.keys(manifest.datasets ?? {})) {
    datasets[relPath] = JSON.parse(
      readFileSync(resolve(civicDir, relPath), 'utf8')
    );
  }
  return datasets;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const staged = process.argv.includes('--staged');
  const gitArgs = staged
    ? ['diff', '--cached', '--name-only', '--diff-filter=ACMR']
    : ['ls-files'];

  const output = execFileSync('git', gitArgs, { encoding: 'utf8' });
  const paths = output.split('\n').filter(Boolean);
  const violations = findViolations(paths);

  const civicDir = fileURLToPath(
    new URL('../src/data/generated/civic/', import.meta.url)
  );
  const datasets = readGeneratedDatasets(civicDir);
  let datasetCount = 0;
  for (const [relPath, data] of Object.entries(datasets)) {
    datasetCount += 1;
    violations.push(
      ...findContentViolations(`src/data/generated/civic/${relPath}`, data)
    );
  }

  if (violations.length > 0) {
    console.error(
      '[check-no-private-data] FAILED: canonical/raw private-repo paths or prohibited content found in the public frontend repo:'
    );
    for (const v of violations) console.error(`  - ${v}`);
    console.error(
      '\nThese belong only in the private bettersanfernando-data repo. See CLAUDE.md.'
    );
    process.exit(1);
  }

  console.log(
    `[check-no-private-data] OK: checked ${paths.length} path(s) and ${datasetCount} generated dataset(s), no violations.`
  );
}
