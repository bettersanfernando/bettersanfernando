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
|    14 | `/government/contact`           | `/contact`                                                |
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

`/government/contact` was later redesigned from a searchable 44-office
directory into a concise contact hub: emergency contacts (911, CDRRMO's
primary emergency-dispatch line, the City of San Fernando Police
Headquarters, and the Bureau of Fire Protection San Fernando), general City
Hall and Heroes Hall trunk lines, and destination cards to the fuller
`/government/hotlines`, `/government/barangay-contacts`, `/government/links`,
and `/services` directories. `/contact` now permanently redirects here — it
was previously its own registered planned page — and the top-level Contact
navigation item points directly at `/government/contact`, so there is exactly
one visible Contact navigation destination.

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

`/transparency/full-disclosure` shipped as a new canonical route: a
publication-reviewed directory of 10 individually verified Full Disclosure
Policy report records (2023–2026) — 4 Annual Procurement Plans, 2 Procurement
Monitoring Reports, 2 Trust Fund Utilization reports, and 2 Special Education
Fund Utilization reports — each with an official page link, an official
attachment link where provided, file type, publishing agency, and
verification date. Search, report-type and year filters, and reporting-year
grouping are implemented; no financial amounts, line items, or disbursements
are extracted or published. It is `PARTIAL`, not `READY`: three unverified
records (APP CY2021, Indicative APP CY2021, PMR 2nd Semester 2020) remain held
and unpublished, and the canonical inventory separately tracks a materially
larger set of official source records not yet individually verified.

`/statistics/project-spending` shipped under the safer public title "Project
Cost & Utilization": 298 verified, source-reported, year-to-date
cost-utilization observations covering 109 of the 324 canonical projects (108
with repeated within-year observations across their reporting quarters).
Each observation shows Total Cost, Total Cost Incurred to Date, a derived
cost-incurred percentage, source-reported physical completion, and a link to
its official source; `currency_unit` is null throughout and every amount is
labeled "Currency not stated in source" rather than formatted as PHP or
peso. Quarterly observations are never summed, and observations are never
connected across different years. The matched project-detail pages show a
conditional Project Cost & Utilization section; the other 215 projects show
none, and none is implied to have zero cost. It is `PARTIAL`, not `READY`:
only 109 of 324 projects have a reviewed observation, and Total Cost Incurred
to Date is not proof of cash payment or disbursement.

`/legislation/resolutions` shipped as a new canonical route: 2 subject-verified
resolution records (identified only via official City cross-references), each
showing its document number, verified subject, year-level date precision, and
issuing body, with a link to its official cross-reference. Neither record has
a formal title, an exact adoption date, or full text — none is manufactured.
The 2022 (126 positions) and 2023 (264 positions) archive-range counts from
`statistics/public-records-coverage.json` are shown in a clearly separate
"archive-range context" section and are never promoted into individually
published resolution records. It is `PARTIAL`, not `READY`: this is a bounded
2-record batch, and additional resolutions remain in recovery.

`/transparency/finance` shipped as "City Finances": 53 owner-approved official
aggregate finance reports and 121 non-additive, source-reported observations,
backed by the typed `civic/finance.ts` access layer. The page provides a
coverage summary by report family/fund/year, a searchable and filterable
report catalog with official page and attachment links, and comparison-safe
charts limited to observations that share the same report, fund, period, and
accounting basis: receipts vs. expenditures (SRE), authorized budget
(annual budget), ending cash balance (cash flow), outstanding debt
(indebtedness snapshots), SEF utilization, and derived LDRRMF/20% NTA-IRA
utilization percentages. `currency_code` and `unit_text` are null throughout,
so every amount renders as a plain number with an explicit "unit not stated"
note — never PHP, pesos, thousands, or millions. Cumulative year-to-date
quarters are never summed, incompatible funds/periods/bases are never
combined, and City Finances is never combined with the separate 298 Project
Cost & Utilization observations. UCA report rows stay aggregate-only. It is
`PARTIAL`, not `READY`: this is a bounded 53-report batch, and additional
report years and families remain in recovery.

