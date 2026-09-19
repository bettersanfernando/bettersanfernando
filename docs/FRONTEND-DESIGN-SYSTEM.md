# BetterSanFernando Frontend Design System

Practical visual reference for implementing and redesigning BetterSanFernando
pages. This document describes what is **actually implemented and approved**
today — it does not invent aspirational styles.

## Canonical Reference Implementation

**`/statistics/population`** (`src/app/statistics/population/page.tsx` +
`src/app/statistics/population/BarangayTable.tsx`)

This page establishes the current visual direction for BetterSanFernando.
Future pages should match its:

- visual tone
- typography hierarchy
- color restraint
- spacing discipline
- borders and radii
- information density
- interaction quality
- data presentation
- provenance treatment

**Do not require future pages to copy the Population page's exact section
layout.** Different content should use the layout appropriate to that
content. This document governs visual language, not identical page
composition.

---

## 1. Typography

### Primary UI font — Inter

Used for everything: page titles, headings, body copy, navigation, buttons,
cards, tables, statistics, interface labels.

```css
'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  sans-serif
```

Configured once in `src/fonts.css` as `--font-kapwa-sans`, loaded via a
Google Fonts `@import` (weights 400/500/600/700), and wired into Tailwind's
`font-sans` via `--font-sans: var(--font-kapwa-sans)` in `src/index.css`.
`body` sets `font-family: var(--font-kapwa-sans)` directly. **Do not use
Figtree** — it was migrated away from. Do not introduce another display
font without an intentional design review.

### Monospace font — Roboto Mono

Used selectively for small editorial eyebrows, technical/data labels, and
`code`/`pre`.

```css
'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace
```

Configured as `--font-kapwa-mono` in the same file, mapped to Tailwind's
`font-mono`.

### Shared typography utilities (`src/index.css`)

A small set of `@utility` classes standardize the properties that tend to
drift across pages — tracking and line-height — without touching weight,
size, or color (those stay ordinary Tailwind utilities you combine
alongside):

| Utility                | Effect                                                       | Use for                  |
| ---------------------- | ------------------------------------------------------------ | ------------------------ |
| `text-eyebrow`         | `font-mono`, 11px, weight 500, uppercase, `tracking: 0.18em` | editorial eyebrows       |
| `text-display`         | `tracking: -0.02em`, `line-height: 1.05`                     | page/hero titles         |
| `text-section-title`   | `tracking: -0.02em`, `line-height: 1.2`                      | major section headings   |
| `text-component-title` | `tracking: 0`, `line-height: 1.3`                            | card/component headings  |
| `text-stat-value`      | `tracking: -0.025em`, `tabular-nums`                         | large/KPI numeric values |

Combine with normal Tailwind classes for size, weight, and color, e.g.
`className="text-4xl font-extrabold text-display text-white"`.

### Hierarchy principles

- **Page / hero title** — Inter, 700–800, `text-display`, compact
  line-height, should clearly dominate the page. Avoid exaggerated negative
  tracking (nothing tighter than about `-0.02em`).
- **Major section heading** — Inter, usually 700, `text-section-title`,
  visibly smaller than the page title.
- **Component / card heading** — Inter, 600–700. Not every heading needs to
  be ExtraBold.
- **Body copy** — Inter 400, normal tracking, comfortable line-height,
  sentence case.
- **Supporting metadata** — Inter 400–500, visually quieter (`text-gray-500`
  or similar) than primary content.
- **Data / numeric values** — Inter 700–800, `text-stat-value` (tabular
  numerals, restrained tracking). Reserve the heaviest weight/size for the
  single most important number in a section.
- **Editorial eyebrows** — Roboto Mono via `text-eyebrow`. Small, uppercase,
  moderately expanded tracking. Not required on every section or page.
  Examples in use today: `Population`, `Distribution`, `Context`,
  `Barangay Data`, `Data Provenance` (source text is Title Case; the
  utility renders it uppercase).

---

## 2. Casing Rules

| Context                | Rule                             | Examples                                                                                               |
| ---------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Page titles            | Title Case                       | `Population Statistics`, `Government Statistics`                                                       |
| Major section headings | Title Case                       | `All Barangays`, `Population Insights`, `How Population Is Distributed`, `Source and Reference Period` |
| KPI labels             | Title Case                       | `Total Population`, `Largest Barangay`, `Smallest Barangay`                                            |
| Editorial eyebrows     | Uppercase (via `text-eyebrow`)   | `POPULATION`, `DISTRIBUTION`, `CONTEXT`                                                                |
| Body copy              | Sentence case                    | normal prose, never Title Case                                                                         |
| Table headers          | Readable UI casing, not all caps | `Rank`, `Barangay`, `Relative population`, `Population`, `City share`, `Classification`                |

Do not rewrite existing terminology or content merely to satisfy casing.

