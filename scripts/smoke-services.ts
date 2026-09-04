#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';
import {
  getServiceBySlug,
  getServiceCategory,
  getServiceHref,
  getServices,
} from '../src/data/civic/services.ts';

const services = getServices();
const blpd = services.filter(service => service.office.acronym === 'BLPD');
const cdrrmo = services.filter(service => service.office.acronym === 'CDRRMO');
const cswdo = services.filter(service => service.office.acronym === 'CSWDO');
const assistancePrograms = cswdo.filter(
  service => getServiceCategory(service) === 'assistance-programs'
);
const pwdServices = cswdo.filter(
  service => getServiceCategory(service) === 'pwd-services'
);
const soloParentServices = cswdo.filter(
  service => getServiceCategory(service) === 'social-welfare'
);
const appSource = readFileSync('src/App.tsx', 'utf8');
const servicesPageSource = readFileSync('src/pages/Services.tsx', 'utf8');
const detailPageSource = readFileSync('src/pages/ServiceDetail.tsx', 'utf8');

const canonicalCategories = [
  'business',
  'employment',
  'livelihood',
  'health-services',
  'education',
  'assistance-programs',
  'social-welfare',
  'senior-citizens',
  'pwd-services',
  'infrastructure-public-works',
  'agriculture-fisheries',
  'environment',
  'disaster-preparedness',
] as const;
const realCategorySlugs = [
  'business',
  'assistance-programs',
  'social-welfare',
  'pwd-services',
  'disaster-preparedness',
];
const plannedCategorySlugs = canonicalCategories.filter(
  slug => !realCategorySlugs.includes(slug)
);

const servicesNavigation = mainNavigation.find(item => item.id === 'services');
assert.deepEqual(
  servicesNavigation?.sections?.flatMap(section =>
    section.items.map(item => item.href.replace('/services/', ''))
  ),
  canonicalCategories
);
assert.deepEqual(
  servicesNavigation?.sections?.flatMap(section =>
    section.items.map(item => item.kind)
  ),
  canonicalCategories.map(slug =>
    realCategorySlugs.includes(slug) ? 'real' : 'planned'
  )
);
assert.deepEqual(
  plannedPages
    .filter(page => page.path.startsWith('/services/'))
    .map(page => page.path.replace('/services/', '')),
  plannedCategorySlugs
);
assert.match(appSource, /path="\/services\/assistance-programs"/);
assert.match(appSource, /path="\/services\/:category\/:serviceSlug"/);
assert.match(appSource, /path="\/services\/:slug"/);
assert.match(
  detailPageSource,
  /<Navigate to={getServiceHref\(service\)} replace/
);
for (const slug of canonicalCategories) {
  assert.ok(
    servicesPageSource.includes(`'${slug}'`),
    `${slug} must appear on the Services category hub`
  );
}

assert.equal(services.length, 54);
assert.equal(blpd.length, 8);
assert.equal(cdrrmo.length, 7);
assert.equal(cswdo.length, 39);
assert.equal(assistancePrograms.length, 19);
assert.equal(pwdServices.length, 6);
assert.equal(soloParentServices.length, 14);
assert.equal(new Set(services.map(service => service.id)).size, 54);
assert.equal(new Set(services.map(service => service.slug)).size, 54);
assert.ok(
  services.every(service => service.classification.service_scope === 'External')
);
assert.ok(
  services.every(
    service =>
      service.requirements.length > 0 && service.client_steps.length > 0
  )
);
assert.ok(
  services.every(service => getServiceBySlug(service.slug) === service),
  'all 54 service detail routes must resolve through the adapter'
);
assert.ok(
  blpd.every(
    service => getServiceHref(service) === `/services/business/${service.slug}`
  ),
  'all eight BLPD records must use canonical Business Services routes'
);
assert.ok(
  cdrrmo.every(
    service =>
      getServiceHref(service) ===
      `/services/disaster-preparedness/${service.slug}`
  ),
  'all seven CDRRMO records must use canonical Disaster Preparedness routes'
);
assert.ok(
  assistancePrograms.every(
    service =>
      getServiceHref(service) ===
      `/services/assistance-programs/${service.slug}`
  ),
  'the existing nineteen reviewed CSWDO records must use canonical Assistance Programs routes'
);
assert.ok(
  pwdServices.every(
    service =>
      getServiceHref(service) === `/services/pwd-services/${service.slug}`
  ),
  'all six reviewed PWD CSWDO records must use canonical PWD Services routes'
);
assert.ok(
  soloParentServices.every(
    service =>
      getServiceHref(service) === `/services/social-welfare/${service.slug}`
  ),
  'all fourteen reviewed Solo Parent CSWDO records must use canonical Social Welfare routes'
);

