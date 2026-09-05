# BetterSanFernando

BetterSanFernando is an independent civic-information and transparency portal
for the City of San Fernando, Pampanga, Philippines. It organizes verified
local government information — services, projects, government structure,
legislation, and transparency records — around resident needs, with a clear
link from every published fact back to its source.

**BetterSanFernando is not the official website of the City Government of San
Fernando.** It is an independent project, not affiliated with, endorsed by, or
authorized to speak on behalf of the City Government. Official City Government
contact information is presented as sourced official information, not as a
BetterSanFernando channel.

## Current public scope

The site has exactly seven top-level navigation areas:

- **Home** — introduces the portal and surfaces high-value civic facts.
- **Services** — resident-facing guidance on city services, organized by need.
- **Projects** — a bounded, verified subset of city infrastructure/public-works
  projects and their evidence.
- **Government** — offices, official contacts, and legislation.
- **Transparency** — published-record inventory, sources, and methodology.
  Statistics is a content area under Transparency, not a separate top-level
  item.
- **About** — the project's purpose, independence, and methodology.
- **Contact** — a channel for BetterSanFernando itself, kept separate from
  official City Government contacts.

Full route ownership and publication rules are defined in
[`docs/SITE-ARCHITECTURE.md`](docs/SITE-ARCHITECTURE.md).

## Current bounded data snapshot

These are BetterSanFernando's current published holdings, not complete City
Government inventories. Coverage is progressive: absence from the portal does
not mean a City service or record does not exist, only that it has not yet
been verified and reviewed for publication.

| Domain                            | Published count |
| --------------------------------- | --------------- |
| Reviewed External service records | 113             |
| Published service categories      | 6 of 13         |
| Planned service categories        | 7 of 13         |
| Project records                   | 239             |
| Project-evidence records          | 334             |
| Barangays                         | 35              |
| City-office directory records     | 44              |
| Executive orders                  | 11              |
| Ordinances                        | 6               |
| Resolutions                       | 0               |

Published service categories:

| Category              | Records | Route                             |
| --------------------- | ------: | --------------------------------- |
| Business Services     |       8 | `/services/business`              |
| Disaster Preparedness |       7 | `/services/disaster-preparedness` |
| Assistance Programs   |      19 | `/services/assistance-programs`   |
| Social Welfare        |      14 | `/services/social-welfare`        |
| PWD Services          |       6 | `/services/pwd-services`          |
| Health Services       |      59 | `/services/health-services`       |

The remaining 7 service categories (Employment, Livelihood, Education
Services, Senior Citizens, Infrastructure & Public Works, Agriculture &
Fisheries, Environment) are visible in navigation as planned sections; they do
not yet contain published service records. Health Services is `PARTIAL`, not
`READY`: its 59 publication-reviewed CHO records are a bounded subset of the
canonical inventory. Another 142 External services and all 74 Internal services
remain unpublished; CHO records external-22 and external-60 remain held and are
not published. See
[`docs/PAGE-DATA-MATRIX.md`](docs/PAGE-DATA-MATRIX.md) for the full
page-by-page readiness assessment and
[`docs/IMPLEMENTATION-ROADMAP.md`](docs/IMPLEMENTATION-ROADMAP.md) for what is
planned next.

## Data and publication model

Private research and canonical civic data are maintained in a separate,
private repository. This repository (`bettersanfernando`) is the **public
frontend only**:

- Canonical/raw research data, source PDFs/XLSX, recovery queues, and internal
  analysis files are never copied into this repository.
- The frontend consumes only a versioned, reviewed, frontend-safe export,
  vendored into `src/data/generated/civic/`.
- Application code reads that data exclusively through the typed access layer
  in `src/data/civic/` — never by importing generated JSON/GeoJSON directly,
  and never by reading the private repository at build or run time.
- Generated frontend data is refreshed only through the established sync
  workflow (`pnpm data:sync`); it is never hand-edited.
- Private research files, sensitive or person-level data, recovery queues, and
  source workbooks existing privately does not make them publication-safe —
  publishing a dataset requires a deliberate, allowlisted export and
  publication review.