---

## 3. Color

### Civic blue palette

| Role              | Value                             | Use for                                                                       |
| ----------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| Deep civic blue   | `#002EAC`                         | major hero/background surfaces where strong civic identity is appropriate     |
| Interactive blue  | `#0066EB` (= theme `primary-500`) | links, buttons, active controls, data bars, focus rings, interactive emphasis |
| Interactive hover | `#0052BC` (= theme `primary-600`) | hover state for the interactive blue                                          |
| Soft blue         | `#E6F0FD` (= theme `primary-50`)  | light callouts, subtle icon backgrounds, selected/supporting surfaces         |
| Canvas            | `#F7F8FA`                         | page background                                                               |

The interactive blue and its hover state already correspond to the
`primary-500` / `primary-600` tokens defined in `src/index.css`'s `@theme`
block — prefer `text-primary-600` / `bg-primary-600` etc. where practical.
The deep civic blue (`#002EAC`) is **not yet a formal token**; it is used as
a literal hex value on the Population hero. Treat it as an approved but
un-tokenized value until a future pass formalizes it.

### Neutrals

- White or very-light-neutral primary surfaces.
- `gray-950`/`gray-900` for primary text, `gray-600`/`gray-500` for
  supporting text, `gray-200` for borders (the existing `gray-*` scale in
  `src/index.css`).
- Semantic colors (`success`/`error`/`warning`/`accent`, or ad hoc
  `emerald`/`rose`) exist and may be used, but only when they carry real
  meaning (e.g., Urban/Rural badges, largest/smallest KPI accents) — not as
  decoration.

### Philosophy

BetterSanFernando should feel civic, trustworthy, modern, calm,
data-oriented, and readable. Blue is intentional, not everywhere:

- Large surfaces **may** use the deep civic blue — this is not mandatory for
  every page.
- Interactive elements use the brighter interactive blue.
- Most content surfaces stay white or neutral.
- Avoid turning the site into an all-blue dashboard.

---

## 4. Page Canvas and Containers

- Use the site's existing `container mx-auto px-4` convention for every
  section; keep left/right alignment consistent within a page.
- Generous but controlled vertical spacing between sections (the Population
  page uses `space-y-16` for its main content stack, `py-12`–`py-16` for
  the hero).
- Avoid giant empty areas and sections that feel disconnected from their
  neighbors — content should have a clear beginning, middle, and end.
- Align major sections to the same underlying grid/container width.
- Prefer editorial spacing over dashboard density, but don't manufacture
  whitespace for its own sake.

---

## 5. Hero Pattern

The Population page hero is one approved pattern, not the only one:

- Strong single-color background (`#002EAC`) with subtle geometric
  decoration only (two faint outlined circles at ~5% opacity) — **no**
  stock photography, AI-generated imagery, gradients, or glassmorphism.
- Compact but substantial vertical height (`py-12` → `py-16` across
  breakpoints), not an oversized marketing hero.
- Clear hierarchy: eyebrow → title → description → primary statistic.
- Supporting metadata (a short `dl` of 2–3 facts) integrated into the same
  composition, typically as a second column on desktop.

Future pages may use a light hero, a compact header, or no hero at all if
their content calls for it. What must stay consistent: strong hierarchy,
intentional spacing, restrained decoration, and a clear content purpose —
not the literal deep-blue treatment.

---

## 6. KPI / Summary Surfaces

Reference: the Population page's three-stat surface (`grid sm:grid-cols-3`
inside one bordered, rounded, lightly-shadowed container, with a
`sm:divide` border between cells rather than three separate floating
cards).

- Keep the number of summary metrics meaningful — don't add a metric just
  to fill a grid slot.
- One unified surface for related KPIs, divided internally, rather than N
  separate card shadows.
- Soft surface, thin border, restrained shadow (`shadow-[0_16px_40px_rgba(15,23,42,0.08)]`
  is the current treatment — subtle, not a floating dashboard tile).
- Compact icon per stat (`h-9 w-9` rounded badge), consistent internal
  padding, clear value hierarchy (label → value → supporting detail).

---

## 7. Cards and Surfaces

Avoid over-cardification — not every paragraph or statistic needs its own
rounded rectangle.

**Approved surface characteristics:**

- Subtle `border-gray-200` border.
- White (or very-light-neutral, e.g. `#f8fafc`) background.
- Restrained radius (see §9).
- Minimal or no shadow.
- Meaningful padding (`p-5`–`p-8` depending on density).

**Avoid:** glassmorphism, glowing borders, large floating shadows,
gradients, random colored cards, excessive nested cards. Prefer typography,
alignment, rules (`border-t`/`divide-y`), and whitespace before reaching for
another card.

---

## 8. Data Visualization

Reference: the horizontal population bars used both in the top-5
distribution list and the full barangay table.

