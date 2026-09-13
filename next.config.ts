import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keeps type-checking scoped to src/app/, isolated from the legacy Vite
  // project's solution-style tsconfig.json (see tsconfig.next.json).
  typescript: {
    tsconfigPath: 'tsconfig.next.json',
  },
  // TEMPORARY, remove once src/pages/ is deleted (Batch 7/8): Next.js
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
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
};

export default nextConfig;
