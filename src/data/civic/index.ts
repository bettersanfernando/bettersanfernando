/**
 * Typed civic-data access layer.
 *
 * Application code must never import from src/data/generated/civic/*.json
 * directly — that's vendored, checksummed, public-safe export data (see
 * src/data/generated/civic/README.md), not an application-facing API.
 *
 * This barrel is a valid, build-safe public entry point. Prefer importing
 * from the specific submodule you need (e.g. `../data/civic/projects`)
 * instead — it tree-shakes better and keeps a page's chunk from pulling in
 * domains it doesn't use (e.g. geography's GeoJSON payload). Use this
 * barrel when a module genuinely needs several domains at once.
 */
export * from './projects.ts';
export * from './demographics.ts';
export * from './geography.ts';
export * from './government.ts';
export * from './legislation.ts';
export * from './sources.ts';
