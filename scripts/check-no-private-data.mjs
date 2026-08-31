#!/usr/bin/env node
/**
 * Guards against root-level canonical/raw civic data ever returning to this
 * public frontend repo. Canonical data/, pdf/, xlsx/, and their research docs
 * live only in the private bettersanfernando-data repo (see CLAUDE.md).
 *
 * Checks currently tracked files by default, or staged files with --staged.
 *
 * Usage:
 *   pnpm check:public-data-boundary
 *   node scripts/check-no-private-data.mjs --staged
 */

import { execFileSync } from 'child_process';
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

  if (violations.length > 0) {
    console.error(
      '[check-no-private-data] FAILED: canonical/raw private-repo paths found in the public frontend repo:'
    );
    for (const v of violations) console.error(`  - ${v}`);
    console.error(
      '\nThese belong only in the private bettersanfernando-data repo. See CLAUDE.md.'
    );
    process.exit(1);
  }

  console.log(
    `[check-no-private-data] OK: checked ${paths.length} path(s), no violations.`
  );
}
