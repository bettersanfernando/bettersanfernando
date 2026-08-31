# BetterSanFernando Implementation Roadmap

This roadmap derives from the reconciled `SITE-ARCHITECTURE.md` and
`PAGE-DATA-MATRIX.md`. It orders work; it does not authorize the public
frontend to read the private data repository or turn unreviewed private
records into public content.

## Phase 0 — Architecture / legacy alignment

1. Implement the 15 agreed redirects in the matrix's Redirect / Alias
   Registry. Redirect aliases must not appear as canonical pages in
   navigation, metadata, sitemaps, analytics, or search results.
2. Consolidate route ownership around `/government/offices`, `/procurement`,
   `/procurement/contracts`, `/statistics/projects`, `/projects/sources`,
   `/transparency/documents`, `/transparency/full-disclosure`,
   `/transparency/methodology`, and `/statistics/population`.
3. Preserve exactly seven top-level navigation items. Statistics remains a
   Transparency-owned content area and is not an eighth item.
4. Remove or replace unsafe starter-kit content, unsupported generic
   government structures, generic service guidance, and metadata that could
   imply City Government affiliation.
5. Keep the public/private boundary intact: application code reads only
   versioned frontend-safe exports through `src/data/civic/`; the private
   repository is never a runtime or build-time source.
6. Schedule the stale public-document updates listed under Documentation
   follow-up after route behavior and shipped scope are known.

Phase 0 performs no civic-data research, record recovery, private-data export,
or publication-policy decision.

## Phase 1 — READY frontend implementation

The order favors high civic value, reuse of shared directory/map/statistics
patterns, and low duplication. `/projects` and `/projects/:projectId` are
already implemented and are not counted in this implementation queue. READY
continues to describe data readiness; implementation completion is tracked
separately below.

### Completed READY implementation

Batch 1 was implemented, validated, visually reviewed, merged to `main`, and
pushed. Batch 2 was implemented, validated, and visually reviewed on its
feature branch.

| Batch | Canonical page                  | Completed prerequisite redirects                |
| ----: | ------------------------------- | ----------------------------------------------- |
|     1 | `/government/offices`           | `/government/directory`, `/government/contacts` |
|     1 | `/legislation/executive-orders` | None                                            |
|     1 | `/projects/map`                 | None                                            |
|     2 | `/statistics/projects`          | `/projects/dashboard`                           |

`/government/directory` and `/government/contacts` now redirect to
`/government/offices`. `/government/departments` remains in the redirect
registry and is not recorded as completed by this batch.

### Remaining READY implementation sequence

The next two items are numbered by immediate execution order. The remaining
items then continue in their finalized roadmap order, retaining their original
ranks for traceability.

