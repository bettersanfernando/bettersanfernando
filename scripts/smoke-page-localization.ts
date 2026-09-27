#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Page localization: every t('English text') key used by a localized page (or
// its client components) must have a Filipino entry (or be a deliberate
// keep-as-is term), each Filipino entry must still be used, keys sit in the
// narrowest bundle that covers their users, and placeholders must match.
// Pages use the English text as the key (see getPageT in src/i18n/server.ts).

const STATISTICS = 'src/app/statistics/';
const PAGES: Record<string, string[]> = {
  about: ['src/app/about/page.tsx'],
  accessibility: ['src/app/accessibility/page.tsx'],
  sitemap: ['src/app/sitemap/page.tsx'],
  'not-found': ['src/app/not-found.tsx'],
  government: ['src/app/government/page.tsx'],
  'government-contact': ['src/app/government/contact/page.tsx'],
  projects: ['src/app/projects/page.tsx'],
  statistics: [`${STATISTICS}page.tsx`],
  transparency: ['src/app/transparency/page.tsx'],
  legislation: ['src/app/legislation/page.tsx'],
  home: ['src/app/page.tsx'],
  'statistics-projects': [
    `${STATISTICS}projects/page.tsx`,
    `${STATISTICS}enum-labels.ts`,
  ],
  'statistics-procurement': [
    `${STATISTICS}procurement/page.tsx`,
    `${STATISTICS}enum-labels.ts`,
  ],
  'statistics-project-spending': [
    `${STATISTICS}project-spending/page.tsx`,
    `${STATISTICS}project-spending/ProjectSpendingStatistics.tsx`,
  ],
  'statistics-population': [
    `${STATISTICS}population/page.tsx`,
    `${STATISTICS}population/BarangayTable.tsx`,
  ],
  'statistics-demographics': [
    `${STATISTICS}demographics/page.tsx`,
    `${STATISTICS}demographics/HouseholdBarangayTable.tsx`,
  ],
  'statistics-government': [`${STATISTICS}government/page.tsx`],
  'statistics-legislation': [`${STATISTICS}legislation/page.tsx`],
  'statistics-public-records': [
    `${STATISTICS}public-records/page.tsx`,
    `${STATISTICS}public-records/PublicRecordsStatistics.tsx`,
  ],
  'statistics-city-profile': [`${STATISTICS}city-profile/page.tsx`],
};

// Terms that intentionally read the same in Filipino: 'Home' is localized by
// Breadcrumbs itself; the rest are the brand, standard or source names.
const KEPT_IN_ENGLISH = new Set([
  'Home',
  'WCAG 2.1 Level AA',
  'BetterSanFernando',
  '2024 POPCEN',
  // Homepage evidence-chain step label; awaiting a reviewed Filipino term.
  'Anchor',
]);

const readJson = (path: string) =>
  JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>;

// The string literal(s) a t() first argument can render: a literal or the two
// branches of a conditional (used for singular/plural wording).
function literals(node: ts.Expression): string[] | null {
  if (ts.isStringLiteralLike(node)) return [node.text];
  if (ts.isParenthesizedExpression(node)) return literals(node.expression);
  if (ts.isConditionalExpression(node)) {
    const whenTrue = literals(node.whenTrue);
    const whenFalse = literals(node.whenFalse);
    return whenTrue && whenFalse ? [...whenTrue, ...whenFalse] : null;
  }
  return null;
}

function collectKeys(file: string, keys: Set<string>) {
  const source = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 't' &&
      node.arguments.length > 0
    ) {
      const found = literals(node.arguments[0]);
      assert.ok(
        found,
        `${file}: t() must take string literals, got ${node.arguments[0].getText()}`
      );
      found.forEach(key => keys.add(key));
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

const placeholders = (text: string) =>
  (text.match(/\{\{\w+\}\}/g) ?? []).sort().join();

const shared = readJson('public/locales/fil/shared.json');
const statisticsShared = readJson('public/locales/fil/statistics-shared.json');
const isStatistics = (namespace: string) => namespace.startsWith('statistics-');

const used = new Map<string, Set<string>>();
const namespacesByKey = new Map<string, string[]>();
for (const [namespace, files] of Object.entries(PAGES)) {
  const keys = new Set<string>();
  files.forEach(file => collectKeys(file, keys));
  used.set(namespace, keys);
  keys.forEach(key =>
    namespacesByKey.set(key, [...(namespacesByKey.get(key) ?? []), namespace])
  );
}

for (const [namespace, keys] of used) {
  const bundle = readJson(`public/locales/fil/${namespace}.json`);
  for (const key of keys) {
    if (KEPT_IN_ENGLISH.has(key)) continue;
    const translation =
      bundle[key] ??
      (isStatistics(namespace) ? statisticsShared[key] : undefined) ??
      shared[key];
    assert.ok(translation, `${namespace}: missing Filipino text for "${key}"`);
    assert.equal(
      placeholders(translation),
      placeholders(key),
      `${namespace}: placeholders differ for "${key}"`
    );
  }
  for (const key of Object.keys(bundle)) {
    assert.ok(keys.has(key), `${namespace}.json has unused key "${key}"`);
    assert.ok(
      !(key in shared) && !(key in statisticsShared),
      `"${key}" is in both ${namespace}.json and a shared bundle`
    );
  }
}
for (const key of Object.keys(shared)) {
  assert.ok(
    (namespacesByKey.get(key)?.length ?? 0) > 1,
    `shared.json key "${key}" must be used by more than one page`
  );
}
for (const key of Object.keys(statisticsShared)) {
  const users = namespacesByKey.get(key) ?? [];
  assert.ok(
    users.length > 1 && users.every(isStatistics),
    `statistics-shared.json key "${key}" must be used by several statistics pages only`
  );
}

// Wording that matches a navigation label must reuse that navigation wording.
const en = JSON.parse(readFileSync('public/locales/en/common.json', 'utf8'));
const fil = JSON.parse(readFileSync('public/locales/fil/common.json', 'utf8'));
const pageText: Record<string, string> = { ...shared, ...statisticsShared };
for (const namespace of used.keys()) {
  Object.assign(pageText, readJson(`public/locales/fil/${namespace}.json`));
}
for (const group of ['items', 'sections'] as const) {
  for (const [id, english] of Object.entries<string>(en.navigation[group])) {
    const navigation = fil.navigation[group]?.[id];
    if (navigation && pageText[english]) {
      assert.equal(
        pageText[english],
        navigation,
        `"${english}" must match navigation.${group}.${id}`
      );
    }
  }
}

console.log(
  `Page localization smoke passed: ${used.size} pages, ${namespacesByKey.size} keys.`
);