See the **Repository Boundary** section of [`CLAUDE.md`](CLAUDE.md) for the
exact rules agents and contributors must follow.

## Technology

- React 19, TypeScript, Vite
- React Router, Tailwind CSS
- i18next for multilingual support
- Zod-validated typed data access layer
- pnpm as the package manager (`packageManager: pnpm@11.9.0`)

## Local development

```bash
pnpm install       # Install dependencies
pnpm dev           # Start the development server (localhost:5173)
pnpm build         # TypeScript check + production build
pnpm lint          # Run ESLint
```

### Data validation and smoke tests

These checks run against the already-vendored, public-safe data in
`src/data/generated/civic/` and require no private-repository access:

```bash
pnpm data:validate            # Validate the vendored civic-data export
pnpm data:smoke                # Civic data layer smoke checks
pnpm services:smoke            # Services dataset and route smoke checks
pnpm nav:smoke                  # Navigation and planned-page smoke checks
pnpm check:public-data-boundary # Guard against private data re-entering this repo
```

Additional domain-specific smoke tests (projects, barangays, legislation,
transparency, statistics, government, search, and more) are listed in
`package.json`.

## Repository structure

```
src/
├── pages/                    # Route-level page components
├── components/                # Reusable UI and layout components
├── data/
│   ├── civic/                 # Typed, validated access layer for civic data
│   │                            (the only sanctioned way to read civic data)
│   └── generated/civic/       # Vendored frontend-safe export (never hand-edited)
├── lib/                       # Utility functions (markdown/YAML loaders, etc.)
└── i18n/                      # Internationalization setup

scripts/                      # Data sync, validation, and smoke-test scripts
docs/                         # Architecture, data-readiness, and roadmap docs
content/                      # YAML/Markdown content for Services and Government
```

## Data synchronization

Maintainers with local access to the private `bettersanfernando-data`
repository can refresh the vendored export:

```bash
pnpm data:sync
# or: pnpm data:sync -- --source=/path/to/bettersanfernando-data
```

This copies only the files declared in that repository's versioned, checksummed
export manifest into `src/data/generated/civic/`, verifying every checksum
before copying. It is a local maintainer step, never a production or CI
dependency — the private repository is never a runtime or production data
source for this application.

## Methodology and limitations

- [`docs/SITE-ARCHITECTURE.md`](docs/SITE-ARCHITECTURE.md) — canonical routes,
  section ownership, and publication rules.
- [`docs/PAGE-DATA-MATRIX.md`](docs/PAGE-DATA-MATRIX.md) — per-page data
  readiness and publication status.
- [`docs/IMPLEMENTATION-ROADMAP.md`](docs/IMPLEMENTATION-ROADMAP.md) — what has
  shipped and what is planned next.
- In the running application, `/transparency/methodology` and
  `/projects/methodology` explain verification, lifecycle, and data-quality
  rules for the published domains, and `/transparency/sources` inventories the
  sources behind them.

Coverage is progressive and intentionally bounded. Verification status and
provenance matter more than apparent completeness: the portal does not infer
or fill in missing government facts, and an empty or partial dataset is
reported as such rather than backfilled with assumptions.

## Contributing

1. Fork or branch, install dependencies with `pnpm install`, and run `pnpm dev`
   to work locally.
2. Follow the conventions and repository boundary documented in
   [`CLAUDE.md`](CLAUDE.md).
3. Run `pnpm lint` and `pnpm build` before opening a pull request; run the
   relevant smoke tests for any area you changed.
4. A pre-commit hook runs `lint-staged` (ESLint + Prettier) automatically on
   staged files.
5. Any change that affects routes, published dataset counts, category
   publication status, or coverage statements must complete the
   documentation-impact checkpoint described in `CLAUDE.md` — either update the
   affected planning documents in the same change, or state
   `Documentation impact: none` with a specific reason.

## License

This project is licensed under [CC0 1.0 Universal](LICENSE) (Creative Commons
Zero) — see the [`LICENSE`](LICENSE) file for the full text.