`/statistics/legislation` shipped as a new canonical route: a coverage
comparison of BetterSanFernando's published 13 Executive Orders, 11
Ordinances, and 2 Resolutions, by count and by published year (drawn from
`statistics/public-records-coverage.json`'s per-type `period_coverage`), with
links to each collection. The 2022/2023 resolution, ordinance, and
appropriation-ordinance archive-range positions are shown in a clearly
separate table and never counted as individually published records. The page
states that BetterSanFernando does not infer legal effect, current validity,
repeal status, sponsors, authors, or complete archive coverage, and that these
counts are not the City's total legislative output. It is `PARTIAL`, not
`READY`: legislation recovery for all three record types continues.

`/statistics/public-records` shipped as a new canonical route: a per-dataset
coverage view backed by the `statistics/public-records-coverage.json` export
(8 core metrics, 6 archive-range entries, 1 related collection), typed via
`civic/publicRecordsCoverage.ts`. Each metric — projects (324), project
evidence (563), services (177), Full Disclosure documents (10), official
documents (9), Executive Orders (13), Ordinances (11), and Resolutions (2) —
keeps its own unit label, coverage years, and canonical-route link; the 53
City Finances reports appear only in a separate "related specialized
collections" section, and archive-range positions appear only in their own
table. No combined "total public records" figure is computed or published.
It is `PARTIAL`, not `READY`: coverage will expand as additional datasets are
published.

### Should wait for more data

`/statistics/demographics` was previously listed here pending authoritative
age, sex, household, and poverty dimensions beyond population totals. The
`demographic-profile` export now publishes 2024 household population and
households, 2020 age/sex structure with derived age bands, and a 2023 poverty
small area estimate, so the page is implemented as a bounded `PARTIAL` page
(see `PAGE-DATA-MATRIX.md`); population density remains held pending an
available PSA source table. No page currently waits on further data.

## Completed service-publication batches

These are bounded, publication-reviewed subsets already implemented on their
canonical `PARTIAL` category pages (see `PAGE-DATA-MATRIX.md`). They are not
READY pages: each category remains a bounded subset, not complete coverage of
its office or purpose.

| Batch                   |   Count | Category                         | Route                                   |
| ----------------------- | ------: | -------------------------------- | --------------------------------------- |
| BLPD                    |       8 | Business Services                | `/services/business`                    |
| CDRRMO                  |       7 | Disaster Preparedness            | `/services/disaster-preparedness`       |
| CSWDO Social Assistance |      19 | Assistance Programs              | `/services/assistance-programs`         |
| CSWDO PWD               |       6 | PWD Services                     | `/services/pwd-services`                |
| CSWDO Solo Parent       |      14 | Social Welfare                   | `/services/social-welfare`              |
| CHO                     |      59 | Health Services                  | `/services/health-services`             |
| CIPPESO                 |       7 | Employment                       | `/services/employment`                  |
| CAVO                    |       7 | Agriculture & Fisheries          | `/services/agriculture-fisheries`       |
| CCSFP                   |       9 | Education Services               | `/services/education`                   |
| CENRO                   |       1 | Environment                      | `/services/environment`                 |
| CCRO                    |      15 | Civil Registry                   | `/services/civil-registry`              |
| OSCA                    |       2 | Senior Citizens                  | `/services/senior-citizens`             |
| CAdminO                 |       1 | Infrastructure & Public Works    | `/services/infrastructure-public-works` |
| OCBO                    |       2 | Housing & Land Use               | `/services/housing-land-use`            |
| CSFWD                   |       9 | Utilities & Water                | `/services/utilities-water`             |
| CASSO                   |       8 | Property & Taxes                 | `/services/property-taxes`              |
| CTO                     |       3 | Property & Taxes                 | `/services/property-taxes`              |
| **Total**               | **177** | **sixteen published categories** |                                         |

Of the canonical CSFP Citizen's Charter's 329 services (255 External, 74
Internal), 87 External services remain unpublished; the 74 Internal services
are outside
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
The published Housing & Land Use page is also `PARTIAL`, not `READY`: it
contains 2 publication-reviewed Office of the City Building Official (OCBO)
services (Annual Inspection Certificate & Certificate of Operation, and
Certificate of Final Electrical Inspection/Completion for Small Electrical).
Both use the PD 1096 Schedule of Fees and applicable regulatory/ordinance
charges — no fixed peso amount is shown. The Annual Inspection Certificate's
processing time is a maximum of 3 working days (Simple); the electrical
completion certificate's is 3 working days (Simple); both explicitly exclude
the physical inspection itself from that figure, and neither guarantees an
inspection slot or immediate issuance. The electrical certificate is scoped
to Small Electrical only, not a general electrical permit or large-project
completion service. OCBO's downloadable forms remain temporarily unavailable
while procedures are reengineered; no online filing channel is published,
and the institutional email is an inquiries-only contact, not a submission
channel — the reviewed in-person OCBO/City Treasurer workflow is preserved.
Held/excluded building and zoning records (Building Permit and other
Ancillary/Accessory Permits, Certificate of Occupancy, Document/
Certification Requests, Securing Locational Clearance/Zoning for Building,
Securing Zoning Certificate for Land, Securing Zoning Certificate for
Business Permit, Dole Permit to Operate – Payment, Requesting for a
Certificate of Conformity Based on CSFP Heritage Ordinance, and Notice of
Violations) remain unpublished pending source clarification.
The published Utilities & Water page is also `PARTIAL`, not `READY`: it
contains 9 publication-reviewed City of San Fernando Water District (CSFWD)
Charter transactions (Acceptance of Water Bill Payments, Change of Account
Name, New Service Application, Reconnection of Accounts Disconnected Within
Twenty-Four (24) Hours, Reconnection of Accounts Disconnected After
Twenty-Four (24) Hours, Senior Citizen Discount, Transfer of Water Service
Line/Meter, Various MAINTENANCE Services, and Voluntary Disconnection of
Water Service Connection), plus 2 supporting resources (Billing Inquiry, an
inquiry-only tool distinct from online payment; Feedback and Complaints
Mechanism, a shared customer-support channel with a three-working-day reply
standard). CSFWD is a distinct Water District organized under Presidential
Decree 198 — not a City Government office or City Engineer division — with
its own separate Citizen's Charter (2025, 1st Edition). Service availability
applies only within CSFWD/PW-CSF coverage; not every San Fernando barangay
or property is served. No universal flat new-connection fee, online
payment, online application, or 24/7 hotline/office is published; the two
reconnection procedures remain separate transactions, and the maintenance
procedure's eight technical subtypes (leak repairs, no-water/low-pressure,
water-quality concerns, meter-accuracy checks, and meter replacement) remain
one canonical service, not separate service pages. No septage/desludging
service, PWD/lifeline discount, named third-party payment partner, or
unauthenticated Facebook link is published; the Charter-named Facebook page
is explicitly noted as unconfirmed and withheld.
The published Property & Taxes page is also `PARTIAL`, not `READY`: it
contains 11 publication-reviewed records from two offices with distinct
responsibilities — 8 City Assessor's Office records (Availing of Transfer
of Ownership, Issuance of Certificate of Cancelled Assessment, Issuance of
Certificate of Property Holdings, Issuance of Certified True Copy of Tax
Declaration, Issuance of Owner's Copy of Tax Declaration, Securing
Assessment for Declaration of Buildings, Securing of Certification as per
Tax Mapping, and Securing of Certified Tax Map) and 3 City Treasurer's
Office records (Payment of Real Property Tax or Amilyar, Payment of Tax on
Transfer of Real Property Ownership, and Securing Community Tax Certificate
– Individual). The City Assessor's Office handles appraisal, assessment,
tax declarations, ownership-record updates, tax mapping, and assessment
documents; the City Treasurer's Office handles tax computation, collection,
payment records, receipts, transfer tax, RPT/Amilyar, and individual
Community Tax Certificates. A Treasurer payment window inside an Assessor
procedure does not make that Assessor service Treasurer-owned. Land-title
registration remains with the Registry of Deeds/LRA; applicable national
tax requirements remain with the BIR; building, occupancy, zoning, and
locational responsibilities remain with OCBO and CPDCO. Six additional
Assessor records, Market Stall Rental, a standalone RPT Clearance service,
Business Community Tax Certificate, Assessor/OCBO/BLPD/CCRO cashiering
legs, calesa/tricycle/tri-wheeler permits, and other business
certifications and out-of-category collections remain held or excluded. No
online RPT, transfer-tax, or CTC payment/application channel is published,
no universal barangay CTC availability is claimed, and no current Schedule
of Market Values table is included; RPT account inquiry and
statement-of-account information stay integrated within the RPT record as
exported, not as a separate service.
Livelihood research is complete and closed with a no-export decision: no
unique, permanent, publication-ready City service was verified for a
standalone Livelihood category, so no Livelihood category or page is
published and none remains planned. The seven previously identified
livelihood-related services remain published under their owning
categories — Employment (Community-Based Skills Training, Skills Training),
Agriculture & Fisheries (Issuance of Certificate for Bonafide Farmers,
Request for IPM/INM/Crop Production/IEC, Request for Vegetable Seeds and
Request for Vegetable and Fruit-Bearing Seedlings, Request for Livestock
Production/IEC Seminar), and Environment (Sale of Compost Fertilizer) — with
no duplication. Investment Incentive assistance, TVI Accreditation, DILP
distributions/starter-kit awards, Kayabe Ka/King Kabiayan, job fairs and
training announcements, and DOLE/DSWD/DTI/TESDA national programs remain
excluded as CSFP-owned services. All 16 canonical Services categories are now
published; zero planned service-category placeholders remain.

