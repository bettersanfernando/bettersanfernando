import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { getProjects } from '../src/data/civic/projects.ts';
import { getCityOffices } from '../src/data/civic/government.ts';
import {
  getServiceCategory,
  getServiceHref,
  getServices,
} from '../src/data/civic/services.ts';
import { localizeHref, withoutLocalePrefix } from '../src/i18n/locale.ts';

for (const path of ['/', '/about', '/services/civil-registry']) {
  const internal = `/en${path === '/' ? '' : path}`;
  assert.equal(withoutLocalePrefix(internal), path);
  assert.equal(localizeHref(internal, 'en'), path);
  assert.equal(
    localizeHref(internal, 'fil'),
    `/fil${path === '/' ? '' : path}`
  );
}
assert.equal(
  localizeHref('/en/search?q=water#results', 'fil'),
  '/fil/search?q=water#results'
);
assert.equal(withoutLocalePrefix('/environment'), '/environment');

const queryRoutes = [
  '/barangays',
  '/government/barangay-contacts',
  '/government/links',
  '/government/offices',
  '/legislation/executive-orders',
  '/legislation/ordinances',
  '/procurement/bid-results',
  '/procurement/contracts',
  '/projects',
  '/projects/city-projects',
  '/projects/sources',
  '/search',
];
const manifest = JSON.parse(
  readFileSync('.next/prerender-manifest.json', 'utf8')
) as {
  routes: Record<
    string,
    { compute: string; initialRevalidateSeconds: false | number }
  >;
  dynamicRoutes: Record<string, { fallback: false | null | string }>;
};
const literalRoutes = readdirSync('src/app/[locale]', { recursive: true })
  .map(file => file.toString().replaceAll('\\', '/'))
  .filter(file => file.endsWith('page.tsx') && !file.includes('['))
  .map(file => `/${file.replace(/\/?page\.tsx$/, '')}`);
const services = getServices();
const serviceCategoryPaths = [
  ...new Set(
    services.map(service => `/services/${getServiceCategory(service)}`)
  ),
];
const paths = [
  ...literalRoutes.filter(route => !queryRoutes.includes(route)),
  ...services.map(getServiceHref),
  ...getProjects().map(project => `/projects/${project.id}`),
  ...getCityOffices().map(office => `/government/offices/${office.office_id}`),
];

for (const path of literalRoutes.filter(
  route => !queryRoutes.includes(route)
)) {
  assert.equal(
    manifest.dynamicRoutes[`/[locale]${path === '/' ? '' : path}`]?.fallback,
    false,
    `${path} must not deploy a locale fallback function`
  );
}

for (const locale of ['en', 'fil']) {
  for (const path of paths) {
    const internal = `/${locale}${path === '/' ? '' : path}`;
    assert.equal(
      manifest.routes[internal]?.compute,
      'static',
      `${internal} must be prerendered`
    );
    assert.equal(manifest.routes[internal].initialRevalidateSeconds, false);
  }
  for (const path of queryRoutes) {
    assert.ok(
      !manifest.routes[`/${locale}${path}`],
      `${path} must retain query SSR`
    );
  }
  for (const path of serviceCategoryPaths) {
    assert.ok(
      !manifest.routes[`/${locale}${path}`],
      `${path} must retain query SSR for crawlable pagination`
    );
  }
}
for (const family of [
  '/services/[category]',
  '/services/[category]/[serviceSlug]',
  '/projects/[projectId]',
  '/government/offices/[officeId]',
]) {
  assert.notEqual(
    manifest.dynamicRoutes[`/[locale]${family}`]?.fallback,
    false,
    `${family} must retain redirects/404 fallbacks`
  );
}
const proxy = JSON.parse(
  readFileSync('.next/server/functions-config-manifest.json', 'utf8')
) as { functions: Record<string, { matchers: { originalSource: string }[] }> };
assert.deepEqual(
  Object.values(proxy.functions).flatMap(entry =>
    entry.matchers.map(matcher => matcher.originalSource)
  ),
  ['/fil/:path*']
);
assert.equal(paths.length, 553);
console.log(
  `Static locale smoke passed: ${paths.length * 2} public HTML paths prerendered; ${queryRoutes.length + serviceCategoryPaths.length} query-dependent families retained.`
);
