# BetterSanFernando

BetterSanFernando is an independent civic-information and transparency portal
for the City of San Fernando, Pampanga, Philippines. It organizes verified
local government information — services, projects, government structure,
legislation, and transparency records — around resident needs, with a clear
link from every published fact back to its source.

**BetterSanFernando is not the official website of the City Government of San
Fernando.** It is an independent project, not affiliated with, endorsed by, or
authorized to speak on behalf of the City Government. Official City Government
contact information is presented as sourced official information, not as a
BetterSanFernando channel.

## Current public scope

The site has exactly seven top-level navigation areas:

- **Home** — introduces the portal and surfaces high-value civic facts.
- **Services** — resident-facing guidance on city services, organized by need.
- **Projects** — a bounded, verified subset of city infrastructure/public-works
  projects and their evidence.
- **Government** — offices, official contacts, and legislation.
- **Transparency** — published-record inventory, sources, and methodology.
  Statistics is a content area under Transparency, not a separate top-level
  item.
- **About** — the project's purpose, independence, and methodology.
- **Contact** — `/government/contact`, a concise hub for verified official
  City Government contact channels. `/contact` permanently redirects here;
  there is no separate BetterSanFernando feedback channel.

Full route ownership and publication rules are defined in
[`docs/SITE-ARCHITECTURE.md`](docs/SITE-ARCHITECTURE.md).

## Current bounded data snapshot

These are BetterSanFernando's current published holdings, not complete City
Government inventories. Coverage is progressive: absence from the portal does
not mean a City service or record does not exist, only that it has not yet
been verified and reviewed for publication.

| Domain                            | Published count                                                 |
| --------------------------------- | --------------------------------------------------------------- |
| Reviewed External service records | 177                                                             |
| Published service categories      | 16 of 16                                                        |
| Planned service categories        | 0 of 16                                                         |
| Project records                   | 324                                                             |
| Project-evidence records          | 563                                                             |
| Project Cost & Utilization        | 298 observations across 109 projects                            |
| Official Documents                | 9 verified records                                              |
| Barangays                         | 35                                                              |
| City-office directory records     | 44                                                              |
| Demographic profile records       | 136 (2024 household population, 2020 age/sex, 2023 poverty SAE) |
| Government structure entities     | 44 (33 official-directory matches, 14 verified relationships)   |
| Government Hotlines contacts      | 11                                                              |
| Barangay Contacts records         | 324 (35 Secretary, 289 BHERT)                                   |
| Official Government Links         | 35 (30 websites, 2 digital services, 3 Facebook pages)          |
| Executive orders                  | 13 (11 archive-captured, 2 subject-verified 2023)               |
| Ordinances                        | 11 (2 full text, 9 metadata/reference)                          |
| Resolutions                       | 2 (subject-verified)                                            |
| City Finances reports             | 53 reports, 121 observations                                    |
| Public Records Coverage metrics   | 8 datasets, 6 archive-range entries, 1 related collection       |

Published service categories:

| Category                      | Records | Route                                   |
| ----------------------------- | ------: | --------------------------------------- |
| Business Services             |       8 | `/services/business`                    |
| Disaster Preparedness         |       7 | `/services/disaster-preparedness`       |
| Assistance Programs           |      19 | `/services/assistance-programs`         |
| Social Welfare                |      14 | `/services/social-welfare`              |
| PWD Services                  |       6 | `/services/pwd-services`                |
| Health Services               |      59 | `/services/health-services`             |
| Employment                    |       7 | `/services/employment`                  |
| Agriculture & Fisheries       |       7 | `/services/agriculture-fisheries`       |
| Education Services            |       9 | `/services/education`                   |
| Environment                   |       1 | `/services/environment`                 |
| Civil Registry                |      15 | `/services/civil-registry`              |
| Senior Citizens               |       2 | `/services/senior-citizens`             |
| Infrastructure & Public Works |       1 | `/services/infrastructure-public-works` |
| Housing & Land Use            |       2 | `/services/housing-land-use`            |
| Utilities & Water             |       9 | `/services/utilities-water`             |
| Property & Taxes              |      11 | `/services/property-taxes`              |

