#!/usr/bin/env node
import { existsSync } from 'fs';
import { resolve, join } from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const VERIFY_STAGES = [
  ['validate civic data', ['data:validate']],
  ['smoke civic data', ['data:smoke']],
  ['check public data boundary', ['check:public-data-boundary']],
  ['test public data boundary', ['test:public-data-boundary']],
  ['smoke search', ['search:smoke']],
  ['smoke navigation', ['nav:smoke']],
  ['build public app', ['build']],
  ['check diff whitespace', ['exec', 'git', 'diff', '--check']],
];

export function runStages(stages, run) {
  for (const stage of stages) {
    const code = run(stage);
    if (code) return code;
  }
  return 0;
}

export function sourceArgument(args) {
  const inline = args.find(arg => arg.startsWith('--source='));
  if (inline) return inline.slice('--source='.length);
  const index = args.indexOf('--source');
  return index === -1 ? null : args[index + 1] ?? null;
}

export function validSource(source) {
  return Boolean(source && existsSync(source) && existsSync(join(source, 'exports', 'v0.1.0', 'manifest.json')));
}

function runPnpm(stage, args) {
  console.log(`\n[civic-workflow] ${stage}`);
  const pnpmEntrypoint = process.env.npm_execpath;
  if (!pnpmEntrypoint) {
    console.error('[civic-workflow] Run this command through pnpm so its executable path is available.');
    return 2;
  }
  const result = spawnSync(process.execPath, [pnpmEntrypoint, ...args], { cwd: ROOT, stdio: 'inherit' });
  if (result.error) {
    console.error(`[civic-workflow] ${stage} failed: ${result.error.message}`);
    return 1;
  }
  if (result.signal) {
    console.error(`[civic-workflow] ${stage} terminated by ${result.signal}.`);
    return 1;
  }
  if (result.status) console.error(`[civic-workflow] ${stage} failed with exit code ${result.status}.`);
  return result.status || 0;
}

function verify() {
  const status = runStages(VERIFY_STAGES, ([name, args]) => runPnpm(name, args));
  if (!status) console.log('\n[civic-workflow] PASS: civic verification completed.');
  return status;
}

export function syncAndVerify(source, { sync, verify: verifyWorkflow }) {
  const syncStatus = sync(source);
  return syncStatus ? syncStatus : verifyWorkflow();
}

function syncVerify(source) {
  if (!source) {
    console.error('[civic-workflow] --source is required.');
    return 2;
  }
  const sourcePath = resolve(source);
  if (!validSource(sourcePath)) {
    console.error('[civic-workflow] --source must name a private repository/worktree containing exports/v0.1.0/manifest.json.');
    return 2;
  }
  console.log(`[civic-workflow] Source: ${sourcePath}`);
  return syncAndVerify(sourcePath, {
    sync: value => runPnpm('sync sanctioned civic data', ['data:sync', '--', `--source=${value}`]),
    verify,
  });
}

const command = process.argv[2];
if (command === 'verify') process.exit(verify());
if (command === 'sync-verify') process.exit(syncVerify(sourceArgument(process.argv.slice(3))));
if (command) {
  console.error('Usage: node scripts/civic-workflow.mjs <verify|sync-verify> [--source=<private repo/worktree>]');
  process.exit(2);
}
