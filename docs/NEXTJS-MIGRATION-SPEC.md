# Next.js Migration Specification — BetterSanFernando

Status: **SPECIFICATION ONLY.** No application code, dependencies, branches, or
deployments have been created or changed by this document. This corrects and
finalizes the architecture direction from the prior read-only audit.

---

## 1. Executive decision

BetterSanFernando will migrate from a Vite + React Router 8 client-side SPA to
a **standard Next.js App Router application deployed on Vercel**, using
Vercel's normal Next.js runtime (not `output: 'export'`). The application
remains **primarily statically generated** — nearly every page (all civic
content, all 324 project pages, all 177 service pages, all 44 office pages)
is pre-rendered at build time. Vercel's routing/server layer is retained only
for the capabilities static export cannot provide: real HTTP redirects, real
HTTP status codes (404), and headroom for legitimate future needs. This is
**not** an SSR-heavy rearchitecture — no page in this spec renders per-request
by default, and no backend, database, or authentication is introduced. The
one narrow exception is a legacy-URL compatibility lookup (§5, §17), which
reads only already-bundled local JSON at request time — never a network call
or database.

## 2. Verified current architecture

Re-confirmed from the prior audit and this task's own inspection:

| Layer                 | Verified value                                                                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework             | React 19.1.1 + Vite 8.1.5, client-only `createRoot().render()` — no SSR, no prerendering today                                                                                                                                                                            |
| Routing               | react-router 8.3.0, `<BrowserRouter>`, 81 `<Route>` elements in source (1 is a no-op `plannedPages.map`, contributing 0 routes since that array is empty)                                                                                                                 |
| Language/style        | TypeScript 6.0.3 strict, Tailwind CSS 4                                                                                                                                                                                                                                   |
| Data                  | Zod 4 `.strict()` schemas over 22 checksummed, manifest-driven datasets synced from `bettersanfernando-data`                                                                                                                                                              |
| Interactive libs      | MapLibre GL (WebGL map), MiniSearch (in-memory client search), nuqs (URL query state, 9 pages), i18next (client-only, chrome strings only)                                                                                                                                |
| Effective route count | 66 real page routes (58 static literal paths + 8 dynamic-parameter patterns) + 16 client-side `<Navigate>` redirects (recomputed directly from `src/App.tsx`, counting every distinct source URL separately — see §4.1)                                                   |
| Scale                 | 324 projects, 177 services, 44 government entities (from the 22-dataset export), 0 planned routes                                                                                                                                                                         |
| Hosting evidence      | `vercel.json` present and project-specific (SPA catch-all rewrite `/(.*) → /index.html`, `framework: "vite"`); no `.github/` workflows; `terraform/` and most of `DEPLOYMENT-GUIDE.md` are generic, unfilled starter-kit scaffolding, not evidence of the live deployment |

## 3. Corrected rendering and hosting decision

The prior audit's recommendation of `output: 'export'` is **withdrawn**. Per
current official Next.js documentation, static export explicitly does not
support `redirects()`, `rewrites()`, `headers()`, Route Handlers that require
a server, Server Actions, or an image loader (without an external provider).
Since real HTTP redirects and real HTTP status codes are explicit, named
goals of this migration (correcting today's client-side-only `<Navigate>`
aliases and today's soft-404 behavior), static export cannot deliver the
requirements it was recommended for.

**Corrected decision**: deploy a **standard Next.js application to Vercel**,
without `output: 'export'`. Vercel builds this as its native Next.js target,
which:

- pre-renders every statically-generatable route at build time (identical
  page weight/behavior to what static export would have produced for those
  pages);
- additionally evaluates `next.config.js` `redirects()` at Vercel's routing
  layer, producing real 3xx responses without executing any page code;
- serves a real Next.js `not-found` page with a real 404 status;
- keeps the door open, at zero migration cost, for any future page that
  legitimately needs request-time behavior — without a second migration.

No page in the initial migration fetches data from a network source or
database at request time; the single exception (§5, §17) reads only local,
already-bundled JSON to resolve a legacy URL, never an external source. No
Route Handler, database, or auth provider is introduced. This is explicitly
**not** being sold as, or built as, an SSR-heavy application — it is a
statically generated site with a thin, standards-compliant hosting layer
underneath it.

## 4. Route and redirect strategy

### 4.1 All 16 current aliases → permanent HTTP redirects

Recomputed directly from `src/App.tsx` by pairing every `<Route>` with a
`<Navigate>` element to its declared `path`, counting each distinct source
URL as its own entry (the previous draft of this spec undercounted this as
"14" in prose while its own table conflated two source URLs into one row —
both are corrected here to **16**, matching `src/App.tsx` exactly).

Implemented via `next.config.js`'s `redirects()` (evaluated by Vercel at the
edge/routing layer, before any page renders), each with `permanent: true`
(HTTP 308):

|   # | Source                               | Destination                                                                                                                                                                               |
| --: | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | `/contact`                           | `/government/contact`                                                                                                                                                                     |
|   2 | `/philippines/hotlines`              | `/government/hotlines`                                                                                                                                                                    |
|   3 | `/government/directory`              | `/government/offices`                                                                                                                                                                     |
|   4 | `/government/contacts`               | `/government/offices`                                                                                                                                                                     |
|   5 | `/government/departments`            | `/government/offices` _(preserved exactly — see §6.3: this is already a dedicated, literal redirect route in `src/App.tsx` today, not a fallthrough of the dynamic `[category]` pattern)_ |
|   6 | `/government/reports-and-statistics` | `/statistics`                                                                                                                                                                             |
|   7 | `/transparency/procurement`          | `/procurement`                                                                                                                                                                            |
|   8 | `/transparency/contracts`            | `/procurement/contracts`                                                                                                                                                                  |
|   9 | `/projects/data-sources`             | `/projects/sources`                                                                                                                                                                       |
|  10 | `/projects/dashboard`                | `/statistics/projects`                                                                                                                                                                    |
|  11 | `/statistics/population/barangays`   | `/statistics/population#barangays`                                                                                                                                                        |
|  12 | `/transparency/verification`         | `/transparency/methodology#verification`                                                                                                                                                  |
|  13 | `/transparency/limitations`          | `/transparency/methodology#limitations`                                                                                                                                                   |
|  14 | `/government/documents`              | `/transparency/documents`                                                                                                                                                                 |
|  15 | `/government/transparency-documents` | `/transparency/documents`                                                                                                                                                                 |
|  16 | `/transparency/archive`              | `/transparency/full-disclosure`                                                                                                                                                           |

