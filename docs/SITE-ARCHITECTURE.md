# BetterSanFernando Site Architecture

## Status and scope

This document is the authoritative information architecture for the public
BetterSanFernando website. It defines the site's major sections, canonical
route hierarchy, route ownership, overlap decisions, and publication rules.
It does not claim that every route described here is implemented.

The current application still contains a mixture of implemented pages,
generic planned-page placeholders, and older starter-kit content routes.
`src/App.tsx`, `src/data/navigation.ts`, and `src/data/plannedPages.ts` must be
brought into alignment with this document through separate implementation
work. Redirects described below are architecture decisions, not redirects
that have already been added to the application.

## Product purpose and position

BetterSanFernando is an independent civic-information and transparency portal
for the City of San Fernando, Pampanga. Its purpose is to make verified local
government information easier to find, understand, compare, and trace to the
records that support it.

BetterSanFernando is not the official website, service, or publication of the
City Government of San Fernando. It is not affiliated with, endorsed by, or
authorized to speak on behalf of the City Government. The site must never use
language, branding, metadata, or interface patterns that imply otherwise.

In particular:

- official City Government contact information must be labeled as official
  source information, not as a way to contact BetterSanFernando;
- `/government/contact` belongs to the City Government information area,
  while `/contact` belongs to the independent BetterSanFernando project;
- source links lead readers to official publications, but BetterSanFernando's
  interpretation, organization, and presentation remain independent; and
- every major public surface should make the independent/not-official position
  understandable without requiring readers to inspect repository documentation.

## Repository and data boundary

The public and private repositories have different responsibilities.

### Public frontend repository

`bettersanfernando` is the public website repository. It may contain:

- application code and public documentation;
- public website content that has passed publication review;
- versioned, frontend-safe generated civic-data exports under
  `src/data/generated/civic/`; and
- the typed application-facing access layer under `src/data/civic/`.

Application code should consume civic records through `src/data/civic/`, not
import generated JSON or GeoJSON files directly. The access layer validates
the public contract and preserves important distinctions such as project
lifecycle state, evidence authority, and separate budget, bid, and contract
amounts.

### Private canonical-data repository

`bettersanfernando-data` is the canonical research and provenance repository.
It may contain raw PDFs and workbooks, recovery queues, source manifests,
conflict analysis, privacy-sensitive fields, research notes, and records that
have not been approved for public release.

The private repository is not a runtime content source for the public website.
The frontend must not read it during a build, copy its raw directories, or
publish a record merely because that record exists privately. Public use
requires a deliberate, versioned, frontend-safe export with an explicit field
allowlist and publication review.

`civic-data.config.json` pins the canonical data release and public export
contract. The generated manifest is the authority for which datasets are
included in a release, their checksums and record counts, and which private
domains were intentionally excluded.

## Navigation model

The top-level navigation has exactly seven items, in this order:

1. Home
2. Services
3. Projects
4. Government
5. Transparency
6. About
7. Contact

Statistics is a real content area, but it is part of Transparency. It must not
become an eighth top-level navigation item. Routes under `/statistics` and
`/barangays` should activate the Transparency navigation state.

Procurement is cross-linked from Projects and Transparency, but it is not a
top-level navigation section. Legislation is owned by Government, even though
legislative records can also be referenced from Transparency.

## Canonical route hierarchy

The hierarchy below defines route ownership. Child routes may be added only
when they represent a distinct user purpose and have enough verified data to
support that purpose.