[`/government/hotlines`](src/pages/GovernmentHotlines.tsx),
[`/government/barangay-contacts`](src/pages/GovernmentBarangayContacts.tsx),
and [`/government/links`](src/pages/GovernmentOfficialLinks.tsx) are all
`PARTIAL`, not `READY`, and are deliberately separate directories: Government
Hotlines is the citywide emergency/institutional contact list (11 contacts),
Barangay Contacts is a barangay-scoped Barangay Secretary/BHERT directory (324
contacts across all 35 barangays) reproduced from official CSFP City
Information Office posts, and Official Government Links is a directory of 35
verified official websites, digital services, and Facebook pages with no
phone numbers or addresses. None claims to be independently call-tested or a
citywide emergency-dispatch destination; BetterSanFernando remains
independent from the City Government throughout.

All 16 canonical service categories are published; none remain planned. A
completed no-export research decision found no unique, permanent,
publication-ready City service for a standalone Livelihood category, so no
Livelihood category or page is published; livelihood-related services
(skills training, agricultural support, and compost-fertilizer sale) remain
available under Employment, Agriculture & Fisheries, and Environment. Health
Services, Employment, Agriculture & Fisheries, and Education Services are
all
`PARTIAL`, not `READY`: Health Services' 59 publication-reviewed CHO records,
Employment's 7 publication-reviewed CIPPESO records, and Agriculture &
Fisheries' 7 publication-reviewed CAVO records are each a bounded subset of
the canonical inventory. Employment's Investment Incentive record
(external-01) and Technical Vocational Institutions Accreditation record
(external-09) are intentionally excluded — the former is scoped to a future
category, the latter remains held. Agriculture & Fisheries publishes no
standalone fisheries Charter service and no Fish Production Support
service — the CAVO batch covers agriculture, crops, animal health, and meat
regulation only; its Poultry Dressing Plant record is scoped to the Meat
Inspection Certificate (MIC) only, not the National Meat and Meat Products
Certificate (NMMPIC). Education Services publishes nine reviewed City College
procedures and remains `PARTIAL`; five City College Charter records remain
held, and no current admission or enrollment window is claimed. Environment
publishes one reviewed CENRO compost-sale service and remains `PARTIAL`; two
tree-related certification records remain held, and national tree-cutting
permits remain under the applicable DENR/PENRO process. Civil Registry
publishes 15 reviewed CCRO procedures and remains `PARTIAL`; four CCRO records
remain held, and PSA, court, NACC/RACCO, and City Health Office responsibilities
remain separate. Senior Citizens publishes two reviewed OSCA procedures (new
Senior Citizen ID issuance and lost-card replacement) and remains `PARTIAL`;
renewal, transfer, damaged-card replacement, and record-update procedures
remain unverified. Infrastructure & Public Works publishes one reviewed
City Administrator's Office (CAdminO) complaint-intake and referral
procedure and remains `PARTIAL`; it covers only the 12-hour intake/referral
window across six issue topics (roads, bridges, drainage/flooding,
streetlights, public buildings, and other City infrastructure) — it is not a
repair service, and inspection, evaluation, funding, scheduling, resolution,
and repair time are not stated. Housing & Land Use publishes two reviewed
Office of the City Building Official (OCBO) certificate procedures (Annual
Inspection Certificate & Certificate of Operation, and Certificate of Final
Electrical Inspection/Completion for Small Electrical) and remains
`PARTIAL`; both use the PD 1096 Schedule of Fees with no fixed peso amount
shown, a maximum/exactly-3-working-day Simple processing time that excludes
the physical inspection itself, and no guaranteed inspection slot or
issuance. OCBO's downloadable forms remain temporarily unavailable and no
online filing channel is published; the institutional email is an inquiries
-only contact, not a submission channel. Building permits, certificates of
occupancy, zoning clearances, and other building/zoning transactions remain
unpublished pending source clarification. Another 87 CSFP External services
and all 74 CSFP Internal services remain unpublished; CHO records
external-22 and external-60 remain held and are not published. Utilities &
Water publishes nine reviewed City of San Fernando Water District (CSFWD)
Charter transactions plus two supporting resources (a Billing Inquiry tool
and the Feedback and Complaints Mechanism) and remains `PARTIAL`. CSFWD is a
distinct Water District organized under Presidential Decree 198 — not a
City Government office or City Engineer division — and its own Citizen's
Charter is separate from the CSFP Citizen's Charter counted above; service
availability applies only within CSFWD/PW-CSF coverage, not every San
Fernando barangay or property. No universal flat new-connection fee, online
payment, online application, or 24/7 hotline/office is published for
Utilities & Water; the two reconnection procedures remain separate, and the
maintenance procedure's eight technical subtypes remain one canonical
service, not separate pages. Property & Taxes publishes eleven reviewed
records from two offices and remains `PARTIAL`: eight City Assessor's
Office records (appraisal, assessment, tax declarations, ownership-record
updates, tax mapping, and assessment documents) and three City Treasurer's
Office records (RPT/Amilyar, transfer tax, and individual Community Tax
Certificate). Six additional Assessor records, Market Stall Rental, and a
standalone RPT Clearance service remain held. Assessor Transfer of
Ownership updates the City's own assessment record only and does not
perform land-title registration, which remains with the Registry of
Deeds/LRA; applicable national tax requirements remain with the BIR; and
building, occupancy, zoning, and locational responsibilities remain with
OCBO and CPDCO. No online RPT, transfer-tax, or CTC payment/application
channel is published, no universal barangay CTC availability is claimed,
and no current Schedule of Market Values table is included. See
[`docs/PAGE-DATA-MATRIX.md`](docs/PAGE-DATA-MATRIX.md) for the full
page-by-page readiness assessment and
[`docs/IMPLEMENTATION-ROADMAP.md`](docs/IMPLEMENTATION-ROADMAP.md) for what is
planned next.