## Phase 3 — Private data workstream

Work in this phase remains private until validation, publication review, and a
versioned allowlisted export are complete.

### RESEARCH queue

| Priority | Work                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Public page(s) unblocked                                        |
| -------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
|        1 | Continue verifying CSFP Citizen's Charter and current city sources beyond the currently published 168 CSFP External services across fifteen CSFP-owned categories, including OSCA renewal/transfer/damaged-card/record-update procedures, Infrastructure & Public Works repair/maintenance procedures, Housing & Land Use building-permit/occupancy/zoning transactions, and the six held Property & Taxes Assessor records, Market Stall Rental, and standalone RPT Clearance; separately, continue verifying additional CSFWD Charter procedures beyond the nine published Utilities & Water transactions | Broader coverage within the 16 published but PARTIAL categories |
|        2 | Extract and verify the current City Government structure, organizational relationships, mandates, officials, and source dates                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `/government/structure`; later enriches `/government`           |
|        3 | Recover qualifying primary or otherwise publication-grade evidence for additional individual Sangguniang Panlungsod resolutions beyond the 2 currently subject-verified and published                                                                                                                                                                                                                                                                                                                                                                                                                       | `/legislation/resolutions` (implemented, `PARTIAL`)             |
|        4 | Continue exact official CSFP web and social destination verification beyond the published 35-link batch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Moves `/government/links` from `PARTIAL` to `READY`             |
|        5 | Clarify the conflicting BFP landline pair, obtain second-publisher corroboration for the single-publisher-sourced secondary police contact, and review the remaining citywide hotline coverage; 11 contacts across two approval batches are already published                                                                                                                                                                                                                                                                                                                                               | Moves `/government/hotlines` from `PARTIAL` to `READY`          |
|        6 | Retry the PSA population-density source table (held since 2026-07-06 due to a PXWeb server error) once it becomes available                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Moves `/statistics/demographics` from `PARTIAL` to `READY`      |
|        7 | Continue verifying additional Full Disclosure report years and types beyond the published 10-record batch, including the three held records (APP CY2021, Indicative APP CY2021, PMR 2nd Semester 2020)                                                                                                                                                                                                                                                                                                                                                                                                      | Moves `/transparency/full-disclosure` from `PARTIAL` to `READY` |
|        8 | Continue verifying additional Project Cost & Utilization observations beyond the published 109-of-324-project batch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Moves `/statistics/project-spending` from `PARTIAL` to `READY`  |

