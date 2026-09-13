#!/usr/bin/env -S node --experimental-strip-types
// Batch 2 focused coverage for the Next.js App Router shell. Narrow by
// design — full smoke-test adaptation is Batch 7's job. This only checks
// what's new in this batch: the root layout's composition, that the Next
// navigation port uses Next APIs (not react-router), and that it still
// consumes the one shared navigation.ts source (already exhaustively
// verified by smoke-navigation.ts, so not re-checked here).
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const layoutSource = readFileSync('src/app/layout.page.tsx', 'utf8');
const providersSource = readFileSync('src/app/providers.tsx', 'utf8');
const i18nNextSource = readFileSync('src/i18n.next.ts', 'utf8');
const navbarNextSource = readFileSync(
  'src/components/layout/Navbar.next.tsx',
  'utf8'
);
const footerNextSource = readFileSync(
  'src/components/layout/Footer.next.tsx',
  'utf8'
);
const scrollToTopNextSource = readFileSync(
  'src/components/ui/ScrollToTop.next.tsx',
  'utf8'
);

// Root layout stays a Server Component: no 'use client' directive, and the
// client boundary is pushed down into Providers instead.
assert.ok(
  !/^\s*['"]use client['"]/m.test(layoutSource),
  'src/app/layout.page.tsx must not be a Client Component'
);
assert.match(
  providersSource,
  /^\s*['"]use client['"]/m,
  'src/app/providers.tsx must be the Client Component boundary'
);

// The root layout renders the same globally-present shell components as
// src/App.tsx, in the same order: Navbar, ScrollToTop, {children}, Footer.
assert.match(
  layoutSource,
  /<Navbar\s*\/>[\s\S]*<ScrollToTop\s*\/>[\s\S]*\{children\}[\s\S]*<Footer\s*\/>/,
  'root layout must render Navbar, then ScrollToTop, then children, then Footer, in that order'
);
assert.match(
  layoutSource,
  /from '\.\.\/components\/layout\/Navbar\.next'/,
  'root layout must use the Next-ported Navbar'
);
assert.match(
  layoutSource,
  /from '\.\.\/components\/layout\/Footer\.next'/,
  'root layout must use the Next-ported Footer'
);
assert.match(
  layoutSource,
  /from '\.\.\/components\/ui\/ScrollToTop\.next'/,
  'root layout must use the Next-ported ScrollToTop'
);

// Next-facing shell components must use next/link + next/navigation, never
// react-router (that stays exclusive to the legacy Vite build).
for (const [name, source] of [
  ['Navbar.next.tsx', navbarNextSource],
  ['Footer.next.tsx', footerNextSource],
  ['ScrollToTop.next.tsx', scrollToTopNextSource],
] as const) {
  assert.ok(
    !/from ['"]react-router['"]/.test(source),
    `${name} must not import react-router`
  );
}
assert.match(
  navbarNextSource,
  /from 'next\/link'/,
  'Navbar.next.tsx must use next/link'
);
assert.match(
  navbarNextSource,
  /from 'next\/navigation'/,
  'Navbar.next.tsx must use next/navigation'
);
assert.match(
  footerNextSource,
  /from 'next\/link'/,
  'Footer.next.tsx must use next/link'
);
assert.match(
  scrollToTopNextSource,
  /from 'next\/navigation'/,
  'ScrollToTop.next.tsx must use next/navigation'
);

// Both the Vite and Next navbars render from the same navigation.ts source
// — no independent/duplicated navigation configuration.
for (const [name, source] of [
  ['Navbar.tsx', readFileSync('src/components/layout/Navbar.tsx', 'utf8')],
  ['Navbar.next.tsx', navbarNextSource],
] as const) {
  assert.match(
    source,
    /from '\.\.\/\.\.\/data\/navigation'/,
    `${name} must import navigation data from ../../data/navigation`
  );
}

// Ordinary components must not spread the temporary .page.tsx workaround —
// only the two Next special-file conventions may use it.
const appDir = 'src/app';
const appFiles = readdirSync(appDir);
const pageExtensionFiles = appFiles.filter(file => file.endsWith('.page.tsx'));
assert.deepEqual(
  pageExtensionFiles.sort(),
  ['layout.page.tsx', 'page.page.tsx'],
  'only the Next.js layout/page convention files may use the temporary .page.tsx workaround (see next.config.ts pageExtensions)'
);

// Next's i18n bootstrap must supply real, non-empty English resources
// synchronously (server render + first client render before hydration),
// never an HttpBackend-only fetch or an empty stub — that's what hung
// `next build`'s prerender before this fix and what produced raw i18n
// keys in the server-rendered HTML.
const englishCommonLocale = JSON.parse(
  readFileSync('public/locales/en/common.json', 'utf8')
) as Record<string, unknown>;
assert.ok(
  typeof englishCommonLocale.site_name === 'string' &&
    englishCommonLocale.site_name.length > 0,
  'public/locales/en/common.json must contain real, non-empty translations'
);
assert.match(
  i18nNextSource,
  /import enCommon from '\.\.\/public\/locales\/en\/common\.json'/,
  'src/i18n.next.ts must import the real public/locales/en/common.json file, not duplicate its text'
);
assert.match(
  i18nNextSource,
  /resources:\s*\{\s*en:\s*\{\s*common:\s*enCommon\s*\}\s*\}/,
  'src/i18n.next.ts must initialize with the real imported English resource bundle'
);
assert.ok(
  !/resources:\s*\{\s*en:\s*\{\s*common:\s*\{\s*\}\s*\}\s*\}/.test(
    i18nNextSource
  ),
  'src/i18n.next.ts must not initialize with an empty English resource bundle'
);
assert.match(
  i18nNextSource,
  /^\s*lng: 'en',/m,
  'src/i18n.next.ts must set an unconditional initial language of "en" — identical on the server and the first client render, before any browser-only detection can run'
);
assert.ok(
  !/^\s*import .* from ['"]i18next-browser-languagedetector['"]/m.test(
    i18nNextSource
  ),
  'src/i18n.next.ts must not import i18next-browser-languagedetector — attaching it would resolve navigator/localStorage synchronously during init, making the first client render disagree with the always-English server render'
);

// Browser-only language detection/persistence must be deferred to a
// post-mount effect in the client provider, never module-eval time.
assert.match(
  providersSource,
  /useEffect\(\(\) => \{[\s\S]*detectSupportedLanguage\(\)/,
  'language detection must run inside a useEffect in providers.tsx, so it only ever runs after hydration'
);
assert.match(
  providersSource,
  /navigator\.language/,
  "providers.tsx must still detect the user's browser language after hydration"
);

// suppressHydrationWarning must never be used to paper over a mismatch.
for (const [name, source] of [
  ['src/app/layout.page.tsx', layoutSource],
  ['src/app/providers.tsx', providersSource],
  ['src/i18n.next.ts', i18nNextSource],
] as const) {
  assert.ok(
    !/suppressHydrationWarning/.test(source),
    `${name} must not use suppressHydrationWarning`
  );
}

// 0 planned routes remains true (already the authoritative check in
// smoke-navigation.ts; re-asserted here since this shell now renders it).
assert.equal(
  plannedPages.length,
  0,
  'the shared shell must reflect 0 planned routes'
);
assert.equal(mainNavigation.length, 7, 'expected 7 top-level entries');

console.log(
  `Next shell smoke passed: layout stays a Server Component, ${mainNavigation.length} top-level entries wired through Navbar.next.tsx via next/link + next/navigation, i18n bootstraps with real bundled English resources (no suppressHydrationWarning), 0 planned routes.`
);
