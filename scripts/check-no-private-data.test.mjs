import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import {
  findViolations,
  findContentViolations,
  readGeneratedDatasets,
} from './check-no-private-data.mjs';

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

test('allows ordinary public dataset content', () => {
  const dataset = {
    records: [
      { id: 'x-1', title: 'Public record', reconciliation_status: 'reconciled_to_source_total' },
    ],
    record_count: 1,
  };
  assert.deepEqual(findContentViolations('dataset.json', dataset), []);
});

test('preserves legitimate public words that resemble prohibited ones', () => {
  const dataset = {
    verification_confidence: 'high',
    confidence_interval_lower: 1,
    confidence_interval_upper: 2,
    reconciliation_status: 'reconciled_to_source_total',
    publication_status: 'PUBLICATION_REVIEW_COMPLETE',
    verified_at: '2026-01-01',
  };
  assert.deepEqual(findContentViolations('dataset.json', dataset), []);
});

test('rejects an injected source hash key', () => {
  const dataset = { evidence: [{ id: 'e-1', source_sha256: 'deadbeef' }] };
  const violations = findContentViolations('dataset.json', dataset);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /source_sha256/);
});

test('rejects an injected reviewer identity key', () => {
  const dataset = { records: [{ id: 'r-1', reviewer: 'Jane Doe' }] };
  const violations = findContentViolations('dataset.json', dataset);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /reviewer/);
});

test('rejects an injected matching-score key', () => {
  const dataset = { matches: [{ candidate_id: 'c-1', match_confidence: 0.92 }] };
  const violations = findContentViolations('dataset.json', dataset);
  assert.equal(violations.length, 2);
  assert.ok(violations.some(v => v.includes('candidate_id')));
  assert.ok(violations.some(v => v.includes('match_confidence')));
});

test('rejects an injected internal reconciliation key without flagging reconciliation_status', () => {
  const dataset = {
    reconciliation: { open_items: 2 },
    reconciliation_status: 'reconciled_to_source_total',
  };
  const violations = findContentViolations('dataset.json', dataset);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /^dataset\.json:reconciliation \(/);
});

test('rejects a Windows local filesystem path value', () => {
  const dataset = { file: { path: 'C:\\Users\\reviewer\\source.pdf' } };
  const violations = findContentViolations('dataset.json', dataset);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /Windows filesystem path/);
});

test('rejects an internal NTA candidate-group identifier value', () => {
  const dataset = { note: 'grouped under nta-candidate-42' };
  const violations = findContentViolations('dataset.json', dataset);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /candidate-group identifier/);
});

test('reads the dataset list from the generated manifest, not a hardcoded list', () => {
  const civicDir = mkdtempSync(join(tmpdir(), 'public-boundary-manifest-'));
  try {
    writeFileSync(
      join(civicDir, 'manifest.json'),
      JSON.stringify({
        datasets: {
          'projects/city-projects.json': { record_count: 1 },
        },
      })
    );
    mkdirSync(join(civicDir, 'projects'), { recursive: true });
    writeFileSync(
      join(civicDir, 'projects/city-projects.json'),
      JSON.stringify({ projects: [{ id: 'p-1', reviewer: 'Jane Doe' }] })
    );

    const datasets = readGeneratedDatasets(civicDir);
    assert.deepEqual(Object.keys(datasets), ['projects/city-projects.json']);

    const violations = findContentViolations(
      'projects/city-projects.json',
      datasets['projects/city-projects.json']
    );
    assert.equal(violations.length, 1);
    assert.match(violations[0], /reviewer/);
  } finally {
    rmSync(civicDir, { recursive: true, force: true });
  }
});

test('the real 22 generated datasets currently pass the content scan', () => {
  const civicDir = fileURLToPath(
    new URL('../src/data/generated/civic/', import.meta.url)
  );
  const datasets = readGeneratedDatasets(civicDir);
  assert.equal(Object.keys(datasets).length, 22);
  for (const [relPath, data] of Object.entries(datasets)) {
    assert.deepEqual(findContentViolations(relPath, data), []);
  }
});
