#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { getServices, getServiceHref } from '../src/data/civic/services.ts';

const baseUrl = process.env.BATCH7_BASE_URL ?? 'http://127.0.0.1:3000';
const productionOrigin = 'https://bettersanfernando.example';

async function request(path: string) {
  return fetch(new URL(path, baseUrl), { redirect: 'manual' });
}

function redirectLocation(response: Response) {
  const values = response.headers.get('location')!.split(', ');
  assert.ok(values.every(value => value === values[0]));
  return new URL(values[0], baseUrl);
}

const sitemapResponse = await request('/sitemap.xml');
assert.equal(sitemapResponse.status, 200);
const sitemapXml = await sitemapResponse.text();
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  match => match[1]
);
assert.equal(sitemapUrls.length, 599);
assert.equal(new Set(sitemapUrls).size, 599);
assert.ok(sitemapUrls.every(url => url.startsWith(`${productionOrigin}/`)));
assert.doesNotMatch(sitemapXml, /localhost|127\.0\.0\.1/i);

const pages = new Map<string, string>();
for (let offset = 0; offset < sitemapUrls.length; offset += 25) {
  await Promise.all(
    sitemapUrls.slice(offset, offset + 25).map(async canonicalUrl => {
      const canonical = new URL(canonicalUrl);
      const response = await request(canonical.pathname);
      assert.equal(
        response.status,
        200,
        `${canonical.pathname} must return 200`
      );
      const html = await response.text();
      pages.set(canonical.pathname, html);
      assert.match(html, /<header[ >]/i, `${canonical.pathname} needs header`);
      assert.match(html, /<footer[ >]/i, `${canonical.pathname} needs footer`);
      assert.match(html, /<h1[ >]/i, `${canonical.pathname} needs a heading`);
      assert.ok(
        html.length > 1_000,
        `${canonical.pathname} needs meaningful content`
      );
      assert.doesNotMatch(html, /(?:navigation|footer)\.[a-z][\w-]*/i);
      assert.doesNotMatch(html, /localhost|127\.0\.0\.1/i);
      const expectedCanonical =
        canonical.pathname === '/' ? productionOrigin : canonicalUrl;
      assert.match(
        html,
        new RegExp(
          `<link rel="canonical" href="${expectedCanonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`
        )
      );
      assert.match(
        html,
        /<meta property="og:image" content="https:\/\/bettersanfernando\.example\/og-default\.png"/
      );
      assert.match(
        html,
        /independent, community-run civic-information portal/i
      );
      assert.doesNotMatch(html, /"@type":"GovernmentOrganization"/);
      if (/aria-label="Breadcrumb"/.test(html)) {
        assert.match(html, /"@type":"BreadcrumbList"/);
      }
    })
  );
}

const titles = [...pages.entries()].map(([path, html]) => ({
  path,
  title: html.match(/<title>(.*?)<\/title>/)?.[1] ?? '',
}));
assert.ok(titles.every(entry => entry.title.length >= 10));
const titlePaths = Map.groupBy(titles, entry => entry.title);
const duplicateTitles = [...titlePaths.entries()].filter(
  ([, entries]) => entries.length > 1
);
assert.deepEqual(
  duplicateTitles,
  [],
  `page titles must be unique: ${duplicateTitles
    .map(
      ([title, entries]) =>
        `${title}: ${entries.map(entry => entry.path).join(', ')}`
    )
    .join('; ')}`
);
const descriptions = [...pages.values()].map(
  html => html.match(/<meta name="description" content="(.*?)"\/>/)?.[1] ?? ''
);
assert.ok(descriptions.every(description => description.length >= 40));
assert.equal(
  new Set(descriptions).size,
  descriptions.length,
  'page descriptions must be unique'
);

const aliases = [
  ['/contact', '/government/contact'],
  ['/philippines/hotlines', '/government/hotlines'],
  ['/government/directory', '/government/offices'],
  ['/government/contacts', '/government/offices'],
  ['/government/departments', '/government/offices'],
  ['/government/reports-and-statistics', '/statistics'],
  ['/transparency/procurement', '/procurement'],
  ['/transparency/contracts', '/procurement/contracts'],
  ['/projects/data-sources', '/projects/sources'],
  ['/projects/dashboard', '/statistics/projects'],
  ['/statistics/population/barangays', '/statistics/population#barangays'],
  ['/transparency/verification', '/transparency/methodology#verification'],
  ['/transparency/limitations', '/transparency/methodology#limitations'],
  ['/government/documents', '/transparency/documents'],
  ['/government/transparency-documents', '/transparency/documents'],
  ['/transparency/archive', '/transparency/full-disclosure'],
] as const;
for (const [source, destination] of aliases) {
  assert.ok(!sitemapUrls.some(url => new URL(url).pathname === source));
  const response = await request(source);
  assert.equal(response.status, 308, `${source} must return 308`);
  const location = redirectLocation(response);
  assert.equal(`${location.pathname}${location.hash}`, destination);
}

const services = getServices();
for (const service of [services[0], services[88], services.at(-1)!]) {
  const response = await request(`/services/${service.slug}`);
  assert.equal(response.status, 308);
  const location = redirectLocation(response);
  assert.equal(location.pathname, getServiceHref(service));
}

for (const path of [
  '/definitely-not-a-route',
  '/services/definitely-not-a-service',
  '/services/business/definitely-not-a-service',
  '/projects/definitely-not-a-project',
  '/government/offices/definitely-not-an-office',
  '/government/definitely-not-a-category',
]) {
  const response = await request(path);
  assert.equal(response.status, 404, `${path} must return 404`);
  assert.match(await response.text(), /<meta name="robots" content="noindex"/);
}

for (const [path, expectedValue] of [
  ['/search?q=water', 'water'],
  ['/projects?status=AWARDED', 'AWARDED'],
  ['/projects/sources?stage=BID_RESULTS', 'BID_RESULTS'],
  ['/barangays?type=Urban', 'Urban'],
  ['/procurement/bid-results?year=2024', '2024'],
  ['/procurement/contracts?lifecycle=AWARDED', 'AWARDED'],
  ['/legislation/executive-orders?q=peace', 'peace'],
  ['/legislation/ordinances?availability=full-text', 'full-text'],
  ['/government/barangay-contacts?barangay=Baliti', 'Baliti'],
] as const) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} must return 200`);
  const html = await response.text();
  const basePath = path.split('?')[0];
  assert.match(
    html,
    new RegExp(
      `<link rel="canonical" href="${productionOrigin}${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`
    )
  );
  assert.ok(html.includes(expectedValue), `${path} needs query-specific HTML`);
  assert.notEqual(html, pages.get(basePath), `${path} must render URL state`);
}

const robotsResponse = await request('/robots.txt');
assert.equal(robotsResponse.status, 200);
assert.match(
  await robotsResponse.text(),
  /Sitemap: https:\/\/bettersanfernando\.example\/sitemap\.xml/
);

console.log(
  'Batch 7 HTTP smoke passed: 599 content-bearing shell pages, 16 exact aliases, legacy service redirects, genuine noindex 404s, query-state SSR/canonicals, production-origin SEO, and rendered breadcrumb JSON-LD.'
);
