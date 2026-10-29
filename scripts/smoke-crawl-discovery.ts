import assert from 'node:assert/strict';
import { getCityOffices } from '../src/data/civic/government.ts';
import { getProjects } from '../src/data/civic/projects.ts';
import {
  getServices,
  getServiceCategory,
  getServiceHref,
} from '../src/data/civic/services.ts';
import { localizeHref } from '../src/i18n/locale.ts';

// Run against `pnpm start` after a production build. Only real HTML anchors
// advance the listing crawl; knowing a record exists is not discovery evidence.
const base = process.env.CRAWL_BASE_URL ?? 'http://127.0.0.1:32626';
const responses = new Map<string, string>();
const decode = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(parseInt(code, 16))
    )
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(+code))
    .replace(/&apos;/g, "'");
const withoutScripts = (html: string) =>
  html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
const anchors = (html: string) =>
  new Set(
    [...withoutScripts(html).matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map(
      match => decode(match[1])
    )
  );
const main = (html: string) => {
  const content = withoutScripts(html).match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
  assert.ok(content, 'response must contain server-rendered main content');
  return content[0];
};
async function request(path: string) {
  const cached = responses.get(path);
  if (cached) return cached;
  const response = await fetch(new URL(path, base), { redirect: 'manual' });
  assert.equal(response.status, 200, `${path} must return 200`);
  const html = await response.text();
  responses.set(path, html);
  return html;
}
function canonical(html: string) {
  const match = html.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(match, 'response must contain a canonical');
  return new URL(decode(match[1]));
}
function assertMetadata(html: string, path: string, expectedPath = path) {
  const expected = new URL(expectedPath, canonical(html).origin);
  assert.equal(canonical(html).href, expected.href, `${path} canonical`);
  assert.ok(!/<meta[^>]+content="noindex/.test(html), `${path} is indexable`);
  const english = localizeHref(expectedPath, 'en');
  const filipino = localizeHref(expectedPath, 'fil');
  for (const [language, href] of [
    ['en', english],
    ['fil-PH', filipino],
  ]) {
    assert.ok(
      decode(html).includes(
        `rel="alternate" hrefLang="${language}" href="${new URL(href, expected.origin).href}"`
      ) ||
        decode(html).includes(
          `rel="alternate" hreflang="${language}" href="${new URL(href, expected.origin).href}"`
        ),
      `${path} must have its reciprocal ${language} alternate`
    );
  }
}
function assertLocaleLinks(html: string, path: string) {
  const links = anchors(
    [...withoutScripts(html).matchAll(/<a\b[^>]*>/gi)]
      .filter(match => /\bdata-locale-link\b/.test(match[0]))
      .map(match => match[0])
      .join('')
  );
  for (const locale of ['en', 'fil'] as const) {
    assert.ok(
      links.has(localizeHref(path, locale)),
      `${path} needs a crawlable ${locale} locale option`
    );
  }
}

const services = getServices();
const offices = getCityOffices();
const projects = getProjects();
const categories = [...new Set(services.map(getServiceCategory))];
const families = [
  {
    path: '/government/offices',
    details: offices.map(office => `/government/offices/${office.office_id}`),
  },
  ...categories.map(category => ({
    path: `/services/${category}`,
    details: services
      .filter(service => getServiceCategory(service) === category)
      .map(getServiceHref),
  })),
  {
    path: '/projects/city-projects',
    details: projects.map(project => `/projects/${project.id}`),
  },
];

for (const locale of ['en', 'fil'] as const) {
  const homePath = localizeHref('/', locale);
  const home = await request(homePath);
  assertLocaleLinks(home, homePath);
  const homeLinks = anchors(home);
  assert.ok(homeLinks.has(localizeHref('/services', locale)));
  const serviceHubLinks = anchors(
    await request(localizeHref('/services', locale))
  );
  for (const family of families) {
    const listing = localizeHref(family.path, locale);
    assert.ok(
      homeLinks.has(listing) || serviceHubLinks.has(listing),
      `${listing} must be discoverable from navigation or the service hub`
    );
    const expected = new Set(
      family.details.map(path => localizeHref(path, locale))
    );
    const discovered = new Set<string>();
    const queue = [listing];
    const visited = new Set<string>();
    const pageRecords = new Map<string, string[]>();
    for (let i = 0; i < queue.length; i++) {
      const path = queue[i];
      if (visited.has(path)) continue;
      visited.add(path);
      assert.ok(
        visited.size <= family.details.length,
        'pagination crawl must terminate'
      );
      const html = await request(path);
      assertMetadata(html, path);
      assertLocaleLinks(html, path);
      const records = [...anchors(main(html))].filter(href =>
        expected.has(href)
      );
      assert.ok(records.length > 0, `${path} must server-render record links`);
      pageRecords.set(path, records);
      records.forEach(href => discovered.add(href));
      for (const href of anchors(main(html))) {
        const url = new URL(href, base);
        if (
          url.pathname === listing &&
          [...url.searchParams.keys()].every(key => key === 'page') &&
          (!url.search || /^[1-9]\d*$/.test(url.searchParams.get('page') ?? ''))
        ) {
          const target = url.pathname + url.search;
          if (!visited.has(target)) queue.push(target);
        }
      }
    }
    assert.deepEqual(
      [...discovered].sort(),
      [...expected].sort(),
      `${listing}: every detail must be reached through real listing/pagination anchors`
    );
    if (family.details.length > 10) {
      const secondPage = `${listing}?page=2`;
      assert.ok(visited.has(secondPage), `${listing} must link to page 2`);
      assert.notDeepEqual(
        pageRecords.get(secondPage),
        pageRecords.get(listing),
        `${secondPage} must server-render a different record page`
      );
    }
  }

  for (const listingBase of [
    '/government/offices',
    '/services/health-services',
    '/projects/city-projects',
  ]) {
    const listing = localizeHref(listingBase, locale);
    for (const page of ['1', '0', '-1', 'abc', '2x', '1.5']) {
      const path = `${listing}?page=${page}`;
      const html = await request(path);
      assertMetadata(html, path, listing);
      assert.deepEqual(
        anchors(main(html)),
        anchors(main(await request(listing)))
      );
    }
    const family = families.find(family => family.path === listingBase)!;
    const last = `${listing}?page=${Math.ceil(family.details.length / 10)}`;
    const tooFar = `${listing}?page=99999`;
    assertMetadata(await request(tooFar), tooFar, last);
    assert.deepEqual(
      anchors(main(await request(tooFar))),
      anchors(main(await request(last)))
    );
    for (const suffix of ['page=2&q=test', 'page=2&sort=name-asc']) {
      const path = `${listing}?${suffix}`;
      assertMetadata(await request(path), path, listing);
    }
  }

  for (const [path, heading] of [
    ['/about', null],
    [`/government/offices/${offices[0].office_id}`, offices[0].office_name],
    [getServiceHref(services[0]), services[0].title],
    [`/projects/${projects[0].id}`, projects[0].project_name],
  ] as const) {
    const localized = localizeHref(path, locale);
    const html = await request(localized);
    assertMetadata(html, localized);
    assertLocaleLinks(html, localized);
    assert.ok(/<title>[^<]+<\/title>/.test(html));
    const h1 = main(html).match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
    assert.ok(h1, `${localized} needs its H1`);
    if (heading) {
      assert.equal(decode(h1[1].replace(/<[^>]+>/g, '')), heading);
      assert.ok(
        decode(html.match(/<title>(.*?)<\/title>/)![1]).includes(heading)
      );
    }
  }

  const project = projects.find(
    project => project.barangay_psgc && project.barangay
  )!;
  const detail = await request(localizeHref(`/projects/${project.id}`, locale));
  assert.ok(
    anchors(main(detail)).has(
      localizeHref(`/barangays?q=${project.barangay_psgc}`, locale)
    ),
    'verified project barangay must link to its directory record'
  );
  const search = await request(localizeHref('/search', locale));
  assert.match(search, /<meta name="robots" content="noindex, follow"/);
}

const sitemapResponse = await fetch(new URL('/sitemap.xml', base));
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  match => match[1]
);
assert.equal(
  sitemapUrls.length,
  2 *
    (40 +
      categories.length +
      offices.length +
      services.length +
      projects.length)
);
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length);
assert.ok(
  sitemapUrls.every(url => !/[?#]/.test(url)),
  'pagination stays out of XML sitemap'
);
console.log(
  `Crawl discovery smoke passed: ${offices.length} offices, ${services.length} services, ${projects.length} projects per locale; real pagination and locale hrefs, SSR page selection, edge cases, canonicals, hreflang, contextual links, and ${sitemapUrls.length} sitemap URLs verified (${responses.size} HTML requests).`
);
