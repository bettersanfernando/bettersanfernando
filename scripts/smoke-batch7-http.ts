#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import {
  getServiceCategory,
  getServiceHref,
  getServices,
} from '../src/data/civic/services.ts';
import { getProjects } from '../src/data/civic/projects.ts';
import { getCityOffices } from '../src/data/civic/government.ts';

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
const isFilipino = (pathname: string) =>
  pathname === '/fil' || pathname.startsWith('/fil/');
const englishSitemapUrls = sitemapUrls.filter(
  url => !isFilipino(new URL(url).pathname)
);
const filipinoSitemapUrls = sitemapUrls.filter(url =>
  isFilipino(new URL(url).pathname)
);
// Every dataset-backed route is listed: 40 static routes plus one per service
// category, service, project and office (kept in step with smoke-batch6-seo).
assert.equal(
  englishSitemapUrls.length,
  40 +
    new Set(getServices().map(getServiceCategory)).size +
    getServices().length +
    getProjects().length +
    getCityOffices().length
);
assert.equal(filipinoSitemapUrls.length, englishSitemapUrls.length);
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length);
assert.deepEqual(
  filipinoSitemapUrls.map(url => new URL(url).pathname),
  englishSitemapUrls.map(url => {
    const { pathname } = new URL(url);
    return pathname === '/' ? '/fil' : `/fil${pathname}`;
  })
);
assert.doesNotMatch(sitemapXml, /\/fil\/fil/);
assert.equal(
  (sitemapXml.match(/hreflang="fil-PH"/g) ?? []).length,
  sitemapUrls.length,
  'every sitemap entry must carry the EN/FIL alternates'
);
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
      assert.match(
        html,
        new RegExp(
          `<html lang="${isFilipino(canonical.pathname) ? 'fil' : 'en'}"`
        ),
        `${canonical.pathname} must declare its locale`
      );
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
        /independent, community-run civic-information portal|malaya at pinatatakbo-ng-komunidad na portal/i
      );
      assert.doesNotMatch(html, /"@type":"GovernmentOrganization"/);
      if (/aria-label="(Breadcrumb|Landas ng nabigasyon)"/.test(html)) {
        assert.match(html, /"@type":"BreadcrumbList"/);
      }
    })
  );
}

