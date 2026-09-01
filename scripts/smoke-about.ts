import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const appSource = readFileSync('src/App.tsx', 'utf8');
const pageSource = readFileSync('src/pages/About.tsx', 'utf8');

assert.match(appSource, /path="\/about" element={<About \/>}/);
assert.ok(!plannedPages.some(page => page.path === '/about'));
assert.equal(mainNavigation.length, 7);
assert.equal(mainNavigation.find(item => item.id === 'about')?.href, '/about');

assert.match(pageSource, /About BetterSanFernando/);
assert.match(pageSource, /City of San Fernando, Pampanga/);
assert.match(pageSource, /not an official City Government website/i);
assert.match(
  pageSource,
  /not affiliated with or endorsed by the City Government/i
);
assert.match(pageSource, /FACT[\s\S]*SOURCE[\s\S]*OFFICIAL LINK/i);
assert.match(pageSource, /does not mean[^.]+does not exist/i);

for (const href of ['/transparency/sources', '/transparency/methodology']) {
  assert.match(pageSource, new RegExp(`to=["']${href}["']`));
}

assert.doesNotMatch(
  pageSource,
  /(?:official partner|officially affiliated|endorsed civic portal|City Government project)/i
);
assert.doesNotMatch(
  pageSource,
  /(?:provides|offers|includes|covers) (?:complete|comprehensive) coverage|covers all City records|includes every City dataset/i
);
assert.match(pageSource, /not every City\s+dataset or government record/i);
assert.doesNotMatch(
  pageSource,
  /(?:private repo|source hash|recovery queue|extraction QA|finance research|research backlog)/i
);

console.log('[smoke-about] OK');