- Simple horizontal bars only — soft gray track (`bg-gray-100`), blue fill
  (`bg-[#0066EB]` / `primary-500`), width proportional to a real value.
- Always pair a bar with its exact numeric value; the bar is a visual aid,
  not the only source of the number.
- Bars get an `role="img"` + `aria-label` with the concrete value (e.g.
  `"Calulut: 44,659 residents"`) since the visual fill alone isn't
  accessible.
- Use `tabular-nums` for numeric alignment.
- Don't invent charts to make a page "look more visual" — every
  visualization must answer a real question the data supports.

---

## 9. Data Tables

Reference: `BarangayTable.tsx`. Real, working functionality only — this
component genuinely implements every control it displays:

- **Search** — a real `<input type="search">` filtering by name, with a
  visible clear (`×`) affordance and an "N barangays" live count
  (`aria-live="polite"`).
- **Sorting** — every column header is a clickable button
  (`renderSortableHeader`) with a visible sort icon (`ArrowUpDown` when
  inactive, `ArrowUp`/`ArrowDown` in the interactive blue when active) and
  an `aria-label` describing the current state (e.g. "Sort by Population,
  currently descending").
- **Pagination** — real client-side pagination (10 rows/page), numbered
  page buttons, `aria-current="page"` on the active page, disabled
  Previous/Next at the boundaries, and a "Showing X–Y of Z barangays"
  status line.
- Search, sort, and pagination all compose together (sorting/searching
  resets to page 1).

**Visual treatment:**

- White surface, thin `border-gray-200`, rounded outer container
  (`rounded-2xl`), `overflow-hidden`.
- Light neutral header (`bg-[#f8fafc]` or `bg-gray-50/80`).
- Comfortable row height, `divide-y divide-gray-100` separators, subtle row
  hover (`hover:bg-[#0066EB]/[0.025]`).
- Numeric columns right-aligned with `tabular-nums`.
- Classification shown as a small, restrained pill badge (not a loud,
  oversized tag).
- `cursor-pointer` on every interactive control; visible `disabled` styling
  on boundary pagination buttons; `focus-visible:ring` on every control.
- Mobile gets a compact list (`<ol>` of cards inside one bordered
  container), not a horizontally-scrolled version of the desktop table,
  while keeping the same search/sort*/pagination data.

**Never ship a fake search box, fake sort arrows, or fake pagination.**
Every visible control on a table must work.

---

## 10. Search, Sorting, and Pagination — Interaction Details

- **Search**: clear input, visible focus ring, a clear/reset affordance
  once there's a query, and immediate visual feedback (row count, empty
  state).
- **Sorting**: clickable headers, one active column at a time, and a
  distinct ascending/descending icon — never color alone to indicate
  direction.
- **Filters**: only add a filter control when it genuinely helps users
  narrow the dataset. Don't add filter pills just because dashboards
  usually have them — the current table relies on sortable columns instead
  of a separate classification filter, which is a valid, simpler choice.
- **Pagination**: obvious active page, visible hover state, working
  Previous/Next, a real disabled state at both ends, pointer cursor on
  enabled controls, and full keyboard operability.

---

## 11. Source and Data Provenance

Reference: the Population page's closing "Source and Reference Period"
section.

A provenance section should clearly communicate:

