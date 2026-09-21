# Contributing to BetterSanFernando

Thanks for your interest in improving BetterSanFernando. This document is
the entry point for human contributors — for repository conventions aimed at
AI coding agents, see [`CLAUDE.md`](CLAUDE.md).

## What you can work on

Normal public contributions are welcome in areas such as:

- Frontend/UI improvements
- Accessibility improvements
- Bug fixes
- Documentation
- Tests
- Search improvements
- Performance improvements
- Resident-facing usability improvements

## Civic-data corrections

BetterSanFernando's civic data (services, projects, offices, records, etc.)
comes from a private research repository through a reviewed publication
workflow. That workflow is **maintainer-only**.

Normal contributors must **not**:

- Manually edit `src/data/generated/civic/`
- Run the private publication workflow (`pnpm data:sync`)
- Require access to the private canonical research repository
- Add raw/private research files to this repository
- Add sensitive or person-level data
- Bypass `src/data/civic/` by importing generated datasets directly

If you find incorrect or outdated civic information on the site:

1. Open an issue using the **Civic data correction** issue form.
2. Include an official/public source for the correction when possible.
3. A maintainer will review it and, if verified, publish it through the
   private publication workflow.

Civic-data correction issues are leads for verification, not direct edits —
they are not automatically published.

## Local setup

```bash
pnpm install
pnpm dev
```

Ordinary local development works entirely against the already-committed,
public-safe civic-data export in `src/data/generated/civic/`. No access to
the private canonical research repository is required.

## Validation

Before opening a PR, run:

```bash
pnpm lint
pnpm format:check
pnpm check:public-data-boundary
pnpm test:public-data-boundary
```

Then run whichever domain smoke test(s) match the area you changed (see the
`*:smoke` scripts in `package.json` — there's no single "run everything"
script by design).

For application/code changes, also run:

```bash
pnpm build
```

## UI contributions

For visual/design conventions, see
[`docs/FRONTEND-DESIGN-SYSTEM.md`](docs/FRONTEND-DESIGN-SYSTEM.md) rather
than reinventing patterns.

## Architecture and data contributors

For route ownership, publication rules, and data-layer structure, see:

- [`docs/SITE-ARCHITECTURE.md`](docs/SITE-ARCHITECTURE.md)
- [`docs/PAGE-DATA-MATRIX.md`](docs/PAGE-DATA-MATRIX.md)
- [`CLAUDE.md`](CLAUDE.md) — repository-boundary and agent guidance also
  applies to human contributors touching the civic-data layer.

## Pull request expectations

- Keep PRs focused — one concern per PR, no unrelated refactors.
- Write a clear summary of what changed and why.
- State what testing/validation you performed.
- Include screenshots or a short recording for visual changes when useful.
- Do not include generated or private civic-data material outside the
  established `pnpm data:sync` workflow.
- State documentation impact: either update the affected docs in the same
  PR, or state `Documentation impact: none — <reason>` (see CLAUDE.md's
  documentation-impact checkpoint).

## License

This project is licensed under [CC0 1.0 Universal](LICENSE). By
contributing, you agree your contribution is made under that same license.
Only submit material you have the right to contribute — third-party code,
assets, or data remain subject to their own applicable rights and terms.
