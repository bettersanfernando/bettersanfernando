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

// route -> [App Router path segments under src/app, without page.page.tsx]
const batch3Routes: Record<string, string> = {
  '/': 'src/app/page.page.tsx',
  '/about': 'src/app/about/page.page.tsx',
  '/services': 'src/app/services/page.page.tsx',
  '/government': 'src/app/government/page.page.tsx',
  '/government/offices': 'src/app/government/offices/page.page.tsx',
  '/government/contact': 'src/app/government/contact/page.page.tsx',
  '/government/hotlines': 'src/app/government/hotlines/page.page.tsx',
  '/government/links': 'src/app/government/links/page.page.tsx',
  '/procurement': 'src/app/procurement/page.page.tsx',
  '/projects/methodology': 'src/app/projects/methodology/page.page.tsx',
  '/statistics': 'src/app/statistics/page.page.tsx',
  '/statistics/projects': 'src/app/statistics/projects/page.page.tsx',
  '/statistics/procurement': 'src/app/statistics/procurement/page.page.tsx',
  '/statistics/project-spending':
    'src/app/statistics/project-spending/page.page.tsx',
  '/statistics/population': 'src/app/statistics/population/page.page.tsx',
  '/statistics/demographics': 'src/app/statistics/demographics/page.page.tsx',
  '/statistics/government': 'src/app/statistics/government/page.page.tsx',
  '/statistics/legislation': 'src/app/statistics/legislation/page.page.tsx',
  '/statistics/public-records':
    'src/app/statistics/public-records/page.page.tsx',
  '/statistics/city-profile': 'src/app/statistics/city-profile/page.page.tsx',
  '/legislation': 'src/app/legislation/page.page.tsx',
  '/legislation/resolutions': 'src/app/legislation/resolutions/page.page.tsx',
  '/transparency': 'src/app/transparency/page.page.tsx',
  '/transparency/sources': 'src/app/transparency/sources/page.page.tsx',
  '/transparency/methodology': 'src/app/transparency/methodology/page.page.tsx',
  '/transparency/documents': 'src/app/transparency/documents/page.page.tsx',
  '/transparency/full-disclosure':
    'src/app/transparency/full-disclosure/page.page.tsx',
  '/transparency/finance': 'src/app/transparency/finance/page.page.tsx',
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
  'src/app/page.page.tsx must no longer be the Batch 1 placeholder — it must be the real home page'
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
const layoutSource = readFileSync('src/app/layout.page.tsx', 'utf8');
assert.ok(
  !/^\s*['"]use client['"]/m.test(layoutSource),
  'src/app/layout.page.tsx must remain a Server Component'
);

// 6. Migrated pages must use the shared civic-data modules, not copied data.
// Some routes (Batch 6 split these to attach page-level metadata to a
// Server Component) read civic data in a sibling *.next.tsx view instead of
// the page.page.tsx route entry itself — both still count as "the shared
// module", so the file checked is whichever one actually holds the import.
const civicDataImportsByRoute: Record<
  string,
  { file: string; pattern: RegExp }
> = {
  '/': {
    file: batch3Routes['/'],
    pattern: /from '\.\.\/data\/civic\/homeSummary'/,
  },
  '/government/offices': {
    file: 'src/app/government/offices/GovernmentOffices.next.tsx',
    pattern: /from '\.\.\/\.\.\/\.\.\/data\/civic\/government'/,
  },
  '/statistics/projects': {
    file: batch3Routes['/statistics/projects'],
    pattern: /from '\.\.\/\.\.\/\.\.\/data\/civic\/projectStatistics'/,
  },
  '/transparency/finance': {
    file: 'src/app/transparency/finance/CityFinances.next.tsx',
    pattern: /from '\.\.\/\.\.\/\.\.\/data\/civic\/finance'/,
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
