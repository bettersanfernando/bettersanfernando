# BetterSanFernando Frontend Design System

This is the single authoritative frontend design guide for BetterSanFernando.
It documents the current, live visual direction: an editorial, information-first
civic design built on typography, borders, and whitespace rather than blue
hero backgrounds and card grids.

**[`/transparency`](../src/app/transparency/page.tsx) is the first reference
implementation of this direction** — editorial hierarchy, pure-white canvas,
Inter typography, sharp borders, restrained blue accents, minimal
radius/shadows, and information-first layouts. Read it alongside this
document to see the rules applied, but **follow the system described here
for new work, not `/transparency`'s exact composition.** A future page
should use whichever patterns in this document fit its own information
hierarchy, not copy `/transparency`'s section-by-section layout.

Other routes (Services, Projects, Government, the population/statistics
pages, and the rest of the site) predate this direction and still use an
earlier, more decorative pattern set — full-width blue heroes by default,
soft-blue icon badges on every row, heavily rounded shadowed cards. They are
not currently held to this document and will be migrated to it
progressively, page by page, as they're redesigned. When redesigning any
existing page, or building a new one, follow this document.

## Why This Direction

The earlier pattern set leaned on a strong, repeated formula: a full-width
deep-blue hero on nearly every page, soft-blue rounded icon badges on every
row, and white bordered/shadowed cards as the default building block. That
pattern works, but applied everywhere it starts to read as decorative rather
than informational — every page announces itself the same way regardless of
what it actually contains.

This direction is a course-correction, not a rebrand: same brand blue, same
Inter/Roboto Mono type system, same civic-trust content model (sources,
provenance, limitations). What changed is **emphasis** — from "blue
container + icon badge" as the default surface, to typography, borders, and
whitespace doing most of the structural work, with blue reserved for things
that are actually interactive or actually need emphasis.

**Primary visual benchmark:**
[statistics.bettergov.ph](https://statistics.bettergov.ph/) (the Philippine
Statistics Explorer) is this system's primary visual benchmark — the
composition, type-led hierarchy, border treatment, and sharpness described
throughout this document are calibrated against it, and §8 (Reference
Composition Patterns) documents the specific patterns it uses. **This means
adopting its visual system and composition principles, not its branding,
logo, content, or product identity.** BetterSanFernando keeps its own name,
blue brand color, civic content model, and voice (§2) in full — nothing in
this document replaces any of that. When in doubt: if a change would make
BetterSanFernando look like a different product, it has gone too far; if it
would make BetterSanFernando read as calmer, sharper, and more
typography-led while remaining unmistakably BetterSanFernando, it's on
target.

---

## 1. Design Principles

1. **Information before decoration.** Every visual element should help a
   resident find or understand something. If a gradient, icon badge, or
   card doesn't carry information, cut it.
2. **Typography creates hierarchy.** Weight, size, and spacing — not color
   or containers — are the primary tools for showing what matters most on
   a page.
3. **Borders define structure.** Thin, neutral borders and dividers replace
   most of what shadows and nested cards used to do.
4. **Blue is an accent, not a required page background.** Reserve full-color
   blue surfaces for moments that earn it. Most pages should read as
   white/near-black editorial content with blue links and controls, not a
   blue page with white content floating on top.
5. **Use cards only when the content is genuinely a card** — a bounded,
   self-contained unit (a stat block, a single actionable panel). A list of
   directory items, catalog entries, or table rows is not a card grid.
6. **Prefer rows/dividers for directories and catalogs.** One bordered
   surface with internal `divide-y`, not N floating cards with N shadows.
7. **Avoid unnecessary shadows.** Flat, bordered surfaces are the default.
   Shadow is a signal reserved for things that visually float above the
   page (see §5).
8. **Use restrained radius.** Sharp-ish, quiet geometry over heavily
   rounded "friendly" shapes everywhere.
