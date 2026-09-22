# BetterSanFernando Frontend Design System

## Status and purpose

This is the authoritative visual guide for BetterSanFernando. It documents
the current approved direction for new and redesigned work: a clean,
editorial, civic-tech interface that makes public information easy to find,
read, and verify.

The design system is a shared language, not a page template. A homepage,
directory, record detail, data page, and search result should each use the
patterns their content needs while sharing the same hierarchy, restraint, and
trust model.

The live application is the primary source of truth. Existing older details
are evidence, not automatic precedent: new work follows this guide, and older
pages move toward it when intentionally redesigned.

## Core principles

1. **Information before decoration.** Every visual element should help a
   resident find, understand, or verify something.
2. **Typography creates hierarchy.** Weight, size, spacing, and alignment
   should do more work than containers or color fields.
3. **Blue has a job.** Use it for BetterSanFernando identity, important
   actions, and clearly intentional surfaces; do not repeat it mechanically.
4. **Borders and whitespace create structure.** Prefer rules, alignment, and
   spacing to stacked cards and default shadows.
5. **Trust is interface content.** Sources, provenance, coverage, and
   limitations must be readable and discoverable without overwhelming the
   resident's primary task.
6. **Responsive design is composition.** Mobile is not a narrow desktop
   layout; preserve the task and hierarchy at every breakpoint.

The result should feel like an independent public-information platform, not a
generic SaaS dashboard, government template, or component showcase.

## Brand expression

BetterSanFernando is independent and community-run, not an official City
Government website. Copy should be direct, resident-facing, and specific
about what a page helps someone do. Lead with useful information; place
technical process details and caveats where they help interpretation.

### Home and identity moments

The current [homepage](../src/app/page.tsx) is the reference for a genuine
landing and identity moment. Its deep civic-blue hero, centered hierarchy,
brand treatment, geographic linework, central search, quick actions, and
civic metrics work together to orient residents and begin a useful task.

Use a deep-blue surface such as `#002EAC` when a page has earned that level of
brand or landing importance. The homepage is not an inner-page template. Most
content pages should not receive a full-width blue hero merely because they
belong to a top-level section.

Geographic decoration must be real and relevant, such as the homepage's
San Fernando boundary linework. Decorative layers remain visually subtle,
non-interactive, and hidden from assistive technology.

## Typography

Inter is the primary typeface for headings, body copy, navigation, buttons,
forms, tables, and primary UI. It is configured in
[`src/fonts.css`](../src/fonts.css) and used through Tailwind's `font-sans`.

Roboto Mono is reserved for compact editorial or technical moments: eyebrows,
source and data labels, compact metadata, and code. It is not a second body
typeface or a visual gimmick.

- Use one meaningful H1 per page, followed by a logical H2/H3 structure.
- Let page titles be strong without turning every heading into a display.
- Use readable body sizes and line heights for primary content.
- Use tight tracking selectively for prominent headings and tabular numerals
  for comparable numeric values; body copy and controls should remain easy to
  scan.
- Uppercase mono eyebrows label a meaningful section. They are not mandatory
  decoration.

The shared `text-eyebrow`, `text-display`, `text-section-title`, and
`text-stat-value` utilities in [`src/index.css`](../src/index.css) capture
stable typographic treatment without prescribing a page's exact scale.

## Color

The current palette is defined in [`src/index.css`](../src/index.css). Its
important roles are:

| Role                     | Current value        | Approved use                                               |
| ------------------------ | -------------------- | ---------------------------------------------------------- |
| Deep civic blue          | `#002EAC`            | Identity heroes and other intentional brand surfaces       |
| Interactive blue         | `#0066EB`            | Links, primary actions, focus treatment, and small accents |
| Interactive hover        | `#0052BC`            | Hover and active treatment for interactive blue            |
| Light supporting surface | `#F3F6FB` where used | Selected, discovery, or quiet supporting states            |
| White                    | `#FFFFFF`            | Primary information canvas and most content surfaces       |
| Neutral grays            | current gray scale   | Text hierarchy, borders, metadata, and quiet backgrounds   |

White and near-white are the default canvas for content-heavy pages. Deep
civic blue is an important BetterSanFernando surface, not an error to avoid;
it should simply be deliberate. Verify contrast in the actual foreground and
background pairing rather than treating any token as automatically safe.

## Layout and spacing

Use the established `container mx-auto px-4` alignment as the common page
gutter. Keep introductions, content, and supporting modules aligned within a
page. Use narrower reading measures for long prose and wider layouts for real
data or comparison tasks.

