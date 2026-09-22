import type { NextConfig } from 'next';
import projectIdRedirectsJson from './src/data/generated/civic/projects/project-id-redirects.json' with { type: 'json' };

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

// Canonical-project deduplication redirects: data-driven from the private
// data repo's project-canonical-merges.json (synced via `pnpm data:sync` as
// projects/project-id-redirects.json). Each entry retires an NTA-sourced
// canonical project ID that was later confirmed to be the same real project
// as an existing Bid-Results-sourced one — the old public URL must keep
// resolving rather than 404. Do not hand-edit this list; regenerate the
// source repo's data/projects/project-canonical-merges.json instead.
const PROJECT_ID_REDIRECTS: ReadonlyArray<{
  deprecated_project_id: string;
  canonical_project_id: string;
}> = projectIdRedirectsJson.redirects;

const nextConfig: NextConfig = {
  async redirects() {
    const legacy = LEGACY_ALIASES.map(({ source, destination }) => ({
      source,
      destination,
      permanent: true, // HTTP 308
    }));
    const projectIdMerges = PROJECT_ID_REDIRECTS.map(
      ({ deprecated_project_id, canonical_project_id }) => ({
        source: `/projects/${deprecated_project_id}`,
        destination: `/projects/${canonical_project_id}`,
        permanent: true, // HTTP 308
      })
    );
    return [...legacy, ...projectIdMerges];
  },
};

export default nextConfig;