| Next / finalized rank | Canonical page              | Dependencies                                                                         | Reusable pattern established                                              | Important scope caveat                                                                | Prerequisite redirects                                    |
| --------------------: | --------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------- |
|                     1 | `/statistics/population`    | PSA 2024 POPCEN export and 35 barangay records                                       | Sourced totals, comparisons, charts, polygon/table coordination           | Use the single 2024 baseline and total of 377,534; do not silently mix periods        | `/statistics/population/barangays`                        |
|                     2 | `/barangays`                | Demographics export, PSGC identity, and barangay GeoJSON                             | Barangay directory, classification filters, boundary-linked summaries     | No named secretaries, BHERT contacts, or project points are publication-approved      | None                                                      |
|                     7 | `/statistics/city-profile`  | City polygon, PSA population, barangays, and selected office facts                   | Compact sourced profile facts with per-measure dates                      | Core profile only, not a comprehensive socioeconomic profile                          | None                                                      |
|                     8 | `/projects/sources`         | 334 sanitized evidence records and typed evidence APIs                               | Evidence browser, authority/stage filters, established-field explanations | Evidence verifies only named fields; coverage is limited to the 239-project subset    | `/projects/data-sources`                                  |
|                     9 | `/projects/methodology`     | Public schemas, manifest, lifecycle and matching policies                            | Domain methodology layout and semantic callouts                           | `AWARDED != CONTRACTED`; NTP and `COMPLETED` require their own evidence               | None                                                      |
|                    10 | `/transparency/sources`     | Public generated manifest and `civic/sources.ts`                                     | Cross-domain dataset inventory, version, publisher, coverage, exclusions  | List only public release contents and explicitly identify non-exported domains        | None                                                      |
|                    11 | `/transparency/methodology` | Public manifest, schemas, evidence rules, and publication policy                     | Site-wide trust model, anchorable verification/limitations sections       | ABC, winning bid, contract amount, and actual expenditure remain distinct             | `/transparency/verification`, `/transparency/limitations` |
|                    12 | `/about`                    | Reviewed project-owned editorial copy and methodology links                          | Independence, governance, contribution, and sourcing narrative            | BetterSanFernando is independent and not an official City Government site             | None                                                      |
|                    13 | `/government/contact`       | Verified institutional fields from the 22-office export                              | Official-contact finder and discrepancy presentation                      | This is City Government source information, not the BetterSanFernando contact channel | None                                                      |
|                    14 | `/government`               | Office, contact, and legislation destinations                                        | Section hub and cross-domain directory cards                              | Do not add an unsupported organization chart or current-official roster               | None                                                      |
|                    15 | `/legislation`              | Published EO and ordinance collections plus the empty resolution state               | Multi-collection landing page with exact denominators                     | Uneven coverage: 11 EOs, 6 ordinances, and 0 publishable resolutions                  | None                                                      |
|                    16 | `/legislation/ordinances`   | Six public ordinance records and two recovered full texts                            | Metadata-first archive with explicit file-availability state              | Bounded capture; missing full text and history must remain visible                    | None                                                      |
|                    17 | `/procurement/contracts`    | Project/evidence exports with 228 awarded and 6 contracted records                   | Lifecycle-separated record views and evidence-specific amount labels      | An award is not an executed contract; sparse contracts must not be inferred           | `/transparency/contracts`                                 |
|                    18 | `/procurement/bid-results`  | Sanitized project-linked `BID_RESULTS` evidence                                      | Procurement result table and identifier namespaces                        | Winning bid is not ABC, contract amount, or expenditure; not citywide coverage        | None                                                      |
|                    19 | `/procurement`              | Published project-linked procurement evidence and terminology                        | Procurement-stage explainer and bounded collection navigation             | Covers the infrastructure/public-works subset, not all city procurement               | `/transparency/procurement`                               |
|                    20 | `/statistics/procurement`   | Bounded public project/evidence records                                              | Denominator-first aggregate procurement views                             | Subset rates cannot be generalized to all city procurement                            | None                                                      |
|                    21 | `/transparency`             | Public manifest and currently published domain summaries                             | Availability/gap hub with accountable cross-links                         | Finance and disclosure material are not publicly available until exported             | None                                                      |
|                    22 | `/statistics`               | Published population, project, procurement, geography, office, and legislation views | Statistics index with source periods and coverage labels                  | Index only supported measures; Statistics remains under Transparency                  | `/government/reports-and-statistics`                      |
|                    23 | `/search`                   | Canonical published-route inventory and approved public content/data index           | Canonical result model, coverage notice, and alias suppression            | Index only published verified content; exclude private data and planned placeholders  | All Phase 0 redirects                                     |
|                    24 | `/`                         | Shipped canonical destinations and a small reviewed fact set                         | Cross-domain summary cards and visible independence language              | Every metric needs a date and bounded-coverage label; no completeness claim           | None                                                      |

## Phase 2 — PARTIAL pages

### Can ship safely with deliberately bounded scope

| Page                   | Exact READY blocker                                                                                              | Safe bounded release                                                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/government/hotlines` | Operating scope/hours are not verified for the intended urgent-contact set, and a CDRRMO number remains disputed | Publish only cross-verified institutional hotline entries, omit disputed or person-level BHERT data, show verification dates, and label the limited coverage. It remains `PARTIAL` until the intended urgent-contact set is verified. |

### Should wait for more data

| Page                       | Exact READY blocker                                                                                                                                          | Required next work                                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/statistics/demographics` | The approved purpose is composition beyond population totals, but authoritative age, sex, household, density, or another selected dimension is not published | Choose the dimensions first, research authoritative data for them, and create a frontend-safe export. Population alone belongs on `/statistics/population` and must not be repackaged as broad demographics. |

## Phase 3 — Private data workstream

Work in this phase remains private until validation, publication review, and a
versioned allowlisted export are complete.

### RESEARCH queue

| Priority | Work                                                                                                                                                                                  | Public page(s) unblocked                                          |
| -------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
|        1 | Verify the CSFP Citizen's Charter and current city sources for exact service eligibility, requirements, fees, processing times, schedules, locations, forms, and responsible contacts | `/services` and all 14 canonical service page concepts beneath it |
|        2 | Extract and verify the current City Government structure, organizational relationships, mandates, officials, and source dates                                                         | `/government/structure`; later enriches `/government`             |
|        3 | Recover qualifying primary or otherwise publication-grade evidence for individual Sangguniang Panlungsod resolutions                                                                  | `/legislation/resolutions`                                        |
|        4 | Verify exact official CSFP web and social destinations and their owning entities                                                                                                      | `/government/links`                                               |
|        5 | Verify hotline purpose, operating scope/hours, update cadence, and the disputed CDRRMO number                                                                                         | Moves `/government/hotlines` from `PARTIAL` to `READY`            |
|        6 | Select and obtain authoritative demographic dimensions beyond population totals                                                                                                       | Moves `/statistics/demographics` from `PARTIAL` to `READY`        |

Research must not be mixed with a decision to publish sensitive fields or
with the mechanical creation of an export.

### RECOVERY queue