```text
/
├── services
│   ├── business
│   │   └── :serviceSlug
│   ├── employment
│   ├── livelihood
│   ├── health-services
│   ├── education
│   ├── assistance-programs
│   ├── social-welfare
│   ├── senior-citizens
│   ├── pwd-services
│   ├── infrastructure-public-works
│   ├── agriculture-fisheries
│   ├── environment
│   └── disaster-preparedness
├── projects
│   ├── :projectId
│   ├── map
│   ├── sources
│   └── methodology
├── procurement
│   ├── bid-results
│   └── contracts
├── government
│   ├── structure
│   ├── contact
│   ├── offices
│   ├── hotlines
│   └── links
├── legislation
│   ├── executive-orders
│   ├── ordinances
│   └── resolutions
├── transparency
│   ├── full-disclosure
│   ├── documents
│   ├── finance
│   ├── sources
│   └── methodology
├── statistics
│   ├── city-profile
│   ├── population
│   ├── demographics
│   ├── projects
│   ├── project-spending
│   ├── procurement
│   └── public-records
├── barangays
├── about
├── contact
└── search
```

Routes in the hierarchy are architectural destinations, not promises of
immediate publication. Pages without sufficient verified public data should
remain unimplemented or clearly planned rather than being filled with generic,
inferred, or non-San Fernando content.

## Section responsibilities

### Home

Home explains what BetterSanFernando is, establishes its independent status,
and directs residents to the site's most useful verified content. It may show
small summaries derived from public datasets, but it must not use counts or
highlights that imply comprehensive coverage.

Home is not a government promotional page, a news feed, or an official service
portal.

### Services

Services answers resident-centered questions such as what a service is, who
may use it, what is required, where to go, what it costs, and how long it
takes. A service page requires current, local, authoritative guidance. An
office name or generic national procedure is not enough to establish a City
of San Fernando service process.

The Services section owns transactional and assistance guidance. It does not
own office-directory records, project records, or general government
structure. Those may be linked as supporting context.

Audience-specific destinations such as Senior Citizens and PWD Services may
remain separate when they contain materially tailored guidance. Otherwise,
they should be represented as views or subsections of the Social Welfare hub,
not duplicate pages.

### Projects

Projects presents the public, verified city-project dataset and the evidence
connected to each project. It owns:

- the project list and project-detail experience;
- geographic exploration of project records;
- project-specific evidence and source records; and
- the methodology for normalizing and verifying project facts.

The current project dataset is a bounded infrastructure/public-works subset.
It does not represent every project undertaken by the City, every procurement,
or all historical activity. Project lifecycle states are evidence states, not
claims of physical progress. For example, `AWARDED` does not mean construction
started, and the absence of `COMPLETED` evidence does not mean a project was
not completed.

### Procurement

Procurement explains and exposes procurement records related to bids, awards,
and contracts. It is a distinct record domain from Projects:

- a project describes the civic work or asset;
- procurement evidence describes a purchasing or award process; and
- one project may be supported by several procurement records.

The canonical procurement namespace is `/procurement`. It is linked from both
Projects and Transparency because it connects operational project information
with public accountability records.

Procurement pages must not imply citywide coverage when the available export
contains only the bounded records connected to the verified project subset.
Awards and contracts must also remain distinct: an award record is not, by
itself, a verified executed contract.

### Government

Government helps readers understand and contact the institutions of the City
Government. It owns the government landing page, structure, offices, central
contact information, hotlines, official links, and access to legislation.

The Government landing page is a directory hub, not a license to publish an
unsupported organizational chart, current-official roster, or generic
starter-kit categories. Office pages should distinguish verified fields from
missing fields and show when contact information was last checked.

### Legislation

Legislation is a Government-owned record area with its own `/legislation`
namespace. Executive orders, ordinances, and resolutions remain separate
collections because they have different issuing authorities, evidence, and
coverage.

Collection counts must be described as records available in
BetterSanFernando, not as totals produced by the City. An empty resolutions
dataset means that no individual resolution currently meets the publication
standard; it does not mean the City issued no resolutions.

### Transparency

Transparency explains what public records are available, how facts are
supported, what is known about spending and procurement, and where the data is
incomplete. It owns:

- full-disclosure document discovery;
- cross-domain official documents;
- financial transparency;
- the site-wide source inventory;
- site-wide verification methodology and limitations; and
- the Statistics content area.

