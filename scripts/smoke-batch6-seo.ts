#!/usr/bin/env -S node --experimental-strip-types
// Batch 6 focused coverage: redirects, custom 404, centralized site-URL
// resolution, metadata/canonical construction, the default OG image,
// sitemap/robots, and JSON-LD safety. Full route/content parity sweeps are
// Batch 7's job — this only checks what's new in this batch.
//
// Extended in Batch 9 (SEO/search-identity pass) with: /search noindex and
// excluded from the sitemap, /sitemap + /accessibility included, the
// per-agent robots rules (OAI-SearchBot allowed, GPTBot disallowed), the
// Organization/WebSite JSON-LD @graph, and the favicon/icon/apple-icon/
// logo-512 file set.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { getServices, getServiceCategory } from '../src/data/civic/services.ts';
import { getProjects } from '../src/data/civic/projects.ts';
import { getCityOffices } from '../src/data/civic/government.ts';

// 1-3. Exact 16-alias accounting, destinations, and permanent (308) config.
const nextConfigSource = readFileSync('next.config.ts', 'utf8');
const aliasMatches = [
  ...nextConfigSource.matchAll(
    /source:\s*'([^']+)',\s*\n?\s*destination:\s*'([^']+)'/g
  ),
];
assert.equal(aliasMatches.length, 16, 'expected exactly 16 redirect aliases');

const expectedAliases: Record<string, string> = {
  '/contact': '/government/contact',
  '/philippines/hotlines': '/government/hotlines',
  '/government/directory': '/government/offices',
  '/government/contacts': '/government/offices',
  '/government/departments': '/government/offices',
  '/government/reports-and-statistics': '/statistics',
  '/transparency/procurement': '/procurement',
  '/transparency/contracts': '/procurement/contracts',
  '/projects/data-sources': '/projects/sources',
  '/projects/dashboard': '/statistics/projects',
  '/statistics/population/barangays': '/statistics/population#barangays',
  '/transparency/verification': '/transparency/methodology#verification',
  '/transparency/limitations': '/transparency/methodology#limitations',
  '/government/documents': '/transparency/documents',
  '/government/transparency-documents': '/transparency/documents',
  '/transparency/archive': '/transparency/full-disclosure',
};
const actualAliases = Object.fromEntries(
  aliasMatches.map(([, source, destination]) => [source, destination])
);
assert.deepEqual(
  actualAliases,
  expectedAliases,
  'redirect source/destination pairs must match docs/NEXTJS-MIGRATION-SPEC.md §4.1 exactly'
);
assert.match(
  nextConfigSource,
  /permanent:\s*true/,
  'redirects must be permanent (HTTP 308)'
);

