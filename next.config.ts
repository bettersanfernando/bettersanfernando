import type { NextConfig } from 'next';

// The 16 literal aliases from src/App.tsx's <Navigate> routes, recomputed
// directly from source and cross-checked against
// docs/NEXTJS-MIGRATION-SPEC.md §4.1. Each source URL is its own entry
// (rows 9/10 below were originally one <Route> conflated into one spec-table
// row before that was corrected) — a single `source` cannot express two
// distinct source paths. Fragment-bearing destinations are preserved
// exactly; `redirects()` supports a `destination` containing a hash.
const LEGACY_ALIASES: ReadonlyArray<{ source: string; destination: string }> = [
  { source: '/contact', destination: '/government/contact' },
  { source: '/philippines/hotlines', destination: '/government/hotlines' },
  { source: '/government/directory', destination: '/government/offices' },
  { source: '/government/contacts', destination: '/government/offices' },
  { source: '/government/departments', destination: '/government/offices' },
  {
    source: '/government/reports-and-statistics',
    destination: '/statistics',
  },
  { source: '/transparency/procurement', destination: '/procurement' },
  {
    source: '/transparency/contracts',
    destination: '/procurement/contracts',
  },
  { source: '/projects/data-sources', destination: '/projects/sources' },
  { source: '/projects/dashboard', destination: '/statistics/projects' },
  {
    source: '/statistics/population/barangays',
    destination: '/statistics/population#barangays',
  },
  {
    source: '/transparency/verification',
    destination: '/transparency/methodology#verification',
  },
  {
    source: '/transparency/limitations',
    destination: '/transparency/methodology#limitations',
  },
  {
    source: '/government/documents',
    destination: '/transparency/documents',
  },
  {
    source: '/government/transparency-documents',
    destination: '/transparency/documents',
  },
  {
    source: '/transparency/archive',
    destination: '/transparency/full-disclosure',
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return LEGACY_ALIASES.map(({ source, destination }) => ({
      source,
      destination,
      permanent: true, // HTTP 308
    }));
  },
  // Keeps type-checking scoped to src/app/, isolated from the legacy Vite
  // project's solution-style tsconfig.json (see tsconfig.next.json).
  typescript: {
    tsconfigPath: 'tsconfig.next.json',
  },
  // TEMPORARY, remove once the Batch 8 preview/cutover retires src/pages/:
  // treats any `pages`/`src/pages` directory as its own Pages Router and
  // compiles every matching file inside it as a route. This repo's
  // src/pages/ predates Next.js entirely (react-router components,
  // including Vite-only import.meta.glob content loading) and must never be
  // treated as Next route files. Restricting the recognized route-file
  // extension to the compound `.page.tsx`/`.page.ts` suffix — and naming
  // only this migration's own App Router special-convention files that way
  // (layout.page.tsx, page.page.tsx; ordinary components keep plain .tsx
  // names) — means none of the existing src/pages/*.tsx files match, so
  // Next never attempts to compile them. Once src/pages/ and the legacy
  // Vite build are gone, delete this option and rename app/layout.page.tsx
  // / app/page.page.tsx (and any later page.tsx/layout.tsx added under
  // src/app/) back to their normal Next.js names.
  // Plain `ts` (no `.tsx`) is also allowed so metadata-route files
  // (sitemap.ts, robots.ts) keep Next's standard names — Next's own
  // typegen for those files doesn't understand the `.page.ts` compound
  // suffix pattern used for page/layout files below. Safe: no file under
  // legacy src/pages/ has a plain .ts (non-.tsx) extension, so this can't
  // resurrect any of them as a route.
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'ts'],
};

export default nextConfig;
