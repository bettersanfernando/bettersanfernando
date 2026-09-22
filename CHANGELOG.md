# Changelog

Notable BetterSanFernando project changes are documented here. The project
does not currently use formal semantic-version releases or Git tags; dated
milestones are used until formal releases begin.

## Unreleased

Current unreleased changes will be recorded here.

## 2026-09 — Platform migration and civic-data expansion

- Migrated the application to Next.js 16 App Router and retired the legacy
  Vite and React Router application structure.
- Established typed civic-data access backed by reviewed, public-safe generated
  exports and validation safeguards.
- Expanded data-backed resident information across services, projects,
  government, transparency, legislation, statistics, and barangays.
- Added project-map runtime support and related MapLibre worker handling.

## 2026-09 — Search, design, and public experience

- Adopted local MiniSearch for published civic information search.
- Modernized navigation, search, metadata, and resident-facing information
  surfaces.
- Established the current frontend design direction and its canonical design
  system documentation.

## 2026-09 — Open-source and documentation foundation

- Added contribution guidance, issue forms, pull-request expectations, and
  GitHub Actions CI.
- Added the Code of Conduct, Security Policy, and Provenance documentation.
- Established the documentation index, civic-data publication guide,
  architecture, page-data matrix, and current design-system documentation.
- Removed unused public brand-asset variants to reduce deployment source size.

## 2026-08 — BetterSanFernando foundation

- Established the BetterSanFernando repository and adopted pnpm.
- Created the civic-data foundation and early data-backed city-information
  routes.

## Historical note

BetterSanFernando originated from a separate starter project with its own
earlier release history. Those releases are not BetterSanFernando releases.
See [PROVENANCE.md](./PROVENANCE.md) for verified origin and third-party
material information.
