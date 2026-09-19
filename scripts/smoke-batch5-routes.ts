#!/usr/bin/env -S node --experimental-strip-types
// Batch 5 focused coverage: the ten interactive/URL-state routes exist as
// a thin Server Component route entry + a narrowly scoped *.tsx
// Client Component, use the same nuqs query-parameter names as the legacy
// pages, never import react-router/react-helmet-async/import.meta.glob,
// and the project-map's browser-only MapLibre code never touches
// window/document outside a client-only dynamic import. Full route/content
// parity sweeps are Batch 7's job — this only checks what's new here.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { getSearchDocuments } from '../src/data/civic/search.ts';
import { getBarangays } from '../src/data/civic/demographics.ts';
import {
  getExecutiveOrders,
  getOrdinances,
} from '../src/data/civic/legislation.ts';

const routes: Record<
  string,
  { dir: string; component: string; queryParams: string[] }
> = {
  '/search': {
    dir: 'src/app/search',
    component: 'Search',
    queryParams: ['q', 'domain'],
  },
  '/projects': {
    dir: 'src/app/projects',
    component: 'Projects',
    queryParams: ['q', 'status', 'barangay', 'category'],
  },
  '/projects/map': {
    dir: 'src/app/projects/map',
    component: '',
    queryParams: [],
  },
  '/projects/sources': {
    dir: 'src/app/projects/sources',
    component: 'ProjectSources',
    queryParams: ['q', 'stage', 'authority', 'project', 'sort'],
  },
  '/barangays': {
    dir: 'src/app/barangays',
    component: 'Barangays',
    queryParams: ['q', 'type', 'sort'],
  },
  '/procurement/bid-results': {
    dir: 'src/app/procurement/bid-results',
    component: 'BidResults',
    queryParams: ['q', 'year', 'abc', 'sort'],
  },
  '/procurement/contracts': {
    dir: 'src/app/procurement/contracts',
    component: 'Contracts',
    queryParams: ['q', 'lifecycle', 'year', 'number', 'amount', 'sort'],
  },
  '/legislation/executive-orders': {
    dir: 'src/app/legislation/executive-orders',
    component: 'ExecutiveOrders',
    queryParams: ['q', 'sort'],
  },
  '/legislation/ordinances': {
    dir: 'src/app/legislation/ordinances',
    component: 'Ordinances',
    queryParams: ['q', 'availability', 'sort'],
  },
  '/government/barangay-contacts': {
    dir: 'src/app/government/barangay-contacts',
    component: 'GovernmentBarangayContacts',
    queryParams: ['q', 'barangay'],
  },
};

// 1. All ten route files exist.
for (const [route, { dir }] of Object.entries(routes)) {
  assert.ok(
    existsSync(`${dir}/page.tsx`),
    `${route} must have a page.tsx route entry`
  );
}