The City Health Office publication batch is implemented as the bounded,
publication-reviewed set described above. Health Services remains `PARTIAL`.

Research must not be mixed with a decision to publish sensitive fields or
with the mechanical creation of an export.

### RECOVERY queue

| Priority | Work                                                                                                                                                                        | Public page(s) unblocked or improved                                                                             |
| -------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
|        1 | Recover project contract documents, notices to proceed, completion evidence, unresolved linkages, collisions, and source conflicts without advancing lifecycle by inference | Improves `/projects/:projectId`, `/procurement/contracts`, `/statistics/projects`, and `/statistics/procurement` |
|        2 | Recover missing ordinance full text and additional verified ordinances                                                                                                      | Improves `/legislation/ordinances` and `/legislation`                                                            |
|        3 | Recover the three older referenced executive orders                                                                                                                         | Improves `/legislation/executive-orders` and `/legislation`                                                      |
|        4 | Recover additional individual resolution evidence after jurisdiction and authority checks                                                                                   | Improves `/legislation/resolutions` (implemented, `PARTIAL`) and `/legislation`                                  |
|        5 | Continue targeted finance recovery for a comparable Annual Budget year, 2023 Q4 SIPB, selected 2022 OCR needs, and COA reports                                              | Improves `/transparency/finance` (implemented, `PARTIAL`, 53 reports/121 observations)                           |

