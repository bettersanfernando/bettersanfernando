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
pushed. Batches 2 through 9 were implemented, validated, and visually reviewed
on their feature branches. Batches 10 through 22 were implemented and
validated on their feature branches, with final visual review and commit left
to the human maintainer.

| Batch | Canonical page                  | Completed prerequisite redirects                          |
| ----: | ------------------------------- | --------------------------------------------------------- |
|     1 | `/government/offices`           | `/government/directory`, `/government/contacts`           |
|     1 | `/legislation/executive-orders` | None                                                      |
|     1 | `/projects/map`                 | None                                                      |
|     2 | `/statistics/projects`          | `/projects/dashboard`                                     |
|     3 | `/statistics/population`        | `/statistics/population/barangays`                        |
|     4 | `/barangays`                    | None                                                      |
|     5 | `/statistics/city-profile`      | None                                                      |
|     6 | `/projects/sources`             | `/projects/data-sources`                                  |
|     7 | `/projects/methodology`         | None                                                      |
|     8 | `/transparency/sources`         | None                                                      |
|     9 | `/transparency/methodology`     | `/transparency/verification`, `/transparency/limitations` |
|    10 | `/legislation/ordinances`       | None                                                      |
|    11 | `/procurement/bid-results`      | None                                                      |
|    12 | `/procurement/contracts`        | `/transparency/contracts`                                 |
|    13 | `/statistics/procurement`       | None                                                      |
|    14 | `/government/contact`           | None                                                      |
|    15 | `/legislation`                  | None                                                      |
|    16 | `/procurement`                  | `/transparency/procurement`                               |
|    17 | `/transparency`                 | None                                                      |
|    18 | `/statistics`                   | `/government/reports-and-statistics`                      |
|    19 | `/government`                   | None                                                      |
|    20 | `/about`                        | None                                                      |
|    21 | `/search`                       | None                                                      |
|    22 | `/`                             | None                                                      |

`/government/directory` and `/government/contacts` now redirect to
`/government/offices`. `/government/departments` remains in the redirect
registry and is not recorded as completed by this batch.

### Remaining READY implementation sequence

No READY pages remain in the current general frontend implementation sequence.

## Phase 2 — PARTIAL pages

### Completed bounded batch

`/government/hotlines` shipped its first owner-approved batch of 6 institutional/
emergency contacts, then a 2026-09-06 expansion approved 5 more, for **11**
total: the original 6 (911; CDRRMO Command Center's 961-4357, 649-6076, and
409-6750; CDRRMO/SAFRU's Heroes Hall line; CHO/HEMS's Heroes Hall line) plus
CDRRMO/SAFRU's mobile hotline, CPOSCO's traffic/public-safety contact, the
City of San Fernando Police Station's primary and secondary contacts, and the
City of San Fernando Fire Station's contact — grouped into Emergency numbers,
CDRRMO Command Center contacts, and Related emergency-service office contacts.
The previously disputed 409-6750 is now resolved to the CDRRMO Command Center
by the current canonical Citizen's Charter, with the prior conflicting
attribution preserved as history in the private repository, not deleted. Only
961-4357 and the newly approved SAFRU mobile carry a positive, scoped 24/7
claim (emergency call reception/dispatch, and SAFRU rescue/emergency-response,
respectively); every other contact is explicitly described as not established
as 24/7. It remains `PARTIAL`, not `READY`: a conflicting pair of BFP
landlines and two older, unconfirmed CDRRMO mobile numbers remain held and
unpublished; the Police Station's secondary contact (0956-820-5255) is
already published, but on weaker, single-publisher-sourced evidence pending
second-publisher corroboration; and broader citywide hotline coverage (other
verified `city-offices.json` emergency contacts) has not yet been folded into
this page.

`/government/barangay-contacts` shipped as a new canonical route: a
publication-reviewed, barangay-scoped directory of 324 contacts (35 Barangay
Secretary, 289 BHERT) across all 35 barangays, reproduced from official CSFP
City Information Office Facebook directory posts. Missing names (12), missing
numbers (2), non-standard-length numbers (5), and published landline numbers
(2) are preserved and shown transparently rather than corrected or hidden. No
24/7 claim is made for any barangay-level contact, and the page directs
residents to `/government/hotlines` for citywide emergency dispatch — the two
pages are deliberately separate directories. It is `PARTIAL`, not `READY`:
this is an initial batch with no established reverification cadence for
personnel and number changes.