Transparency cross-links Projects, Procurement, Government, and Legislation
but does not duplicate their primary record experiences.

### Statistics

Statistics provides careful summaries derived from verified public datasets.
It is a content area under Transparency, even though it uses the clean
`/statistics` namespace.

Statistics pages answer aggregate questions; they do not replace the
underlying record lists. Every statistic must state its source dataset,
reference period, coverage, and relevant limitations. Counts of records in
BetterSanFernando must never be labeled as total government output.

`/statistics/population` owns city and barangay population comparisons.
`/statistics/demographics` is reserved for additional verified measures such
as age, sex, or households and must not duplicate the population page while
those measures are unavailable.

`/statistics/project-spending` may be published only after its terminology is
resolved. Approved budget, winning bid, contract amount, and actual
expenditure are different concepts and must never be collapsed into a single
ambiguous "spending" value.

### Barangays

`/barangays` is a barangay-centered directory that may combine verified PSGC
identity, population, urban/rural classification, and geographic boundaries.
It is distinct from `/statistics/population`, which is comparison-centered.

Named barangay contacts, Barangay Secretaries, and BHERT records are not part
of the current public export. They must not be added to barangay pages without
a separate publication and privacy decision followed by a safe export.

### About

About explains the project's purpose, independence, sourcing principles,
governance, and ways to contribute. It should make clear that the portal is a
community civic project rather than a City Government publication.

### Contact

`/contact` is for contacting BetterSanFernando. It must not blur project
contact channels with City Government channels. Official city contact details
belong at `/government/contact` and should be linked with a clear explanation
that the user is leaving the independent project's contact context.

### Search

Search is a utility rather than a top-level section. It should index only
published, verified content and canonical destinations. Redirect aliases,
planned placeholders, and withdrawn legacy content should not appear as
independent results.

## Projects, Procurement, Transparency, and Statistics

These areas are related but answer different questions:

| Area         | Primary question                                                                              | Primary unit                           | Owns                                                                 |
| ------------ | --------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| Projects     | What civic work is represented in the verified dataset?                                       | Project                                | Project records, detail pages, map, project evidence context         |
| Procurement  | What bid, award, or contract records support purchasing activity?                             | Procurement record                     | Bid results, awards, contracts, procurement-specific browsing        |
| Transparency | What public records and accountability information are available, and how are they supported? | Source collection or disclosure domain | Disclosure documents, finance, source inventory, verification policy |
| Statistics   | What carefully bounded patterns can be derived from published records?                        | Aggregate measure                      | Population, project, procurement, and public-record summaries        |

Cross-navigation is expected. Duplicate canonical pages are not.

## Sources, evidence, and methodology

A source or evidence page and a methodology page have different
responsibilities.

### Source and evidence pages

Source pages answer:

- Which public record supports this fact?
- Who published it?
- What document or page can the reader inspect?
- What fields does the record establish?
- Was only a landing page recovered, or is the document itself available?

`/projects/sources` is project-specific and may expose evidence records tied
to projects. `/transparency/sources` is cross-domain and inventories the
sources behind all published civic datasets.

### Methodology pages

Methodology pages answer:

- How were records accepted, normalized, linked, and checked?
- How are conflicts and missing values handled?
- What does a status, amount, or classification mean?
- What is outside the dataset's scope?
- What limitations should affect interpretation?

`/projects/methodology` owns project-domain rules.
`/transparency/methodology` owns the cross-domain publication, verification,
and limitation model. Verification and limitations are sections of that
canonical page, not separate duplicate destinations.

## Trust model

The public trust path is:

```text
FACT -> SOURCE -> OFFICIAL LINK
```

### Fact

A fact is the value BetterSanFernando presents: a project name, population,
office phone number, document number, amount, date, or classification. Facts
must come from the frontend-safe export or separately reviewed public content.

