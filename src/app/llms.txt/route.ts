// AI-discovery file for LLM crawlers/agents (e.g. ChatGPT Search via
// OAI-SearchBot, allowed in src/app/robots.ts). Deliberately short: states
// identity, independence, and the main/provenance sections — not a route
// dump. See docs/SITE-ARCHITECTURE.md for the full route hierarchy.
const LLMS_TXT = `# BetterSanFernando

> Independent, community-run civic-information portal for the City of
> San Fernando, Pampanga, Philippines. NOT the official City Government
> website and not affiliated with the City Government.

## What this is
Public information republished from official sources, with every fact
traceable to a cited source record.

## Main sections
- /services      — City service guidance by need
- /projects      — infrastructure & public-works project records
- /procurement   — bid results, awards, contract evidence
- /government    — offices, contacts, hotlines, official links
- /legislation   — executive orders, ordinances, resolutions
- /transparency  — disclosure documents and city finances
- /statistics    — population, project, procurement, city profile

## Methodology and provenance
- /about
- /projects/methodology
- /projects/sources
- /transparency/methodology
- /transparency/sources

## Interpretation limits
- Datasets are BOUNDED and PARTIAL, not complete City records.
- Each dataset keeps its own reference period and unit; figures from
  different datasets must not be summed or compared as one total.
- Coverage counts describe what is currently published and verified,
  never what the City as a whole has produced.
- Published records are not legal or official copies; the cited
  official source governs.
`;

export function GET() {
  return new Response(LLMS_TXT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