9. **Mobile layouts should be intentionally redesigned, not squeezed.**
   A mobile layout is a distinct composition of the same content and
   hierarchy, not a shrunk desktop grid.
10. **Sources, provenance, and limitations are part of the interface** —
    not a footnote. Every data-backed page states where its data comes
    from and what it doesn't yet cover, presented with the same visual
    care as the primary content.

---

## 2. Brand Voice / Statement

**Primary product statement** (use on the homepage and in top-level
about/meta copy):

> BetterSanFernando makes public information about the City of San
> Fernando easier to find, understand, and verify.

**Supporting statement:**

> An independent civic portal organizing public services, projects,
> government information, records, and official-source data in one place.

**Independence statement** (use wherever trust/provenance needs a short,
consistent line — trust panels, about sections, footers):

> Independent and community-run. Not an official City Government website.

**Optional short brand line** (tight spaces, meta descriptions, social
cards):

> Local public information, made easier to use.

**Copy rules:**

- Keep sentences short and resident-facing — plain language over
  institutional/technical phrasing wherever the meaning survives.
- Lead with what the page does for the reader, not with BetterSanFernando's
  internal process.
- Technical caveats (export versions, dataset mechanics, methodology
  detail) are accurate and available, but never the first thing a resident
  reads — see §10.

**Casing rules:** Title Case for page titles, major section headings, and
KPI/metric labels; sentence case for body copy (never Title Case for
prose); uppercase for editorial eyebrows via the `text-eyebrow` utility;
readable UI casing (not all-caps) for table headers. Do not rewrite
existing terminology or content merely to satisfy casing.

---

## 3. Typography

### Primary — Inter

Used for everything: headings, body, navigation, buttons, tables, data.

```css
'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  sans-serif
```

Configured once in `src/fonts.css` as `--font-kapwa-sans`, loaded via a
Google Fonts `@import`, and wired into Tailwind's `font-sans`. `body` sets
`font-family: var(--font-kapwa-sans)` directly.

### Secondary/editorial — Roboto Mono

Reserved for eyebrows, small technical/data labels, and `code`/`pre`. Do
not expand its use beyond that — mono text is a seasoning, not a body
font.

### Practical type roles

| Role                          | Weight  | Notes                                                                                                                                     |
| ----------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Display / landing H1          | 800     | Largest text on the site. Reserved for the homepage and other true landing moments. `text-display` (tight line-height, `-0.02em`).        |
| Page H1                       | 700–800 | One per page. Should clearly dominate its page without needing a color block behind it.                                                   |
| Section H2                    | 700     | `text-section-title`. Visibly smaller than the page H1; carries most of a page's internal hierarchy.                                      |
| Component title (H3/card/row) | 600–700 | Not every heading needs to be 800/ExtraBold — reserve the heaviest weight for the top of the page.                                        |
| Body                          | 400     | Sentence case, comfortable line-height (`leading-6`/`leading-7`), near-black (`text-gray-950`/`text-gray-900`), never pure `#000`.        |
| Metadata / supporting text    | 400–500 | Visually quieter — `text-gray-600`/`text-gray-500`.                                                                                       |
| Eyebrow                       | 500     | `text-eyebrow` (Roboto Mono, uppercase, restrained positive tracking). Compact, small, used to label a section or panel, not decorate it. |

Favor strong headings (700–800) paired with genuinely readable body copy
(16px/`text-base` minimum for primary reading content) — the contrast
between "confident heading" and "quiet, readable body" is itself part of
the editorial feel. Headings use tight tracking (around `-0.02em`, via the
`text-display`/`text-section-title` utilities); body and link/button text
use normal tracking; only the eyebrow uses positive tracking, and it
should stay restrained — if an eyebrow's default tracking reads as too
wide for a given page's feel, a page-local override is preferable to
loosening the shared default site-wide.

---

## 4. Color System

Existing brand blue and token values — no new palette. Neutral/white is
the default page surface everywhere, and blue is something you reach for
deliberately, not a default background.

