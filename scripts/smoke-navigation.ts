import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  mainNavigation,
  getActiveNavigationId,
  getSearchHref,
  searchNavigation,
} from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';
import { assertNextRedirect, readNextRoute } from './smoke-next-route.ts';

const expectedTopLevelIds = [
  'home',
  'services',
  'projects',
  'government',
  'transparency',
  'about',
  'contact',
];

assert.deepEqual(
  mainNavigation.map(item => item.id),
  expectedTopLevelIds,
  'the header must expose exactly the approved seven top-level entries'
);

const megaMenus = mainNavigation.filter(item => item.sections);
assert.deepEqual(
  megaMenus.map(item => item.id),
  ['services', 'projects', 'government', 'transparency'],
  'only the four approved entries may use mega menus'
);

for (const menu of megaMenus) {
  assert.ok(menu.sections && menu.sections.length <= 4);

  for (const destination of menu.sections!.flatMap(section => section.items)) {
    assert.ok(
      destination.descriptionKey,
      `${destination.href} must define a localized navigation description`
    );
    assert.ok(
      destination.icon,
      `${destination.href} must define a semantic navigation icon`
    );
  }
}

assert.equal(searchNavigation.href, '/search');
assert.equal(searchNavigation.labelKey, 'navigation.search');
assert.equal(
  searchNavigation.placeholderKey,
  'navigation.searchPlaceholder',
  'Search must remain a permanent header utility'
);
assert.equal(getSearchHref('  city projects  '), '/search?q=city%20projects');
assert.equal(getSearchHref('   '), '/search');

for (const [source, destination] of [
  ['/government/documents', '/transparency/documents'],
  ['/transparency/archive', '/transparency/full-disclosure'],
  ['/contact', '/government/contact'],
  ['/government/departments', '/government/offices'],
  ['/government/transparency-documents', '/transparency/documents'],
  ['/philippines/hotlines', '/government/hotlines'],
] as const) {
  await assertNextRedirect(source, destination);
}
for (const route of [
  '/government/contact',
  '/government/offices',
  '/transparency/documents',
  '/government/hotlines',
]) {
  readNextRoute(route);
}

const allNavigationHrefs = megaMenus.flatMap(menu =>
  menu.sections!.flatMap(section => section.items.map(item => item.href))
);
for (const href of [
  '/transparency/documents',
  '/transparency/full-disclosure',
]) {
  assert.equal(
    allNavigationHrefs.filter(item => item === href).length,
    1,
    `${href} must have exactly one navigation destination, not a duplicate alias entry`
  );
}
assert.ok(
  !allNavigationHrefs.includes('/government/documents'),
  '/government/documents must not remain as an independent navigation destination'
);
assert.ok(
  !allNavigationHrefs.includes('/transparency/archive'),
  '/transparency/archive must not remain as an independent navigation destination'
);
assert.ok(
  allNavigationHrefs.includes('/transparency/documents'),
  'the canonical Transparency Documents navigation entry must remain present'
);
assert.ok(
  allNavigationHrefs.includes('/transparency/full-disclosure'),
  'the canonical Full Disclosure Reports navigation entry must remain present'
);
assert.ok(
  !plannedPages.some(page => page.path === '/government/documents'),
  '/government/documents must no longer be registered as a planned page'
);
assert.ok(
  !plannedPages.some(page => page.path === '/transparency/archive'),
  '/transparency/archive must no longer be registered as a planned page'
);
assert.ok(
  !plannedPages.some(page => page.path === '/transparency/documents'),
  '/transparency/documents must be removed from planned pages'
);
assert.ok(
  !plannedPages.some(page => page.path === '/transparency/full-disclosure'),
  '/transparency/full-disclosure must no longer be registered as a planned page'
);
assert.ok(
  !plannedPages.some(page => page.path === '/contact'),
  '/contact must no longer be registered as a planned page'
);

const contactTopLevel = mainNavigation.find(item => item.id === 'contact');
assert.equal(
  contactTopLevel?.href,
  '/government/contact',
  'the top-level Contact navigation item must point directly to /government/contact'
);
const directContactDestinations = mainNavigation.filter(
  item => item.href === '/government/contact'
);
assert.equal(
  directContactDestinations.length,
  1,
  'exactly one top-level navigation item may point directly at /government/contact'
);
const transparencyDocumentsDestination = megaMenus
  .flatMap(menu => menu.sections!.flatMap(section => section.items))
  .find(item => item.href === '/transparency/documents');
const fullDisclosureDestination = megaMenus
  .flatMap(menu => menu.sections!.flatMap(section => section.items))
  .find(item => item.href === '/transparency/full-disclosure');