`/government/links` shipped as a new canonical route: a publication-reviewed
directory of 35 approved official destinations (30 official websites, 2
digital services, 3 institutional Facebook pages), grouped by channel type
with owning entity, purpose, verification date, and a limitation note per
link. The approved CDRRMO Facebook destination carries only its narrow,
reviewed purpose (official CDRRMO information and regular weather updates) —
never a 24/7-monitoring or emergency-dispatch claim; residents are directed to
`/government/hotlines` for emergencies. No phone numbers, addresses, or
personal accounts are included. It is `PARTIAL`, not `READY`: broader
exact-URL verification across remaining departments and city channels
continues beyond this batch.

### Should wait for more data

| Page                       | Exact READY blocker                                                                                                                                          | Required next work                                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/statistics/demographics` | The approved purpose is composition beyond population totals, but authoritative age, sex, household, density, or another selected dimension is not published | Choose the dimensions first, research authoritative data for them, and create a frontend-safe export. Population alone belongs on `/statistics/population` and must not be repackaged as broad demographics. |

## Completed service-publication batches

These are bounded, publication-reviewed subsets already implemented on their
canonical `PARTIAL` category pages (see `PAGE-DATA-MATRIX.md`). They are not
READY pages: each category remains a bounded subset, not complete coverage of
its office or purpose.

| Batch                   |   Count | Category                          | Route                                   |
| ----------------------- | ------: | --------------------------------- | --------------------------------------- |
| BLPD                    |       8 | Business Services                 | `/services/business`                    |
| CDRRMO                  |       7 | Disaster Preparedness             | `/services/disaster-preparedness`       |
| CSWDO Social Assistance |      19 | Assistance Programs               | `/services/assistance-programs`         |
| CSWDO PWD               |       6 | PWD Services                      | `/services/pwd-services`                |
| CSWDO Solo Parent       |      14 | Social Welfare                    | `/services/social-welfare`              |
| CHO                     |      59 | Health Services                   | `/services/health-services`             |
| CIPPESO                 |       7 | Employment                        | `/services/employment`                  |
| CAVO                    |       7 | Agriculture & Fisheries           | `/services/agriculture-fisheries`       |
| CCSFP                   |       9 | Education Services                | `/services/education`                   |
| CENRO                   |       1 | Environment                       | `/services/environment`                 |
| CCRO                    |      15 | Civil Registry                    | `/services/civil-registry`              |
| OSCA                    |       2 | Senior Citizens                   | `/services/senior-citizens`             |
| CAdminO                 |       1 | Infrastructure & Public Works     | `/services/infrastructure-public-works` |
| **Total**               | **155** | **thirteen published categories** |                                         |

Of the canonical Citizen's Charter's 329 services (255 External, 74 Internal),
100 External services remain unpublished; the 74 Internal services are outside
the resident-facing Services scope and remain unpublished. The published Health
Services page is `PARTIAL`, not `READY`: it contains 59 publication-reviewed
CHO records, while external-22 and external-60 remain held and unpublished.
The published Employment page is also `PARTIAL`, not `READY`: it contains 7
publication-reviewed CIPPESO/CPESO records (Community-Based Skills Training,
Employers' Engagement, Mayor's Clearance, Working Permit, Job Referral Online,
Job Referral Walk-in, and Skills Training). CIPPESO's Investment Incentive
record (external-01) is scoped to a future, non-Employment category, and its
Technical Vocational Institutions Accreditation record (external-09) remains
held and unpublished. No current job-fair, SPES, DILP, vacancy, or
training-batch announcement is implied to be currently open; the reviewed
batch/schedule, vacancy-dependence, POEA-to-DMW, and Citizens-Portal-versus-
Charter-workflow limitations are preserved on their respective records.
The published Agriculture & Fisheries page is also `PARTIAL`, not `READY`: it
contains 7 publication-reviewed CAVO records (Bonafide Farmers Certificate,
IPM/INM/Crop Production/IEC, Vegetable Seeds and Seedlings, Animal Vaccination
and Treatment, Livestock Production/IEC Seminar, Poultry Dressing Plant MIC,
and City Slaughterhouse MIC/NMMPIC). No standalone fisheries Charter service
or Fish Production Support procedure is published; the Poultry Dressing Plant
record is scoped to the Meat Inspection Certificate (MIC) only, never the
National Meat and Meat Products Certificate (NMMPIC). No current seed,
seedling, vaccine, or medicine inventory, guaranteed same-day availability, or
current seminar/vaccination schedule is implied; the reviewed
Masterlist/jurisdiction, scheduling-dependence, availability, and
certificate-scope limitations are preserved on their respective records.
The published Education Services page is also `PARTIAL`, not `READY`: it
contains 9 publication-reviewed CCSFP records. Five City College records
(external-01, external-05, external-10, external-11, and external-12) remain
held and unpublished. No current admission or enrollment window, testing
date, scholarship date, faculty vacancy, or permanent Google Form is claimed;
the reviewed schedule, referral, library, and clinic limitations are preserved.
The published Environment page is also `PARTIAL`, not `READY`: it contains the
publication-reviewed CENRO Sale of Compost Fertilizer service. Two tree-related
certification records remain held because their current Charter titles, output
names, and public/private-property scopes conflict. National tree-cutting
permits remain under the applicable DENR/PENRO process.
The published Civil Registry page is also `PARTIAL`, not `READY`: it contains
15 publication-reviewed CCRO services, while external-01, external-06,
external-15, and external-17 remain held. CCRO local registration,
certification, endorsement, and transmission remain distinct from PSA, court,
NACC/RACCO, and City Health Office responsibilities and processing time.
The published Senior Citizens page is also `PARTIAL`, not `READY`: it contains
2 publication-reviewed OSCA services (Applying for a New Senior Citizen's
Card and Applying for the Replacement of the Lost Senior Citizen's Card).
Both are free, in-person-only transactions at Heroes Hall with no online
application or appointment channel and no guaranteed ID/card stock; renewal,
transfer, damaged-card replacement, and record-update procedures remain
unverified and unpublished. Adjacent OSCA/national programs (Grocery/Cinema
booklets, medicine booklets, NCSC Digital NSCID, DSWD Social Pension, and PSA
certificate issuance) remain outside this bounded pair.
The published Infrastructure & Public Works page is also `PARTIAL`, not
`READY`: it contains 1 publication-reviewed CAdminO complaint-intake and
referral service (Processing of Complaints/and other Issues Related to the
Territorial Jurisdiction of the City of San Fernando, Pampanga), presented as
a single bounded procedure covering six issue topics (roads, bridges,
drainage/flooding, streetlights/public lighting, public buildings/facilities,
and other City infrastructure) rather than six separate services. Published
timing covers acknowledgment (5 minutes) plus referral to the concerned Head
of Office (11 hours 55 minutes), totaling 12 hours for intake and referral
only; inspection, evaluation, funding, procurement, scheduling, resolution,
and repair time are not stated and are not published. A topic does not
establish City ownership or maintenance responsibility — that may belong to
the City, barangay, Province, DPWH, a subdivision, a utility, or another
asset owner. No dedicated road/bridge/drainage/streetlight/facility-repair
service, alternate submission channel (email, phone, Facebook, messaging),
CIO "Addressing Public Concerns" service, City Engineer internal form/work
order, Water District service, OCBO/CPDCO service, or repair SLA is
published or implied.

## Phase 3 — Private data workstream

Work in this phase remains private until validation, publication review, and a
versioned allowlisted export are complete.

### RESEARCH queue

| Priority | Work                                                                                                                                                                                                                                                                                      | Public page(s) unblocked                                                                                      |
| -------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
|        1 | Continue verifying CSFP Citizen's Charter and current city sources beyond the currently published 155 External services across thirteen categories, including OSCA renewal/transfer/damaged-card/record-update procedures and Infrastructure & Public Works repair/maintenance procedures | The 1 remaining planned Services category and broader coverage within the 13 published but PARTIAL categories |
|        2 | Extract and verify the current City Government structure, organizational relationships, mandates, officials, and source dates                                                                                                                                                             | `/government/structure`; later enriches `/government`                                                         |
|        3 | Recover qualifying primary or otherwise publication-grade evidence for individual Sangguniang Panlungsod resolutions                                                                                                                                                                      | `/legislation/resolutions`                                                                                    |
|        4 | Continue exact official CSFP web and social destination verification beyond the published 35-link batch                                                                                                                                                                                   | Moves `/government/links` from `PARTIAL` to `READY`                                                           |
|        5 | Clarify the conflicting BFP landline pair, obtain second-publisher corroboration for the single-publisher-sourced secondary police contact, and review the remaining citywide hotline coverage; 11 contacts across two approval batches are already published                             | Moves `/government/hotlines` from `PARTIAL` to `READY`                                                        |
|        6 | Select and obtain authoritative demographic dimensions beyond population totals                                                                                                                                                                                                           | Moves `/statistics/demographics` from `PARTIAL` to `READY`                                                    |

The City Health Office publication batch is implemented as the bounded,
publication-reviewed set described above. Health Services remains `PARTIAL`.

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

| Priority | Decision                                                                                                                               | Public page(s) unblocked       |
| -------: | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
|        1 | Select the BetterSanFernando contact channel, responsible owner, moderation/abuse process, retention policy, and privacy copy          | `/contact`                     |
|        2 | Decide whether `/statistics/project-spending` is renamed and narrowed to procurement amounts or waits for an actual-expenditure export | `/statistics/project-spending` |

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