`NOT_FOUND_AFTER_TARGETED_SEARCH` records a recovery outcome; it never proves
that a government record does not exist.

### EXPORT queue

`/transparency/documents` is implemented as a hybrid hub backed by a bounded
nine-record export. It remains `PARTIAL`: canonical laws, Full Disclosure,
procurement, projects, and services stay in their own datasets, while held and
excluded documents remain unpublished.
All four canonical planned routes have shipped as real, publication-reviewed
pages, and the planned-page registry is now empty (0 routes). The sanitized
aggregate finance export and typed `civic/finance.ts` module (item 1, below)
are complete: 53 reports and 121 observations back `/transparency/finance`
with metric definitions, non-additive-comparison rules, and a privacy
classification (UCA rows stay aggregate-only).

| Priority | Export work                                                                                                                          | Public page(s) unblocked                                                                                                          |
| -------: | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
|        1 | ~~Create a sanitized aggregate finance export and typed frontend module~~ — done; continue expanding report-year and family coverage | `/transparency/finance` (implemented, `PARTIAL`)                                                                                  |
|        2 | Only if future scope expands beyond the approved bounded subset, create a dedicated safe procurement/bid-results export              | Expands `/procurement`, `/procurement/bid-results`, and `/statistics/procurement`; it does not block their bounded READY versions |

### DECISION queue

No open product/publication decisions remain in this queue.

`/contact` is resolved: it permanently redirects to `/government/contact`
rather than hosting a distinct BetterSanFernando feedback channel. No contact
form or message-forwarding claim is implemented; residents are directed to
official City Government channels only.

`/statistics/project-spending` is resolved: it is implemented under the
safer title "Project Cost & Utilization," scoped strictly to the 298 verified
year-to-date observations for 109 of 324 projects. No renamed-vs-narrowed
decision remains open — the export supplies exactly the safe, bounded scope
described above, not actual expenditure.

## Phase 4 — DEFERRED

| Page or feature                                                              | Why postponed                                                                                                            | Reconsider when                                                                                                                   |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Project point map                                                            | No verified project point locations exist, and centroids or approximate coordinates would misrepresent project locations | Verified point coordinates are recovered, reviewed, safely exported, and the architecture approves a distinct point-level purpose |
| Separate Full Disclosure archive workflow                                    | Filtering by type/year/period is already owned by `/transparency/full-disclosure`                                        | User research demonstrates a materially distinct historical workflow and the architecture is updated first                        |
| Generic legacy News, Guides and Regulations, and Public Consultations routes | They are unsupported starter-kit concepts outside the approved information architecture                                  | Product scope, authoritative data, maintenance ownership, and canonical route review justify them                                 |

`/statistics/public-records` and `/statistics/legislation` are no longer
deferred: both were approved and implemented as bounded `PARTIAL` pages,
backed by the `statistics/public-records-coverage.json` export (8 metrics,
6 archive-range entries, 1 related collection) and the existing legislation
exports, respectively (see `PAGE-DATA-MATRIX.md`).

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
