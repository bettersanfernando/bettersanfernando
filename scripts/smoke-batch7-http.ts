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
  [
    '/statistics/projects',
    'Isang snapshot ng mga nailathalang talaan ng proyekto ng San Fernando',
    'Estadistika ng mga Proyekto',
  ],
  [
    '/statistics/procurement',
    'Nailathalang ebidensya at saklaw ng procurement',
    'Estadistika ng Procurement',
  ],
  [
    '/statistics/project-spending',
    'Gaano karami sa koleksyon ng proyekto ang kinakatawan?',
    'Gastos at Paggamit ng Proyekto',
  ],
  [
    '/statistics/population',
    'Paano Ipinamamahagi ang Populasyon',
    'Estadistika ng Populasyon',
  ],
  [
    '/statistics/demographics',
    'Magkakaibang Sukat, Magkakaibang Panahong Tinutukoy',
    'Demograpiko',
  ],
  [
    '/statistics/government',
    'Saklaw ng Pahinang Ito',
    'Estadistika ng Pamahalaan',
  ],
  [
    '/statistics/legislation',
    'Nailathalang Saklaw ayon sa Koleksyon',
    'Estadistika ng Lehislasyon',
  ],
  [
    '/statistics/public-records',
    'Walang pinagsamang kabuuan ng mga pampublikong talaan',
    'Estadistika ng mga Pampublikong Talaan',
  ],
  [
    '/statistics/city-profile',
    'Tuklasin ang Profile ng Lungsod',
    'Profile ng Lungsod: San Fernando, Pampanga',
  ],
  [
    '/projects/city-projects',
    'Tingnan ang mga beripikadong proyekto at talaan ng procurement ng Lungsod.',
    'Mga Proyekto ng Lungsod',
  ],
  [
    '/projects/map',
    'Mga barangay na may pinakamaraming talaan',
    'Distribusyon ng proyekto ayon sa barangay',
  ],
  [
    '/projects/methodology',
    'Paano binubuo ng BetterSanFernando ang mga talaan ng proyekto',
    'Metodolohiya ng Proyekto',
  ],
  [
    '/projects/sources',
    'Mga talaan sa likod ng mga katotohanan tungkol sa proyekto',
    'Mga Source ng Proyekto',
  ],
  ['/procurement', 'Mga talaan at ebidensya ng procurement', 'Procurement'],
  [
    '/procurement/bid-results',
    'Nailathalang ebidensya ng resulta ng bid',
    'Resulta ng Bid',
  ],
  [
    '/procurement/contracts',
    'Nailathalang ebidensya ng award at kontrata',
    'Mga Kontrata at Award',
  ],
  [
    '/government/hotlines',
    'Mga numero ng contact para sa emerhensiya at institusyon',
    'Mga Hotline sa Emerhensiya',
  ],
  [
    '/government/offices',
    'Hanapin ang isang tanggapan',
    'Mga Tanggapan ng Lungsod',
  ],
  [
    '/government/barangay-contacts',
    'Mga contact ng barangay sa buong San Fernando',
    'Mga Contact ng Barangay',
  ],
  [
    '/government/links',
    'Hanapin ang isang opisyal na destinasyon',
    'Mga Opisyal na Link ng Pamahalaan',
  ],
  [
    '/legislation/executive-orders',
    'Hanapin ang isang Executive Order',
    'Mga Executive Order',
  ],
  [
    '/legislation/ordinances',
    'Hanapin at i-filter ang mga ordinansa',
    'Mga Ordinansa',
  ],
  [
    '/legislation/resolutions',
    'Mga beripikadong paksa ng resolusyon',
    'Mga Resolusyon',
  ],
  [
    '/transparency/sources',
    'Ang mga Pampublikong Source sa Likod ng BetterSanFernando',
    'Mga Source ng Transparency',
  ],
  [
    '/transparency/methodology',
    'Ang Proseso ng Paglalathala',
    'Paano Namin Inilalathala ang Datos',
  ],
  [
    '/transparency/documents',
    'beripikado ngunit bahagyang koleksyon',
    'Mga Opisyal na Dokumento',
  ],
  [
    '/transparency/full-disclosure',
    'Beripikadong metadata ng ulat ng Full Disclosure Policy',
    'Mga Ulat ng Full Disclosure',
  ],
  [
    '/transparency/finance',
    'source-reported na opisyal na aggregate na ulat sa pananalapi',
    'Pananalapi ng Lungsod',
  ],
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

