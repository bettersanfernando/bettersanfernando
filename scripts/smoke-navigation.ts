import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  mainNavigation,
  getActiveNavigationId,
  getSearchHref,
  searchNavigation,
} from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

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

const activeRouteCases = [
  ['/', 'home'],
  ['/services/business', 'services'],
  ['/projects/example-project', 'projects'],
  ['/projects/map', 'projects'],
  ['/procurement/contracts', 'projects'],
  ['/government/offices', 'government'],
  ['/legislation/ordinances', 'government'],
  ['/transparency/archive', 'transparency'],
  ['/statistics/population', 'transparency'],
  ['/statistics/city-profile', 'transparency'],
  ['/statistics/projects', 'transparency'],
  ['/barangays', 'transparency'],
  ['/about', 'about'],
  ['/contact', 'contact'],
] as const;

for (const [pathname, expected] of activeRouteCases) {
  assert.equal(
    getActiveNavigationId(pathname),
    expected,
    `${pathname} should activate ${expected}`
  );
}

const approvedPlannedPaths = [
  '/services/employment',
  '/services/livelihood',
  '/services/assistance-programs',
  '/services/senior-citizens',
  '/services/pwd-services',
  '/procurement',
  '/procurement/bid-results',
  '/procurement/contracts',
  '/projects/sources',
  '/projects/data-sources',
  '/projects/methodology',
  '/government/structure',
  '/government/contact',
  '/legislation',
  '/legislation/ordinances',
  '/legislation/resolutions',
  '/government/documents',
  '/government/hotlines',
  '/government/links',
  '/transparency',
  '/transparency/full-disclosure',
  '/transparency/archive',
  '/transparency/documents',
  '/transparency/procurement',
  '/transparency/contracts',
  '/transparency/finance',
  '/transparency/sources',
  '/transparency/methodology',
  '/transparency/verification',
  '/transparency/limitations',
  '/statistics',
  '/statistics/demographics',
  '/statistics/project-spending',
  '/statistics/procurement',
  '/statistics/government',
  '/statistics/legislation',
  '/statistics/public-records',
  '/about',
  '/contact',
];

assert.deepEqual(
  plannedPages.map(page => page.path).sort(),
  [...approvedPlannedPaths].sort(),
  'the planned-page registry must contain every approved non-real route'
);

const plannedPaths = new Set(plannedPages.map(page => page.path));
const knownRealDestinations = new Set([
  '/',
  '/services',
  '/services/business',
  '/services/business/apply-for-barangay-clearance-and-mayors-business-permits',
  '/services/health-services',
  '/services/education',
  '/services/social-welfare',
  '/services/infrastructure-public-works',
  '/services/agriculture-fisheries',
  '/services/environment',
  '/services/disaster-preparedness',
  '/projects',
  '/projects/map',
  '/statistics/projects',
  '/statistics/population',
  '/statistics/city-profile',
  '/barangays',
  '/government',
  '/government/offices',
  '/legislation/executive-orders',
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
  'search.unavailableTitle',
  'search.unavailableDescription',
  'search.unavailableStatus',
  'search.unavailableGuidance',
];

for (const key of referencedEnglishKeys) {
  assert.ok(hasTranslationKey(english, key), `missing English key: ${key}`);
}

console.log(
  `Navigation smoke passed: ${mainNavigation.length} top-level entries, ${plannedPages.length} planned routes, EN/FIL/PAM resources valid.`
);