- Create strong vertical rhythm between major sections and compact, useful
  spacing inside rows and controls.
- Use editorial grids when content has a real relationship: balanced columns
  for comparable content, and asymmetric columns when one area supports
  another.
- Let paired columns stack naturally on smaller screens.
- Do not add large blank regions only to make a page look dramatic.
- Do not force every route into the same grid or equal-height-card layout.

## Surfaces, borders, radius, and elevation

Cards are not the default page unit. Use a card or filled panel only for
information that is genuinely self-contained: a key action, a bounded
callout, a distinct metric group, or an overlay-like module. Directories,
catalogs, and many data views are better as rows, rules, tables, or a single
shared surface with internal dividers.

- Thin neutral borders and whitespace are the default separators.
- Filled supporting surfaces are quiet and purposeful, not a substitute for
  hierarchy.
- Current production uses several restrained radii (`rounded-sm` through
  `rounded-md`) for controls and compact surfaces. Follow that quiet range
  when it fits; do not normalize new work into large, soft rounded cards.
- Fully rounded shapes are for small, meaningful status markers or compact
  controls, not default containers.
- Shadows belong to layers that actually float: menus, autocomplete panels,
  drawers, dialogs, and popovers. Ordinary content surfaces should not need
  one.

## Icons and visual language

Use the existing Lucide icon set when an icon improves recognition,
navigation, or action comprehension. Icons are supporting UI, not automatic
decoration.

- Keep icons visually quiet; do not place one in a soft-blue tile by default.
- Decorative icons and graphics use `aria-hidden="true"`.
- Icon-only actions require an accessible name.
- `ChevronRight` indicates drill-down or deeper hierarchy.
- `ArrowRight` indicates a forward action or CTA.
- `ArrowUpRight` is appropriate for external destinations and exploratory
  actions that leave the immediate context.

The current navigation still contains icon-tile treatments in some mega-menu
destinations. Treat those as implementation detail to evaluate during a
future navigation refinement, not as a pattern to expand elsewhere.

## Navigation

The current [`Navbar`](../src/components/layout/Navbar.tsx) is the reference
for global navigation behavior.

On desktop, top-level navigation is compact and restrained. Expandable areas
open one shared mega-menu surface with structured columns, group labels,
descriptions where useful, and clear drill-down affordances. It should read
as a directory, not cards within cards.

On mobile, the drawer provides a compact brand header, search near the top,
simple hierarchy, and natural scrolling. It supports one expanded navigation
group at a time, clear parent-row interaction, close controls, Escape,
focus management, and a focus trap while open. Keep new mobile navigation
work consistent with those behaviors; essential destinations must not depend
on hover.

The [footer](../src/components/layout/Footer.tsx) is the reference for the
global closing treatment: grouped navigation, contribution and correction
actions, independence context, and accessible external links. Its existing
decorative callout artwork is specific to that component, not a general
background pattern.

## Search

Search is a primary resident action, not a decorative panel. The homepage
[`HomeSearchForm`](../src/app/home-search-form.tsx) and
[`/search`](../src/app/search/Search.tsx) are the current references.

- Keep homepage autocomplete as an overlay so suggestions do not reflow the
  hero beneath it.
- Keep suggestions compact, with a clear type, title, metadata, and action.
- Limit suggestions to a useful, scannable set.
- Support keyboard navigation, listbox semantics, visible active states, and
  Escape or outside-click dismissal.
- Give the full results page clear search, filters, result rows, empty states,
  and responsive pagination rather than decorative discovery widgets.

## Page archetypes

Use these archetypes to select patterns, not to copy a fixed layout.

| Archetype                         | Emphasis                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------- |
| Home / identity landing           | Brand expression, resident search, useful entry points, and live civic context  |
| Section or index landing          | Clear purpose, primary routes, and limited supporting context                   |
| Directory or catalog              | Scan-friendly rows, rules, filters, and real navigation                         |
| Search and results                | Query, filters, readable result hierarchy, and keyboard-friendly interaction    |
| Record or detail                  | Primary fact, supporting context, source links, and explicit limits             |
| Data, statistics, or transparency | Comparable values, methods, source context, and disciplined visualizations      |
| Methodology or source page        | Readable explanation, provenance, and limitations without audit-report overload |

## Responsive behavior

Design mobile intentionally. The current homepage, navigation drawer, search,
and statistics pages show the desired direction: responsive type scaling,
usable controls, stacked columns, and data views recomposed for available
space.

