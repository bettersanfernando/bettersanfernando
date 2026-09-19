#!/usr/bin/env -S node --experimental-strip-types
// Coverage for the Next.js App Router shell: the root layout's composition,
// that navigation uses Next APIs, and that i18n bootstraps correctly for
// server render + first client hydration.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const layoutSource = readFileSync('src/app/layout.tsx', 'utf8');
const providersSource = readFileSync('src/app/providers.tsx', 'utf8');
const i18nSource = readFileSync('src/i18n.ts', 'utf8');
const navbarSource = readFileSync('src/components/layout/Navbar.tsx', 'utf8');
const footerSource = readFileSync('src/components/layout/Footer.tsx', 'utf8');
const scrollToTopSource = readFileSync(
  'src/components/ui/ScrollToTop.tsx',
  'utf8'
);

// Root layout stays a Server Component: no 'use client' directive, and the
// client boundary is pushed down into Providers instead.
assert.ok(
  !/^\s*['"]use client['"]/m.test(layoutSource),
  'src/app/layout.tsx must not be a Client Component'
);
assert.match(
  providersSource,
  /^\s*['"]use client['"]/m,
  'src/app/providers.tsx must be the Client Component boundary'
);

// The root layout renders the shell components in order: Navbar,
// ScrollToTop, {children}, Footer.
assert.match(
  layoutSource,
  /<Navbar\s*\/>[\s\S]*<ScrollToTop\s*\/>[\s\S]*\{children\}[\s\S]*<Footer\s*\/>/,
  'root layout must render Navbar, then ScrollToTop, then children, then Footer, in that order'
);
assert.match(
  layoutSource,
  /from '\.\.\/components\/layout\/Navbar'/,
  'root layout must use Navbar'
);
assert.match(
  layoutSource,
  /from '\.\.\/components\/layout\/Footer'/,
  'root layout must use Footer'
);
assert.match(
  layoutSource,
  /from '\.\.\/components\/ui\/ScrollToTop'/,
  'root layout must use ScrollToTop'
);

// Shell components must use next/link + next/navigation, never react-router.
for (const [name, source] of [
  ['Navbar.tsx', navbarSource],
  ['Footer.tsx', footerSource],
  ['ScrollToTop.tsx', scrollToTopSource],
] as const) {
  assert.ok(
    !/from ['"]react-router['"]/.test(source),
    `${name} must not import react-router`
  );
}
assert.match(
  navbarSource,
  /from 'next\/link'/,
  'Navbar.tsx must use next/link'
);
assert.match(
  navbarSource,
  /from 'next\/navigation'/,
  'Navbar.tsx must use next/navigation'
);
assert.match(
  footerSource,
  /from 'next\/link'/,
  'Footer.tsx must use next/link'
);
assert.match(
  scrollToTopSource,
  /from 'next\/navigation'/,
  'ScrollToTop.tsx must use next/navigation'
);
assert.match(
  navbarSource,
  /from '\.\.\/\.\.\/data\/navigation'/,
  'Navbar.tsx must import navigation data from ../../data/navigation'
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
  i18nSource,
  /import enCommon from '\.\.\/public\/locales\/en\/common\.json'/,
  'src/i18n.ts must import the real public/locales/en/common.json file, not duplicate its text'
);
assert.match(
  i18nSource,
  /resources:\s*\{\s*en:\s*\{\s*common:\s*enCommon\s*\}\s*\}/,
  'src/i18n.ts must initialize with the real imported English resource bundle'
);
assert.ok(
  !/resources:\s*\{\s*en:\s*\{\s*common:\s*\{\s*\}\s*\}\s*\}/.test(i18nSource),
  'src/i18n.ts must not initialize with an empty English resource bundle'
);
assert.match(
  i18nSource,
  /^\s*lng: 'en',/m,
  'src/i18n.ts must set an unconditional initial language of "en" — identical on the server and the first client render, before any browser-only detection can run'
);
assert.ok(
  !/^\s*import .* from ['"]i18next-browser-languagedetector['"]/m.test(
    i18nSource
  ),
  'src/i18n.ts must not import i18next-browser-languagedetector — attaching it would resolve navigator/localStorage synchronously during init, making the first client render disagree with the always-English server render'
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
  ['src/app/layout.tsx', layoutSource],
  ['src/app/providers.tsx', providersSource],
  ['src/i18n.ts', i18nSource],
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
  `Next shell smoke passed: layout stays a Server Component, ${mainNavigation.length} top-level entries wired through Navbar.tsx via next/link + next/navigation, i18n bootstraps with real bundled English resources (no suppressHydrationWarning), 0 planned routes.`
);
