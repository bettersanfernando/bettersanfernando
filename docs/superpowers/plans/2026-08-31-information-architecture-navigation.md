# BetterSanFernando Information Architecture and Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localization-ready seven-link header with shared desktop/mobile mega-navigation and valid scaffolds for every approved route.

**Architecture:** A typed navigation configuration drives both responsive renderers and config-based active state. A typed planned-route registry feeds one lazy-loaded `PlannedPage`, while existing pages retain explicit routes and route-level chunks.

**Tech Stack:** React 19, TypeScript 6, React Router 8, i18next/react-i18next, Tailwind CSS 4, Lucide React, Node's built-in assertions.

**Spec:** `docs/superpowers/specs/2026-08-31-information-architecture-navigation-design.md`

## Global Constraints

- Do not commit or push.
- Preserve all current working routes and route-level code splitting.
- Do not alter canonical/generated civic data, private data, or runtime data access.
- Do not add dependencies or create duplicate page components.
- Every approved route must resolve to a real page or `PlannedPage`.
- English is complete; FIL and PAM must load and safely fall back to English without raw keys.
- Search remains feature-flagged and separate from the seven navigation links.

---

### Task 1: Typed navigation and planned-route contracts

**Files:**

- Modify: `src/types/index.ts`
- Modify: `src/data/navigation.ts`
- Create: `src/data/plannedPages.ts`
- Create: `scripts/smoke-navigation.ts`
- Modify: `package.json`

**Interfaces:**

- Produces: `NavigationId`, `NavigationItem`, `NavigationSection`, `NavigationDestination`, `mainNavigation`, `getActiveNavigationId(pathname)`, `plannedPages`, and `PlannedPageId`.
- `NavigationItem` owns `id`, `labelKey`, `href`, `activePathPrefixes`, and optional `sections`; each section owns `labelKey` and destination items.
- `plannedPages` owns every approved non-real route as `{ id, path, titleKey, descriptionKey }`.

- [ ] Write `scripts/smoke-navigation.ts` first with literal assertions for exactly seven top-level entries, four mega menus with no more than four sections, required active-route mappings, unique item destinations, and every planned navigation destination appearing in `plannedPages`.
- [ ] Run `node --experimental-strip-types scripts/smoke-navigation.ts` and confirm it fails because the new contracts do not exist.
- [ ] Replace the old flat navigation type/config with the typed IA. Reuse only accurately matching Services routes; use planned routes for Employment, Assistance Programs, Senior Citizens, and PWD Services.
- [ ] Add every approved future path to `plannedPages`, including approved routes not directly linked from a mega menu.
- [ ] Add `nav:smoke` to `package.json` and run it to confirm the contract passes.

### Task 2: Localization resources and supported locale model

**Files:**

- Modify: `src/i18n/languages.ts`
- Modify: `public/locales/en/common.json`
- Create: `public/locales/fil/common.json`
- Create: `public/locales/pam/common.json`
- Modify: `scripts/smoke-navigation.ts`

**Interfaces:**

- Produces: `SUPPORTED_LANGUAGES` containing `en`, `fil`, and `pam` with translation-key-driven display labels.
- Translation namespaces: `navigation`, `plannedPages`, `contact`, and `languages` within `common`.

- [ ] Extend the smoke script with resource-load assertions: all three JSON files parse, English contains every key referenced by navigation/planned pages, and FIL/PAM can fall back without raw missing keys.
- [ ] Run the smoke script and confirm failure because FIL/PAM resources and new English keys are absent.
- [ ] Add complete English strings, reuse only existing Filipino translations, and create valid Filipino/Kapampangan resource files that intentionally omit unavailable translations so i18next uses English fallback.
- [ ] Restrict header selection to EN/FIL/PAM without changing URL paths or disabling language persistence.
- [ ] Run the smoke script and confirm it passes.

### Task 3: Reusable planned page and route registration

**Files:**

- Create: `src/pages/PlannedPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**

- Consumes: `PlannedPageId` and `plannedPages`.
- Produces: `PlannedPage({ pageId }: { pageId: PlannedPageId })` with translated SEO, breadcrumbs, title, purpose, and restrained status copy.

- [ ] Add route-integrity assertions to the smoke script for every approved literal path and run them against the absent registry to verify failure.
- [ ] Implement `PlannedPage` with existing `SEO`, `Breadcrumbs`, `Section`, `Heading`, and `Text` components; include no facts, charts, fake loading, or invented contacts.
- [ ] Lazy-load `PlannedPage` in `App.tsx` and generate route elements from the registry while preserving explicit real pages and Search gating.
- [ ] Confirm `/about` explains independent/non-official status and `/contact` distinguishes BetterSanFernando contact from official CSFP channels through their translated registry copy.
- [ ] Run `pnpm nav:smoke` and `pnpm build`.

### Task 4: Shared responsive navigation behavior

**Files:**

- Modify: `src/components/layout/Navbar.tsx`
- Remove if unused: `src/components/LanguageSwitcher.tsx`

**Interfaces:**

- Consumes: `mainNavigation`, `getActiveNavigationId`, `SUPPORTED_LANGUAGES`, and i18next keys.
- Desktop: one controlled open mega menu, disclosure buttons, full-width four-column panel, active-route state, outside click, route-change close, and Escape with trigger focus restoration.
- Mobile: one controlled open disclosure, shared section/item data, obvious single links, separate Search and locale utilities.

- [ ] Add pure behavior assertions for active-route selection and config integrity before component work; verify they fail for any missing prefix mapping.
- [ ] Refactor `Navbar` to render exactly seven top-level entries from `mainNavigation`; use `NavLink`/`Link` for internal destinations and anchors only for external destinations.
- [ ] Add standard disclosure semantics (`aria-expanded`, `aria-controls`), translated accessible labels, Escape handling, outside-click handling, visible focus styling, and predictable close behavior.
- [ ] Render a full-width desktop panel with at most four columns and a mobile accordion from the same configuration.
- [ ] Keep conditional Search and EN/FIL/PAM utilities separate from primary navigation.
- [ ] Run `pnpm nav:smoke`, `pnpm lint`, and `pnpm build`.

### Task 5: Required validation and bounded visual QA

**Files:**

- Modify only files proven defective by QA.

**Interfaces:**

- Verifies the shipped route, localization, accessibility, and responsive contracts.

- [ ] Run `pnpm data:validate` and record its result.
- [ ] Run `pnpm data:smoke` and record its result.
- [ ] Run `pnpm nav:smoke` and record its result.
- [ ] Run `pnpm lint` and confirm zero errors; retain the documented five unrelated warnings.
- [ ] Run `pnpm build` and confirm success.
- [ ] Run the Impeccable detector once over the changed UI files and address in-scope findings.
- [ ] Start the local app and perform one bounded browser QA pass at desktop, tablet, and mobile widths across the required representative routes.
- [ ] Verify all seven links, all four mega menus, every mega-menu destination, Search gating, EN/FIL/PAM switching, desktop keyboard/Escape behavior, mobile disclosures, active-route states, and no header/content overlap.
- [ ] Apply one batched correction pass if needed, rerun relevant checks once, then report exact files and final `git status` without committing or pushing.