assert.equal(
  transparencyDocumentsDestination?.kind,
  'real',
  'Transparency Documents must be a real navigation destination'
);
assert.equal(
  fullDisclosureDestination?.kind,
  'real',
  'Full Disclosure Reports must now be a real navigation destination'
);

for (const href of [
  '/legislation/resolutions',
  '/transparency/finance',
  '/statistics/public-records',
  '/statistics/legislation',
]) {
  const destination = megaMenus
    .flatMap(menu => menu.sections!.flatMap(section => section.items))
    .find(item => item.href === href);
  assert.equal(
    destination?.kind,
    'real',
    `${href} must now be a real navigation destination`
  );
}

const services = mainNavigation.find(item => item.id === 'services');
const serviceHrefs = services?.sections?.flatMap(section =>
  section.items.map(item => item.href)
);
assert.equal(
  new Set(serviceHrefs).size,
  serviceHrefs?.length,
  'distinct Services labels must not share generic destinations'
);

const navigationDestinations = new Set(
  megaMenus.flatMap(menu =>
    menu.sections!.flatMap(section => section.items.map(item => item.href))
  )
);
assert.ok(navigationDestinations.has('/government/offices'));
assert.ok(!navigationDestinations.has('/government/directory'));
assert.ok(!navigationDestinations.has('/government/contacts'));
assert.ok(!navigationDestinations.has('/transparency/contracts'));

const activeRouteCases = [
  ['/', 'home'],
  ['/services/business', 'services'],
  ['/projects/example-project', 'projects'],
  ['/projects/map', 'projects'],
  ['/procurement/contracts', 'projects'],
  ['/procurement', 'projects'],
  ['/government/offices', 'government'],
  ['/government/contact', 'contact'],
  ['/legislation/ordinances', 'government'],
  ['/legislation/resolutions', 'government'],
  ['/legislation', 'government'],
  ['/transparency/full-disclosure', 'transparency'],
  ['/transparency/finance', 'transparency'],
  ['/statistics', 'transparency'],
  ['/statistics/population', 'transparency'],
  ['/statistics/demographics', 'transparency'],
  ['/statistics/government', 'transparency'],
  ['/statistics/city-profile', 'transparency'],
  ['/statistics/public-records', 'transparency'],
  ['/statistics/legislation', 'transparency'],
  ['/barangays', 'transparency'],
  // Owned by Projects even though the URL sits under /statistics: these are
  // project/procurement analytics, not general civic statistics — see
  // navigation.ts's most-specific-prefix resolver.
  ['/statistics/projects', 'projects'],
  ['/statistics/project-spending', 'projects'],
  ['/statistics/procurement', 'projects'],
  ['/about', 'about'],
] as const;

for (const [pathname, expected] of activeRouteCases) {
  assert.equal(
    getActiveNavigationId(pathname),
    expected,
    `${pathname} should activate ${expected}`
  );
}

assert.deepEqual(
  plannedPages.map(page => page.path),
  [],
  'every canonical planned route has shipped — the planned-page registry must now be empty'
);

const plannedPaths = new Set(plannedPages.map(page => page.path));
const knownRealDestinations = new Set([
  '/',
  '/services',
  '/services/business',
  '/services/employment',
  '/services/health-services',
  '/services/disaster-preparedness',
  '/services/assistance-programs',
  '/services/social-welfare',
  '/services/senior-citizens',
  '/services/pwd-services',
  '/services/infrastructure-public-works',
  '/services/housing-land-use',
  '/services/utilities-water',
  '/services/property-taxes',
  '/services/agriculture-fisheries',
  '/services/education',
  '/services/environment',
  '/services/civil-registry',
  '/projects',
  '/projects/city-projects',
  '/projects/map',
  '/projects/sources',
  '/projects/methodology',
  '/procurement/bid-results',
  '/procurement/contracts',
  '/procurement',
  '/statistics',
  '/statistics/projects',
  '/statistics/procurement',
  '/statistics/project-spending',
  '/statistics/population',
  '/statistics/demographics',
  '/statistics/government',
  '/statistics/city-profile',
  '/barangays',
  '/government',
  '/government/offices',
  '/government/contact',
  '/government/hotlines',
  '/government/barangay-contacts',
  '/government/links',
  '/transparency/full-disclosure',
  '/transparency/documents',
  '/transparency/finance',
  '/legislation/executive-orders',
  '/legislation/ordinances',
  '/legislation/resolutions',
  '/legislation',
  '/transparency',
  '/transparency/sources',
  '/transparency/methodology',
  // Repointed in Batch 9 to their redirect destinations (next.config.ts's
  // LEGACY_ALIASES) rather than the /transparency/verification and
  // /transparency/limitations sources — internal links should never route
  // through a redirect hop.
  '/transparency/methodology#verification',
  '/transparency/methodology#limitations',
  '/statistics/legislation',
  '/statistics/public-records',
]);