// 4. No SPA catch-all rewrite anywhere (removed in Batch 1; must stay gone).
assert.ok(
  !existsSync('vercel.json'),
  'vercel.json (SPA catch-all) must not be reintroduced'
);
assert.ok(
  !/rewrites\s*\(/.test(nextConfigSource),
  'next.config.ts must not define a rewrites() catch-all'
);

// 5-6. Centralized site-URL resolver: priority order, validation, and that
// VERCEL_URL/VERCEL_BRANCH_URL are never read.
const siteUrlSource = readFileSync('src/lib/site-url.ts', 'utf8');
assert.ok(
  !/process\.env\.VERCEL_URL\b/.test(siteUrlSource) &&
    !/process\.env\.VERCEL_BRANCH_URL\b/.test(siteUrlSource),
  'site-url.ts must never read VERCEL_URL or VERCEL_BRANCH_URL (preview-deployment identifiers)'
);

function runSiteUrlResolver(env: Record<string, string | undefined>) {
  return execFileSync(
    process.execPath,
    [
      '--experimental-strip-types',
      '-e',
      "import('./src/lib/site-url.ts').then(m => console.log(m.getSiteUrl())).catch(e => { console.error('ERR:' + e.message); process.exit(1); })",
    ],
    { encoding: 'utf8', env: { ...process.env, ...env } }
  ).trim();
}

// Priority 1: explicit NEXT_PUBLIC_SITE_URL wins over everything.
assert.equal(
  runSiteUrlResolver({
    NEXT_PUBLIC_SITE_URL: 'https://example-site.test/',
    VERCEL_PROJECT_PRODUCTION_URL: 'should-be-ignored.vercel.app',
    VERCEL: '1',
  }),
  'https://example-site.test', // trailing slash normalized away
  'NEXT_PUBLIC_SITE_URL must take priority and have its trailing slash normalized'
);

// Priority 2: VERCEL_PROJECT_PRODUCTION_URL when no explicit override.
assert.equal(
  runSiteUrlResolver({
    NEXT_PUBLIC_SITE_URL: undefined,
    VERCEL_PROJECT_PRODUCTION_URL: 'bettersanfernando.vercel.app',
    VERCEL: '1',
  }),
  'https://bettersanfernando.vercel.app',
  'VERCEL_PROJECT_PRODUCTION_URL must be used (as https://) when no explicit override exists'
);

// Priority 3: localhost fallback, non-Vercel only.
assert.equal(
  runSiteUrlResolver({
    NEXT_PUBLIC_SITE_URL: undefined,
    VERCEL_PROJECT_PRODUCTION_URL: undefined,
    VERCEL: undefined,
  }),
  'http://localhost:3000',
  'must fall back to localhost only outside Vercel'
);

// VERCEL=1 with nothing configured must fail loudly, not silently emit localhost.
let failedAsExpected = false;
try {
  runSiteUrlResolver({
    NEXT_PUBLIC_SITE_URL: undefined,
    VERCEL_PROJECT_PRODUCTION_URL: undefined,
    VERCEL: '1',
  });
} catch {
  failedAsExpected = true;
}
assert.ok(
  failedAsExpected,
  'VERCEL=1 with no site URL configured must throw, never silently fall back to localhost'
);

// Invalid explicit URL must throw.
let invalidUrlFailed = false;
try {
  runSiteUrlResolver({ NEXT_PUBLIC_SITE_URL: 'not-a-valid-url' });
} catch {
  invalidUrlFailed = true;
}
assert.ok(
  invalidUrlFailed,
  'an invalid NEXT_PUBLIC_SITE_URL must throw, not be silently accepted'
);

// 7. metadataBase present in root metadata.
const metadataLibSource = readFileSync('src/lib/metadata.ts', 'utf8');
assert.match(
  metadataLibSource,
  /metadataBase:\s*new URL\(getSiteUrl\(\)\)/,
  'root metadata must set metadataBase from the centralized site URL'
);

// 8. Canonical construction: buildPageMetadata always derives `alternates.canonical`
// from absoluteUrl(path), never a hardcoded/query-string URL.
assert.match(
  metadataLibSource,
  /alternates:\s*\{\s*canonical\s*\}/,
  'buildPageMetadata must set alternates.canonical from absoluteUrl(path)'
);

// 9. Dynamic metadata: all four dynamic route families define
// generateMetadata() using civic accessors (not a hardcoded title table).
const dynamicMetadataFiles = [
  'src/app/services/[category]/page.tsx',
  'src/app/services/[category]/[serviceSlug]/page.tsx',
  'src/app/projects/[projectId]/page.tsx',
  'src/app/government/offices/[officeId]/page.tsx',
];
for (const file of dynamicMetadataFiles) {
  const source = readFileSync(file, 'utf8');
  assert.match(
    source,
    /export async function generateMetadata/,
    `${file} must export generateMetadata()`
  );
  assert.match(
    source,
    /buildPageMetadata\(/,
    `${file} must build its metadata with the shared buildPageMetadata() helper`
  );
}

// 10. Default OG image: exists, is a real PNG, and is exactly 1200x630.
const ogImagePath = 'public/og-default.png';
assert.ok(existsSync(ogImagePath), 'public/og-default.png must exist');
const ogBuffer = readFileSync(ogImagePath);
assert.equal(
  ogBuffer.subarray(0, 8).toString('hex'),
  '89504e470d0a1a0a',
  'og-default.png must be a valid PNG (correct signature)'
);
// PNG IHDR: width at bytes 16-19, height at bytes 20-23 (big-endian).
const ogWidth = ogBuffer.readUInt32BE(16);
const ogHeight = ogBuffer.readUInt32BE(20);
assert.equal(ogWidth, 1200, 'og-default.png must be 1200px wide');
assert.equal(ogHeight, 630, 'og-default.png must be 630px tall');
assert.match(
  metadataLibSource,
  /DEFAULT_OG_IMAGE_PATH = '\/og-default\.png'/,
  'the default OG image must be wired into the centralized metadata helper'
);

// 11. Sitemap: independently recompute the expected count and verify
// uniqueness/exclusions.
const services = getServices();
const categoryCount = new Set(services.map(getServiceCategory)).size;
const expectedStaticRouteCount =
  28 /* Batch 3 */ +
  10 /* Batch 5 (historical label) */ +
  1 /* /projects/city-projects — City Projects listing split from the /projects hub */ -
  1 /* /search removed in Batch 9 — noindex, thin query-only surface */ +
  2; /* Batch 9: /sitemap, /accessibility */
const expectedTotal =
  expectedStaticRouteCount +
  categoryCount +
  services.length +
  getProjects().length +
  getCityOffices().length;
assert.equal(
  expectedTotal,
  584,
  'independently recomputed sitemap count must be 584'
);

const sitemapSource = readFileSync('src/app/sitemap.ts', 'utf8');
const staticRouteMatches = [...sitemapSource.matchAll(/'(\/[^']*)'/g)].map(
  m => m[1]
);
assert.equal(
  new Set(staticRouteMatches).size,
  staticRouteMatches.length,
  'the static route list in sitemap.ts must not contain duplicates'
);
assert.equal(
  staticRouteMatches.length,
  expectedStaticRouteCount,
  'sitemap.ts must list exactly the 28 Batch 3 + 10 Batch 5 (historical) static routes, plus the /projects/city-projects split, minus /search, plus the two Batch 9 routes'
);
assert.ok(
  !staticRouteMatches.includes('/search'),
  '/search must not appear in the sitemap (Batch 9: noindex, thin query-only surface)'
);
for (const included of ['/sitemap', '/accessibility']) {
  assert.ok(
    staticRouteMatches.includes(included),
    `${included} must appear in the sitemap's static route list (Batch 9)`
  );
}
for (const excluded of [
  '/contact',
  '/philippines/hotlines',
  '/government/directory',
  '/government/documents',
  '/discord',
  '/philippines/holidays',
]) {
  assert.ok(
    !staticRouteMatches.includes(excluded),
    `${excluded} must not appear in the sitemap's static route list`
  );
}
assert.ok(
  !/\?/.test(sitemapSource.replace(/\/\/.*$/gm, '')) ||
    !/'\/[^']*\?/.test(sitemapSource),
  'sitemap.ts must not contain any query-string URL'
);
assert.ok(
  !sitemapSource.includes('#'),
  'sitemap.ts must not contain any fragment URL'
);
assert.ok(
  !/new Date\(\)/.test(sitemapSource),
  'sitemap.ts must not use the current build time as a fake lastModified date'
);
assert.ok(
  !/lastModified\s*:/.test(sitemapSource),
  'sitemap.ts omits a lastModified field entirely (no verified per-page date is available)'
);

