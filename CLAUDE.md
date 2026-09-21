# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (`pnpm-lock.yaml` is the lockfile; there is no
`package-lock.json`), not npm.

```bash
pnpm dev             # Start Next.js dev server (localhost:3000)
pnpm build           # Next.js production build (type-checked against tsconfig.json)
pnpm start           # Serve the production build
pnpm lint            # Run ESLint
pnpm lint:fix        # Auto-fix ESLint issues
pnpm format          # Format with Prettier
pnpm format:check    # Check formatting without writing
pnpm data:sync       # Sync the public-safe civic-data export from civic-data.config.json
pnpm data:validate   # Validate the synced civic-data export
```

Also present: a large family of `pnpm <area>:smoke` scripts (e.g.
`pnpm batch7-parity:smoke`, `pnpm nav:smoke`, `pnpm batch6-seo:smoke`) — see
`package.json` for the full list — each a focused Node smoke test for one
route family, data-layer accessor, or migration batch. Run the ones relevant
to what you changed; there is no single "run everything" script by design.

Pre-commit hook runs `lint-staged` automatically (ESLint + Prettier on staged files).

## Repository Boundary

This repo (`bettersanfernando`) is the **public frontend only**. Canonical/raw civic research data, source PDFs/XLSX, and research docs live only in the private `../bettersanfernando-data` repo — never copy root `data/`, `pdf/`, or `xlsx/` here. This repo consumes only the public-safe generated export via `pnpm data:sync`; `src/data/generated/civic/` is the expected, allowed vendored copy.

### Documentation-impact checkpoint

Every data publication, export sync, category activation, or frontend injection must check whether it changes: dataset counts; published/planned category status; route availability; public coverage statements; provenance or source versions; or roadmap completion state. If it does, either (1) update the affected authoritative documents in the same change, or (2) explicitly report `Documentation impact: none` with a specific reason. Documents to check: `docs/PAGE-DATA-MATRIX.md`; `docs/SITE-ARCHITECTURE.md` only when taxonomy or canonical routes change; `README.md` only when public project scope materially changes; the generated manifest only through `pnpm data:sync`, never by hand.

## Architecture

This is a **Next.js 16 App Router** + TypeScript app (React 19) for the City
of San Fernando, Pampanga. It uses Tailwind CSS, i18next for multilingual
support, and a typed civic-data access layer. The app was migrated off a
Vite + React Router implementation (see `docs/NEXTJS-MIGRATION-SPEC.md`);
that legacy app and its `src/App.tsx` router no longer exist.

### Routing

Routes are literal file-based App Router pages under `src/app/` (e.g.
`src/app/services/[category]/[serviceSlug]/page.tsx`), not a single routes
table. `docs/SITE-ARCHITECTURE.md`'s "Canonical route hierarchy" is the
authoritative route list; `next.config.ts`'s `LEGACY_ALIASES` defines the
permanent (308) redirects from retired URLs to their current routes.

### Civic data

Public page content comes from the typed access layer in `src/data/civic/`
(e.g. `getServices()`, `getProjects()`, `getCityOffices()`), which reads the
versioned, public-safe generated export at `src/data/generated/civic/` —
never raw private-repo data (see "Repository Boundary" above). Pages call
these accessors directly; there is no runtime Markdown/YAML content loader
in the current app.

### Navigation

`src/data/navigation.ts` is the single source of truth for the top-level nav
(`mainNavigation`), its mega-menu sections, the footer link groups
(`footerNavigation`), and `getActiveNavigationId()` (longest-matching-prefix
nav highlighting). `docs/SITE-ARCHITECTURE.md`'s "Navigation model" describes
the current top-level items and their ownership.

### SEO and metadata

`src/lib/metadata.ts` (`buildPageMetadata()`, `getRootMetadata()`) and
`src/lib/site-url.ts` (`absoluteUrl()`, `getSiteUrl()`) are the single
sources of truth for canonical URLs, titles, descriptions, and Open Graph/
Twitter metadata — every route's `metadata`/`generateMetadata()` should
build on `buildPageMetadata()` rather than re-deriving these by hand.
`src/lib/json-ld.tsx` renders the site-wide Organization/WebSite `@graph`
(root layout) and per-page `BreadcrumbList` (via `Breadcrumbs`). `robots.ts`
and `sitemap.ts` under `src/app/` are the crawl/indexing configuration.

### Internationalization

- i18next with `HttpBackend` loads translation files from `public/locales/{lang}/common.json`
- Language detection order: `localStorage` → `navigator` → `htmlTag`
- Fallback language: `en`
- Supported languages are defined in `src/types/index.ts` (`LanguageType`)
- Currently only `public/locales/en/common.json` exists

### Environment Variables

`NEXT_PUBLIC_SITE_URL` is the canonical production URL, resolved by
`src/lib/site-url.ts` (see that file's own priority-order comment). Normal
local development needs no environment file.

### UI Components

Reusable primitives live in `src/components/ui/`: `Section`, `Heading`,
`Text`, `Breadcrumbs`, `ScrollToTop`, `PageLoading`, `EligibilityText`. Use
these instead of raw HTML elements for consistency.

### Code Style

- Single quotes, 2-space indentation, trailing commas (ES5), semicolons, 80-char line width (enforced by Prettier)
- Arrow functions omit parens for single arguments