### Source

The source record explains the provenance that supports the fact. It should
identify the publisher, source type, relevant date or reporting period, and
which fields the record establishes. A fact may have more than one source,
and conflicting sources must remain visible rather than being silently
collapsed.

### Official link

When an official public page or attachment is available, the source should
link to it so readers can inspect the primary publication. A missing or
unrecovered official link must be represented honestly. BetterSanFernando
must not fabricate a URL or upgrade a secondary reference to a primary
official source.

The trust path must remain usable in both directions: readers should be able
to move from a fact to its evidence, while source pages should make clear
which published facts they support.

## Bounded data and completeness

Every dataset must be presented according to its actual scope.

- A verified subset is labeled a bounded, verified subset.
- Dataset record counts describe BetterSanFernando's holdings, not total City
  Government activity.
- Missing records are not evidence that the underlying government activity
  did not occur.
- An empty collection means no record currently satisfies the project's
  evidence standard, not that the City produced none.
- A source archive described as complete must name the bounded archive or
  visible listing that was captured and the date of verification.
- Filters and charts operate on the published subset. Their totals must not be
  generalized beyond that subset.
- Unknown, missing, not applicable, and zero are different values and must not
  be presented interchangeably.
- Dates must preserve their meaning: document date, effective date, reference
  year, status-as-of date, and verification date are not substitutes for one
  another.
- Project amounts must retain their semantics. Approved budget, winning bid,
  contract amount, and expenditure must not be flattened into "cost" or
  "spending."
- Project evidence state must not be presented as physical implementation
  state.
- A privacy-sensitive or non-exported private dataset must not be summarized
  publicly unless an approved aggregate export explicitly permits it.

Pages should display a concise coverage statement near the information it
qualifies, with a link to the relevant methodology or source page for detail.

## Canonical routes and redirects

The following decisions resolve overlaps present in the current navigation
and planned-route registry. Redirect behavior will be implemented separately.

| Current or proposed route          | Canonical destination                    | Decision                                                                     |
| ---------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| `/government/offices`              | `/government/offices`                    | Canonical searchable office directory, including verified contact fields     |
| `/government/directory`            | `/government/offices`                    | Permanent redirect; may preserve a directory view query if needed            |
| `/government/contacts`             | `/government/offices`                    | Permanent redirect; may target a contact-details anchor or view              |
| `/government/contact`              | `/government/contact`                    | Remains distinct: central City Government contact information                |
| `/contact`                         | `/contact`                               | Remains distinct: contact the independent BetterSanFernando project          |
| `/procurement`                     | `/procurement`                           | Canonical procurement overview                                               |
| `/transparency/procurement`        | `/procurement`                           | Permanent redirect; Transparency cross-links the canonical page              |
| `/procurement/contracts`           | `/procurement/contracts`                 | Canonical contracts and awards destination                                   |
| `/transparency/contracts`          | `/procurement/contracts`                 | Permanent redirect                                                           |
| `/projects/dashboard`              | `/statistics/projects`                   | Permanent redirect; aggregate project analysis belongs to Statistics         |
| `/statistics/projects`             | `/statistics/projects`                   | Canonical project-statistics page under Transparency                         |
| `/projects/sources`                | `/projects/sources`                      | Canonical project evidence/source page                                       |
| `/projects/data-sources`           | `/projects/sources`                      | Permanent redirect                                                           |
| `/projects/methodology`            | `/projects/methodology`                  | Remains distinct from the source inventory                                   |
| `/government/documents`            | `/transparency/documents`                | Permanent redirect; cross-domain document discovery belongs to Transparency  |
| `/transparency/documents`          | `/transparency/documents`                | Canonical official-document discovery page                                   |
| `/transparency/full-disclosure`    | `/transparency/full-disclosure`          | Canonical filterable Full Disclosure collection                              |
| `/transparency/archive`            | `/transparency/full-disclosure`          | Permanent redirect unless a future design proves a distinct archive workflow |
| `/transparency/methodology`        | `/transparency/methodology`              | Canonical cross-domain methodology page                                      |
| `/transparency/verification`       | `/transparency/methodology#verification` | Permanent redirect to the verification section                               |
| `/transparency/limitations`        | `/transparency/methodology#limitations`  | Permanent redirect to the limitations section                                |
| `/statistics/population`           | `/statistics/population`                 | Canonical city and barangay population experience                            |
| `/statistics/population/barangays` | `/statistics/population#barangays`       | Permanent redirect to the barangay comparison section                        |