## Data and publication model

Private research and canonical civic data are maintained in a separate,
private repository. This repository (`bettersanfernando`) is the **public
frontend only**:

- Canonical/raw research data, source PDFs/XLSX, recovery queues, and internal
  analysis files are never copied into this repository.
- The frontend consumes only a versioned, reviewed, frontend-safe export,
  vendored into `src/data/generated/civic/`.
- Application code reads that data exclusively through the typed access layer
  in `src/data/civic/` — never by importing generated JSON/GeoJSON directly,
  and never by reading the private repository at build or run time.
- Generated frontend data is refreshed only through the established sync
  workflow (`pnpm data:sync`); it is never hand-edited.
- The 85 NTA-sourced projects use `IMPLEMENTATION_REPORTED`: an official
  implementation or utilization report describes activity, without independently
  establishing an award, signed contract, payment, disbursement, or physical
  verification.
- Project Cost & Utilization has partial coverage (109 of 324 projects). Source
  currency is unstated, and Total Cost Incurred to Date is not interpreted as
  actual payment or spending.
- `/transparency/documents` is a hybrid discovery hub and bounded nine-record
  collection of Citizen’s Charters, business forms, and privacy documents.
  Laws, Full Disclosure, procurement, projects, and services remain in their
  canonical datasets; held and excluded documents remain unpublished.
- Private research files, sensitive or person-level data, recovery queues, and
  source workbooks existing privately does not make them publication-safe —
  publishing a dataset requires a deliberate, allowlisted export and
  publication review.

See the **Repository Boundary** section of [`CLAUDE.md`](CLAUDE.md) for the
exact rules agents and contributors must follow.

