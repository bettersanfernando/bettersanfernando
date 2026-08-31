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

const BANNED_PREFIXES = [/^data\//, /^pdf\//, /^xlsx\//];

const BANNED_FILES = new Set([
  'docs/DATA-AUDIT.md',
  'docs/DATA-SOURCES.md',
  'docs/PROJECT-TARGETED-RESEARCH.md',
  'docs/BID-RESULTS-ANALYSIS.md',
  'docs/FINANCIAL-TRANSPARENCY-ANALYSIS.md',
  'docs/SOCIAL-MEDIA-VERIFICATION.md',
  'docs/DATA-FOUNDATION-V0.1-FREEZE-READINESS.md',
  'docs/ROADMAP.md',
]);

const staged = process.argv.includes('--staged');
const gitArgs = staged
  ? ['diff', '--cached', '--name-only', '--diff-filter=ACMR']
  : ['ls-files'];

const output = execFileSync('git', gitArgs, { encoding: 'utf8' });
const paths = output.split('\n').filter(Boolean);

const violations = paths.filter(
  p => BANNED_PREFIXES.some(re => re.test(p)) || BANNED_FILES.has(p)
);

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

console.log(`[check-no-private-data] OK: checked ${paths.length} path(s), no violations.`);
