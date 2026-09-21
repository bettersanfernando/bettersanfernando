<p align="center">
  <img src="public/logo-512.png" width="96" alt="BetterSanFernando logo" />
</p>

<h1 align="center">BetterSanFernando</h1>

<p align="center">
  Independent civic information and transparency for San Fernando, Pampanga.
</p>

<p align="center">
  <a href="https://bettersanfernando.org">Visit the live site</a> ·
  <a href="CONTRIBUTING.md">Contribute</a> ·
  <a href="https://github.com/bettersanfernando/bettersanfernando/issues">Report an issue</a>
</p>

<p align="center">
  <a href="https://github.com/bettersanfernando/bettersanfernando/actions/workflows/ci.yml">
    <img src="https://github.com/bettersanfernando/bettersanfernando/actions/workflows/ci.yml/badge.svg" alt="CI status" />
  </a>
</p>

## About

BetterSanFernando is an independent civic-information and transparency
portal for the City of San Fernando, Pampanga, Philippines. It organizes
public information from official and public sources — city services,
infrastructure and public projects, government offices and contacts,
legislation and public records, transparency information, and
barangay/statistical data — into a resident-oriented interface with search
across all of it.

**BetterSanFernando is not the official website of the City Government of
San Fernando.** It is an independent project, not affiliated with,
endorsed by, or authorized to speak on behalf of the City Government.

## What you can find

- **Services** — resident-facing guidance on city services, organized by need.
- **Projects** — infrastructure and public-works projects with supporting evidence.
- **Government** — offices, official contacts, and legislation.
- **Transparency & public records** — published-record inventory, sources, and methodology.
- **Barangays & statistics** — barangay information and city statistical data.
- **Search** — a single search across services, projects, government, and records.

## How information is handled

Published information is based on official and public sources, and
published records retain source and provenance information where
applicable. Coverage is progressive and intentionally bounded: an absent or
partial dataset is presented as such rather than inferred, filled in, or
backfilled with assumptions.

Private research and canonical civic data are maintained in a separate,
private repository. This repository is the public frontend and a reviewed,
frontend-safe civic-data export:

- Application code reads civic data only through the typed access layer in
  `src/data/civic/`.
- `src/data/generated/civic/` is generated, reviewed output and must never
  be hand-edited.
- Normal contributors do not require access to the private canonical
  research repository.

For the full picture, see
[`docs/PAGE-DATA-MATRIX.md`](docs/PAGE-DATA-MATRIX.md),
[`docs/SITE-ARCHITECTURE.md`](docs/SITE-ARCHITECTURE.md), and
[`PROVENANCE.md`](PROVENANCE.md).

## Getting started

Prerequisites: Node.js 22 and pnpm (`packageManager: pnpm@11.9.0`).

```bash
git clone https://github.com/bettersanfernando/bettersanfernando.git
cd bettersanfernando
pnpm install
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

Before opening a pull request:

```bash
pnpm lint
pnpm format:check
pnpm build
```

More targeted smoke and data-validation checks are documented in
[`CONTRIBUTING.md`](CONTRIBUTING.md) and `package.json`.

## Repository structure

```
src/
├── app/                    # Next.js App Router routes, layouts, and metadata
├── components/             # Reusable UI and layout components
├── data/
│   ├── civic/               # Typed access layer for civic data (read it, never bypass it)
│   └── generated/civic/     # Reviewed, frontend-safe export — never hand-edited
└── lib/                    # Shared utilities

public/                    # Static assets
scripts/                   # Data sync, validation, and smoke-test scripts
docs/                      # Architecture, data-readiness, and design docs
```

## Contributing

Contributions to the frontend, accessibility, documentation, tests,
performance, search, and general usability are welcome — see
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the full guide.

Civic-data corrections should be submitted through the repository's **Civic
Data Correction** issue form rather than by editing generated civic-data
files directly. Normal contributors do not need access to the private
research repository for any of the above.

## Documentation

| Document                                                           | Purpose                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| [`docs/SITE-ARCHITECTURE.md`](docs/SITE-ARCHITECTURE.md)           | Current route and information architecture                                           |
| [`docs/PAGE-DATA-MATRIX.md`](docs/PAGE-DATA-MATRIX.md)             | Publication readiness and data coverage                                              |
| [`docs/FRONTEND-DESIGN-SYSTEM.md`](docs/FRONTEND-DESIGN-SYSTEM.md) | Frontend design and UI conventions                                                   |
| [`docs/NEXTJS-MIGRATION-SPEC.md`](docs/NEXTJS-MIGRATION-SPEC.md)   | Historical Next.js migration specification — not current implementation instructions |

See also [`CONTRIBUTING.md`](CONTRIBUTING.md),
[`SECURITY.md`](SECURITY.md), and [`PROVENANCE.md`](PROVENANCE.md).

## License and provenance

This repository's LICENSE remains [CC0 1.0 Universal](LICENSE). Third-party
dependencies and source materials referenced or included by this project
remain subject to their own applicable rights and terms — inclusion in or
reference from this repository does not relicense them. See
[`PROVENANCE.md`](PROVENANCE.md) for what has been specifically verified.