- Official source / publisher.
- Reference period.
- Last verification date.
- A link to the official source (paired with an `ExternalLink` icon).
- Any relevant limitations (e.g. "this page uses one baseline only; it does
  not combine estimates or projections").

**Design principles:**

- Compact — a two-column layout on desktop (explanatory copy + a `dl` of
  metadata), stacked on mobile.
- Visually closes the page; doesn't create a large empty section.
- Metadata (`Publisher` / `Reference` / `Last verified`) is separated from
  explanatory prose.
- The official-source action is an obvious, styled link or button, not
  buried in a paragraph.
- A short, restrained verification note (light-blue background, small
  `ShieldCheck` icon) can reinforce trust without dominating the section.

Data provenance is part of the product experience, not an afterthought —
every data-backed page should have one.

---

## 12. Icons

Lucide icons only (already the project's dependency — don't add another
icon set).

- Small (`h-4 w-4` to `h-6 w-6` typical), restrained, one icon per concept.
- Don't decorate every heading — an eyebrow + heading pair rarely needs an
  icon; a KPI card or provenance block benefits from one.
- No emoji as interface icons.

---

## 13. Borders, Radius, and Shadows

- **Borders**: thin, neutral (`border-gray-200` / `border-gray-300`).
- **Radius**: moderate — roughly 12–16px (`rounded-xl`/`rounded-2xl`) for
  major surfaces (cards, tables, callouts). Small pills (badges, buttons)
  can be fully rounded; don't make every element pill-shaped.
- **Shadows**: very subtle, only where they improve depth or hierarchy
  (e.g. the KPI surface floating slightly over the hero). Avoid strong
  floating shadows or shadow-as-decoration.

---

## 14. Interaction States

Every interactive element must visibly communicate state using more than
color alone where practical:

- **Hover** — background/border/text color shift (e.g.
  `hover:bg-[#E6F0FD] hover:text-[#0052BC]`).
- **Active** — for pagination/sort, a filled or bordered "current" style
  plus `aria-current`/an active icon, not color alone.
- **Focus-visible** — a visible ring (`focus-visible:ring-2
focus-visible:ring-[#0066EB]`) on every button, link, and input.
- **Disabled** — visually muted (`disabled:text-gray-300
disabled:bg-gray-50`) and `cursor-not-allowed`; enabled controls use
  `cursor-pointer`.

---

## 15. Responsive Design

Desktop layouts should not simply shrink onto mobile:

- Multi-column sections (hero, distribution + insights, KPI grid) stack to
  a single column.
- Wide desktop tables become a compact mobile list (see §9), not a
  horizontally scrollable table.
- Metadata simplifies (e.g. hiding a secondary column on narrow screens)
  rather than wrapping awkwardly.
- Controls (search, pagination buttons) stay touch-friendly at mobile
  widths.
- Preserve information hierarchy — the mobile view should tell the same
  story as desktop, just recomposed, not truncated.

---

## 16. Accessibility

Preserve or improve, on every page:

- Semantic heading hierarchy (`h1` → `h2` → `h3`, referenced by
  `aria-labelledby` where a heading labels a `section`/`aside`).
- Proper table semantics — `<caption>` (can be `sr-only`), `scope="col"` /
  `scope="row"`, real `<thead>`/`<tbody>`/`<tfoot>`.
- Real `<button>`/`<a>` semantics for interactive controls — never a `div`
  with an `onClick`.
- Full keyboard operability and visible `focus-visible` treatment.
- Sufficient color contrast (dark neutral text on white/light surfaces,
  white text on the deep civic blue).
- Screen-reader labels for icon-only or visually-encoded content (e.g. the
  `aria-label` on population bars, `aria-label` on sort buttons describing
  current direction).
- Correct disabled-state semantics (`disabled` attribute, not just a
  visual style).
- Never encode meaning (classification, sort direction, active state) with
  color alone — pair it with text, an icon, or an `aria-*` attribute.

---

## 17. Content Density

Aim for an editorial civic-data density — neither a cramped admin
dashboard nor an empty marketing landing page. Each section should have a
clear reason to exist. Reduce:

- Redundant descriptions of the same fact.
- Duplicated statistics shown in more than one place without new context.
- Giant whitespace that isn't doing hierarchy work.
- Unnecessary cards (see §7).
- Repeated source/provenance text across sections.
- Visual filler added only to make a section "feel" more complete.

---

## 18. What to Avoid

- Generic dashboard patterns (traffic-light everything, widget grids).
- Excessive card grids.
- Giant empty hero whitespace.
- Gradients, glassmorphism.
- Decorative AI-generated or stock imagery.
- Charts that don't answer a real question.
- Fake search, filters, sort, or pagination controls.
- Excessive rounded-pill shapes.
- Oversized icons.
- Excessive shadows.
- Too many unrelated colors.
- Inconsistent casing.
- Extreme negative letter-spacing (tighter than about `-0.025em` on
  numbers, `-0.02em` on headings).
- Making every heading ExtraBold.
- Putting every paragraph in its own card.
- Duplicating data just to fill a layout.
- Changing global navigation/header/footer as part of an unrelated page
  redesign.

---

## 19. Future Page Redesign Workflow

Before redesigning or building a page:

1. Inspect the existing page and its data/helper functions.
2. Read this document (`docs/FRONTEND-DESIGN-SYSTEM.md`).
3. Inspect `/statistics/population` as the live visual reference.
4. Identify the page's actual information hierarchy — don't assume it
   matches the Population page's.
5. Preserve canonical data and functionality; never invent or duplicate
   data to fill a layout.
6. Design the page for its own content rather than copying the Population
   page's section layout.
7. Reuse the established typography utilities, colors, spacing units,
   interaction patterns, and provenance style described here.
8. Avoid unrelated global changes (header, footer, navigation, tokens).
9. Verify responsive and accessible behavior.
10. Do not introduce fake functionality (search/filter/sort/pagination)
    purely for visual appearance — every visible control must work.

---

## Reference Implementation Note

> The Population Statistics page is the current reference implementation
> for BetterSanFernando's frontend visual direction. It should be used to
> understand the product's visual language, not as a template to copy
> section-for-section. Future pages should preserve the same level of
> hierarchy, restraint, clarity, interaction quality, and source
> transparency while selecting layouts appropriate to their own content.
