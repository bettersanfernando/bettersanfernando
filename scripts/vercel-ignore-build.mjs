#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const NON_RUNTIME_ROOT_FILES = new Set([
  'AGENTS.md',
  'CHANGELOG.md',
  'CLAUDE.md',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'PROVENANCE.md',
  'README.md',
  'SECURITY.md',
]);

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' });
}

function isCommit(commit) {
  try {
    git('rev-parse', '--verify', `${commit}^{commit}`);
    return true;
  } catch {
    return false;
  }
}

function isNonRuntimePath(path) {
  return path.startsWith('docs/') || NON_RUNTIME_ROOT_FILES.has(path);
}

export function shouldSkipBuild({
  previousSha = process.env.VERCEL_GIT_PREVIOUS_SHA,
  currentSha = process.env.VERCEL_GIT_COMMIT_SHA,
} = {}) {
  if (!previousSha || !isCommit(previousSha)) {
    return false;
  }

  const current = currentSha || git('rev-parse', 'HEAD').trim();
  if (!isCommit(current)) {
    return false;
  }

  try {
    const changedPaths = git(
      'diff',
      '--name-only',
      '-z',
      '--no-renames',
      previousSha,
      current
    )
      .split('\0')
      .filter(Boolean);

    return changedPaths.length > 0 && changedPaths.every(isNonRuntimePath);
  } catch {
    return false;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const skip = shouldSkipBuild();
  console.log(
    skip
      ? 'Skipping build: only documentation or repository metadata changed.'
      : 'Running build: changed files may affect the deployed application.'
  );
  process.exit(skip ? 0 : 1);
}