// 12. Robots: sitemap reference, per-agent rules (OAI-SearchBot allowed,
// GPTBot disallowed), and /search kept out of general crawling.
const robotsSource = readFileSync('src/app/robots.ts', 'utf8');
assert.match(
  robotsSource,
  /sitemap:\s*absoluteUrl\('\/sitemap\.xml'\)/,
  'robots.ts must reference the sitemap through absoluteUrl()'
);
assert.match(
  robotsSource,
  /userAgent:\s*'\*'[\s\S]*?allow:\s*'\/'/,
  'robots.ts must allow normal public crawling for all agents'
);
assert.match(
  robotsSource,
  /disallow:\s*'\/search'/,
  'robots.ts must disallow /search for general crawlers'
);
assert.match(
  robotsSource,
  /userAgent:\s*'OAI-SearchBot',\s*allow:\s*'\/'/,
  'robots.ts must explicitly allow OAI-SearchBot (ChatGPT Search discovery)'
);
assert.match(
  robotsSource,
  /userAgent:\s*'GPTBot',\s*disallow:\s*'\/'/,
  'robots.ts must explicitly disallow GPTBot (training-corpus crawler)'
);

// 13. JSON-LD safety and independent-portal identity: Organization + WebSite
// @graph, alternateName present, never GovernmentOrganization.
const jsonLdSource = readFileSync('src/lib/json-ld.tsx', 'utf8');
assert.match(
  jsonLdSource,
  /replace\(\/<\/g, ['"]\\\\u003c['"]\)/,
  'json-ld.tsx must escape "<" to prevent script-closing injection'
);
assert.ok(
  // Matches an actual quoted type value (e.g. '@type': 'GovernmentOrganization'),
  // not prose — json-ld.tsx's own comment explains *why* Organization is used
  // instead, which legitimately mentions the word without quotes.
  !/['"]GovernmentOrganization['"]/.test(jsonLdSource),
  'JSON-LD must never type BetterSanFernando as a GovernmentOrganization'
);
assert.match(
  jsonLdSource,
  /'@type':\s*'Organization'/,
  'json-ld.tsx must define an Organization node'
);
assert.match(
  jsonLdSource,
  /'@type':\s*'WebSite'/,
  'json-ld.tsx must define a WebSite node'
);
assert.match(
  jsonLdSource,
  /alternateName:\s*SITE_ALTERNATE_NAME/,
  'the Organization/WebSite nodes must set alternateName'
);
assert.match(
  metadataLibSource,
  /SITE_ALTERNATE_NAME = 'Better San Fernando'/,
  "the alternate site name must be exactly 'Better San Fernando'"
);
assert.match(
  metadataLibSource,
  /independent, community-run/,
  'the shared description must identify BetterSanFernando as independent and community-run'
);
assert.ok(
  !/official City Government/i.test(metadataLibSource) ||
    /not the official City Government/i.test(metadataLibSource),
  'any mention of "official City Government" in shared metadata must be a denial, not a claim'
);

// 14. Icon files: favicon.ico, icon.png, apple-icon.png (App Router file
// convention) and public/logo-512.png (Organization.logo target) exist and
// have the expected dimensions. No `icons` entry remains in metadata.ts —
// the file convention takes over.
assert.ok(
  !/icons:\s*\{/.test(metadataLibSource),
  'metadata.ts must not set an `icons` entry — favicon.ico/icon.png/apple-icon.png take over via the file convention'
);
function readPngDimensions(path: string): [number, number] {
  const buf = readFileSync(path);
  assert.equal(
    buf.subarray(0, 8).toString('hex'),
    '89504e470d0a1a0a',
    `${path} must be a valid PNG (correct signature)`
  );
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}
assert.ok(existsSync('src/app/favicon.ico'), 'src/app/favicon.ico must exist');
assert.ok(existsSync('src/app/icon.png'), 'src/app/icon.png must exist');
assert.deepEqual(
  readPngDimensions('src/app/icon.png'),
  [512, 512],
  'src/app/icon.png must be 512x512'
);
assert.ok(
  existsSync('src/app/apple-icon.png'),
  'src/app/apple-icon.png must exist'
);
assert.deepEqual(
  readPngDimensions('src/app/apple-icon.png'),
  [180, 180],
  'src/app/apple-icon.png must be 180x180'
);
assert.ok(existsSync('public/logo-512.png'), 'public/logo-512.png must exist');
assert.deepEqual(
  readPngDimensions('public/logo-512.png'),
  [512, 512],
  'public/logo-512.png must be 512x512'
);

// 15. /search is set to noindex (thin query-only surface).
const searchPageSource = readFileSync('src/app/search/page.tsx', 'utf8');
assert.match(
  searchPageSource,
  /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/,
  '/search must be set to noindex (follow: true) — see src/app/search/page.tsx'
);

// 14. Custom 404: presence, noindex, and useful links.
const notFoundSource = readFileSync('src/app/not-found.tsx', 'utf8');
assert.match(
  notFoundSource,
  /robots:\s*\{\s*index:\s*false/,
  'the custom 404 page must be marked noindex'
);
for (const href of ['/', '/services', '/projects', '/government', '/search']) {
  assert.ok(
    notFoundSource.includes(`href: '${href}'`),
    `the custom 404 page must link to ${href}`
  );
}

console.log(
  `Batch 6/9 SEO smoke passed: 16 redirects verified exactly, site-URL resolver honors its 3-tier priority (and fails loudly on Vercel with none configured), metadataBase/canonical/OG/sitemap (${expectedTotal} URLs)/robots (OAI-SearchBot allowed, GPTBot disallowed)/JSON-LD (Organization+WebSite @graph)/icons (favicon/icon/apple-icon/logo-512)/404-noindex/search-noindex all present and safe.`
);