// Untranslated /fil pages intentionally share their English title and
// description, so uniqueness is enforced per locale over the English set.
const titles = [...pages.entries()]
  .filter(([path]) => !isFilipino(path))
  .map(([path, html]) => ({
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
const descriptions = [...pages.entries()]
  .filter(([path]) => !isFilipino(path))
  .map(
    ([, html]) =>
      html.match(/<meta name="description" content="(.*?)"\/>/)?.[1] ?? ''
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
  ['/projects/city-projects?status=AWARDED', 'AWARDED'],
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

// Legacy /projects listing filters redirect to the canonical listing route,
// keeping the query string and (for Filipino URLs) the /fil prefix.
for (const [source, destination] of [
  ['/projects?status=AWARDED', '/projects/city-projects?status=AWARDED'],
  [
    '/fil/projects?status=AWARDED',
    '/fil/projects/city-projects?status=AWARDED',
  ],
] as const) {
  const response = await request(source);
  assert.ok(
    [307, 308].includes(response.status),
    `${source} must redirect, got ${response.status}`
  );
  const location = redirectLocation(response);
  assert.equal(`${location.pathname}${location.search}`, destination);
}

// Localized editorial pages: /fil shows Filipino authored copy and metadata
// with locale-preserving links, while the English URL stays English.
for (const [path, filipino, filipinoTitle] of [
  [
    '/about',
    'Dapat Mas Madaling Gamitin ang Pampublikong Impormasyon',
    'Tungkol sa BetterSanFernando',
  ],
  ['/accessibility', 'Semantikong Estruktura', 'Accessibility'],
  ['/sitemap', 'Mga Pangunahing Destinasyon', 'Site Index'],
  ['/government', 'Unawain ang inyong Pamahalaang Lungsod.', 'Pamahalaan'],
  [
    '/government/contact',
    'Hanapin ang tamang contact sa Pamahalaang Lungsod',
    'Contact ng Pamahalaan',
  ],
  ['/projects', 'Impormasyon at Transparency ng mga Proyekto', 'Mga Proyekto'],
  ['/statistics', 'Tuklasin ang mga Estadistikang View', 'Estadistika'],
  ['/transparency', 'Pampublikong datos na matutuntunan mo.', 'Transparency'],
  ['/legislation', 'Limitadong pampublikong koleksyon', 'Lehislasyon'],
] as const) {
  const english = await (await request(path)).text();
  const filipinoPage = await (await request(`/fil${path}`)).text();
  assert.ok(filipinoPage.includes(filipino), `/fil${path} needs Filipino copy`);
  assert.ok(!english.includes(filipino), `${path} must stay English`);
  assert.ok(
    filipinoPage.includes(
      `<title>${filipinoTitle} | BetterSanFernando</title>`
    ),
    `/fil${path} needs its Filipino title`
  );
  assert.ok(!/href="\/fil/.test(english), `${path} must not link into /fil`);
  const unprefixed = [...filipinoPage.matchAll(/ href="(\/[^"]*)"/g)]
    .map(match => match[1])
    .filter(
      href =>
        !/^\/(fil(\/|$)|_next|assets|icon|apple-icon|favicon|sitemap\.xml)/.test(
          href
        )
    );
  assert.deepEqual(unprefixed, [], `/fil${path} links must keep /fil`);
  assert.ok(!filipinoPage.includes('/fil/fil'));
}
// Homepage: Filipino copy and metadata on /fil, English untouched on /.
{
  const english = await (await request('/')).text();
  const filipino = await (await request('/fil')).text();
  assert.ok(filipino.includes('Mas Madaling Gamitin.'));
  assert.ok(!english.includes('Mas Madaling Gamitin.'));
  assert.ok(
    english.includes('Public Information for San Fernando, Made Easier to Use.')
  );
  assert.ok(
    !filipino.includes(
      'Public Information for San Fernando, Made Easier to Use.'
    )
  );
  assert.ok(
    filipino.includes(
      '<title>BetterSanFernando — Impormasyong Pampubliko para sa San Fernando, Pampanga</title>'
    )
  );
  assert.ok(
    english.includes(
      '<title>BetterSanFernando — Civic Information for San Fernando, Pampanga</title>'
    )
  );
  assert.ok(
    filipino.includes(
      '<link rel="canonical" href="https://bettersanfernando.example/fil"'
    )
  );
  assert.ok(filipino.includes('<meta property="og:locale" content="fil_PH"'));
  assert.ok(!filipino.includes('/fil/fil'));
  const unprefixed = [...filipino.matchAll(/ href="(\/[^"]*)"/g)]
    .map(match => match[1])
    .filter(
      href =>
        !/^\/(fil(\/|$)|_next|assets|icon|apple-icon|favicon|sitemap\.xml)/.test(
          href
        )
    );
  assert.deepEqual(unprefixed, [], '/fil links must keep /fil');
}

const filipinoNotFound = await request('/fil/definitely-not-a-route');
assert.equal(filipinoNotFound.status, 404);
assert.ok(
  (await filipinoNotFound.text()).includes(
    'Hindi namin makita ang pahinang iyon.'
  )
);

const robotsResponse = await request('/robots.txt');
assert.equal(robotsResponse.status, 200);
assert.match(
  await robotsResponse.text(),
  /Sitemap: https:\/\/bettersanfernando\.example\/sitemap\.xml/
);

console.log(
  'Batch 7 HTTP smoke passed: content-bearing EN and FIL shell pages for every sitemap URL, 16 exact aliases, legacy service redirects, genuine noindex 404s, query-state SSR/canonicals, production-origin SEO, and rendered breadcrumb JSON-LD.'
);
