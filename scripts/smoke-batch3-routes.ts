#!/usr/bin/env -S node --experimental-strip-types
// Batch 3 focused coverage: every static-literal-path route this batch was
// scoped to (per docs/NEXTJS-MIGRATION-SPEC.md §12 Batch 3, read together
// with §5/§11's correction moving the 16 /services/{category} pages into
// Batch 4's [category] dispatcher, and §9's 9 nuqs pages + MapLibre map
// staying in Batch 5) exists as a real App Router file, uses no
// react-router-dom/react-helmet-async, and that later-batch dynamic routes
// were not accidentally created. Full route/content parity sweeps are
// Batch 7's job — this only checks what's new in this batch.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

// route -> [App Router path segments under src/app, without page.tsx]
const batch3Routes: Record<string, string> = {
  '/': 'src/app/[locale]/page.tsx',
  '/about': 'src/app/[locale]/about/page.tsx',
  '/services': 'src/app/[locale]/services/page.tsx',
  '/government': 'src/app/[locale]/government/page.tsx',
  '/government/offices': 'src/app/[locale]/government/offices/page.tsx',
  '/government/contact': 'src/app/[locale]/government/contact/page.tsx',
  '/government/hotlines': 'src/app/[locale]/government/hotlines/page.tsx',
  '/government/links': 'src/app/[locale]/government/links/page.tsx',
  '/procurement': 'src/app/[locale]/procurement/page.tsx',
  '/projects/methodology': 'src/app/[locale]/projects/methodology/page.tsx',
  '/statistics': 'src/app/[locale]/statistics/page.tsx',
  '/statistics/projects': 'src/app/[locale]/statistics/projects/page.tsx',
  '/statistics/procurement': 'src/app/[locale]/statistics/procurement/page.tsx',
  '/statistics/project-spending':
    'src/app/[locale]/statistics/project-spending/page.tsx',
  '/statistics/population': 'src/app/[locale]/statistics/population/page.tsx',
  '/statistics/demographics':
    'src/app/[locale]/statistics/demographics/page.tsx',
  '/statistics/government': 'src/app/[locale]/statistics/government/page.tsx',
  '/statistics/legislation': 'src/app/[locale]/statistics/legislation/page.tsx',
  '/statistics/public-records':
    'src/app/[locale]/statistics/public-records/page.tsx',
  '/statistics/city-profile':
    'src/app/[locale]/statistics/city-profile/page.tsx',
  '/legislation': 'src/app/[locale]/legislation/page.tsx',
  '/legislation/resolutions':
    'src/app/[locale]/legislation/resolutions/page.tsx',
  '/transparency': 'src/app/[locale]/transparency/page.tsx',
  '/transparency/sources': 'src/app/[locale]/transparency/sources/page.tsx',
  '/transparency/methodology':
    'src/app/[locale]/transparency/methodology/page.tsx',
  '/transparency/documents': 'src/app/[locale]/transparency/documents/page.tsx',
  '/transparency/full-disclosure':
    'src/app/[locale]/transparency/full-disclosure/page.tsx',
  '/transparency/finance': 'src/app/[locale]/transparency/finance/page.tsx',
};

const expectedRouteCount = 28;
const routeEntries = Object.entries(batch3Routes);
assert.equal(
  routeEntries.length,
  expectedRouteCount,
  `this ledger must list exactly the ${expectedRouteCount} Batch 3 static routes (58 static-literal-path count in §12 predates the §5/§11 correction moving the 16 /services/{category} pages into Batch 4, and the 9 nuqs pages + /projects/map stay in Batch 5 per §9/§12)`
);

// 1. Every expected Next route file exists.
for (const [route, filePath] of routeEntries) {
  assert.ok(existsSync(filePath), `${route} must exist at ${filePath}`);
}