Additional legacy-route decisions:

- `/government/departments` should redirect to `/government/offices` rather
  than preserve the starter-kit department hierarchy.
- `/government/reports-and-statistics` should redirect to `/statistics` or a
  more specific canonical statistics page.
- `/government/transparency-documents` should redirect to
  `/transparency/documents`.
- generic starter-kit News, Guides and Regulations, and Public Consultations
  routes are not part of this architecture. They require a future scope
  decision rather than automatic preservation.
- the footer's `/philippines/hotlines` should redirect to
  `/government/hotlines` if retained.

Redirect aliases must not appear as separate navigation items, sitemap
entries, canonical metadata URLs, analytics destinations, or search results.

## Route and filter principles

Canonical routes identify durable resources. Query parameters identify views
of those resources.

Use path segments for:

- distinct content types with a stable public identity;
- a specific record such as `/projects/:projectId`; and
- a section whose purpose differs materially from its parent.

Use query parameters for:

- search terms;
- lifecycle, type, year, barangay, office, document, and source filters;
- sort order;
- pagination; and
- optional table, card, or map views of the same records.

Filters must not create duplicate planned pages or separate canonical URLs.
Useful filter state should be shareable in the URL. Default/empty filter
values should normalize to the canonical unfiltered route. Filters should be
derived from values actually present in the published dataset and should not
offer unsupported categories merely to make a page look complete.

Record identifiers in paths must be stable public identifiers from the safe
export, not array positions, private file paths, source hashes, or mutable
display names.

Every canonical page should emit its canonical URL. Redirects should preserve
safe, meaningful filters where the destination supports them and discard
obsolete parameters otherwise.

## Architecture acceptance rules

A new public page or route should be added only when all of the following are
true:

1. It has a clear user purpose not already served by a canonical page.
2. Its section ownership follows this document.
3. It has sufficient verified public data or reviewed editorial content.
4. Its source and completeness language can be stated honestly.
5. It does not require the frontend to read private canonical material.
6. It has an identified maintenance and reverification responsibility when
   the information is time-sensitive.
7. It does not create a second canonical URL for a filter, subsection, or
   presentation mode.

When these conditions are not met, the page should remain deferred. A planned
route is not evidence that its subject is publication-ready.

## Unresolved architecture questions

The following decisions remain outside this document's settled route model:

- whether all currently listed Services categories remain in scope after
  local service research, and which audience pages warrant separate routes;
- whether named Barangay Secretaries or BHERT contacts should ever be
  published, subject to privacy and publication review;
- whether Financial Transparency begins as document discovery, selected
  aggregate metrics, or both;
- whether `/statistics/project-spending` should be renamed to reflect the
  available budget, bid, and contract fields;
- whether current elected officials belong in the initial Government scope
  and how term changes will be maintained;
- whether a dedicated historical Full Disclosure workflow eventually becomes
  different enough to justify a route separate from the filterable canonical
  collection;
- whether Search uses a hosted index, a generated local index, or remains
  deferred until the core content corpus is publication-ready; and
- whether currently linked but unplanned utility destinations such as
  Accessibility, Community Discord, and Holidays become supported pages or
  are removed from navigation.

These questions may change page scope or labels, but they do not change the
seven-item top-level navigation or the canonical overlap decisions above.
