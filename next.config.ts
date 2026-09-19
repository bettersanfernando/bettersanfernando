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
  // Keeps type-checking scoped to src/app/.
  typescript: {
    tsconfigPath: 'tsconfig.next.json',
  },
};

export default nextConfig;