| Priority | Work                                                                                                                                                                        | Public page(s) unblocked or improved                                                                                    |
| -------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
|        1 | Recover project contract documents, notices to proceed, completion evidence, unresolved linkages, collisions, and source conflicts without advancing lifecycle by inference | Improves `/projects/:projectId`, `/procurement/contracts`, `/statistics/projects`, and `/statistics/procurement`        |
|        2 | Recover missing ordinance full text and additional verified ordinances                                                                                                      | Improves `/legislation/ordinances` and `/legislation`                                                                   |
|        3 | Recover the three older referenced executive orders                                                                                                                         | Improves `/legislation/executive-orders` and `/legislation`                                                             |
|        4 | Recover individual resolution evidence after jurisdiction and authority checks                                                                                              | Unblocks `/legislation/resolutions` and improves `/legislation`                                                         |
|        5 | Continue targeted finance recovery for a comparable Annual Budget year, 2023 Q4 SIPB, selected 2022 OCR needs, and COA reports                                              | Improves the future exports for `/transparency/finance`, `/transparency/full-disclosure`, and `/transparency/documents` |

`NOT_FOUND_AFTER_TARGETED_SEARCH` records a recovery outcome; it never proves
that a government record does not exist.

### EXPORT queue

| Priority | Export work                                                                                                                                                             | Public page(s) unblocked                                                                                                          |
| -------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
|        1 | Create public-safe Full Disclosure metadata with report type, period, agency, official URL, provenance, coverage gaps, and reviewed attachment handling                 | `/transparency/full-disclosure`                                                                                                   |
|        2 | Create a unified allowlisted document projection for approved disclosure classes, excluding private paths, audit notes, recovery queues, and sensitive rows             | `/transparency/documents`                                                                                                         |
|        3 | Create a sanitized aggregate finance export and typed frontend module with metric definitions, derivation tests, period-comparability rules, and privacy classification | `/transparency/finance`; may inform the decision on `/statistics/project-spending`                                                |
|        4 | Only if future scope expands beyond the approved bounded subset, create a dedicated safe procurement/bid-results export                                                 | Expands `/procurement`, `/procurement/bid-results`, and `/statistics/procurement`; it does not block their bounded READY versions |

### DECISION queue

| Priority | Decision                                                                                                                                                         | Public page(s) unblocked                                                                                                                         |
| -------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
|        1 | Select the BetterSanFernando contact channel, responsible owner, moderation/abuse process, retention policy, and privacy copy                                    | `/contact`                                                                                                                                       |
|        2 | Decide whether `/statistics/project-spending` is renamed and narrowed to procurement amounts or waits for an actual-expenditure export                           | `/statistics/project-spending`                                                                                                                   |
|        3 | Decide whether named barangay secretary or BHERT/person-level contacts should ever be published, with consent, minimization, update, privacy, and takedown rules | Optional future contact features on `/barangays`, `/government/offices`, or `/government/hotlines`; no current READY page depends on publication |

## Phase 4 — DEFERRED

| Page or feature                                                              | Why postponed                                                                                                                                                                     | Reconsider when                                                                                                                   |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `/statistics/public-records`                                                 | There is no defensible cross-domain records universe, shared denominator, or comparable status model; private recovery counts cannot become government-performance claims         | A reviewed methodology defines the records universe, periods, publication criteria, and comparable denominators                   |
| Project point map                                                            | No verified project point locations exist, and centroids or approximate coordinates would misrepresent project locations                                                          | Verified point coordinates are recovered, reviewed, safely exported, and the architecture approves a distinct point-level purpose |
| Separate Full Disclosure archive workflow                                    | Filtering by type/year/period is already owned by `/transparency/full-disclosure`                                                                                                 | User research demonstrates a materially distinct historical workflow and the architecture is updated first                        |
| Government/legislation statistics routes                                     | `/statistics/government` and `/statistics/legislation` are not approved canonical destinations; directory counts and uneven legislative captures do not justify standalone routes | A distinct civic purpose, adequate verified measures, and an architecture update all exist                                        |
| Generic legacy News, Guides and Regulations, and Public Consultations routes | They are unsupported starter-kit concepts outside the approved information architecture                                                                                           | Product scope, authoritative data, maintenance ownership, and canonical route review justify them                                 |

## Operating model

`SITE-ARCHITECTURE.md` defines where something belongs and which route is
canonical. `PAGE-DATA-MATRIX.md` defines whether that canonical page is ready
and why. This roadmap defines execution order.

Frontend agents work primarily from `READY` items. Private data agents work
from the `RESEARCH`, `RECOVERY`, and `EXPORT` queues. Human/product owners
resolve `NEEDS_DECISION` items. No agent should independently add a major new
route or dataset without updating or reviewing these planning documents.

## Documentation follow-up

After implementation establishes the actual public route and data behavior:

- update `README.md` to describe the canonical sections, seven-item navigation,
  bounded datasets, and public/private repository boundary;
- update `CLAUDE.md` so implementation guidance matches canonical routes,
  redirects, typed civic-data access, and publication constraints; and
- update `docs/PROJECT.md` to remove stale starter-kit scope, counts, and route
  assumptions and link to these three planning documents.

Those files are intentionally not rewritten in this planning task.