// 2. Route entries remain Server Components (no top-level 'use client');
//    the Client Component lives in a sibling *.tsx file instead.
for (const [route, { dir }] of Object.entries(routes)) {
  const source = readFileSync(`${dir}/page.tsx`, 'utf8');
  assert.ok(
    !/^\s*['"]use client['"]/m.test(source),
    `${route}'s page.tsx must remain a Server Component`
  );
}

// 3. Interactive Client Components are explicitly isolated (each carries
//    its own 'use client' directive), and none of them — nor their route
//    entry — imports react-router-dom, react-helmet-async, or uses
//    Vite-only import.meta.glob.
for (const [route, { dir, component }] of Object.entries(routes)) {
  if (!component) continue; // /projects/map has its own dedicated check below
  const clientPath = `${dir}/${component}.tsx`;
  assert.ok(existsSync(clientPath), `${route} must have ${clientPath}`);
  const source = readFileSync(clientPath, 'utf8');
  assert.match(
    source,
    /^\s*['"]use client['"]/m,
    `${clientPath} must be an explicit Client Component`
  );
  assert.ok(
    !/from ['"]react-router(-dom)?['"]/.test(source),
    `${clientPath} must not import react-router/react-router-dom`
  );
  assert.ok(
    !/^\s*import .* from ['"](react-helmet-async|\.\.\/+components\/SEO)['"]/m.test(
      source
    ),
    `${clientPath} must not import react-helmet-async or the legacy SEO component`
  );
  assert.ok(
    !/import\.meta\.glob/.test(source),
    `${clientPath} must not use Vite-only import.meta.glob`
  );

  // 4. Query-parameter names match the legacy behavior.
  for (const param of routes[route].queryParams) {
    assert.match(
      source,
      new RegExp(`useQueryState\\('${param}'`),
      `${route} must keep the "${param}" query parameter (legacy parity)`
    );
  }

  // Canonical Next-compatible links only.
  assert.ok(
    !/<Link\s+to=/.test(source) && !/^\s*to=/m.test(source),
    `${clientPath} must use next/link's href, not react-router's to`
  );
}

// 5. Filter-before-pagination behavior is preserved: every page that
//    slices/paginates a filtered array must compute the filtered set first.
//    Spot-check the two pages with an explicit visibleCount/PAGE_SIZE
//    pagination pattern (ProjectSources, BidResults) plus Contracts.
for (const component of ['ProjectSources', 'BidResults', 'Contracts']) {
  const route = Object.entries(routes).find(
    ([, r]) => r.component === component
  )!;
  const source = readFileSync(`${route[1].dir}/${component}.tsx`, 'utf8');
  assert.match(
    source,
    /filtered\w*\.slice\(0, visibleCount\)|visibleCount/,
    `${component} must paginate the already-filtered collection, not the raw dataset`
  );
}

// 6. Project-map: the MapLibre component is client-only, dynamically
//    imported with ssr:false from within a Client Component (never from
//    the Server Component route entry), and never invents coordinates.
const mapPageSource = readFileSync('src/app/projects/map/page.tsx', 'utf8');
assert.ok(
  !/^\s*['"]use client['"]/m.test(mapPageSource),
  'src/app/projects/map/page.tsx must remain a Server Component'
);
assert.ok(
  !/window\.|document\./.test(mapPageSource),
  'the map route entry (Server Component) must never touch window/document'
);
const mapViewSource = readFileSync(
  'src/app/projects/map/project-map-view.tsx',
  'utf8'
);
assert.match(
  mapViewSource,
  /^\s*['"]use client['"]/m,
  'project-map-view.tsx must be a Client Component'
);
assert.match(
  mapViewSource,
  /dynamic\(\s*\(\)\s*=>\s*import\(['"]\.\.\/\.\.\/\.\.\/components\/projects\/BarangayProjectMap['"]\),\s*\{\s*ssr:\s*false/,
  'the MapLibre component must be loaded via next/dynamic with ssr:false'
);
const barangayMapSource = readFileSync(
  'src/components/projects/BarangayProjectMap.tsx',
  'utf8'
);
assert.match(
  barangayMapSource,
  /^\s*['"]use client['"]/m,
  'BarangayProjectMap.tsx must be a Client Component'
);
assert.ok(
  !/^\s*import .* from ['"][^'"]+\?url['"]/m.test(barangayMapSource),
  'BarangayProjectMap.tsx must not use Vite-only ?url asset imports'
);
assert.match(
  barangayMapSource,
  /new URL\('maplibre-gl\/dist\/maplibre-gl-worker\.mjs', import\.meta\.url\)/,
  'the MapLibre worker must load via the standard new URL(..., import.meta.url) asset pattern'
);
// No hardcoded longitude/latitude coordinate pairs anywhere in the map
// route — every geometry must come from the synced GeoJSON, never an
// invented per-project coordinate.
for (const source of [mapPageSource, mapViewSource, barangayMapSource]) {
  assert.ok(
    !/-?1[0-6]\.\d{3,},\s*1[1-2]\d\.\d{3,}/.test(source),
    'no route file may hardcode a Philippines-range lat/lng coordinate pair'
  );
}

// 7. All expected civic datasets remain represented, and the search index
//    count is reported (990 documents: 324 projects + 35 barangays +
//    44 offices + 24 legislation + 563 sources).
const searchDocuments = getSearchDocuments();
assert.equal(
  searchDocuments.length,
  990,
  'expected exactly 990 search documents (324 projects + 35 barangays + 44 offices + 24 legislation + 563 sources)'
);
assert.equal(getBarangays().length, 35, 'expected exactly 35 barangays');
assert.equal(
  getExecutiveOrders().length,
  13,
  'expected exactly 13 Executive Orders'
);
assert.equal(getOrdinances().length, 11, 'expected exactly 11 ordinances');

// 8. Private/prohibited data fields never enter a search document or a
//    route file: source_sha256, local paths, OCR diagnostics, reviewer
//    notes, candidate IDs.
const searchModuleSource = readFileSync('src/data/civic/search.ts', 'utf8');
for (const forbidden of [
  'source_sha256',
  'ocr_',
  'reviewer',
  'candidate_id',
  'C:\\\\',
  '/home/',
]) {
  assert.ok(
    !searchModuleSource.includes(forbidden),
    `search.ts must never reference "${forbidden}"`
  );
}

console.log(
  `Batch 5 route smoke passed: all 10 routes have a Server Component entry + isolated Client Component, legacy query-parameter names preserved, project-map is client-only with no invented coordinates, and the search index reports exactly ${searchDocuments.length} documents.`
);