## Technology

- React 19, TypeScript, Vite
- React Router, Tailwind CSS
- i18next for multilingual support
- Zod-validated typed data access layer
- pnpm as the package manager (`packageManager: pnpm@11.9.0`)

## Local development

```bash
pnpm install       # Install dependencies
pnpm dev           # Start the development server (localhost:5173)
pnpm build         # TypeScript check + production build
pnpm lint          # Run ESLint
```

### Data validation and smoke tests

These checks run against the already-vendored, public-safe data in
`src/data/generated/civic/` and require no private-repository access:

```bash
pnpm data:validate            # Validate the vendored civic-data export
pnpm data:smoke                # Civic data layer smoke checks
pnpm services:smoke            # Services dataset and route smoke checks
pnpm nav:smoke                  # Navigation and planned-page smoke checks
pnpm check:public-data-boundary # Guard against private data re-entering this repo
```

Additional domain-specific smoke tests (projects, barangays, legislation,
transparency, statistics, government, search, and more) are listed in
`package.json`.

## Repository structure

```
src/
├── pages/                    # Route-level page components
├── components/                # Reusable UI and layout components
├── data/
│   ├── civic/                 # Typed, validated access layer for civic data
│   │                            (the only sanctioned way to read civic data)
│   └── generated/civic/       # Vendored frontend-safe export (never hand-edited)
├── lib/                       # Utility functions (markdown/YAML loaders, etc.)
└── i18n/                      # Internationalization setup

scripts/                      # Data sync, validation, and smoke-test scripts
docs/                         # Architecture, data-readiness, and roadmap docs
content/                      # YAML/Markdown content for Services and Government
```

## Data synchronization

Maintainers with local access to the private `bettersanfernando-data`
repository can refresh the vendored export:

```bash
pnpm data:sync
# or: pnpm data:sync -- --source=/path/to/bettersanfernando-data
```

This copies only the files declared in that repository's versioned, checksummed
export manifest into `src/data/generated/civic/`, verifying every checksum
before copying. It is a local maintainer step, never a production or CI
dependency — the private repository is never a runtime or production data
source for this application.

## Methodology and limitations

- [`docs/SITE-ARCHITECTURE.md`](docs/SITE-ARCHITECTURE.md) — canonical routes,
  section ownership, and publication rules.
- [`docs/PAGE-DATA-MATRIX.md`](docs/PAGE-DATA-MATRIX.md) — per-page data
  readiness and publication status.
- [`docs/IMPLEMENTATION-ROADMAP.md`](docs/IMPLEMENTATION-ROADMAP.md) — what has
  shipped and what is planned next.
- In the running application, `/transparency/methodology` and
  `/projects/methodology` explain verification, lifecycle, and data-quality
  rules for the published domains, and `/transparency/sources` inventories the
  sources behind them.

Coverage is progressive and intentionally bounded. Verification status and
provenance matter more than apparent completeness: the portal does not infer
or fill in missing government facts, and an empty or partial dataset is
reported as such rather than backfilled with assumptions.

## Contributing

1. Fork or branch, install dependencies with `pnpm install`, and run `pnpm dev`
   to work locally.
2. Follow the conventions and repository boundary documented in
   [`CLAUDE.md`](CLAUDE.md).
3. Run `pnpm lint` and `pnpm build` before opening a pull request; run the
   relevant smoke tests for any area you changed.
4. A pre-commit hook runs `lint-staged` (ESLint + Prettier) automatically on
   staged files.
5. Any change that affects routes, published dataset counts, category
   publication status, or coverage statements must complete the
   documentation-impact checkpoint described in `CLAUDE.md` — either update the
   affected planning documents in the same change, or state
   `Documentation impact: none` with a specific reason.

## License

This project is licensed under [CC0 1.0 Universal](LICENSE) (Creative Commons
Zero) — see the [`LICENSE`](LICENSE) file for the full text.