- Keep search and navigation usable at 320px and above.
- Preserve meaningful tap targets and visible focus treatment.
- Scale headings without letting them dominate the viewport.
- Stack paired columns and simplify dense desktop controls on narrow screens.
- For tables and directories, use a mobile list or compact summary when that
  preserves the task; when a true table must remain wide, provide a deliberate
  accessible overflow treatment rather than clipping or shrinking it into
  illegibility.
- Avoid horizontal overflow caused by incidental layout choices.
- Do not make essential information available only on hover.

## Accessibility

BetterSanFernando is designed with accessibility in mind. These are concrete
requirements, not a claim of formal conformance certification.

- Use semantic HTML, landmarks, one meaningful H1, and logical headings.
- Use real buttons and links for interaction.
- Provide visible keyboard focus and predictable keyboard operation.
- Use accessible labels for icon-only controls and `aria-expanded`/
  `aria-controls` for applicable disclosures.
- Preserve adequate contrast and do not convey status or meaning by color
  alone.
- Use meaningful image alt text; keep decorative imagery out of the
  accessibility tree.
- Keep forms, listboxes, tables, and result counts understandable by screen
  readers.
- Make touch targets usable and preserve essential information across
  breakpoints.

## Motion

Motion is brief, restrained, and functional. It should never delay access to
information or be required to understand state.

The homepage uses a short entrance sequence only for its landing moment and
respects `prefers-reduced-motion`. The navigation drawer and disclosure
transitions also disable transition motion for reduced-motion users. Follow
that approach for new motion:

- Use subtle arrow movement, disclosure, menu, or popover transitions to
  clarify an interaction.
- Reserve entrance motion for genuine landing moments.
- Respect `prefers-reduced-motion` with a stable, usable alternative.
- Avoid constant ambient motion, large parallax, bouncing decoration, and
  animation repeated across every card or row.

## Data, sources, and trust

Sources, provenance, verification status, coverage, and limitations belong in
the interface. They should be visually consistent and easy to find, while
remaining subordinate to the resident's main task.

Use concise source and limitation modules, readable metadata, and direct
official-source links where available. Make partial coverage or uncertainty
clear near the information it qualifies. Do not hide it as legal-looking fine
print, repeat it until it overwhelms the page, or turn every data page into an
audit report.

Visualizations must represent real data and answer a real question. Pair a
chart or graphic with enough labels, values, and context to interpret it.

## Visual anti-patterns

Avoid visual treatments that obscure civic information or make the product
feel generic:

- Random gradients, glassmorphism, neon accents, floating 3D objects, dots,
  sparkles, or decoration without information purpose
- Fake dashboards, decorative charts, or maps unrelated to real geography
- Stock-government imagery, AI-generated people, or fake government seals
- Repetitive icon-card grids, unnecessary blue icon tiles, excessive pills,
  excessive shadows, or oversized rounded surfaces
- A saturated blue hero on every inner page
- Huge empty hero space, default card grids for directories, or dense desktop
  layouts merely squeezed onto mobile

## Current reference implementations

| Reference                                                                                                | Demonstrates                                                                                                                       |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [Homepage](../src/app/page.tsx)                                                                          | Deep-blue identity hero, real geographic linework, central search, quick actions, metrics, and reduced-motion-aware landing motion |
| [Navbar](../src/components/layout/Navbar.tsx)                                                            | Global hierarchy, desktop mega-menu behavior, mobile drawer, disclosure state, and keyboard/focus handling                         |
| [Footer](../src/components/layout/Footer.tsx)                                                            | Global closing navigation, contribution actions, independent-project context, and external-link treatment                          |
| [Search](../src/app/search/Search.tsx)                                                                   | Editorial search introduction, filters, result rows, empty states, and responsive pagination                                       |
| [Transparency](../src/app/transparency/page.tsx)                                                         | Editorial data, provenance, coverage, and divider-led composition                                                                  |
| [Statistics](../src/app/statistics/page.tsx) and [population](../src/app/statistics/population/page.tsx) | Data hierarchy, genuine comparative graphics, responsive data composition, and source context                                      |

No single route is the universal reference implementation. Use the relevant
archetype and component behavior rather than copying an entire page.

## Applying the system to existing pages

New and redesigned pages follow this guide now. Existing routes may retain
older patterns until they receive an intentional migration; that is temporary,
not an exemption from the system.

When updating an existing page, preserve resident-facing content and working
behavior, then move it toward the current system through the smallest useful
change: stronger hierarchy, fewer unnecessary surfaces, purposeful blue,
quiet icon treatment, and responsive task-first composition. Do not turn a
local migration into a site-wide visual rewrite.

External products may provide occasional historical inspiration, but
BetterSanFernando's live implementation and this document define its visual
direction.