| Token                                     | Value                                              | Use for                                                                                                                                                                                                                                   |
| ----------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ink (primary text)                        | `gray-950`/`gray-900`                              | Primary text everywhere, including page/hero titles — no white-on-blue by default.                                                                                                                                                        |
| Muted text                                | `gray-600`/`gray-500`                              | Supporting/metadata text.                                                                                                                                                                                                                 |
| Primary blue                              | `#0066EB` (`primary-500`)                          | Links, buttons, active controls, focus rings, small accents — **not** a default large background.                                                                                                                                         |
| Hover blue                                | `#0052BC` (`primary-600`)                          | Hover state for the interactive blue.                                                                                                                                                                                                     |
| Soft blue                                 | `#E6F0FD` (`primary-50`)                           | Reserved for genuinely "selected/informational" moments (an active filter, a highlighted row, a callout) — not a default icon-badge treatment on every row.                                                                               |
| Selected/feature surface (pale blue-gray) | `#EEF1F5`-ish (slightly desaturated vs. Soft blue) | Background for a genuinely selected or featured _panel_, as piloted on `/transparency`'s Publication Gaps section. Use sparingly — one such panel per page at most, and prefer a rule/border over a filled panel where either would work. |
| Canvas                                    | `#FFFFFF` / `#FAFAFA`                              | **Primary** page background on virtually every page.                                                                                                                                                                                      |
| Surface                                   | `#FFFFFF`                                          | Card/panel backgrounds, sitting directly on canvas with a border, rarely with a shadow.                                                                                                                                                   |
| Border                                    | `gray-200` (`#E9ECEF`)                             | The primary structural tool — dividers between rows, section separators, table rules, default card edges.                                                                                                                                 |
| Stronger border                           | `gray-300` (`#DEE2E6`)                             | Where a divider needs to read a little stronger (a header/body separator, a table's outer rule).                                                                                                                                          |
| Deep civic blue                           | `#002EAC`                                          | Reserved for a small number of intentional full-color moments (see §7) — not a default.                                                                                                                                                   |
| Dark/navy section                         | `primary-900`/`primary-800`                        | A quiet, sparing way to mark a trust/sourcing section — not required, and not a default two-tile "dashboard" treatment (see §9's Methodology guidance).                                                                                   |

**Rule of thumb:** if you're about to set a background to blue, ask
whether the content is (a) the page's single hero/identity moment, or (b)
a genuinely dark, closing "trust" panel. If it's neither, use canvas +
border instead.

---

## 5. Borders, Radius, Shadows

### Borders — the primary structural tool

- Thin, neutral (`border-gray-200`) for internal dividers and default card
  edges.
- `border-gray-300` where a divider needs to read a little stronger (a
  header/body separator, a table's outer rule).
- Borders do the job cards' shadows used to do: separating one row/section
  from the next inside one continuous surface.

### Radius

The reference benchmark ("Why This Direction," above) reads as
essentially square — match that closely, not "moderate rounding."

- **Default for surfaces** (cards, panels, table/catalog containers, the
  outer edge of a statistics strip): `rounded-none` or `rounded-sm`
  (0–2px) — square or almost-square corners, not a softened "friendly"
  rectangle.
- `rounded-md` (6px) is the **occasional** exception, not the default —
  reach for it only where a slightly softened corner genuinely helps (a
  small standalone callout, a compact button/input, an autocomplete
  panel). Don't apply it reflexively to every container.
- **Avoid `rounded-lg`/`rounded-xl`/`rounded-2xl` as default UI.** These
  read as the older "friendly card" language this system moves away
  from.
- Buttons and inputs: `rounded-sm` by default; `rounded-md` is acceptable
  for a primary CTA-style button where a touch more softness is wanted —
  never pill-shaped.
- Fully-rounded (`rounded-full`) stays reserved for small status
  tags/badges and avatar-style elements — don't expand it.

### Shadows

- **No default shadow** on cards, panels, statistics strips, or catalog
  rows. A border is sufficient separation from the canvas.
- Reserve `shadow-*` for layers that are genuinely floating above the page
  and need a depth cue independent of z-order: dropdown menus, autocomplete
  result panels, modals/dialogs, popovers/tooltips. In those cases a
  moderate shadow (`shadow-lg`/`shadow-xl`) is appropriate and expected.

---

## 6. Layout

- **Content max-width:** the existing `container mx-auto px-4` convention
  for every section; keep left/right alignment consistent within a page.
  For dense editorial/data content, an internal `max-w-4xl`/`max-w-5xl`
  reading measure on body copy keeps long-form and tabular content
  legible even inside a wider container.
- **Editorial two-column layouts:** a wide content column plus a narrower
  supporting column (`lg:grid-cols-[minmax(0,1fr)_20rem]`-style ratios)
  is the standard pattern for a page intro + supporting module, or body
  copy + metadata/actions. Reserve it for genuinely asymmetric content —
  don't force two equal columns just to fill width.
- **Catalog rows:** default to a single bordered surface with `divide-y`/
  `border-t` internal rows, each row a flex/grid layout (an optional
  leading element, title + description, trailing action). This replaces
  "one card per catalog item" as the default.
- **Table/data layouts:** real `<table>` semantics for genuinely tabular
  data (see §9 Tables); a row-based `dl`/list pattern for summary-style
  key/value data that isn't a full table.
- **Grid columns:** 2-column grids are appropriate for paired, comparable
  content (two supporting panels of similar weight, a two-up stat split).
  3-column grids are appropriate for short, genuinely parallel items
  (a "what you'll find" feature strip). Don't reach for a grid when a
  single-column stack with dividers communicates the same hierarchy more
  clearly.
- **Don't force equal-height cards** when the underlying content differs
  in length — let each card/row size to its own content; use alignment
  (`items-start`) rather than stretch when content lengths vary
  meaningfully.
- **Generous whitespace between major sections, compact interiors within
  them.** The editorial feel comes from _both_ halves of that pair — a
  page with `space-y-14`–`space-y-20` between sections but tight,
  efficient padding inside each row/panel (`p-4`–`p-6`, not `p-8`+ by
  default) reads as considered; a page that's spacious everywhere reads as
  empty, and a page that's compact everywhere reads as cramped.
- **Reduce, don't pad:** avoid redundant descriptions of the same fact,
  duplicated statistics shown in more than one place without new context,
  giant whitespace that isn't doing hierarchy work, unnecessary cards
  (§1 principle 5), repeated source/provenance text across sections, and
  visual filler added only to make a section "feel" more complete. Each
  section should have a clear reason to exist.

---

## 7. Hero / Page-Header System

A full-width deep-blue hero on every page is the **exception**, not the
default.

### Default page header (editorial, white/light — use for the large majority of pages)

- **Eyebrow** — small, mono, uppercase (`text-eyebrow`), names the section.
- **Large title** — bold (700–800), near-black, `text-display`/
  `text-section-title` depending on scale. No white-on-blue requirement.
- **Concise description** — one to two sentences, `text-gray-600`/`700`.
- **Optional metadata/actions row** — real counts, a primary action, or
  both, presented as plain text/inline controls rather than a stat-card
  block.
- **Optional right-side module** — a genuinely useful functional or
  supporting element (search, a short quick-link list, key actions, trust
  copy) separated by a thin border/rule, _not_ a filled card floating on
  a color field, since there's no color field to float on.
- Background stays canvas (white/near-white). A hairline `border-b` can
  separate the header from the content below it in place of a color
  change.
- The breadcrumb belongs inside this same content container, above the
  eyebrow/title, aligned to the page's left content edge — not in its
  own full-width bordered strip directly under the navbar. Keep it small
  (`text-xs`) and quiet (muted color for prior levels; the current page
  can read darker).

### Blue full-width hero (exception, not default)

Reserve for pages that are genuinely top-level "front doors" to a major
section of the site (e.g. the homepage, and at most one or two hub pages
where a strong identity moment is earned) — not every page under that
hub. When used:

- Same civic-blue value (`#002EAC`), same restraint: no gradients, no
  stock imagery, no glassmorphism.
- **Decoration is off by default, even here.** The reference benchmark's
  header has no background decoration at all — bold type carries it. Ship
  the blue hero with a flat, undecorated background first; add a handful
  of low-opacity geometric accents only if the page genuinely needs the
  extra visual signal, confined to an `aria-hidden`, `pointer-events-none`,
  `overflow-hidden` layer, and reduced/hidden below `lg` rather than
  compressed. The bar for using decoration at all is high, not just its
  restraint once used.
- Still follows the same content hierarchy (eyebrow → title → description
  → optional supporting module) as the editorial header — the blue
  background doesn't change what content goes where, only how much visual
  weight the page opens with.

---

## 8. Reference Composition Patterns

These are the structural patterns visible on
[statistics.bettergov.ph](https://statistics.bettergov.ph/), this
system's primary visual benchmark (Why This Direction, above). They
describe **structure and visual treatment only** — no copy, branding,
logo, or product identity from the reference site is adopted. Each
pattern below is translated into a general, reusable BetterSanFernando
pattern; apply the structure to our own civic content, not the reference
site's content.

**BetterSanFernando should feel like the same design family as the
reference site in terms of typography, spacing, border treatment,
sharpness, and information hierarchy — while retaining BetterSanFernando's
own civic blue branding and content.** The goal is a shared visual
language, not a shared identity.

1. **Editorial page introduction.** An eyebrow label, one large confident
   heading, one to two lines of plain-language supporting copy, and
   generous top/bottom whitespace — on a plain white/light background,
   with no color block or decoration behind it. This is exactly §7's
   default page header.
2. **Flat statistics row.** A small number (2–4) of headline metrics
   shown as plain typography — a large tabular-numeral value with a small
   label underneath or beside it — arranged in one horizontal row,
   separated by whitespace or a single hairline rule. No stat cards, no
   icon badges, no colored backgrounds. See §9 Statistics strips.
3. **Sharp bordered feature panels.** A small number of standalone
   highlighted panels (e.g. a ranked list of topics, a single callout),
   each with a thin neutral border, `rounded-none`/`rounded-sm` corners,
   no shadow, and a white or very-light background. Panels are
   distinguished by a small numeral/label and typography, not by icon
   badges or color.
4. **Two-up feature/data cards.** Exactly two roughly-equal-weight panels
   placed side by side on desktop (stacked on mobile), each illustrating
   one related dataset/feature with a title, one line of description, and
   a labeled metric or source. This is a deliberate single pairing, not a
   repeating card grid — use it where a page genuinely has two comparable
   featured items, not as a general-purpose layout.
5. **Data/catalog grids.** A grid or list of topic/dataset entries, each
   compact (title + a short descriptor or count), sharp corners, thin
   borders or dividers between entries, no drop shadow, and consistent
   internal padding. This is the grid-shaped sibling of the catalog-row
   pattern in §6/§9 — use rows for a small number of substantial entries,
   this denser grid form for a larger number of short entries.
6. **Split editorial trust/provenance section.** A clearly-labeled section
   stating where the data comes from and how it's verified, written as
   plain editorial copy with one clear link/action — not two separately
   backgrounded "cards" side by side, and not necessarily boxed at all; a
   thin left rule or top/bottom rule is enough separation. See §9's
   Methodology guidance to unify a Sources/Methodology-style section into
   one coherent, open layout rather than two dashboard tiles.
7. **Dense but readable filters/tables.** List/table UI that stays
   information-dense — tight row height, real columns, no wasted chrome —
   while remaining legible through consistent alignment, clear column
   headers, and adequate (not excessive) internal padding. Density lives
   in the data itself, not in decorative spacing around it.
8. **Simple footer/navigation treatment.** A multi-column link footer with
   a darker or otherwise clearly-differentiated background, sharp
   corners, tight vertical rhythm within each link group, and generous
   horizontal gutters between groups. (BetterSanFernando's existing footer
   is out of scope for the current rollout — noted here for when footer
   work is eventually considered.)

---

## 9. Components

### Navigation / directory rows

One bordered surface, `divide-y` internal rows. Each row: small leading
icon (optional — not every row needs one), title, one-line description,
trailing chevron. No per-row icon badge background by default; reserve a
tinted icon background for a row that's genuinely being highlighted
(active/selected/featured), not as a blanket treatment.

### Data catalog rows

Same row pattern as navigation, scaled up slightly for an optional
leading icon/title pair, a description, and a set of destination
links/actions below or beside it. Prefer a vertical list of actions on
narrow viewports (§11) over a wrapped inline row of links.

### Statistics strips

A single, typography-led horizontal strip (`flex`/`grid` with internal
dividers or plain whitespace) — not N separate stat cards with N shadows,
and not every real metric competing at equal weight. Prefer a small
number (2–4) of primary metrics carried by size/weight of the number
itself, with any remaining real counts demoted to a quieter supporting
line (plain text, smaller, muted color) rather than added as more stat
cells. Icon is optional and small if used at all — the value's typography
does the work, not a colored icon background. See §8 pattern 2.

### Buttons

- Primary: solid `primary-500` background, white text, compact and
  rectangular — `rounded-sm` by default (`rounded-md` acceptable for a
  prominent CTA-style button), compact height (`h-10`–`h-11`), no shadow.
- Secondary: white background, thin border (`border-gray-300` or
  `border-primary-500/30`), same compact rectangular radius, no shadow —
  not a soft-blue-tinted secondary.
- Hover/active states are color/border shifts — never color alone.

### Inputs / search

White background, `border-gray-300`, `rounded-sm`, visible
`focus-visible:ring`. Autocomplete/results panels are the shadow
exception (§5) — a floating panel below the input with `shadow-lg` is
correct here.

### Cards

Used only for genuinely card-like content: a single self-contained stat,
a highlighted callout, a standalone action panel. Thin border, minimal
radius, no shadow, meaningful padding. If you find yourself repeating the
same card N times in a row for list-like content, switch to a divided row
list instead (§6).

### Tables

Reference: `BarangayTable.tsx` (`src/app/statistics/population/BarangayTable.tsx`).
Real, working functionality only — every visible control must actually
work:

- **Search** — a real `<input type="search">` filtering by name, with a
  visible clear affordance and a live result count (`aria-live="polite"`).
- **Sorting** — every column header is a clickable button with a visible
  sort icon (inactive vs. ascending/descending) and an `aria-label`
  describing the current state.
- **Pagination** — real client-side pagination, numbered page buttons,
  `aria-current="page"` on the active page, disabled Previous/Next at the
  boundaries, and a "Showing X–Y of Z" status line. Search, sort, and
  pagination compose together (sorting/searching resets to page 1).
- Never ship a fake search box, fake sort arrows, or fake pagination.

Visual treatment shifts toward this system's restraint: thin borders over
shadowed containers, minimal row radius (a table's outer container can
keep a small `rounded-sm` for the overall surface; individual rows don't
need one), a light neutral header, `divide-y` row separators, subtle row
hover, numeric columns right-aligned with `tabular-nums`, and
classification/status shown as a small restrained pill, not a loud tag.
Mobile gets a compact list (not a horizontally-scrolled desktop table),
while keeping the same search/sort/pagination data.

### Status tags

Small, `rounded-full` (this is one of the retained pill uses), restrained
color only where the status is meaningful (e.g. "Partial", "Not currently
exported"). Not used decoratively, and not applied to content that has no
real status to communicate — a "Published" badge on every item once
every item is published communicates nothing (see §12).

### Source / provenance blocks

A provenance section should clearly communicate: the official source/
publisher, the reference period, a last-verification date, a link to the
official source (paired with an `ExternalLink` icon), and any relevant
limitations — presented with this system's visual restraint: a bordered
block, a thin left/top rule, or a simple two-column layout (explanatory
copy + a metadata list) rather than a heavily card-ified callout.

### Methodology / limitations sections

Plain, readable prose sections, typically at or near the end of a page —
see §10 for placement guidance. A quiet dark section (`primary-900`) is an
acceptable, sparing way to visually mark "this is the trust/sourcing part
of the page," but isn't required for every page — an open editorial
section on the plain canvas, separated by a thin rule, is equally valid
and is now the default. When a Sources/Methodology section has more than
one sub-area, present them as one coherent layout divided by a rule, not
as separately backgrounded tiles (§8 pattern 6).

### Icon direction

- `ChevronRight` — normal drill-down/navigation within the site (a
  directory row, a catalog row, "see more" within the same context).
- `ArrowUpRight` — a larger action, an external destination, or a
  "go explore this in depth" action (e.g. "Explore published data
  sources," a link to an external official source).
- Icons are small (`h-4 w-4`–`h-5 w-5`), one per concept, Lucide only.
  Don't add an arrow to every link by reflex — a plain text link is
  sometimes correct, especially inline in body copy.
- **Icons — including leading row/catalog icons, not just arrows — appear
  only when they improve comprehension**, not as default decoration. A
  catalog row or directory row does not need a leading icon just because
  the older pattern always had one; add it only where it genuinely helps
  a reader scan or recognize the row faster. When an icon is used, render
  it plain (`text-gray-400`/`text-gray-500` or the accent blue) rather
  than inside a tinted badge — icon badges are no longer the default row
  treatment (§4's Soft blue row).

---

## 10. Content Style

Prefer short, direct headings and copy over institutional phrasing.

**Example:**

Heading:

> Find the information you need.

Supporting:

> Browse City services, projects, records, government information, and
> official sources.

**Guidance:**

- Lead with the plain-language version of what a page does. A resident
  should understand the page's purpose from the H1 + one sentence, without
  reading a methodology paragraph first.
- Move technical caveats (dataset mechanics, export/versioning detail,
  precise definitional distinctions between record types) lower on the
  page — typically their own section near the end — unless the caveat is
  essential to correctly interpreting the number the reader is looking at
  right now (in which case it stays adjacent to that number, kept short).
- Avoid restating the same disclaimer in multiple sections of the same
  page.
- Casing rules are as described in §2 (Title Case headings, sentence-case
  body, uppercase eyebrows via `text-eyebrow`).

---

## 11. Accessibility and Responsive Rules

- Semantic heading hierarchy (`h1`→`h2`→`h3`), `aria-labelledby` linking a
  heading to the `section`/`aside` it labels.
- Proper table semantics — `<caption>` (can be `sr-only`), `scope="col"`/
  `scope="row"`, real `<thead>`/`<tbody>`/`<tfoot>`.
- Real `<a>`/`<button>` semantics for every interactive element — never a
  `div` with an `onClick`.
- Visible `focus-visible:ring` on every interactive control, including
  plain text links (not just buttons).
- Sufficient contrast — near-black ink on white/canvas easily clears
  standard contrast targets; when blue is used as a small accent, verify
  it against its actual background (white vs. a soft-blue tint) rather
  than assuming the token is always compliant.
- Touch-friendly control sizing (comfortable tap targets) on every
  row/button, even in denser row-list patterns.
- No horizontal scrolling — wide tables/catalogs recompose into a mobile
  list (§9 Tables), not a horizontally-scrollable version of the desktop
  layout.
- **Responsive recomposition, not compression:** a multi-column
  editorial layout, a statistics strip, or a catalog-row layout should
  each have a deliberately designed mobile arrangement (stacked sections,
  2-column stat grids instead of an awkward wrapped row, one action per
  line instead of wrapped inline links) — not the same desktop DOM simply
  narrowed.
- Never encode meaning (classification, sort direction, active state)
  with color alone — pair it with text, an icon, or an `aria-*` attribute.
- Decorative elements (hero geometry, background accents) are
  `aria-hidden="true"` and `pointer-events-none`, confined to their own
  layer so they never affect layout or tab order.

---

## 12. Anti-Patterns

Explicitly avoid:

- Generic dashboard patterns (widget grids, traffic-light-everything).
- Excessive card grids for list-like content (see §6/§9 — use divided
  rows instead).
- A large, saturated hero background on every page by default (§7 — it's
  an exception), and decoration inside that hero by default even when the
  hero itself is used (§7 — decoration is opt-in, not automatic).
- Gradients.
- Glassmorphism.
- Rounding surfaces above `rounded-md` by default — `rounded-lg`,
  `rounded-xl`, and `rounded-2xl` all read as the older, softened
  "friendly card" language and should not appear on new surfaces (§5).
- Unnecessary shadows outside the floating-layer exception in §5.
- Fake charts — any visualization must answer a real question the
  underlying data supports (e.g. a proportional bar paired with its exact
  value and a real `aria-label`, never decoration alone).
- Decorative UI with no information value (icon badges on every row
  regardless of meaning, ornamental dividers, filler illustration).
- Pills/badges applied everywhere rather than to genuinely meaningful
  status.
- Squeezed desktop layouts on mobile — any layout that is visibly "the
  desktop grid, just narrower" rather than a considered mobile
  composition.
- Extreme negative letter-spacing (tighter than about `-0.025em` on
  numbers, `-0.02em` on headings) and making every heading ExtraBold.

---

## 13. Reference Implementation & Rollout

The current BetterSanFernando frontend design system is documented in this
file. **The `/transparency` route is the first reference implementation of
this direction**, emphasizing editorial hierarchy, pure-white canvas,
Inter typography, sharp borders, restrained blue accents, minimal
radius/shadows, and information-first layouts.

- **Follow the system, don't copy `/transparency`.** This document governs
  visual language and principles, not a page-by-page template. A future
  page should use whichever patterns fit its own information hierarchy —
  it can (and often should) draw on several patterns from §8/§9 rather
  than reproducing `/transparency`'s exact section order or composition.
- **New and redesigned pages follow this document.** Any page being built
  from scratch, or substantially redesigned, should be built to this
  system.
- **Existing pages migrate progressively.** Services, Projects,
  Government, the population/statistics pages, and the rest of the site
  currently use the earlier, more decorative pattern set described in
  "Why This Direction" above. They are not retroactively out of spec —
  they simply haven't been migrated yet — and should move to this system
  page by page as they're next redesigned, not in one site-wide rewrite.
- **Validate real usage before generalizing further.** When migrating a
  page, check its desktop/tablet/mobile behavior against §11 before
  considering it done, and feed anything genuinely new that a page's
  content requires back into this document rather than treating it as a
  one-off exception.

---

## Reference Note

This system does not introduce a new brand, new fonts, or new color
tokens — it redistributes emphasis within the existing BetterSanFernando
system (Inter, Roboto Mono, the existing civic-blue palette) toward
typography, borders, and whitespace as the primary structural tools, with
blue, cards, and shadows used narrowly and intentionally rather than as
page-wide defaults.

[statistics.bettergov.ph](https://statistics.bettergov.ph/) is this
system's **primary visual benchmark**, not a loose inspiration — its
composition patterns are catalogued in §8, and its near-zero radius,
no-default-shadow, typography-led approach is the explicit default
throughout this document (§5, §9). What is adopted from it is strictly
the visual system and composition principles: typography, spacing, border
treatment, sharpness, and information hierarchy. Its branding, logo,
content, and product identity are not adopted. BetterSanFernando's own
branding, voice, and content model (§2) are unchanged and are not
replaced by that reference — the goal is the same design family, not the
same product.
