/**
 * Typed civic-data access layer.
 *
 * Application code should import civic data from here (or a specific
 * submodule below), never from src/data/generated/civic/*.json directly.
 * The generated JSON is vendored, checksummed, public-safe export data —
 * see src/data/generated/civic/README.md.
 */
export * from './projects.ts';
export * from './demographics.ts';
export * from './geography.ts';
export * from './government.ts';
export * from './legislation.ts';
export * from './sources.ts';