// Search: /fil/search keeps identical matching behavior to /search — an
// English query still matches, an existing Filipino alias still expands to
// its English-indexed results, and the no-results state renders Filipino
// chrome without requiring canonical result titles to be translated.
{
  const englishQuery = await (await request('/fil/search?q=water')).text();
  assert.ok(
    englishQuery.includes('water'),
    '/fil/search must still match an English query'
  );

  const aliasQuery = await (await request('/fil/search?q=kalusugan')).text();
  const englishAliasQuery = await (await request('/search?q=kalusugan')).text();
  assert.ok(
    aliasQuery.includes('Health'),
    '/fil/search must expand the existing "kalusugan" alias to its English-indexed results'
  );
  assert.ok(
    englishAliasQuery.includes('Health'),
    '/search must also expand the same alias — Filipino must not change matching behavior'
  );

  const noResults = await (
    await request('/fil/search?q=zzzznonexistentqueryxyz')
  ).text();
  assert.ok(
    noResults.includes('Walang nailathalang talaan'),
    '/fil/search must render the Filipino empty-state copy'
  );
}

// Search data-layer display localization (Batch 3C): a curated "Site page"
// result shows a translated title/description on /fil while the English
// page keeps the untranslated authored copy — same href, same match, only
// the rendered text differs. Office/project/legislation searches keep their
// canonical, source-faithful titles on both locales.
{
  const englishSitePage = await (
    await request('/search?q=Transparency')
  ).text();
  const filipinoSitePage = await (
    await request('/fil/search?q=Transparency')
  ).text();
  assert.ok(
    englishSitePage.includes('Published-record inventory'),
    '/search must keep the English site-page description'
  );
  assert.ok(
    !englishSitePage.includes('Inventory ng nailathalang talaan'),
    '/search must not show the Filipino site-page description'
  );
  assert.ok(
    filipinoSitePage.includes('Inventory ng nailathalang talaan'),
    '/fil/search must show the localized site-page description'
  );
  assert.ok(
    filipinoSitePage.includes('href="/fil/transparency"'),
    '/fil/search must still link to the same destination as the English result'
  );

  const englishOffice = await (await request('/search?q=CHO')).text();
  const filipinoOffice = await (await request('/fil/search?q=CHO')).text();
  const officeNameMatch = englishOffice.match(/City Health Office[^<]*/)?.[0];
  assert.ok(
    officeNameMatch,
    '/search?q=CHO must return the City Health Office by its canonical name'
  );
  assert.ok(
    filipinoOffice.includes(officeNameMatch!),
    '/fil/search must show the same canonical office name verbatim, untranslated'
  );

  const englishProject = await (
    await request('/search?q=San Nicolas School')
  ).text();
  const filipinoProject = await (
    await request('/fil/search?q=San Nicolas School')
  ).text();
  assert.ok(
    englishProject.includes('proj-2025-san-nicolas-school'),
    '/search must return a matching project result'
  );
  assert.ok(
    filipinoProject.includes('proj-2025-san-nicolas-school'),
    '/fil/search must return the same canonical project result'
  );
}

