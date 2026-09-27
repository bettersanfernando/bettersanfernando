#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Batch 1A page localization: every t('English text') key used by a localized
// server page must have a Filipino entry (or be a deliberate keep-as-is
// term), each Filipino entry must still be used, and placeholders must match.
// Pages use the English text as the key (see getPageT in src/i18n/server.ts).

const PAGES = {
  about: 'src/app/about/page.tsx',
  accessibility: 'src/app/accessibility/page.tsx',
  sitemap: 'src/app/sitemap/page.tsx',
  'not-found': 'src/app/not-found.tsx',
  government: 'src/app/government/page.tsx',
  'government-contact': 'src/app/government/contact/page.tsx',
  projects: 'src/app/projects/page.tsx',
  statistics: 'src/app/statistics/page.tsx',
  transparency: 'src/app/transparency/page.tsx',
  legislation: 'src/app/legislation/page.tsx',
} as const;

// Terms that intentionally read the same in Filipino: 'Home' is localized by
// Breadcrumbs itself, and WCAG 2.1 Level AA is a standard identifier.
const KEPT_IN_ENGLISH = new Set(['Home', 'WCAG 2.1 Level AA']);

const readJson = (path: string) =>
  JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>;

function usedKeys(file: string): Set<string> {
  const source = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const keys = new Set<string>();
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 't' &&
      node.arguments.length > 0
    ) {
      const [first] = node.arguments;
      assert.ok(
        ts.isStringLiteralLike(first),
        `${file}: t() must take a string literal, got ${first.getText()}`
      );
      keys.add(first.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return keys;
}

const placeholders = (text: string) =>
  (text.match(/\{\{\w+\}\}/g) ?? []).sort().join();

const shared = readJson('public/locales/fil/shared.json');
const allKeys = new Set<string>();
const usedNamespacesByKey = new Map<string, number>();

for (const [namespace, file] of Object.entries(PAGES)) {
  const bundle = readJson(`public/locales/fil/${namespace}.json`);
  const used = usedKeys(file);
  for (const key of used) {
    allKeys.add(key);
    usedNamespacesByKey.set(key, (usedNamespacesByKey.get(key) ?? 0) + 1);
    if (KEPT_IN_ENGLISH.has(key)) continue;
    const translation = bundle[key] ?? shared[key];
    assert.ok(translation, `${file}: missing Filipino text for "${key}"`);
    assert.equal(
      placeholders(translation),
      placeholders(key),
      `${namespace}: placeholders differ for "${key}"`
    );
  }
  for (const key of Object.keys(bundle)) {
    assert.ok(used.has(key), `${namespace}.json has unused key "${key}"`);
    assert.ok(
      !(key in shared),
      `"${key}" is in both ${namespace}.json and shared.json`
    );
  }
}
for (const key of Object.keys(shared)) {
  assert.ok(
    (usedNamespacesByKey.get(key) ?? 0) > 1,
    `shared.json key "${key}" must be used by more than one page`
  );
}

// Wording that matches a navigation label must reuse that navigation wording.
const en = JSON.parse(readFileSync('public/locales/en/common.json', 'utf8'));
const fil = JSON.parse(readFileSync('public/locales/fil/common.json', 'utf8'));
const pageText: Record<string, string> = { ...shared };
for (const namespace of Object.keys(PAGES)) {
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
  `Page localization smoke passed: ${Object.keys(PAGES).length} pages, ${allKeys.size} keys.`
);