Rows 14 and 15 are two separate `<Route>` elements in `src/App.tsx` sharing
the same destination — each is its own source URL and must become its own
`redirects()` entry (a single entry with two `source` values is not valid in
`next.config.js`).

Fragment-bearing destinations (`#barangays`, `#verification`, `#limitations`)
are preserved exactly as written — `redirects()` supports a `destination`
containing a hash, and this must be verified in Phase 6/7 against an actual
browser navigation (not just the HTTP response), since URL fragments are a
client-side scroll behavior, not a server-visible part of the request.

### 4.2 Removal of the Vite SPA catch-all rewrite

`vercel.json`'s `"/(.*)" → "/index.html"` rewrite is removed entirely as part
of the cutover. It is structurally incompatible with real per-route static
files and real 404s — keeping it would silently re-introduce the soft-404
problem this migration exists to fix.

### 4.3 No silent blank pages, no arbitrary catch-all swallowing invalid URLs

Every route family in this spec is **explicit and enumerable** (see §6).
No root-level `[...catchAll]` segment is introduced. Any URL that does not
match an explicit static or `generateStaticParams`-enumerated dynamic route
falls through to Next.js's native `app/not-found.tsx`, which is a real page
with a real 404 status — never a blank render, never a 200.

## 5. Service canonicalization

**Canonical service-detail URL**: `/services/{category}/{serviceSlug}`.

Evidence: `getServiceHref()` (`src/data/civic/services.ts`) already returns
exactly this category-qualified form, and all 7 internal call sites already
use it. The shorter `/services/{slug}` pattern has **zero current internal
usages** — it exists in `App.tsx` only as a second route pattern pointing at
the same `ServiceDetail` component, with no code today generating a link in
that shape.

**Verified dataset facts** (`src/data/generated/civic/services/services.json`
via `src/data/civic/services.ts`'s `getServices()`/`getServiceCategory()`,
inspected directly for this correction, not assumed):

- Exactly **16** published `PublishedServiceCategory` values (the routing
  categories derived by `getServiceCategory()` — distinct from the 10
  content-only categories in `src/data/services.yaml`, which back unrelated
  markdown listing pages and are not part of this route family).
- Exactly **177** published services (`record_count: 177`, `services.length
=== 177`).
- All 177 `slug` values are **globally unique**, including
  case-insensitively (`toLowerCase()` collision check performed against the
  full dataset: zero collisions).
- **No service slug equals any of the 16 category identifiers**, exactly or
  case-insensitively (checked directly against the full dataset: zero
  collisions).
- Conclusion: no ambiguous-slug case exists today. If a future data update
  ever introduced a service slug identical (or case-insensitively identical)
  to a category identifier, or a duplicate slug across services, the
  deterministic rule below applies without guessing — no such case exists to
  handle today.

**Routing requirement — single dynamic segment under `/services`, not two
sibling segments**:

Next.js treats `app/services/[category]/page.tsx` and
`app/services/[slug]/page.tsx` as **the same one-segment dynamic route**
regardless of parameter name — a directory structure with both is invalid
and must not appear in this spec. The corrected structure has exactly one
dynamic segment at that level:

- `/services/[category]/[serviceSlug]/page.tsx` is the one canonical,
  indexable service-detail route, generated via `generateStaticParams` over
  all 177 services keyed by their real `(category, slug)` pair. It must:
  - statically generate all 177 canonical `(category, serviceSlug)`
    combinations;
  - verify the requested service actually belongs to the requested
    `category` and call `notFound()` on any mismatch or unknown combination;
  - be the only service-detail URL format used in internal links,
    canonical `<link rel="canonical">` metadata, and `app/sitemap.ts` output.
- `/services/[category]/page.tsx` is a single **Server Component** that
  handles **every** one-segment URL under `/services` — both real category
  listings and legacy short service-slug URLs — by checking, in this order:
  1. **Category match**: if the `[category]` param matches one of the 16
     `PublishedServiceCategory` values, render the corresponding category
     listing page. These 16 values are statically generated via
     `generateStaticParams()`.
  2. **Legacy slug match**: otherwise, if the param matches one of the 177
     service slugs (looked up against the same synced dataset used for
     `generateStaticParams`, `src/data/generated/civic/services/services.json`),
     resolve that service's real category via `getServiceCategory()` and
     call `permanentRedirect('/services/{actualCategory}/{serviceSlug}')`
     from `next/navigation`, producing a real **HTTP 308**.
  3. **Neither**: call `notFound()` from `next/navigation`, producing a real
     **HTTP 404** via `app/not-found.tsx`. **It must never redirect an
     unknown value to `/services`** — silently rewriting a bad URL to a
     generic listing page would itself be a soft-404 (a wrong URL returning
     a "successful" redirect to unrelated content instead of failing
     honestly).
  - Category matching takes precedence over legacy-slug matching in every
    case — this is safe today because the verified dataset facts above
    confirm no slug collides with any category identifier, exactly or
    case-insensitively.
  - `dynamicParams` is **not** set to `false` on this route: values that are
    neither a category nor a known slug must still be evaluated at request
    time (step 3) rather than short-circuited to a build-time 404 before the
    legacy-slug check can run.
  - Only the 16 category values are included in `generateStaticParams`; the
    177 legacy slug values are **not** pre-built at this level (they are
    already statically generated at their canonical
    `[category]/[serviceSlug]` path). The lookup reads only the
    already-bundled, build-time-synced JSON already shipped in the app — no
    network call, no database, no external fetch — so the legacy-slug branch
    of this route is the **one narrow, explicitly justified exception** to
    "every page is static" in this migration (see §17), scoped to
    legacy-URL compatibility only.