// Services (Batch 4): authored hub/category/detail chrome is Filipino on
// /fil, while canonical service-record content (titles, requirements,
// steps, fees, processing times, office/contact details) stays verbatim —
// the same English text on both locales, since no reviewed Filipino source
// exists for it.
{
  const englishHub = await (await request('/services')).text();
  const filipinoHub = await (await request('/fil/services')).text();
  assert.ok(
    englishHub.includes('Find the City service you need.'),
    '/services must keep its English hero heading'
  );
  assert.ok(
    filipinoHub.includes('Hanapin ang serbisyo ng Lungsod na kailangan mo.'),
    '/fil/services must show the localized hero heading'
  );
  assert.ok(
    filipinoHub.includes('href="/fil/services/civil-registry"'),
    '/fil/services category links must keep /fil'
  );

  // Representative category: authored intro/coverage text is localized;
  // the civil-registry category name comes from the shared nav vocabulary.
  const englishCategory = await (
    await request('/services/civil-registry')
  ).text();
  const filipinoCategory = await (
    await request('/fil/services/civil-registry')
  ).text();
  assert.ok(
    englishCategory.includes(
      'publication-reviewed Citizen&#x27;s Charter services currently published from the City Civil Registry Office (CCRO).'
    ),
    '/services/civil-registry must keep its English category intro'
  );
  assert.ok(
    filipinoCategory.includes('City Civil Registry Office (CCRO)'),
    '/fil/services/civil-registry must still name the office verbatim inside the localized intro'
  );
  assert.ok(
    !englishCategory.includes('Labinlimang publication-reviewed'),
    '/services/civil-registry must not show Filipino text'
  );
  assert.ok(
    englishCategory.includes('Civil Registry'),
    '/services/civil-registry (English) must show the English category name'
  );

  // Representative detail pages, chosen to cover a stated fee, a stated
  // processing time, multiple requirements/steps, forms, and variants.
  for (const slug of [
    'applying-for-a-marriage-license',
    'various-maintenance-services',
  ] as const) {
    const category =
      slug === 'various-maintenance-services'
        ? 'utilities-water'
        : 'civil-registry';
    const path = `/services/${category}/${slug}`;
    const englishResponse = await request(path);
    assert.equal(englishResponse.status, 200, `${path} must return 200`);
    const english = await englishResponse.text();
    const filipino = await (await request(`/fil${path}`)).text();

    // Canonical service title is byte-identical on both locales.
    const titleMatch = english.match(/<h1[^>]*>([^<]*)<\/h1>/);
    assert.ok(titleMatch, `${path} must render an <h1> service title`);
    assert.ok(
      filipino.includes(titleMatch![1]),
      `${path}: the canonical service title must appear verbatim on /fil`
    );

    // Authored section headings are localized on /fil.
    assert.ok(
      filipino.includes('Mga Kinakailangan'),
      `/fil${path} must localize the Requirements heading`
    );
    assert.ok(
      filipino.includes('Paano mag-apply'),
      `/fil${path} must localize the "How to apply" heading`
    );
    assert.ok(
      !english.includes('Mga Kinakailangan'),
      `${path} (English) must not show the Filipino Requirements heading`
    );

    // /fil never doubles the locale prefix.
    assert.ok(
      !filipino.includes('/fil/fil'),
      `/fil${path} must not contain /fil/fil`
    );
  }

  // Fee/no-fee and stated/unstated processing-time fallback text: the
  // authored fallback sentence is localized, but "Not stated" must never be
  // strengthened into a claim that the item is unavailable or not required.
  const marriage = await (
    await request(
      '/fil/services/civil-registry/applying-for-a-marriage-license'
    )
  ).text();
  assert.ok(
    !marriage.includes('Not required') && !marriage.includes('Unavailable'),
    '/fil service detail must never strengthen "not stated" into "not required"/"unavailable"'
  );
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

// Dynamic project detail: source-faithful title, localized chrome.
for (const projectId of [
  'proj-2025-san-nicolas-school',
  'proj-2024-alasas-road',
]) {
  const english = await (await request(`/projects/${projectId}`)).text();
  const filipino = await (await request(`/fil/projects/${projectId}`)).text();
  assert.ok(filipino.includes('Pangkalahatang-tanaw ng Pananalapi'));
  assert.ok(!english.includes('Pangkalahatang-tanaw ng Pananalapi'));
  const titleMatch = /<title>([^<]*) \| BetterSanFernando<\/title>/.exec(
    english
  );
  assert.ok(titleMatch);
  assert.ok(
    filipino.includes(`<title>${titleMatch[1]} | BetterSanFernando</title>`),
    'project name/title must stay verbatim across locales'
  );
}

// Dynamic office detail: record-faithful title, localized chrome.
for (const officeId of ['city-government-main', 'rhu-i-dolores']) {
  const english = await (
    await request(`/government/offices/${officeId}`)
  ).text();
  const filipino = await (
    await request(`/fil/government/offices/${officeId}`)
  ).text();
  assert.ok(filipino.includes('Beripikadong talaan'));
  assert.ok(!english.includes('Beripikadong talaan'));
  const officeTitleMatch = /<title>([^<]*) \| BetterSanFernando<\/title>/.exec(
    english
  );
  assert.ok(officeTitleMatch);
  assert.ok(
    filipino.includes(
      `<title>${officeTitleMatch[1]} | BetterSanFernando</title>`
    ),
    'office name in the title must stay verbatim across locales'
  );
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