// Independent expectations, not derived from getServiceCategory's id sets in
// src/data/civic/services.ts, so a future miscategorization is caught even if
// the same wrong ids were used on both sides.
const expectedPwdServiceIds = [
  'charter-2026-2e-city-social-welfare-and-development-office-external-14',
  'charter-2026-2e-city-social-welfare-and-development-office-external-15',
  'charter-2026-2e-city-social-welfare-and-development-office-external-16',
  'charter-2026-2e-city-social-welfare-and-development-office-external-17',
  'charter-2026-2e-city-social-welfare-and-development-office-external-18',
  'charter-2026-2e-city-social-welfare-and-development-office-external-19',
].sort();
const expectedSoloParentServiceIds = [
  'charter-2026-2e-city-social-welfare-and-development-office-external-27',
  'charter-2026-2e-city-social-welfare-and-development-office-external-28',
  'charter-2026-2e-city-social-welfare-and-development-office-external-29',
  'charter-2026-2e-city-social-welfare-and-development-office-external-30',
  'charter-2026-2e-city-social-welfare-and-development-office-external-31',
  'charter-2026-2e-city-social-welfare-and-development-office-external-32',
  'charter-2026-2e-city-social-welfare-and-development-office-external-33',
  'charter-2026-2e-city-social-welfare-and-development-office-external-34',
  'charter-2026-2e-city-social-welfare-and-development-office-external-35',
  'charter-2026-2e-city-social-welfare-and-development-office-external-36',
  'charter-2026-2e-city-social-welfare-and-development-office-external-37',
  'charter-2026-2e-city-social-welfare-and-development-office-external-38',
  'charter-2026-2e-city-social-welfare-and-development-office-external-39',
  'charter-2026-2e-city-social-welfare-and-development-office-external-40',
].sort();
assert.deepEqual(
  pwdServices.map(service => service.id).sort(),
  expectedPwdServiceIds,
  'PWD Services must contain exactly the six approved PWD service ids'
);
assert.deepEqual(
  soloParentServices.map(service => service.id).sort(),
  expectedSoloParentServiceIds,
  'Social Welfare must contain exactly the fourteen approved Solo Parent service ids'
);

assert.deepEqual(
  blpd.map(service => service.slug),
  [
    'certified-true-copy',
    'issuance-of-business-retirement-certificate',
    'issuance-of-certificate-of-no-business',
    'issuance-of-other-business-related-certifications',
    'mayors-permit-for-business-new-business',
    'mayors-permit-for-business-renewal',
    'mayors-permit-for-business-special-permit',
    'permit-to-operate-temporary-permit',
  ]
);
assert.equal(
  createHash('sha256').update(JSON.stringify(blpd)).digest('hex'),
  'de2902281cf7bf42e6f97ec8ea6d445064026355428815c5fb687b4153bfb95a',
  'the existing eight BLPD records must remain semantically unchanged'
);
assert.equal(
  getServiceBySlug('permit-to-operate-temporary-permit')?.client_steps.at(-1)
    ?.sequence,
  '*'
);

assert.equal(
  cdrrmo.filter(service => service.availability?.status === '24/7').length,
  2
);
assert.ok(
  cdrrmo
    .filter(service => service.availability)
    .every(service => /only$/i.test(service.availability!.scope))
);
assert.ok(
  cdrrmo.every(
    service =>
      service.office_hours.scope === 'Regular CDRRMO office operations only'
  )
);
assert.ok(
  cdrrmo.every(
    service =>
      service.forms.length === 0 &&
      service.online_channels.length === 0 &&
      service.appointment === null
  )
);
assert.deepEqual(
  cdrrmo.flatMap(service =>
    service.emergency_contacts.map(contact => contact.phone)
  ),
  ['961-4357', '961-4357']
);

assert.equal(new Set(cswdo.map(service => service.slug)).size, 39);
assert.ok(
  cswdo.every(
    service =>
      service.forms.length === 0 &&
      service.online_channels.length === 0 &&
      service.appointment === null
  ),
  'reviewed CSWDO records must not promote unresolved forms, digital channels, or appointment coverage'
);
assert.ok(
  cswdo.every(
    service =>
      service.office_hours.scope === 'Published CSWDO office hours only'
  )
);
assert.ok(
  cswdo.every(service =>
    service.requirements.every(
      requirement =>
        requirement.ordinal !== null && requirement.where_to_secure !== null
    )
  ),
  'reviewed CSWDO requirements must not silently drop ordinal or where_to_secure'
);
assert.ok(
  cswdo.every(service => !('agency_action' in service)),
  'CSWDO records must not leak private agency-action fields'
);

for (const service of services) {
  for (const url of [
    service.canonical_source.url,
    service.canonical_source.landing_page_url,
    ...service.forms.map(form => form.url),
    ...service.online_channels.map(channel => channel.url),
    service.appointment?.url,
  ].filter((value): value is string => Boolean(value))) {
    assert.match(new URL(url).protocol, /^https?:$/);
  }
}

const serialized = JSON.stringify(services);
for (const forbidden of [
  '409-6750',
  '0939-936-2423',
  'agency_action',
  'agency action',
  'responsible_person',
  'person responsible',
  'research_',
  'enrichment_',
  'source_id',
  'sha256',
  'file://',
  'C:\\',
]) {
  assert.ok(!serialized.toLowerCase().includes(forbidden.toLowerCase()));
}

assert.equal(getServiceBySlug('missing-service'), undefined);

console.log('Services civic data smoke checks passed.');
console.log(
  '  routes: 54/54; BLPD: 8; CDRRMO: 7; CSWDO: 39 (Assistance Programs: 19, PWD Services: 6, Social Welfare: 14); External: 54; published categories: 5/13'
);