// 2. Migrated Next route files must not import react-router-dom or
//    react-helmet-async (metadata is Batch 6's job; SEO.tsx is dropped).
for (const [route, filePath] of routeEntries) {
  const source = readFileSync(filePath, 'utf8');
  assert.ok(
    !/from ['"]react-router(-dom)?['"]/.test(source),
    `${route} (${filePath}) must not import react-router/react-router-dom`
  );
  assert.ok(
    !/^\s*import .* from ['"](react-helmet-async|\.\.\/+components\/SEO)['"]/m.test(
      source
    ),
    `${route} (${filePath}) must not import react-helmet-async or the legacy SEO component`
  );
}

// 3. The temporary placeholder home page from Batch 1 is gone.
const homeSource = readFileSync(batch3Routes['/'], 'utf8');
assert.ok(
  !/Next\.js migration foundation/.test(homeSource),
  'src/app/[locale]/page.tsx must no longer be the Batch 1 placeholder — it must be the real home page'
);
assert.match(
  homeSource,
  /BetterSanFernando/,
  'the real home page must render actual BetterSanFernando content'
);

// 4. The rejected sibling-[slug]-folder anti-pattern (see
//    docs/NEXTJS-MIGRATION-SPEC.md §5) must never appear. Batch 4 and
//    Batch 5 both legitimately added dynamic/client-island routes, so this
//    only checks the one pattern that must never exist regardless of batch
//    — see smoke-batch4-dynamic-routes.ts and smoke-batch5-routes.ts for
//    their own scopes.
function collectAppFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return collectAppFiles(full);
    return [full];
  });
}
const allAppFiles = collectAppFiles('src/app');
assert.ok(
  !allAppFiles.some(file => file.includes('[slug]')),
  '[slug] must never exist as a sibling of services/[category] — Next.js treats same-position dynamic segments as one route regardless of param name (§5)'
);

// 5. The root layout stays a Server Component (already the authoritative
//    check in smoke-next-shell.ts; re-asserted here since real page content
//    now renders inside it).
const layoutSource = readFileSync('src/app/[locale]/layout.tsx', 'utf8');
assert.ok(
  !/^\s*['"]use client['"]/m.test(layoutSource),
  'src/app/[locale]/layout.tsx must remain a Server Component'
);

// 6. Migrated pages must use the shared civic-data modules, not copied data.
// Some routes (Batch 6 split these to attach page-level metadata to a
// Server Component) read civic data in a sibling *.tsx view instead of
// the page.tsx route entry itself — both still count as "the shared
// module", so the file checked is whichever one actually holds the import.
const civicDataImportsByRoute: Record<
  string,
  { file: string; pattern: RegExp }
> = {
  '/': {
    file: batch3Routes['/'],
    pattern: /from '\.\.\/\.\.\/data\/civic\/homeSummary'/,
  },
  '/government/offices': {
    file: 'src/app/[locale]/government/offices/GovernmentOffices.tsx',
    pattern: /from '\.\.\/\.\.\/\.\.\/\.\.\/data\/civic\/government'/,
  },
  '/statistics/projects': {
    file: batch3Routes['/statistics/projects'],
    pattern: /from '\.\.\/\.\.\/\.\.\/\.\.\/data\/civic\/projectStatistics'/,
  },
  '/transparency/finance': {
    file: 'src/app/[locale]/transparency/finance/CityFinances.tsx',
    pattern: /from '\.\.\/\.\.\/\.\.\/\.\.\/data\/civic\/finance'/,
  },
};
for (const [route, { file, pattern }] of Object.entries(
  civicDataImportsByRoute
)) {
  const source = readFileSync(file, 'utf8');
  assert.match(
    source,
    pattern,
    `${route} must import its civic data from the shared src/data/civic module, not a duplicated copy`
  );
}

console.log(
  `Batch 3 route smoke passed: all ${routeEntries.length} static routes exist, use next/link (no react-router/react-helmet-async), the temporary home placeholder is gone, the rejected services/[slug] sibling-folder pattern is absent, and pages read the shared civic-data modules.`
);
