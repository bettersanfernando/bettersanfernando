import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(
  new URL('./vercel-ignore-build.mjs', import.meta.url)
);

function git(directory, ...args) {
  return execFileSync('git', args, { cwd: directory, encoding: 'utf8' }).trim();
}

function write(directory, path, contents = '') {
  const file = join(directory, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

function commit(directory, message) {
  git(directory, 'add', '--all');
  git(directory, 'commit', '-m', message);
  return git(directory, 'rev-parse', 'HEAD');
}

function run(directory, environment) {
  const {
    VERCEL_GIT_PREVIOUS_SHA: _previousSha,
    VERCEL_GIT_COMMIT_SHA: _currentSha,
    ...env
  } = process.env;

  return spawnSync(process.execPath, [script], {
    cwd: directory,
    env: { ...env, ...environment },
    encoding: 'utf8',
  });
}

function withRepository(callback) {
  const directory = mkdtempSync(join(tmpdir(), 'vercel-ignore-build-'));
  try {
    git(directory, 'init');
    git(directory, 'config', 'user.email', 'test@example.com');
    git(directory, 'config', 'user.name', 'Test User');
    return callback(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('skips only documentation and explicit root metadata across multiple commits', () => {
  withRepository(directory => {
    write(directory, 'README.md', '# BetterSanFernando');
    const base = commit(directory, 'initial docs');
    write(directory, 'docs/guide.md', '# Guide');
    commit(directory, 'add guide');
    write(directory, 'CONTRIBUTING.md', '# Contributing');
    const current = commit(directory, 'update contributing guide');

    const result = run(directory, {
      VERCEL_GIT_PREVIOUS_SHA: base,
      VERCEL_GIT_COMMIT_SHA: current,
    });
    assert.equal(result.status, 0, result.stderr);
  });
});

test('builds when an older commit changes runtime code and the newest only changes docs', () => {
  withRepository(directory => {
    write(directory, 'README.md', '# BetterSanFernando');
    const base = commit(directory, 'initial docs');
    write(directory, 'src/app/page.tsx', 'export default function Page() {}');
    commit(directory, 'add page');
    write(directory, 'docs/guide.md', '# Guide');
    const current = commit(directory, 'add guide after runtime change');

    const result = run(directory, {
      VERCEL_GIT_PREVIOUS_SHA: base,
      VERCEL_GIT_COMMIT_SHA: current,
    });
    assert.equal(result.status, 1, result.stderr);
  });
});

test('builds when the range includes a runtime-relevant path', async t => {
  const runtimePaths = [
    'public/locales/fil/x.json',
    'src/data/generated/civic/x.json',
    'pnpm-lock.yaml',
    'package.json',
    'next.config.ts',
    'scripts/x.mjs',
    '.github/workflows/ci.yml',
    'src/content.md',
    'unknown-file',
  ];

  for (const path of runtimePaths) {
    await t.test(path, () =>
      withRepository(directory => {
        write(directory, 'README.md', '# BetterSanFernando');
        const base = commit(directory, 'initial docs');
        write(directory, path, 'changed');
        const current = commit(directory, `change ${path}`);

        const result = run(directory, {
          VERCEL_GIT_PREVIOUS_SHA: base,
          VERCEL_GIT_COMMIT_SHA: current,
        });
        assert.equal(result.status, 1, result.stderr);
      })
    );
  }
});

test('builds when no previous deployment commit is available', () => {
  withRepository(directory => {
    write(directory, 'docs/guide.md', '# Guide');
    const current = commit(directory, 'add guide');

    const result = run(directory, { VERCEL_GIT_COMMIT_SHA: current });
    assert.equal(result.status, 1, result.stderr);
  });
});

test('uses HEAD only when VERCEL_GIT_COMMIT_SHA is unavailable', () => {
  withRepository(directory => {
    write(directory, 'README.md', '# BetterSanFernando');
    const base = commit(directory, 'initial readme');
    write(directory, 'docs/guide.md', '# Guide');
    commit(directory, 'add guide');

    const result = run(directory, { VERCEL_GIT_PREVIOUS_SHA: base });
    assert.equal(result.status, 0, result.stderr);
  });
});

test('builds for an invalid previous commit SHA', () => {
  withRepository(directory => {
    write(directory, 'docs/guide.md', '# Guide');
    const current = commit(directory, 'add guide');

    const result = run(directory, {
      VERCEL_GIT_PREVIOUS_SHA: 'not-a-commit',
      VERCEL_GIT_COMMIT_SHA: current,
    });
    assert.equal(result.status, 1, result.stderr);
  });
});

test('builds for an empty commit range', () => {
  withRepository(directory => {
    write(directory, 'docs/guide.md', '# Guide');
    const commitSha = commit(directory, 'add guide');

    const result = run(directory, {
      VERCEL_GIT_PREVIOUS_SHA: commitSha,
      VERCEL_GIT_COMMIT_SHA: commitSha,
    });
    assert.equal(result.status, 1, result.stderr);
  });
});

test('builds outside a Git repository', () => {
  const directory = mkdtempSync(join(tmpdir(), 'vercel-ignore-build-no-git-'));
  try {
    const result = run(directory, {
      VERCEL_GIT_PREVIOUS_SHA: 'not-a-commit',
      VERCEL_GIT_COMMIT_SHA: 'not-a-commit',
    });
    assert.equal(result.status, 1, result.stderr);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('builds when a runtime file is renamed into docs', () => {
  withRepository(directory => {
    write(directory, 'src/runtime.ts', 'export const runtime = true;');
    const base = commit(directory, 'add runtime');
    mkdirSync(join(directory, 'docs'));
    git(directory, 'mv', 'src/runtime.ts', 'docs/runtime.md');
    const current = commit(directory, 'rename runtime documentation');

    const result = run(directory, {
      VERCEL_GIT_PREVIOUS_SHA: base,
      VERCEL_GIT_COMMIT_SHA: current,
    });
    assert.equal(result.status, 1, result.stderr);
  });
});
