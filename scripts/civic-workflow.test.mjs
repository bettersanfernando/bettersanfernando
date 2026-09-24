import assert from 'node:assert/strict';
import test from 'node:test';
import {
  runStages,
  sourceArgument,
  syncAndVerify,
  validSource,
  VERIFY_STAGES,
} from './civic-workflow.mjs';

test('keeps every required civic verification stage in order', () => {
  assert.deepEqual(
    VERIFY_STAGES.map(([name]) => name),
    [
      'validate civic data',
      'smoke civic data',
      'check public data boundary',
      'test public data boundary',
      'smoke search',
      'smoke navigation',
      'build public app',
      'check diff whitespace',
    ]
  );
});

test('runs civic verification stages in order', () => {
  const seen = [];
  assert.equal(
    runStages(['validate', 'build'], stage => (seen.push(stage), 0)),
    0
  );
  assert.deepEqual(seen, ['validate', 'build']);
});

test('stops verification on the first failure', () => {
  const seen = [];
  assert.equal(
    runStages(
      ['validate', 'build'],
      stage => (seen.push(stage), stage === 'validate' ? 9 : 0)
    ),
    9
  );
  assert.deepEqual(seen, ['validate']);
});

test('requires and parses --source', () => {
  assert.equal(sourceArgument(['--source=C:/data']), 'C:/data');
  assert.equal(sourceArgument(['--source', 'C:/data']), 'C:/data');
  assert.equal(sourceArgument([]), null);
  assert.equal(validSource('C:/definitely-not-a-private-worktree'), false);
});

test('sync failure prevents verification', () => {
  const seen = [];
  assert.equal(
    syncAndVerify('C:/data', {
      sync: source => (seen.push(`sync:${source}`), 4),
      verify: () => (seen.push('verify'), 0),
    }),
    4
  );
  assert.deepEqual(seen, ['sync:C:/data']);
});

test('successful sync proceeds into verification', () => {
  const seen = [];
  assert.equal(
    syncAndVerify('C:/data', {
      sync: source => (seen.push(`sync:${source}`), 0),
      verify: () => (seen.push('verify'), 0),
    }),
    0
  );
  assert.deepEqual(seen, ['sync:C:/data', 'verify']);
});
