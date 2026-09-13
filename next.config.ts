import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keeps type-checking scoped to src/app/, isolated from the legacy Vite
  // project's solution-style tsconfig.json (see tsconfig.next.json).
  typescript: {
    tsconfigPath: 'tsconfig.next.json',
  },
  // Next.js treats any `pages`/`src/pages` directory as its own Pages
  // Router and compiles every matching file inside it as a route. This
  // repo's src/pages/ predates Next.js entirely (react-router components,
  // including Vite-only import.meta.glob content loading) and must never be
  // treated as Next route files. Restricting the recognized route-file
  // extension to the compound `.page.tsx`/`.page.ts` suffix — and naming
  // only this migration's own App Router files that way — means none of
  // the existing src/pages/*.tsx files match, so Next never attempts to
  // compile them.
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
};

export default nextConfig;
