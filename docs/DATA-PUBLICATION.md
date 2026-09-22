# Civic Data Publication

## Purpose

BetterSanFernando separates civic-data work into four stages:

1. research and canonical work;
2. publication review;
3. frontend-safe public exports; and
4. application consumption.

This public repository contains only the frontend-safe publication side.

## Repository boundary

Canonical and raw research are maintained separately. Normal public
contributors do not need private-repository access, and private or raw
research files are not runtime or build dependencies. Production and CI work
entirely from this public repository.

Do not add private source files, recovery queues, internal analysis, or
unpublished records here.

## Public civic-data flow

```text
research/source material
  -> verification and review
  -> allowlisted frontend-safe export
  -> src/data/generated/civic/
  -> validation
  -> typed access through src/data/civic/
  -> routes and components
```

Publication follows review; research material is not automatically published.

## Generated data

[`src/data/generated/civic/`](../src/data/generated/civic/) is the reviewed,
frontend-safe output committed to this repository so normal contributors and
CI can work without private access. It must never be hand-edited. Maintainers
refresh it through the publication and sync workflow.

## Typed application boundary

[`src/data/civic/`](../src/data/civic/) is the sanctioned application access
layer. It uses typed, validated access to the generated export. Routes and
components should use this layer rather than importing generated datasets
directly.

## Publication status and bounded coverage

Coverage is progressive and published data can be partial. Absence is not
evidence that a service or record does not exist, and BetterSanFernando does
not infer missing facts. Data must not be presented as complete unless the
available evidence supports that claim.

The current [page-data matrix](PAGE-DATA-MATRIX.md) defines the `READY`,
`PARTIAL`, and other readiness statuses and records current per-page coverage.

## Source and provenance principles

BetterSanFernando publishes reviewed information derived from official and
public sources. Published records retain source provenance where supported,
and the project distinguishes sourced fact from interpretation. Government and
other public-source material is not automatically owned or relicensed by
BetterSanFernando.

[PROVENANCE.md](../PROVENANCE.md) covers repository and source provenance,
including third-party boundaries. It is not legal advice.

## Civic-data corrections from contributors

External contributors should not directly edit generated civic records.
Instead, use the **Civic Data Correction** GitHub issue form, identify the
affected record or page, and provide an official or public source when
available. Maintainers verify corrections before publication.

See [CONTRIBUTING.md](../CONTRIBUTING.md). Filing a correction does not
automatically result in publication.

## Maintainer publication workflow

Maintainers prepare an approved export, then use `pnpm data:sync` to refresh
the vendored frontend-safe dataset. Validation and public-data boundary checks
run afterward. This maintainer-only refresh command is not required for
ordinary contributors or CI.

The workflow intentionally does not document private source locations,
credentials, recovery queues, or unpublished records.

## Validation

Relevant public checks are:

```bash
pnpm data:validate
pnpm check:public-data-boundary
pnpm test:public-data-boundary
```

Use targeted smoke tests when a change affects the corresponding application
area; see `package.json` for the available checks.

## What must never be committed

- Credentials or secrets
- Private or raw research files
- Sensitive or person-level data
- Unpublished internal records
- Source workbooks or PDFs not intentionally approved for this public repo
- Manually edited generated civic-data files
- Private-repository dependencies

## Related documentation

- [PAGE-DATA-MATRIX.md](PAGE-DATA-MATRIX.md)
- [SITE-ARCHITECTURE.md](SITE-ARCHITECTURE.md)
- [PROVENANCE.md](../PROVENANCE.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