- Result: **one canonical URL per service**, **zero duplicate indexable
  service pages**, **all 177 services remain reachable** (177 via the
  canonical path, plus the legacy short path continuing to resolve correctly
  — either redirecting to the right page or genuinely 404ing — rather than
  disappearing or silently misdirecting), **canonical `<link
rel="canonical">` metadata and `app/sitemap.ts` entries use only the
  category-qualified path** — the legacy short path is never listed in the
  sitemap, never self-canonicalizes, and never emits its own metadata (it
  always either redirects or renders the shared not-found page).

## 6. Document-route resolution

Four route families were inspected for actual content, actual navigation
linkage, and actual jurisdiction correctness. Findings are evidence-based,
not assumed.

### 6.1 `/:documentSlug` (root, one segment) — **remove**

`Document.tsx`'s effect immediately sets `error = 'No document specified'`
whenever `category` or `categoryType` is missing (`if (!documentSlug ||
!category || !categoryType) { setError(...); return; }`). The route
`<Route path="/:documentSlug" element={<Document />} />` supplies **only**
`documentSlug` via `useParams()` — `category` and `categoryType` are never
passed. **This route unconditionally renders the "Document Not Found" error
state for every possible input, today, in production code.** It has never
functioned as a live content route. No internal link targets it.

**Migration treatment**: do not port. Any URL this pattern would have matched
falls through to `app/not-found.tsx` (a real, correct 404 — strictly better
than today's always-error, non-noindexed behavior).

### 6.2 `/:lang/:documentSlug` (root, two segments) — **remove**

Identical defect: the route supplies `lang` and `documentSlug`, but
`Document.tsx` never reads a `lang` param and still receives no `category`/
`categoryType` — so this route **also unconditionally errors** for every
input. No internal link targets it. No real i18n routing depends on it
(§9 confirms i18next here is chrome-only, not route-driven).

**Migration treatment**: do not port. Falls through to `app/not-found.tsx`.

### 6.3 `/government/:category` — **remove as a dynamic pattern; `/government/departments` is already, and remains, its own explicit redirect**

Two separate things exist in `src/App.tsx` today and must not be conflated:

1. A **dedicated, literal** `<Route path="/government/departments"
element={<Navigate to="/government/offices" replace />} />` — an exact,
   static-path redirect, declared independently of any dynamic pattern.
2. A **separate, generic** `<Route path="/government/:category"
element={<Government />} />` — this dynamic pattern only ever matches a
   category value if no more specific literal route (like #1) already
   claimed that exact path. `Government.tsx` takes no route params at all and
   renders one fixed, static overview page regardless of the `:category`
   value actually supplied.

Because React Router (and, identically, the Next.js App Router) always
prefers a matching static/literal segment over a dynamic one, **`/government/
departments` is already redirected to `/government/offices` today by route
#1 — it never reaches route #2's `<Government/>` fallback.** The generic
`[category]` pattern is therefore only ever reachable for some _other_,
undeclared category value — and the one category this pattern was ever
authored to carry (`departments`) is backed by `content/government/
departments/`, whose content is demonstrably **wrong-jurisdiction placeholder
data** (see §6.4). `src/data/navigation.ts` contains no link to any
`/government/{category}` value the dynamic pattern would actually reach.

**Migration treatment**:

- **Preserve exactly**: `/government/departments` → `/government/offices`,
  as row 5 of the `redirects()` table in §4.1, at real HTTP 308 — this is
  not a new decision, it is the existing behavior in `src/App.tsx` carried
  forward unchanged.
- The generic dynamic `[category]` pattern (route #2 above) is **not**
  ported to Next.js — no `app/government/[category]/page.tsx` exists in the
  target structure (§11). Any `/government/{category}` value other than the
  literal `departments` redirect falls through to `app/not-found.tsx`.

### 6.4 `/government/:category/:documentSlug` — **remove; genuine 404**

This is the **only** route in the entire application that actually resolves
`content/government/departments/*` into rendered content. Inspection of that
content:

- `content/government/departments/executive.json`:
  `"GOVERNMENT_NAME": "Lapu Lapu City"`, `"MAYOR": "Ma. Cynthia K. Chan"`,
  `"VICE_MAYOR": "Celedonio B. Sitoy"` — **a different LGU entirely** (Lapu-Lapu
  City, Cebu), not San Fernando, Pampanga.
- `content/government/departments/legislative/index.yaml`: placeholder
  entries (`name: 'Councilor A'`, `description: 'Description'`) —
  unmistakably unfinished template scaffolding.
- `src/data/government.yaml`'s "Departments" subcategories list generic,
  non-existent-for-this-LGU entries ("Department of Education", "Department
  of Health", "Department of Transportation").
- The real, live `/government` overview (`Government.tsx`) imports
  exclusively from `../data/civic/governmentSummary` — the verified,
  San-Fernando-specific 44-entity civic dataset — and has no relationship to
  this YAML/content tree at all.

This confirms the content behind this route is starter-kit demo data for an
unrelated city, never adapted, and never linked into real navigation. It must
never be presented as BetterSanFernando content, in this migration or after.

**Migration treatment**: do not port, in any form (not even a redirect — there
is no correct destination for wrong-jurisdiction content). Any URL matching
this shape falls through to `app/not-found.tsx`. Per this task's explicit
instruction, **the underlying content and YAML files are left completely
unchanged and unpublished** — this spec makes a routing decision only.

### 6.5 Net effect

No genuinely used public document URL is lost. Every route removed above
either (a) has never rendered real content in production code, or (b) has
never been linked from real navigation and resolves only to verifiably
wrong-jurisdiction placeholder data. Real, verified content across services,
government offices, legislation, projects, finance, transparency, and
statistics is served entirely by its own explicit, already-real routes and is
unaffected by this section.

## 7. Garbage/waste-content resolution

`content/services/garbage-waste-disposal/` (4 markdown files + `index.yaml`,
wired into `src/data/yamlLoader.ts`'s `categoryIndexMap` and listed as a
category in the generic `src/data/services.yaml`) is:

- **Not one of the 16 approved Services categories** in
  `src/data/navigation.ts` or the real civic `services.ts` data layer.
- **Not referenced by any `<Route>` in `App.tsx`** — there is no
  `/services/garbage-waste-disposal` path declared anywhere.
- **Wrong-jurisdiction content**: every one of its four markdown files is
  explicitly about **Lapu-Lapu City** ("The City Government of Lapu-Lapu
  manages regular garbage collection through... CENRO", "mandatory in
  Lapu-Lapu City under Republic Act 9003..."), not San Fernando, Pampanga.
- Conceptually superseded by the real, verified **Environment** category
  (backed by the civic `services.ts` dataset: 1 reviewed CENRO Environment
  service, "Sale of Compost Fertilizer"), which _is_ one of the 16 approved
  categories with its own real route (`/services/environment`).

**Final determination**: **legacy, wrong-jurisdiction, orphaned starter-kit
content.** It requires no canonical route, must not be published under any
URL during this migration, and is not superseded-and-mergeable with
Environment (the two aren't verified-equivalent content; Environment simply
already occupies the real category slot this legacy content would have
conflicted with). Per this task's explicit instruction, the content and
`categoryIndexMap` wiring in `yamlLoader.ts` are **left unchanged** — this is
a routing/publication decision, not a content-deletion action.

## 8. Metadata and OG-image strategy

### 8.1 Verified current state

- `SEO.tsx` (react-helmet-async, 100% client-injected) sets `og:image`/
  `twitter:image` to `VITE_OG_IMAGE_URL`, defaulting to
  `${fullUrl}/og-image.jpg`.
- **No file exists at `public/og-image.jpg` or any equivalent path.**
- `public/og-image-template.html` is a **static, standalone HTML file**
  with hardcoded generic placeholder copy ("🏛️ Government", "Official
  Government Website", "Local Government Services") — never customized for
  BetterSanFernando.
- No image-generation dependency exists anywhere in `package.json`
  (no Puppeteer/Playwright/`@vercel/og`/`satori`/`sharp`), and no script in
  `scripts/` renders this template to an image. `scripts/setup-starter-kit.js`
  only writes the `VITE_OG_IMAGE_URL="${websiteUrl}/og-image.jpg"` env-var
  default during initial repo setup — it does not generate the file.
- **Conclusion: no verified production OG image exists today, and
  `og-image-template.html` does not automatically generate one.** Any
  claim otherwise would be false.
- Real, on-brand raster/vector assets do exist:
  `public/assets/brand/logos/{horizontal,stacked,badges}/*.png|svg` in
  blue/black/white variants.

### 8.2 Migration requirement

Specify **one stable, static default OG image** for the parity migration:

- Produce (as a one-time asset task, not a build step) a single 1200×630
  PNG — e.g. the existing horizontal blue-on-white lockup
  (`better-san-fernando-horizontal-blue-on-white.png`) composed onto a solid
  or gradient background matching the portal's primary color, saved as
  `public/og-default.png`.
- `metadataBase` + every route's `generateMetadata` fall back to this single
  static file when no page-specific image is supplied.
- This is a manual/one-time design asset, not a generated pipeline — it must
  not be described as automatic or dynamic.

### 8.3 Deferred (optional, future work)

Per-page dynamically generated OG images (e.g. via Next's `ImageResponse`/
`@vercel/og`, rendering a project or service's real title/summary onto a
templated image at build time) are **explicitly out of scope** for the parity
migration and remain optional future work, to be scoped separately once the
static default is live and verified.

## 9. Server/Client Component boundaries

Default: **Server Component.** `"use client"` is applied only where a file
genuinely needs interactivity or a browser API.

| Concern                                                                                                                                             | Files                                                                            | Treatment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navbar + mobile nav interactions (mega-menu open/close, pointer/keyboard handling, mobile accordion)                                                | `Navbar.tsx`                                                                     | Client Component — inherently stateful/interactive (hover-intent timers, `aria-expanded`, Escape handling, click-outside)                                                                                                                                                                                                                                                                                                                                                                                                                    |
| i18next UI chrome (nav labels, a handful of UI strings)                                                                                             | `src/i18n.ts` + a thin provider                                                  | Client Component boundary, unchanged behavior. `fil`/`pam` are near-empty stubs (15 and 7 lines) with real content only in `en`; all civic-content JSX across pages is hardcoded English, not `t()`-driven. No SSR-aware i18n integration is undertaken in this migration — there is no current translated content to gain SEO value from server-rendering                                                                                                                                                                                   |
| Nuqs filters (9 pages: Barangays, BidResults, Contracts, ExecutiveOrders, GovernmentBarangayContacts, Ordinances, Projects, ProjectSources, Search) | listed pages                                                                     | The interactive filter/pagination controls are Client Components using `nuqs/adapters/next/app`; the surrounding page shell (title, static intro copy) stays a Server Component where the split is practical                                                                                                                                                                                                                                                                                                                                 |
| MiniSearch (`src/data/civic/search.ts`)                                                                                                             | pure computation over already-parsed civic JSON, **zero browser API dependency** | Index construction can execute in a Server Component or plain module. Only the interactive search box + live results are a Client Component ("island") inside a Server Component `page.tsx` that owns `generateMetadata`                                                                                                                                                                                                                                                                                                                     |
| MapLibre GL + its worker                                                                                                                            | `BarangayProjectMap.tsx`                                                         | `next/dynamic(() => import(...), { ssr: false })` — the standard pattern for WebGL/canvas map libraries under Next.js. The `?url` worker import is replaced with Next's native `new URL('...', import.meta.url)` asset syntax (verified during implementation, not a design blocker)                                                                                                                                                                                                                                                         |
| Other browser APIs: `window.scrollTo`, `document.getElementById`, `MutationObserver` (scroll-to-hash)                                               | `ScrollToTop.tsx`                                                                | Client Component; re-implemented against `next/navigation`'s `usePathname`/`useSearchParams` in place of react-router's `useLocation`                                                                                                                                                                                                                                                                                                                                                                                                        |
| `window.innerWidth` + resize listener (table/card toggle)                                                                                           | `TableWithToggle.tsx`                                                            | Client Component                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Static civic-data pages (the large majority: all legislation, transparency, statistics, most detail pages)                                          | ~30+ page files                                                                  | Server Components — read already-synced, already-validated civic JSON at build/request-nothing time and render plain JSX                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Dynamic detail pages (project, service, office)                                                                                                     | `ProjectDetail.tsx`, `ServiceDetail.tsx`, `GovernmentOfficeDetail.tsx`           | Server Components, statically generated via `generateStaticParams`; no client-side data fetching                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Category listing + legacy service-slug lookup (§5)                                                                                                  | `app/services/[category]/page.tsx`                                               | Server Component. The 16 real categories are statically generated via `generateStaticParams()`; any other value falls through, at request time, to a lookup against the already-bundled synced dataset that calls `permanentRedirect()` (known legacy slug) or `notFound()` (unknown value) from `next/navigation`. This request-time fallback is the one deliberate per-request lookup in the migration — reading only local, already-synced JSON, never a network call or database — scoped narrowly to legacy-URL compatibility (see §17) |

No blanket "convert everything to Client Components" approach is used or
recommended.

## 10. Data pipeline preservation

Unchanged, end to end:

```
bettersanfernando-data → scripts/generate-exports.js → exports/v0.1.0/*.json
  (22 datasets + manifest.json, checksummed)
→ pnpm data:sync (checksum-verified copy)
→ src/data/generated/civic/*.json
→ Zod .strict() parsing in src/data/civic/*.ts (throws loudly on drift)
→ pages (via generateStaticParams / direct import, at build time)
```

Explicit requirements, unchanged by this migration:

- All **22 datasets** and their manifest-driven checksum validation
  (`scripts/sync-civic-data.mjs`) — pure Node, framework-agnostic, unaffected
  by Next.js.
- **Strict Zod schemas** and the **public-data boundary checker**
  (`scripts/check-no-private-data.mjs`, which recursively scans all 22
  manifest-registered datasets) — run identically regardless of the
  downstream framework.
- **Canonical IDs** (project `id`, service `(category, slug)`, office
  `office_id`, legislation `id`, finance `report_id`, barangay `psgc_code`)
  are exactly what feeds `generateStaticParams`.
- Cross-dataset reference integrity checks (e.g. evidence→project,
  observation→report) that currently throw at module-evaluation time now
  throw at **Next.js build time** inside `generateStaticParams`/Server
  Components — a strict improvement (a broken reference fails the build
  loudly, before deploy, rather than only being caught by a separate smoke
  run).
- **No direct frontend access to private research files** — the frontend
  only ever reads the synced copy in `src/data/generated/civic/`, enforced by
  the already-hardened `check-no-private-data.mjs`, unaffected by framework.
- **No new backend or database.** Every "dynamic" route in this app is fully
  determined by a small, versioned, already-synced JSON export at build time
  — the textbook static-generation case, not a runtime-database case.

The **only** adaptation required, confined entirely to _how_ the frontend
imports its own already-synced files:

- 18 files using `with { type: 'json' }` import-attribute syntax drop that
  clause (Next's bundler resolves native JSON imports without it).
- `src/data/civic/geography.ts`'s 2 `?raw` `.geojson` imports become
  `fs.readFileSync(...) + JSON.parse(...)` calls at module/build time.

**The data repository and its export format require zero changes.**

## 11. Target App Router structure

```
app/
  layout.tsx                              (Server: <html>/<body>, Navbar, Footer;
                                            thin Client provider for i18next + NuqsAdapter)
  page.tsx                                (/)
  about/page.tsx
  search/page.tsx                         (Server shell + generateMetadata; Client search island)
  not-found.tsx                           (real 404, noindex — see §4.3, §6)

  services/
    page.tsx
    [category]/page.tsx                   (single dynamic segment, not split into sibling
                                            [category]/[slug] folders — Next.js treats those as
                                            the same route regardless of param name. Handles both
                                            of the following, in order: (1) 16 real categories,
                                            statically generated via generateStaticParams; (2)
                                            any other value checked at request time against the
                                            177 legacy service slugs -> permanentRedirect() 308 to
                                            the canonical [category]/[serviceSlug] URL, or
                                            notFound() -> real 404 if neither matches; see §5)
    [category]/[serviceSlug]/page.tsx     (canonical; generateStaticParams over 177 services)

  government/
    page.tsx
    offices/page.tsx
    offices/[officeId]/page.tsx           (generateStaticParams over 44 offices)
    contact/page.tsx
    hotlines/page.tsx
    barangay-contacts/page.tsx
    links/page.tsx
                                           (NOTE: no [category] or [category]/[documentSlug]
                                            dynamic segment — see §6.3/§6.4; /government/departments
                                            is a redirects() entry, not a route folder)

  projects/
    page.tsx
    sources/page.tsx
    methodology/page.tsx
    map/page.tsx                          (renders the ssr:false map island)
    [projectId]/page.tsx                  (generateStaticParams over 324 projects)

  procurement/
    page.tsx
    bid-results/page.tsx
    contracts/page.tsx

  statistics/ (9 static subfolders: projects, procurement, project-spending,
               population, demographics, government, legislation,
               public-records, city-profile)

  legislation/ (page.tsx + executive-orders, ordinances, resolutions)

  transparency/ (page.tsx + sources, methodology, documents, full-disclosure,
                 finance)

  barangays/page.tsx

  sitemap.ts
  robots.ts
```

No root-level `[documentSlug]` or `[lang]/[documentSlug]` segment exists in
this structure (§6.1–6.2).

## 12. Migration batches and commit boundaries

Branch: **`feat/nextjs-migration`**, isolated within the existing repository
(not a new repo). Each batch below is a reviewable, independently
committable unit. No batch includes visual-redesign changes.

### Batch 1 — Next.js foundation and configuration

- **Scope**: scaffold `next.config.js` (no `output: 'export'`), port
  Tailwind/ESLint/Prettier/TypeScript config, stub the shared civic-data
  lookup helper the legacy service-slug route will use (§5). The production
  domain and `metadataBase` value are **not required for this batch** — they
  are only needed starting in Batch 6 (see §18).
- **Dependencies**: none.
- **Risk**: low.
- **Validation**: `next build` succeeds on an empty shell; `tsc --noEmit`
  clean.
- **Stop condition**: any Next.js config incompatibility with a hard
  requirement (none currently identified).
- **Suggested commit message**: `feat(migration): scaffold Next.js App Router foundation`

### Batch 2 — Root layout, providers, navigation, shared components

- **Scope**: `app/layout.tsx`, `Navbar.tsx`, `Footer.tsx`, `ScrollToTop`,
  `EmergencyStrip`, `CivicUtilityBar`, breadcrumbs, i18next + `NuqsAdapter`
  provider boundary.
- **Dependencies**: Batch 1.
- **Risk**: medium (mega-menu/keyboard/mobile-accordion fidelity).
- **Validation**: shared shell renders identically (structure and
  interaction) to the current Vite build on a placeholder route.
- **Stop condition**: any regression in mega-menu open/close, Escape,
  click-outside, or mobile accordion behavior.
- **Suggested commit message**: `feat(migration): port root layout, navigation, and shared components`

### Batch 3 — Static routes

- **Scope**: all 58 static literal-path pages.
- **Dependencies**: Batch 2.
- **Risk**: medium (volume, mostly mechanical react-router → next/navigation
  swap).
- **Validation**: route-by-route content/metadata diff against current Vite
  build.
- **Stop condition**: a page blocked by a Vite-only import (`?raw`, `with
{type:'json'}`) is isolated and fixed, not allowed to block the whole
  batch.
- **Suggested commit message**: `feat(migration): port static routes to App Router`

### Batch 4 — Dynamic projects, services, offices, and document routes

- **Scope**: `[projectId]`, `[category]/[serviceSlug]`, `offices/[officeId]`,
  the `[category]` route's legacy-slug fallback branch (category match takes
  precedence, then permanentRedirect/notFound for legacy slugs, §5), plus
  removal of the government `[category]`/`[category]/[documentSlug]`
  patterns per §6.
- **Dependencies**: Batch 3.
- **Risk**: high (three large `generateStaticParams` families + the
  route-removal decisions in §6/§7 must be applied correctly).
- **Validation**: generated static page counts match exactly — 324 / 177 / 44;
  `/government/departments` resolves via `redirects()` to
  `/government/offices` (§6.3), not a route; a sample of known
  `/services/{slug}` values 308-redirects to the canonical category-qualified
  URL and a sample of unknown slugs returns a genuine 404 (never a redirect
  to `/services`); `/:documentSlug`, `/:lang/:documentSlug`,
  `/government/[category]`, `/government/[category]/[documentSlug]` all
  produce genuine 404s.
- **Stop condition**: any canonical ID fails to produce a page (missing
  param) — parity-breaking, must fix before Batch 5.
- **Suggested commit message**: `feat(migration): generate dynamic project, service, and office routes`

### Batch 5 — Search, filters, MapLibre, and other client islands

- **Scope**: `BarangayProjectMap` (`ssr:false` dynamic import), `/search`
  Server shell + Client island, the 9 nuqs pages, `TableWithToggle`.
- **Dependencies**: Batch 4.
- **Risk**: high (maplibre-gl worker-loading under Next's bundler is the
  single largest unresolved technical spike).
- **Validation**: map renders/interacts identically; search returns
  identical results for a fixed query set; every filter/pagination URL still
  round-trips through the address bar.
- **Stop condition**: maplibre-gl fails to load under Next's asset pipeline —
  isolate as a spike before the rest of the batch proceeds.
- **Suggested commit message**: `feat(migration): port search, filters, and MapLibre client islands`

### Batch 6 — Redirects, not-found, metadata, sitemap, robots, JSON-LD

- **Scope**: all 16 `redirects()` entries (§4.1), `app/not-found.tsx`,
  **finalizing the real production domain and `metadataBase`** (the one
  piece of information this batch newly requires that earlier batches did
  not — see §18), `generateMetadata` on every route (canonical URLs,
  OG/Twitter tags using the default OG image from §8, query-string
  canonicalization for the 9 filter/pagination pages), `app/sitemap.ts`,
  `app/robots.ts`, `BreadcrumbList` JSON-LD where breadcrumbs already exist.
- **Dependencies**: Batches 3–5 (every route must exist before it can be
  enumerated in the sitemap or redirect table); the confirmed production
  domain (§18, blocker 1).
- **Risk**: medium-high (correctness-critical; must match §4/§5/§6 exactly).
- **Validation**: sitemap entry count matches the route inventory; every
  redirect returns a real 301/308 (including the 3 fragment-bearing ones,
  verified in-browser) against a `next build && next start`-style preview;
  `not-found`-triggering URLs return real 404 + `noindex`.
- **Stop condition**: any redirect destination mismatches its specified
  target in §4.1/§5 — must match exactly, no substitutions.
- **Suggested commit message**: `feat(migration): implement redirects, not-found, metadata, sitemap, and robots`

### Batch 7 — Smoke-test adaptation and full route/data parity

- **Scope**: port the existing `scripts/smoke-*.ts` suite (30+ scripts) to
  read from the Next.js build/route table instead of `App.tsx`'s JSX; full
  manual + automated parity sweep across all ~600+ generated pages.
- **Dependencies**: Batches 1–6.
- **Risk**: high (volume of smoke tests to adapt; this is the phase that
  catches anything earlier phases missed).
- **Validation**: 100% of ported smoke tests pass; `pnpm data:validate`,
  `pnpm data:smoke`, `pnpm check:public-data-boundary` all pass unchanged;
  `tsc --noEmit`, `eslint`, `next build` all clean.
- **Stop condition**: any parity mismatch found here blocks Batch 8 until
  resolved.
- **Suggested commit message**: `test(migration): adapt smoke suite and verify full route/data parity`

### Batch 8 — Vercel preview deployment and production readiness

- **Scope**: connect the branch to a Vercel preview deployment; verify
  redirects/404s/metadata against the **real** Vercel routing layer (not just
  local preview); confirm the hosting question is fully resolved (real
  domain, real `.env`) before any production cutover; document the rollback
  step (revert the production alias to the current Vite deployment).
- **Dependencies**: Batch 7 passing completely.
- **Risk**: medium (production-only discrepancies between local preview and
  Vercel's actual routing layer are possible and must be checked explicitly).
- **Validation**: production-equivalent smoke test against the live preview
  URL; redirect/404 checks against real HTTP responses.
- **Stop condition**: any preview-only discrepancy — resolve before
  requesting a production cutover; do not cut over with open discrepancies.
- **Suggested commit message**: `chore(migration): verify Vercel preview deployment and rollback plan`

Batches 9 (later visual redesign) and 10 (final SEO/performance
optimization) from the original audit remain explicitly **out of scope** for
this branch and are not numbered as commit batches here — they begin only
after Batch 8 is verified stable in production.

## 13. Risk matrix

| Risk                                                                                                                                                                                            | Likelihood                                                        | Impact                                                                   | Mitigation                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| maplibre-gl SSR/worker-loading incompatibility under Next's bundler                                                                                                                             | Medium                                                            | Medium (map page only)                                                   | Dedicated spike in Batch 5 before the rest of that batch proceeds                                                                                                                                          |
| A `services/[slug]` folder is added as a sibling of `services/[category]`, creating two dynamic segments at the same position (Next.js treats these as the same route regardless of param name) | Low (explicitly corrected and specified as one route in §5/§11)   | High (build-time route conflict)                                         | Spec mandates exactly one dynamic segment under `/services` (`[category]/page.tsx`, handling both category and legacy-slug cases); code review checks no sibling `[slug]`/`[segment]` folder is introduced |
| The `[category]` route's legacy-slug fallback (§5) drifts from the canonical `generateStaticParams` list                                                                                        | Low (both read the same synced `services.json`)                   | Medium (a known slug wrongly 404s, or an unknown slug wrongly redirects) | The lookup helper and `generateStaticParams` both read the same synced `services.json` file directly — no separate hand-maintained list exists to drift                                                    |
| An unknown `/services/{value}` is accidentally redirected to `/services` instead of 404ing (reintroducing a soft-404)                                                                           | Low (explicitly specified in §5)                                  | Medium                                                                   | Batch 4/7 validation explicitly tests an unknown slug and asserts a real 404, not a redirect                                                                                                               |
| A future data update introduces a service slug that collides (exactly or case-insensitively) with a category identifier, or a duplicate slug across services                                    | Low (verified zero collisions today — §5)                         | Medium (ambiguous routing outcome)                                       | Category matching always takes precedence per §5's deterministic rule; `pnpm data:validate`'s Zod uniqueness check (`src/data/civic/services.ts`) already fails the build on duplicate `slug`/`id` values  |
| Smoke-test suite porting effort underestimated                                                                                                                                                  | Medium                                                            | Medium (slows Batch 7)                                                   | Budget real time; treat as first-class migration work                                                                                                                                                      |
| Vercel's actual routing behavior for `redirects()`/fragment destinations differs from local `next build` preview                                                                                | Low-Medium                                                        | Medium                                                                   | Explicit Batch 8 verification against the real preview deployment, not just local                                                                                                                          |
| A currently-undiscovered internal link to one of the removed routes (§6) exists outside `src/` (e.g. in `content/` markdown prose)                                                              | Low (repo-wide search already performed and found none in `src/`) | Low-Medium                                                               | Re-run the same link search against `content/**/*.md` during Batch 4 as a final check                                                                                                                      |
| OG default image asset (§8.2) is treated as "good enough" indefinitely instead of revisited                                                                                                     | Low                                                               | Low                                                                      | Explicitly logged as deferred, not silently dropped (§16)                                                                                                                                                  |

## 14. Validation and acceptance checklist

- [ ] All current canonical routes preserved (66 real routes, minus the 4
      route _families_ explicitly resolved in §6, whose removal is justified
      by verified evidence, not convenience).
- [ ] All 16 aliases (§4.1, recomputed directly from `src/App.tsx`) preserved
      as real HTTP redirects (308), including the 3 fragment-bearing
      destinations, verified in-browser.
- [ ] `/services/[category]` is a single route (no sibling `[slug]`/
      `[segment]` folder at the same position) whose category match always
      takes precedence over its legacy-slug fallback.
- [ ] All 16 real service categories render via `/services/{category}` and
      are statically generated via `generateStaticParams`.
- [ ] Every known legacy `/services/{slug}` (all 177) redirects (308) to its
      category-qualified canonical URL; every unknown `/services/{value}`
      returns a genuine HTTP 404 via `notFound()` — **never** a redirect to
      `/services`.
- [ ] `/government/departments` redirects (308) to `/government/offices`
      (preserved exactly from current `src/App.tsx` behavior — see §6.3).
- [ ] All 324 project pages generated via `generateStaticParams`.
- [ ] All 177 canonical service pages generated via `generateStaticParams`.
- [ ] All 44 office pages generated via `generateStaticParams`.
- [ ] All verified, real document routes (content-genuinely-used) generated;
      no wrong-jurisdiction or unlinked legacy content published under any
      URL.
- [ ] All 22 datasets synchronized and validated (`pnpm data:sync`,
      `pnpm data:validate` both pass unchanged).
- [ ] Protected dataset counts unchanged (324 projects / 563 evidence / 298
      cost-utilization / 177 services / 10 full disclosure / 9 official
      documents / 13 EO / 11 ordinances / 2 resolutions / 53 finance reports
      / 121 finance observations / 136 demographic / 44 government entities
      / 0 planned routes).
- [ ] No private-data leakage (`pnpm check:public-data-boundary` passes
      unchanged).
- [ ] Filters (9 nuqs pages), search, navigation (desktop mega-menu + mobile
      accordion), MapLibre map, and pagination all function identically to
      the current Vite build.
- [ ] Correct, unique canonical metadata on every indexable route — no
      fallback-to-root canonical.
- [ ] `app/sitemap.ts` output is valid and its entry count matches the final
      route inventory; `app/robots.ts` correctly allows the indexable
      surface.
- [ ] Genuine HTTP 404 (with `noindex`) for the routes resolved as
      not-found in §6, and for any other unmatched URL.
- [ ] `tsc --noEmit`, `eslint`, `next build`, `pnpm data:validate`,
      `pnpm check:public-data-boundary`, and the full adapted smoke suite all
      pass.
- [ ] Vercel preview deployment verified (real redirects, real 404s, real
      metadata) before any production deployment.
- [ ] No visual-redesign changes present in the migration diff.

## 15. Deployment approach

Standard Vercel-native Next.js deployment (no `output: 'export'`, no custom
static-export hosting workaround): connect `feat/nextjs-migration` to a
Vercel preview environment (Batch 8), verify the full checklist in §14
against that real preview URL, then promote to production via Vercel's
normal branch-promotion flow. Rollback is a Vercel alias revert to the
current (Vite) production deployment — no DNS change is required if both
deployments live under Vercel, which further reduces cutover risk versus a
cross-host migration.

## 16. Deferred visual redesign and optional improvements

Explicitly deferred, not part of this migration:

- The later visual redesign (Batch 9 in the original audit's numbering) —
  begins only after production parity is verified.
- Full SSR-aware i18n (e.g. `next-intl`) — no current translated content
  exists to gain SEO value from; revisit only if `fil`/`pam` content is ever
  actually completed.
- Per-page dynamically generated OG images (§8.3).
- Removing the unused `meilisearch` npm dependency (dead code, unrelated to
  migration correctness).
- `next/image` adoption, font-loading strategy tuning, and other Core Web
  Vitals work (original audit's Batch 10).
- Addressing the pre-existing oversized JS chunks already flagged by Vite's
  own build output (`BarangayProjectMap`, `projects`, `services` bundles) —
  unrelated to this migration, may naturally improve under Next's code
  splitting but is not a migration goal in itself.

## 17. Explicit non-goals

- This migration does **not** introduce a backend, database, or
  authentication layer.
- This migration does **not** introduce Incremental Static Regeneration, a
  network call, or a database read at request time. The single exception is
  the legacy-slug fallback branch of `/services/[category]` (§5), which
  performs a per-request lookup against the already-bundled, build-time-
  synced JSON (never a network call, never a database) so it can correctly
  distinguish a real redirect from a genuine 404 — a case this task's own
  correction explicitly requires and justifies. No other requirement
  justifies any further request-time behavior.
- This migration does **not** change the data repository, its export format,
  its checksums, or its canonical IDs in any way.
- This migration does **not** publish, delete, or modify the wrong-
  jurisdiction/orphaned content identified in §6/§7 — it only decides how
  routing treats it (not-found or redirect, never a live page).
- This migration does **not** claim an automated OG-image pipeline exists —
  §8 is explicit that none does today.
- This migration does **not** combine visual-redesign work into any batch in
  §12.

## 18. Remaining blockers

1. **Production hosting details are still unconfirmed** — the real Vercel
   project (if any already exists), the real production domain, and the real
   `.env`/`VITE_WEBSITE_URL` value are not visible from this repository
   checkout. **This does not block Batch 1** (foundation/config work needs no
   domain) **or any batch through Batch 5** (no page needs `metadataBase`
   until metadata is actually written). It **must be finalized before Batch 6
   completes** (`generateMetadata`, `metadataBase`, and `app/sitemap.ts`'s
   absolute URLs all depend on the real production domain) **and before
   Batch 8** (the Vercel preview/production deployment itself needs the real
   domain and `.env` values). The site is confirmed not yet deployed; Vercel
   is the approved target once these values exist.
2. **The exact implementation mechanism for the legacy-slug fallback branch
   of `/services/[category]` (§5)** — a single-route Server Component that
   checks category match first, then reads the synced `services.json`
   directly for a legacy-slug match, calling `permanentRedirect()`/
   `notFound()` from `next/navigation` — is now specified at the design
   level in this document, including the verified dataset facts (16
   categories, 177 services, no slug/category collisions) that make
   category-first precedence safe. The only remaining detail is where the
   shared lookup helper function lives in the codebase (e.g. alongside the
   existing `getServiceHref()`/`getServiceCategory()` in
   `src/data/civic/services.ts`), which is a Batch 1/4 implementation choice,
   not a blocker to approving this spec.
3. **A final content-search pass across `content/**/*.md`** (not just
   `src/`) for any stray internal link to the routes removed in §6 is
   recommended as a Batch 4 validation step, per the risk matrix (§13), out
   of an abundance of caution beyond the `src/`-scoped search already
   performed for this specification.

No blocker above prevents approving this specification; all three are
implementation-phase action items.
