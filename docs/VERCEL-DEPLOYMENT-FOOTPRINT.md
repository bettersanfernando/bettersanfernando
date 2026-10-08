# Vercel deployment footprint

## Ignored Build Step

In Vercel Project Settings → Git → Ignored Build Step, configure:

```sh
node scripts/vercel-ignore-build.mjs
```

Vercel interprets **0 as skip** and **1 as build**. Run this directly, without
inverting its exit status or wrapping it in a command that swallows failures.
No package installation is needed to run the helper.

The helper compares `VERCEL_GIT_PREVIOUS_SHA` with `VERCEL_GIT_COMMIT_SHA`
(or the checkout's `HEAD` when the latter is absent). It skips only a nonempty
diff consisting entirely of `docs/` files or these explicit root files:
`AGENTS.md`, `CHANGELOG.md`, `CLAUDE.md`, `CODE_OF_CONDUCT.md`,
`CONTRIBUTING.md`, `LICENSE`, `PROVENANCE.md`, `README.md`, `SECURITY.md`.
These are documentation, not current application inputs. If runtime content
ever moves into these paths, remove those paths from the allowlist first.

All other paths build, including `src/`, `public/` (including translations),
generated civic data, dependencies and lockfiles, Next configuration, build
scripts, CI configuration, and unknown files. Markdown outside the allowlist
also builds. Rename detection is disabled so both the removed and added paths
are checked. A runtime file renamed into `docs/` still builds.

Missing or unavailable commits, Git failures, and empty diffs build. There is
no `HEAD^` fallback: a documentation-only newest commit must not hide runtime
changes in earlier commits since the previous deployment. First deployments,
shallow checkouts without the previous commit, and deployments without Vercel's
Git variables therefore build conservatively. Changes to dashboard environment
variables or settings are not visible to Git; bypass the ignored step when
redeploying a documentation-only commit to apply such changes.

Tests: `node --test scripts/vercel-ignore-build.test.mjs`.

## Audit scope and measurement method

Measured on 2026-10-08 using the installed Next.js **16.3.5**, Turbopack,
Node **24.16.0**, baseline commit `cb040e7`, and the vendored public-safe civic export. The working tree
was clean before implementation. Both comparison builds started with `.next`
removed, used the same local environment, and ran the repository's `pnpm build`
(through `corepack pnpm` because a standalone pnpm command was unavailable).

These are **local filesystem sizes**, not Vercel billed storage or a Vercel
Build Output API package. Vercel settings, deployments, retention, compression,
and packaging were not inspected or changed. The reported 8.26 GB and roughly
49 functions at 2.29 MB are supplied dashboard observations. The audit does
not establish a live billing reduction.

Measurements sum file lengths recursively. App route trace sizes resolve
each `.next/server/app/**/*.nft.json` file relative to its directory and sum
the referenced files. The unique trace union counts shared files once; the
per-route sum counts them again for every route. The latter estimates repeated
function inputs, not actual Vercel deduplication or compression. Trace files
also exist for static routes; their presence alone does not mean deployment
as a function. Prerender manifests determine which routes need runtime output.

| Local output / candidate runtime inputs        | Before (bytes) | After (bytes) |
| ---------------------------------------------- | -------------: | ------------: |
| Entire `.next`                                 |    181,192,248 |   181,210,879 |
| `.next/cache` (build cache)                    |    124,055,307 |   124,071,454 |
| `.next` excluding cache, plus `public/`        |     62,565,485 |    62,567,969 |
| `.next/server`                                 |     46,774,307 |    46,775,921 |
| Server source maps                             |     32,749,754 |    32,749,819 |
| `.next/static`                                 |      9,155,856 |     9,155,856 |
| `public/`, including copied map worker files   |      5,428,544 |     5,428,544 |
| Unique files referenced by all 53 app traces   |     13,853,697 |    13,853,724 |
| All app traces summed, including static routes |    198,273,793 |   198,273,820 |
| Dynamic app route traces summed                |    185,350,151 |   183,644,172 |
| Candidate dynamic app route entries            |             47 |            46 |
| Entries in prerender manifest                  |              6 |             7 |

The small increase in local build output is expected: static output is added,
and Next still emits build-side route code and traces for `/llms.txt`. Excluding
that route from candidate runtime inputs saves **1,705,979 bytes (1.63 MiB)**
in the per-route trace sum. The exact Vercel function/storage saving must be
confirmed in a subsequent deployment. Proxy is separate from these app counts.

### Largest output and duplication findings

- Build cache dominates: 118.31 MiB, principally Turbopack `.sst` files
  (the four largest are approximately 22–24 MiB each). This is not the same
  as deployed function/static storage; deleting build cache is not a fix for
  retained deployment storage.
- `.next/server/chunks` is 43,910,259 bytes before the change. Server source
  maps account for 31.23 MiB of the total server output. No app route trace
  references a `.map` file, so suppressing them would not demonstrate a
  function saving here.
- The largest non-cache files are server source maps: a 5,356,116-byte proxy
  chunk map and two 2,443,267-byte civic-project chunk maps. Their corresponding
  JavaScript is 1,902,848 bytes and roughly 903 KB per project chunk.
- Civic projects and services appear in separate compiled contexts. Project
  chunks are about 903 KB each and service chunks about 589 KB each. Zod has
  two approximately 375 KB compiled chunks. Multiple route traces reuse these
  same physical chunks; the Next runtime is referenced by all 53 app traces.
  This explains why function input totals exceed unique local server files.
  Raw civic JSON is compiled into bundles rather than being separately copied
  into every route directory. No additional data export or access path was added.
- Filipino page dictionaries share a 129,653-byte server chunk referenced by
  46 page traces. Common EN/FIL resources are also bundled for client hydration,
  while their public JSON URLs remain available. These are different uses of
  the localization resources, not 46 physical copies in `.next`.
- MapLibre emits **3,417,421 bytes** of `.mjs` media assets, including
  development main/shared/worker files totaling **2,341,119 bytes**, as well as
  production files. Turbopack's handling of MapLibre's `import.meta.url` and
  calculated worker URL brings these files into the asset graph. The application
  also intentionally copies production worker/shared files into `public/`
  (18,592 and 489,575 bytes) to preserve working worker imports. This is a real
  duplication opportunity, but safely changing the worker/bundler integration
  needs map runtime validation and a separately measured experiment.
- Largest public assets include two 769,538-byte logo PNGs, the 654,712-byte
  OG image, a 605,652-byte cropped logo, the 590,540-byte skyline illustration,
  and the 537,555-byte brand SVG. Public URLs and visual assets were preserved.

## Why HTML routes are functions

`src/proxy.ts` derives the locale from the public pathname, injects
`x-bsf-locale`, and rewrites `/fil/...` to the equivalent unprefixed route.
`src/i18n/server.ts` reads that header with `headers()`. The root layout,
root metadata, and page translation helpers depend on it.

The installed Next documentation identifies `headers()` as a request-time API
that opts a route into dynamic rendering. With the current configuration,
the root dependency makes every HTML route dynamic. `generateStaticParams()`
on project, office, service-category, and service-detail routes still enumerates
paths, but cannot make the header-dependent rendering static. The build's
“Generating static pages (578/578)” counter includes attempted paths that
bailed out; it does not prove those pages were prerendered.

Baseline classification was `ƒ` for all HTML route families, `/_not-found`,
and `/llms.txt`, with `○` for `/apple-icon.png`, `/icon.png`, `/robots.txt`,
and `/sitemap.xml`. The prerender manifest also contains `/favicon.ico` and
`/_global-error`, which the printed route table omits. Afterward, only
`/llms.txt` changes from `ƒ` to `○`; Proxy remains runtime code.

All 41 literal HTML routes and four parameterized HTML route families remain
dynamic, plus `/_not-found`. Nine pages explicitly require request query state:

- `/search`
- `/projects/city-projects`
- `/projects/sources`
- `/barangays`
- `/procurement/bid-results`
- `/procurement/contracts`
- `/legislation/executive-orders`
- `/legislation/ordinances`
- `/government/barangay-contacts`

These nine `force-dynamic` pages are justified by server-rendered query/search
parameters. The remaining HTML pages are dynamic because of locale lookup,
not because their civic content necessarily needs request-time rendering.
English and Filipino URLs share the same route implementations; they do not
currently require separate functions per locale or per civic record.

## Static-rendering recovery: measured tradeoff and recommendation

The export has 581 canonical HTML paths per locale, including `/search`:
41 literal pages and 540 civic paths (303 projects, 177 services, 44 offices,
16 service categories). Excluding nine query-driven pages gives **572 × 2 =
1,144** potential prerendered localized pages.

Before implementation, a local production server was queried for **every one
of those 1,144 URLs**, first as HTML and then with the `RSC: 1` request header.
Every response returned 200, and every RSC response had `text/x-component`.
Sizes are decoded response bodies, before HTTP compression:

| Potential static family, both locales | Pages |  HTML bytes |  RSC bytes |
| ------------------------------------- | ----: | ----------: | ---------: |
| Literal pages excluding query routes  |    64 |  14,471,861 |  4,969,241 |
| Service categories                    |    32 |   5,124,458 |  1,072,639 |
| Service details                       |   354 |  61,262,425 | 18,275,871 |
| Project details                       |   606 |  97,266,206 | 24,659,677 |
| Office details                        |    88 |  11,780,543 |  2,353,404 |
| Total                                 | 1,144 | 189,905,493 | 51,330,832 |

Combined bodies are **241,236,325 bytes (230.06 MiB)**. Gzipping each measured
HTML/RSC response separately totals **32,744,145 bytes (31.23 MiB)**, but that
is a transfer/compressibility measure, not a Vercel storage prediction. A real
prerender build would have different serialization plus metadata and possibly
segment-prefetch files. Remaining dynamic pages, fallback routes, Proxy, and
static client/public assets would still be needed. This is an estimate from
measured responses, not a completed static conversion build.

The measured potential uncompressed page output exceeds the current summed
dynamic route traces (176.76 MiB), while Vercel's actual packaging/compression
is unknown. Static recovery could improve latency and runtime usage, but
there is insufficient evidence that it reduces deployment storage. No broad
locale/router rewrite was performed.

The smallest coherent future architecture, following the installed Next 16
internationalization and `next/root-params` guides, would be:

1. Put the HTML route tree and its root layout under `app/[locale]` and
   enumerate `{ locale: 'en' }` and `{ locale: 'fil' }` in the root layout's
   `generateStaticParams()`. Keep discovery route handlers outside the tree.
2. Replace the shared header-based `getLocale()` with the generated `locale`
   getter from `next/root-params`. This avoids passing locale through every
   deeply nested translator and supports metadata and `<html lang>` at build
   time. Reject unsupported locale values.
3. Rewrite unprefixed English requests internally to `/en/...`; serve Filipino
   through `/fil/...`. Preserve the public English URL, canonical URLs,
   query strings, existing localized links, and full-navigation language switch.
   Define direct `/en/...` URL handling to avoid exposing duplicate canonicals.
4. Preserve query-driven rendering, legacy redirects, unknown-ID 404s,
   legacy service slug dispatch, and root/not-found localization. Update
   filesystem-sensitive smoke tests and verify both locales over HTTP.
5. Compare an isolated production/Vercel-output build before adoption. Consider
   selected low-cardinality pages rather than automatically prerendering every
   detail page if storage remains the primary constraint.

Moving the entire route tree, updating imports/tests, and handling special
routes is a substantial migration, even with root parameter getters. Simply
adding `force-static` to today's layout is unsafe: Next supplies empty headers,
which would silently render Filipino requests with English language/metadata.
Request-global locale mutation or a React cache setter is not a safe substitute
for route parameters, since layouts/pages can render concurrently.

## Implemented changes and validation

- Conservative ignored-build helper plus CLI tests prevents future
  documentation-only builds when Vercel supplies a usable commit baseline.
- Constant `/llms.txt` GET output is explicitly prerendered. Both unprefixed
  and `/fil/llms.txt` GET/HEAD retain their original body, status, and content type.
- No HTML route, civic-data accessor/export, locale behavior, search state,
  redirect, public asset, dependency, or Next configuration changed.

Passed: `pnpm lint`, `pnpm build`, `pnpm next-shell:smoke`, `pnpm nav:smoke`,
`pnpm page-localization:smoke`, `pnpm batch4-dynamic-routes:smoke`,
`pnpm batch6-seo:smoke`, `pnpm batch7-parity:smoke`, 18 helper tests, and
`git diff --check`. Lint reported three existing warnings in nested worktrees.
`pnpm format:check` failed on 39 generated files under unrelated `.worktrees/`
checkouts; all six changed files passed a separate Prettier check. Those
unrelated generated files were not modified.
The HTTP parity test requires a build with
`NEXT_PUBLIC_SITE_URL=https://bettersanfernando.example` and a running production
server; that fixture build is separate from the same-environment size comparison.
`pnpm batch7-http:smoke` passed against that fixture: every EN/FIL sitemap
page, aliases, service redirects, noindex 404s, query-state SSR/canonicals,
production-origin SEO, and rendered breadcrumb JSON-LD. The civic-data boundary
was not changed, so its checks were not needed.

Retained deployments remain the reported primary cause of the 8.26 GB total.
The helper prevents eligible future builds; it does not delete retained Preview
or Production deployments. No commit, push, deployment, Vercel setting change,
or retention operation was performed.
