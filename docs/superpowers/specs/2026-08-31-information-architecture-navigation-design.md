# BetterSanFernando Information Architecture and Navigation Design

## Purpose

Give residents, researchers, and civic contributors a clear view of BetterSanFernando's present and future information architecture without implying that the independent portal is an official City Government website. The header must expose exactly seven primary destinations while preserving Search and language selection as separate utilities.

## Architecture

`src/data/navigation.ts` will be the typed source of truth for the seven top-level navigation entries, mega-menu sections, translated labels, destinations, external-link behavior, and active-route matching. Desktop and mobile navigation will render the same configuration.

A separate typed planned-page registry will describe approved routes that do not have real implementations. `App.tsx` will register those routes with one reusable `PlannedPage` component while retaining explicit routes for Home, Services, Projects, project details, Government, Search, and other real pages. Static planned routes must resolve before generic document/category routes where necessary.

## Information Architecture

The top level is exactly Home, Services, Projects, Government, Transparency, About, and Contact. Services, Projects, Government, and Transparency use mega menus. Home, About, and Contact are single links. Search and the language selector remain utilities.

Each mega menu contains at most four sections. Navigation entries reference real destinations only when the existing page accurately represents the label. Otherwise, the approved destination uses `PlannedPage`. In particular, distinct Services labels must not be pointed at the same generic category merely to populate the menu.

Existing Services routes will be reused where their categories or documents genuinely match: Business Services, Permits & Licenses, Livelihood, Health Services, Education Services, Social Welfare, Infrastructure & Public Works, Agriculture, Environment, and Emergency Information. Employment, Assistance Programs, Senior Citizens, PWD Services, and Hotlines will use matching real documents only where the document scope is exact; otherwise they will receive restrained route scaffolds.

All approved routes in the user brief will be registered. Every clickable mega-menu entry must resolve to a real page or the reusable planned-page system. No status, barangay, search, planned, or awarded project pages will be introduced because those concepts belong to project controls rather than navigation.

## Desktop Interaction

The desktop header preserves the existing branding, tokens, sticky positioning, and utility-bar character. Mega-menu triggers are buttons with adjacent top-level navigation semantics. A full-width panel opens below the main header with up to four balanced columns and no promotional panel.

Menus open deliberately through click and keyboard focus rather than hover alone. Only one menu is open. Escape, outside click, selecting a destination, or changing routes closes it. Trigger buttons expose `aria-expanded` and `aria-controls`; focus returns to the trigger when Escape closes a menu. Active state is derived from configured route prefixes, including Projects for `/procurement`, Government for `/legislation`, and Transparency for `/statistics` and `/barangays`.

## Mobile Interaction

The mobile navigation renders the same seven entries from the shared configuration. Single links remain direct destinations. Mega-menu entries use disclosure buttons; only one group is expanded at a time. Section headings remain visible within expanded content. Search and EN/FIL/PAM selection remain available as separate utilities with usable touch targets and no horizontal overflow.

## Localization

The active localization architecture is i18next with an HTTP backend loading `public/locales/{{lng}}/common.json`, browser/local-storage language detection, and English fallback. Routes are not locale-prefixed and will remain unchanged when locale changes.

All navigation labels, section headings, item labels, accessibility strings, planned-page titles and descriptions, mobile labels, and Contact copy will use translation keys. English will be complete. Filipino and Kapampangan resources will load successfully; known existing Filipino translations may be reused, while missing authoritative translations will fall back to English. Neither locale may expose raw keys or fail resource loading. The selector will expose only EN, FIL, and PAM for this portal.

## Planned Pages

`PlannedPage` will use existing `Section`, `Heading`, `Text`, `Breadcrumbs`, and `SEO` components. Each route will have a translated title and purpose statement plus restrained status copy such as “Data integration in progress.” Pages will contain no fake civic facts, charts, loading states, contacts, or data.

About will briefly establish the portal's independent, community-run purpose and non-official status. Contact will explicitly separate contacting the BetterSanFernando project from locating official CSFP contact information, without inventing phone numbers, email addresses, locations, or social accounts.

## Boundaries

- Preserve all current working routes and route-level code splitting.
- Preserve conditional Search behavior and do not rebuild Search.
- Do not alter canonical/generated civic data, private data, or runtime data access.
- Do not redesign the rest of the site or introduce new dependencies.
- Do not create multiple near-identical page components.
- Do not commit or push.

## Verification

Focused tests will cover config-driven active-route selection and route/config integrity when the existing toolchain permits this without adding a test framework solely for the task. Required validation is `pnpm data:validate`, `pnpm data:smoke`, `pnpm lint`, and `pnpm build`. Browser QA will cover representative real and planned routes, all menus, keyboard and Escape behavior, mobile disclosures, Search, EN/FIL/PAM switching, and desktop/tablet/mobile layouts.