for (const destination of megaMenus.flatMap(menu =>
  menu.sections!.flatMap(section => section.items)
)) {
  if (destination.kind === 'planned') {
    assert.ok(
      plannedPaths.has(destination.href),
      `${destination.href} must be registered as a planned route`
    );
  }
  if (destination.kind === 'real') {
    assert.ok(
      knownRealDestinations.has(destination.href),
      `${destination.href} must be a known real destination`
    );
  }
}

// Mega-menu balancing/recategorization: exact per-group item counts, no
// destination duplicated within one mega menu, and Project Statistics
// appearing exactly once inside Projects (cross-menu reuse, e.g. from
// Transparency, remains intentional and is not restricted here).
function menuSectionCounts(menuId: string) {
  return megaMenus
    .find(menu => menu.id === menuId)!
    .sections!.map(section => section.items.length);
}
function menuSectionHeadingKeys(menuId: string) {
  return megaMenus
    .find(menu => menu.id === menuId)!
    .sections!.map(section => section.labelKey);
}

assert.deepEqual(
  menuSectionCounts('services'),
  [4, 4, 4, 4],
  'Services mega menu must be balanced 4/4/4/4'
);
assert.deepEqual(menuSectionHeadingKeys('services'), [
  'navigation.sections.businessOpportunity',
  'navigation.sections.healthCommunitySupport',
  'navigation.sections.peopleCivicServices',
  'navigation.sections.infrastructureEnvironment',
]);

assert.deepEqual(
  menuSectionCounts('projects'),
  [3, 4, 3],
  'Projects mega menu must be balanced 3/4/3'
);
assert.deepEqual(menuSectionHeadingKeys('projects'), [
  'navigation.sections.cityProjects',
  'navigation.sections.procurement',
  'navigation.sections.evidenceInsights',
]);

assert.deepEqual(
  menuSectionCounts('government'),
  [3, 3, 3],
  'Government mega menu must be balanced 3/3/3'
);
assert.deepEqual(menuSectionHeadingKeys('government'), [
  'navigation.sections.cityGovernment',
  'navigation.sections.legislation',
  'navigation.sections.publicInformation',
]);

assert.deepEqual(
  menuSectionCounts('transparency'),
  [5, 5, 5],
  'Transparency mega menu must be balanced 5/5/5 now that the duplicate Projects & Procurement section has been removed'
);
assert.deepEqual(menuSectionHeadingKeys('transparency'), [
  'navigation.sections.publicRecordsFinance',
  'navigation.sections.dataVerification',
  'navigation.sections.cityCommunity',
]);

for (const menu of megaMenus) {
  const hrefs = menu.sections!.flatMap(section =>
    section.items.map(item => item.href)
  );
  assert.equal(
    new Set(hrefs).size,
    hrefs.length,
    `${menu.id} mega menu must not duplicate any destination within itself`
  );
}

const projectsMenuHrefs = megaMenus
  .find(menu => menu.id === 'projects')!
  .sections!.flatMap(section => section.items.map(item => item.href));
assert.equal(
  projectsMenuHrefs.filter(href => href === '/statistics/projects').length,
  1,
  'Project Statistics must appear exactly once inside the Projects mega menu'
);
const transparencyMenuHrefs = megaMenus
  .find(menu => menu.id === 'transparency')!
  .sections!.flatMap(section => section.items.map(item => item.href));
for (const href of [
  '/projects/city-projects',
  '/procurement',
  '/procurement/contracts',
  '/statistics/projects',
]) {
  assert.ok(
    !transparencyMenuHrefs.includes(href),
    `Transparency must no longer duplicate the Projects-owned destination ${href} (removed Projects & Procurement section)`
  );
}

