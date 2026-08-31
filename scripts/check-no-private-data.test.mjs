import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { findViolations } from './check-no-private-data.mjs';

test('allows the public frontend data layer', () => {
  const paths = ['src/data/generated/civic/projects/city-projects.json'];
  assert.deepEqual(findViolations(paths), []);
});

test('rejects private-repo paths regardless of case or slash direction', () => {
  const paths = [
    'data/test.json',
    'Data/test.json',
    'DATA/test.json',
    'pdf/test.pdf',
    'PDF/test.pdf',
    'xlsx/test.xlsx',
    'XLSX/test.xlsx',
    'DoCs/DaTa-AuDiT.Md',
    'DATA\\windows-path.json',
  ];
  assert.deepEqual(findViolations(paths), paths);
});

test('pre-commit stops when the boundary guard cannot run', () => {
  const directory = mkdtempSync(join(tmpdir(), 'public-boundary-hook-'));
  const marker = join(directory, 'lint-staged-ran');

  try {
    writeFileSync(join(directory, 'node'), '#!/bin/sh\nexit 1\n', {
      mode: 0o755,
    });
    writeFileSync(
      join(directory, 'npx'),
      `#!/bin/sh\nprintf ran > "${marker.replaceAll('\\', '/')}"\n`,
      { mode: 0o755 }
    );

    const hook = readFileSync(
      new URL('../.husky/pre-commit', import.meta.url),
      'utf8'
    );
    const hookPath = join(directory, 'pre-commit');
    writeFileSync(hookPath, hook, { mode: 0o755 });

    const gitExecPath = spawnSync('git', ['--exec-path'], {
      encoding: 'utf8',
    }).stdout.trim();
    const shell =
      process.platform === 'win32'
        ? resolve(gitExecPath, '../../../bin/sh.exe')
        : 'sh';
    const result = spawnSync(shell, [hookPath], {
      env: {
        ...process.env,
        PATH: `${directory}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}`,
      },
    });

    assert.equal(result.status, 1, result.stderr?.toString());
    assert.throws(() => readFileSync(marker));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
