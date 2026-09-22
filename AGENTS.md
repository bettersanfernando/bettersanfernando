# AGENTS.md

## Project

BetterSanFernando is an independent civic-information and transparency portal
for the City of San Fernando, Pampanga. It is not an official City Government
website.

The current stack is Next.js 16 App Router, React 19, TypeScript, pnpm,
MiniSearch, generated public-safe civic data, and Vercel-oriented deployment.

## Working Rules

- Inspect the relevant code, docs, and callers before modifying anything.
- Make the smallest correct change; preserve existing architecture and naming.
- Keep changes focused. Do not fold unrelated cleanup into a task.
- Verify paths, commands, and current behavior before documenting or relying
  on them.
- Preserve concurrent or user changes. Do not overwrite work you did not make.
- Do not use destructive Git commands unless the user explicitly requests
  them.

## Git Safety

- Start by checking `git status`; work from a clean tree unless the user has
  explicitly scoped existing changes.
- Use focused branches for implementation work when requested.
- Never use `git reset --hard`, `git clean`, or blind restore/checkout actions
  against user work.
- Inspect the diff before committing.
- Do not commit or push unless the user explicitly asks.

## Civic Data Boundary

- This public repository must not contain private or canonical research
  material, sensitive data, unpublished records, or private-repository
  runtime/build dependencies.
- Application code accesses civic data through `src/data/civic/`; do not
  import generated datasets directly in routes or components.
- `src/data/generated/civic/` is reviewed public-safe output. Never edit it
  by hand.
- `pnpm data:sync` is a maintainer workflow, not an ordinary contributor or
  CI requirement. Use `pnpm data:validate` for the vendored export.
- When work touches the data boundary, run
  `pnpm check:public-data-boundary` and
  `pnpm test:public-data-boundary`.
- See [docs/DATA-PUBLICATION.md](docs/DATA-PUBLICATION.md) for the canonical
  publication workflow.

## Search

- Search is local MiniSearch, implemented by `src/data/civic/search.ts`.
- Preserve `CIVIC_SEARCH_DOMAINS` as the public search-domain contract.
- Reuse `searchAliases.ts` and `searchNormalization.ts` for aliases and query
  normalization rather than creating parallel search behavior.

## Frontend Work

- [docs/FRONTEND-DESIGN-SYSTEM.md](docs/FRONTEND-DESIGN-SYSTEM.md) is the
  canonical visual and interaction guide.
- Follow the existing BetterSanFernando system; avoid generic SaaS/dashboard
  patterns and unrequested visual redesigns.
- Preserve accessibility, keyboard behavior, responsive composition, and
  existing layout/component patterns.
- Reuse shared UI and layout components where they fit the task.

## Validation

- Start with targeted checks. Use broader checks for cross-cutting or runtime
  changes.
- Normal code validation is `pnpm lint`, `pnpm format:check`, and `pnpm build`.
- Run the relevant `*:smoke` script from `package.json`; common shell/search
  checks are `pnpm nav:smoke`, `pnpm next-shell:smoke`, and
  `pnpm search:smoke`.
- Documentation-only changes normally need formatting and `git diff --check`,
  not an application build.
- Always run `git diff --check` before handoff.

## Documentation Impact

When routes, architecture, data behavior, publication status, or frontend
behavior changes, check the affected authoritative documentation:

- `docs/SITE-ARCHITECTURE.md`
- `docs/PAGE-DATA-MATRIX.md`
- `docs/DATA-PUBLICATION.md`
- `docs/FRONTEND-DESIGN-SYSTEM.md`

Update only documentation actually affected by the change. Use
`docs/README.md` to find the current documentation map.

## Do Not Reintroduce Legacy Systems

Do not regress toward retired Vite, React Router, Meilisearch, runtime
YAML/Markdown content loaders, or Terraform/S3 static-deployment assumptions.
Historical references in migration and provenance documentation are expected.