const navbarSource = readFileSync('src/components/layout/Navbar.tsx', 'utf8');
assert.match(
  navbarSource,
  /item\.sections!\.map\(section =>/,
  'the desktop mega menu must render from item.sections'
);
assert.match(
  navbarSource,
  /item\.sections\.map\(section =>/,
  'mobile navigation must render from the same item.sections structure, not a separate mobile-only data model'
);

// Regression guard for the exact bug this rebalance fixes: every mega
// menu's section count must map to its own dedicated grid-cols-N class in
// Navbar.tsx, never silently fall through to the 'grid-cols-4' default —
// that fallback is what produced the huge-empty-space/"content
// disappeared" look for the original 1-section Statistics and 2-section
// Transparency menus.
const gridColsMapMatch = navbarSource.match(
  /DESKTOP_MEGA_MENU_GRID_COLS:\s*Record<number, string>\s*=\s*\{([\s\S]*?)\}/
);
assert.ok(
  gridColsMapMatch,
  'Navbar.tsx must define DESKTOP_MEGA_MENU_GRID_COLS'
);
const mappedGridColCounts = new Set(
  [...gridColsMapMatch![1].matchAll(/(\d+):\s*'grid-cols-\d+'/g)].map(m =>
    Number(m[1])
  )
);
for (const menu of megaMenus) {
  assert.ok(
    mappedGridColCounts.has(menu.sections!.length),
    `${menu.id} mega menu has ${menu.sections!.length} section(s), but DESKTOP_MEGA_MENU_GRID_COLS has no entry for that count — it would silently fall back to grid-cols-4 and leave empty columns`
  );
}

const servicesMenu = megaMenus.find(menu => menu.id === 'services');
assert.ok(
  servicesMenu?.sections?.every(section =>
    section.items.every(item => item.kind === 'real')
  ),
  'zero planned service-category placeholders may remain in the Services navigation'
);
assert.ok(
  !servicesMenu?.sections?.some(section =>
    section.items.some(item => item.href === '/services/livelihood')
  ),
  'no Livelihood navigation destination may remain'
);

function readLocale(locale: 'en' | 'fil' | 'pam') {
  return JSON.parse(
    readFileSync(`public/locales/${locale}/common.json`, 'utf8')
  ) as Record<string, unknown>;
}

const english = readLocale('en');
readLocale('fil');
readLocale('pam');

function hasTranslationKey(resource: Record<string, unknown>, key: string) {
  return key.split('.').every(segment => {
    const value = resource[segment];
    if (typeof value === 'string') {
      resource = {};
      return true;
    }
    if (typeof value !== 'object' || value === null) return false;
    resource = value as Record<string, unknown>;
    return true;
  });
}

const referencedEnglishKeys = [
  ...mainNavigation.flatMap(item => [
    item.labelKey,
    ...(item.sections?.flatMap(section => [
      section.labelKey,
      ...section.items.flatMap(destination => [
        destination.labelKey,
        destination.descriptionKey,
      ]),
    ]) ?? []),
  ]),
  ...plannedPages.flatMap(page => [page.titleKey, page.descriptionKey]),
  'navigation.accessibility.primary',
  'navigation.accessibility.openMenu',
  'navigation.accessibility.closeMenu',
  'navigation.accessibility.openSection',
  'navigation.accessibility.closeSection',
  'navigation.search',
  'navigation.searchPlaceholder',
  'navigation.searchSubmit',
  'navigation.language',
  'plannedPages.status',
  'plannedPages.statusDescription',
];

for (const key of referencedEnglishKeys) {
  assert.ok(hasTranslationKey(english, key), `missing English key: ${key}`);
}

// Orphaned once the planned-route count reached zero (no page ever calls
// t() with a plannedPages.pages.* key again) or once local search shipped
// (Search.tsx is a real implemented page, not an i18n "unavailable" state) —
// these must stay removed rather than silently reappearing.
assert.ok(
  !hasTranslationKey(english, 'plannedPages.pages'),
  'plannedPages.pages.* is orphaned now that the planned-route count is zero and must not be reintroduced'
);
assert.ok(
  !hasTranslationKey(english, 'search'),
  'the orphaned search.unavailable* locale namespace must not be reintroduced now that local search is implemented'
);

function resolveTranslation(key: string): string | undefined {
  let node: unknown = english;
  for (const segment of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === 'string' ? node : undefined;
}

const allVisibleLabelKeys = [
  ...mainNavigation.map(item => item.labelKey),
  ...megaMenus.flatMap(menu =>
    menu.sections!.flatMap(section => section.items.map(item => item.labelKey))
  ),
];
const contactLabels = allVisibleLabelKeys
  .map(resolveTranslation)
  .filter(label => label === 'Contact');
assert.equal(
  contactLabels.length,
  1,
  'exactly one visible navigation item may be labeled exactly "Contact"'
);

console.log(
  `Navigation smoke passed: ${mainNavigation.length} top-level entries, ${plannedPages.length} planned routes, EN/FIL/PAM resources valid.`
);
