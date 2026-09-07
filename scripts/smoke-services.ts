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
const cho = services.filter(service => service.office.acronym === 'CHO');
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
  'civil-registry',
  'infrastructure-public-works',
  'agriculture-fisheries',
  'environment',
  'disaster-preparedness',
] as const;
const realCategorySlugs = [
  'business',
  'employment',
  'health-services',
  'education',
  'environment',
  'civil-registry',
  'assistance-programs',
  'social-welfare',
  'senior-citizens',
  'pwd-services',
  'infrastructure-public-works',
  'agriculture-fisheries',
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
assert.match(appSource, /path="\/services\/health-services"/);
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

const cippeso = services.filter(
  service => service.office.acronym === 'CIPPESO'
);
const cavo = services.filter(service => service.office.acronym === 'CAVO');
const ccsfp = services.filter(service => service.office.acronym === 'CCSFP');
const cenro = services.filter(service => service.office.acronym === 'CENRO');
const ccro = services.filter(service => service.office.acronym === 'CCRO');
const osca = services.filter(service => service.office.acronym === 'OSCA');
const cadmino = services.filter(
  service => service.office.acronym === 'CAdminO'
);
assert.equal(services.length, 155);
assert.equal(blpd.length, 8);
assert.equal(cdrrmo.length, 7);
assert.equal(cswdo.length, 39);
assert.equal(cho.length, 59);
assert.equal(cippeso.length, 7, 'exactly seven CIPPESO Employment records');
assert.equal(
  cavo.length,
  7,
  'exactly seven CAVO Agriculture & Fisheries records'
);
assert.equal(ccsfp.length, 9, 'exactly nine CCSFP Education records');
assert.equal(cenro.length, 1, 'exactly one CENRO Environment record');
assert.equal(ccro.length, 15, 'exactly fifteen CCRO Civil Registry records');
assert.equal(osca.length, 2, 'exactly two OSCA Senior Citizens records');
assert.equal(
  cadmino.length,
  1,
  'exactly one CAdminO Infrastructure & Public Works record'
);
assert.equal(assistancePrograms.length, 19);
assert.equal(pwdServices.length, 6);
assert.equal(soloParentServices.length, 14);
assert.equal(new Set(services.map(service => service.id)).size, 155);
assert.equal(new Set(services.map(service => service.slug)).size, 155);
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
  'all 155 service detail routes must resolve through the adapter'
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
assert.ok(
  cho.every(
    service =>
      getServiceHref(service) === `/services/health-services/${service.slug}`
  ),
  'all fifty-nine CHO records must use canonical Health Services routes'
);
assert.ok(
  cippeso.every(
    service =>
      getServiceHref(service) === `/services/employment/${service.slug}`
  ),
  'all seven CIPPESO records must use canonical Employment routes'
);
assert.ok(
  cavo.every(
    service =>
      getServiceHref(service) ===
      `/services/agriculture-fisheries/${service.slug}`
  ),
  'all seven CAVO records must use canonical Agriculture & Fisheries routes'
);
assert.ok(
  ccsfp.every(
    service => getServiceHref(service) === `/services/education/${service.slug}`
  ),
  'all nine CCSFP records must use canonical Education routes'
);
assert.equal(
  getServiceHref(cenro[0]),
  '/services/environment/sale-of-compost-fertilizer',
  'the CENRO record must use its canonical Environment route'
);
assert.ok(
  ccro.every(
    service =>
      getServiceHref(service) === `/services/civil-registry/${service.slug}`
  ),
  'all fifteen CCRO records must use canonical Civil Registry routes'
);
assert.ok(
  osca.every(
    service =>
      getServiceHref(service) === `/services/senior-citizens/${service.slug}`
  ),
  'both OSCA records must use canonical Senior Citizens routes'
);
assert.equal(
  getServiceHref(cadmino[0]),
  `/services/infrastructure-public-works/${cadmino[0].slug}`,
  'the CAdminO record must use its canonical Infrastructure & Public Works route'
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
const expectedChoServiceIds = [
  'charter-2026-2e-city-health-office-external-01',
  'charter-2026-2e-city-health-office-external-02',
  'charter-2026-2e-city-health-office-external-03',
  'charter-2026-2e-city-health-office-external-04',
  'charter-2026-2e-city-health-office-external-05',
  'charter-2026-2e-city-health-office-external-06',
  'charter-2026-2e-city-health-office-external-07',
  'charter-2026-2e-city-health-office-external-08',
  'charter-2026-2e-city-health-office-external-09',
  'charter-2026-2e-city-health-office-external-10',
  'charter-2026-2e-city-health-office-external-11',
  'charter-2026-2e-city-health-office-external-12',
  'charter-2026-2e-city-health-office-external-13',
  'charter-2026-2e-city-health-office-external-14',
  'charter-2026-2e-city-health-office-external-15',
  'charter-2026-2e-city-health-office-external-16',
  'charter-2026-2e-city-health-office-external-17',
  'charter-2026-2e-city-health-office-external-18',
  'charter-2026-2e-city-health-office-external-19',
  'charter-2026-2e-city-health-office-external-20',
  'charter-2026-2e-city-health-office-external-21',
  'charter-2026-2e-city-health-office-external-23',
  'charter-2026-2e-city-health-office-external-24',
  'charter-2026-2e-city-health-office-external-25',
  'charter-2026-2e-city-health-office-external-26',
  'charter-2026-2e-city-health-office-external-27',
  'charter-2026-2e-city-health-office-external-28',
  'charter-2026-2e-city-health-office-external-29',
  'charter-2026-2e-city-health-office-external-30',
  'charter-2026-2e-city-health-office-external-31',
  'charter-2026-2e-city-health-office-external-32',
  'charter-2026-2e-city-health-office-external-33',
  'charter-2026-2e-city-health-office-external-34',
  'charter-2026-2e-city-health-office-external-35',
  'charter-2026-2e-city-health-office-external-36',
  'charter-2026-2e-city-health-office-external-37',
  'charter-2026-2e-city-health-office-external-38',
  'charter-2026-2e-city-health-office-external-39',
  'charter-2026-2e-city-health-office-external-40',
  'charter-2026-2e-city-health-office-external-41',
  'charter-2026-2e-city-health-office-external-42',
  'charter-2026-2e-city-health-office-external-43',
  'charter-2026-2e-city-health-office-external-44',
  'charter-2026-2e-city-health-office-external-45',
  'charter-2026-2e-city-health-office-external-46',
  'charter-2026-2e-city-health-office-external-47',
  'charter-2026-2e-city-health-office-external-48',
  'charter-2026-2e-city-health-office-external-49',
  'charter-2026-2e-city-health-office-external-50',
  'charter-2026-2e-city-health-office-external-51',
  'charter-2026-2e-city-health-office-external-52',
  'charter-2026-2e-city-health-office-external-53',
  'charter-2026-2e-city-health-office-external-54',
  'charter-2026-2e-city-health-office-external-55',
  'charter-2026-2e-city-health-office-external-56',
  'charter-2026-2e-city-health-office-external-57',
  'charter-2026-2e-city-health-office-external-58',
  'charter-2026-2e-city-health-office-external-59',
  'charter-2026-2e-city-health-office-external-61',
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
  cho.map(service => service.id).sort(),
  expectedChoServiceIds,
  'Health Services must contain exactly the fifty-nine approved CHO service ids'
);
assert.ok(
  !services.some(service =>
    [
      'charter-2026-2e-city-health-office-external-22',
      'charter-2026-2e-city-health-office-external-60',
    ].includes(service.id)
  ),
  'held CHO records external-22 and external-60 must remain unpublished'
);

const expectedCippesoServiceIds = [
  'charter-2026-2e-city-investment-promotions-and-public-employment-services-office-external-02',
  'charter-2026-2e-city-investment-promotions-and-public-employment-services-office-external-03',
  'charter-2026-2e-city-investment-promotions-and-public-employment-services-office-external-04',
  'charter-2026-2e-city-investment-promotions-and-public-employment-services-office-external-05',
  'charter-2026-2e-city-investment-promotions-and-public-employment-services-office-external-06',
  'charter-2026-2e-city-investment-promotions-and-public-employment-services-office-external-07',
  'charter-2026-2e-city-investment-promotions-and-public-employment-services-office-external-08',
].sort();
assert.deepEqual(
  cippeso.map(service => service.id).sort(),
  expectedCippesoServiceIds,
  'Employment must contain exactly the seven approved CIPPESO service ids'
);
assert.deepEqual(
  cippeso.map(service => service.title).sort(),
  [
    'Community-Based Skills Training',
    "Employers' Engagement",
    'Issuance of Working Permit',
    "Issuance of Mayor's Clearance",
    'Job Referral (Online)',
    'Job Referral (Walk In)',
    'Skills Training',
  ].sort(),
  'Employment titles must exactly match the seven approved CIPPESO records'
);
assert.ok(
  !services.some(service =>
    [
      'charter-2026-2e-city-investment-promotions-and-public-employment-services-office-external-01',
      'charter-2026-2e-city-investment-promotions-and-public-employment-services-office-external-09',
    ].includes(service.id)
  ),
  'external-01 (Investment Incentive) and external-09 (TVI Accreditation) must remain excluded from Employment'
);
assert.ok(
  !services.some(
    service =>
      /investment incentive/i.test(service.title) ||
      /technical vocational institutions accreditation/i.test(service.title)
  ),
  'excluded CIPPESO titles must not appear anywhere in the published set'
);

// Preserve the reviewed limitations for the seven Employment records.
const cippesoBySlug = new Map(cippeso.map(service => [service.slug, service]));
for (const slug of ['community-based-skills-training', 'skills-training']) {
  const service = cippesoBySlug.get(slug);
  assert.ok(service, `expected Employment service missing: ${slug}`);
  assert.ok(
    service!.public_notes.some(note =>
      /availability depends on announced/i.test(note)
    ),
    `${slug} must preserve its batch/schedule-dependent limitation`
  );
}
for (const slug of ['job-referral-online', 'job-referral-walk-in']) {
  const service = cippesoBySlug.get(slug);
  assert.ok(service, `expected Employment service missing: ${slug}`);
  assert.ok(
    service!.public_notes.some(note =>
      /depend on current employer vacancies/i.test(note)
    ),
    `${slug} must preserve its vacancy-dependent limitation`
  );
  assert.ok(
    !/currently available|guaranteed hiring/i.test(JSON.stringify(service)),
    `${slug} must not claim current vacancy availability or guaranteed hiring`
  );
}
const employersEngagement = cippesoBySlug.get('employers-engagement');
assert.ok(employersEngagement, "Employers' Engagement must be published");
assert.ok(
  employersEngagement!.public_notes.some(
    note => /POEA/.test(note) && /DMW|Department of Migrant Workers/.test(note)
  ),
  "Employers' Engagement must preserve the POEA-to-DMW freshness limitation"
);
for (const slug of [
  'issuance-of-mayors-clearance',
  'issuance-of-working-permit',
]) {
  const service = cippesoBySlug.get(slug);
  assert.ok(service, `expected Employment service missing: ${slug}`);
  assert.ok(
    service!.public_notes.some(note => /Citizens Portal/i.test(note)),
    `${slug} must preserve the Citizens Portal versus Charter-workflow limitation`
  );
  assert.ok(
    service!.public_notes.some(note => /not established whether/i.test(note)),
    `${slug} must preserve the hedge that it is not established whether the online channel replaces or only precedes the Charter workflow`
  );
}

const expectedCavoServiceIds = [
  'charter-2026-2e-city-agriculture-and-veterinary-office-external-01',
  'charter-2026-2e-city-agriculture-and-veterinary-office-external-02',
  'charter-2026-2e-city-agriculture-and-veterinary-office-external-03',
  'charter-2026-2e-city-agriculture-and-veterinary-office-external-04',
  'charter-2026-2e-city-agriculture-and-veterinary-office-external-05',
  'charter-2026-2e-city-agriculture-and-veterinary-office-external-06',
  'charter-2026-2e-city-agriculture-and-veterinary-office-external-07',
].sort();
assert.deepEqual(
  cavo.map(service => service.id).sort(),
  expectedCavoServiceIds,
  'Agriculture & Fisheries must contain exactly the seven approved CAVO service ids'
);
assert.deepEqual(
  cavo.map(service => service.title).sort(),
  [
    'Issuance of Certificate for Bonafide Farmers',
    'Request for IPM/INM/Crop Production/IEC',
    'Request for Vegetable Seeds and Request for Vegetable and Fruit-Bearing Seedlings',
    'Request for Animal Vaccination and Treatment',
    'Request for Livestock Production/IEC Seminar',
    'Request for Meat Inspection Certificate (MIC) – Poultry Dressing Plant (PDP)',
    'Request for Meat Inspection Certificate (MIC) and/or National Meat and Meat Products Certificate (NMMPIC) – City Slaughterhouse',
  ].sort(),
  'Agriculture & Fisheries titles must exactly match the seven approved CAVO records'
);
assert.ok(
  !services.some(service => /fish production support/i.test(service.title)),
  'no Fish Production Support service may be introduced'
);

// Preserve the reviewed limitations for the seven CAVO records.
const cavoBySlug = new Map(cavo.map(service => [service.slug, service]));
const bonafideFarmers = cavoBySlug.get(
  'issuance-of-certificate-for-bonafide-farmers'
);
assert.ok(bonafideFarmers, 'Bonafide Farmers certificate must be published');
assert.ok(
  bonafideFarmers!.public_notes.some(note =>
    /General Masterlist/i.test(note)
  ) &&
    bonafideFarmers!.public_notes.some(note =>
      /City of San Fernando's jurisdiction/i.test(note)
    ),
  'Bonafide Farmers certificate must preserve the Masterlist/jurisdiction limitation'
);
assert.equal(bonafideFarmers!.fee.text, 'PHP 500.00');
assert.equal(bonafideFarmers!.processing_time.text, '40 minutes');

const ipmIec = cavoBySlug.get('request-for-ipm-inm-crop-production-iec');
assert.ok(ipmIec, 'IPM/INM/Crop Production/IEC must be published');
assert.ok(
  ipmIec!.public_notes.some(note =>
    /scheduling, staff, venue, and target audience/i.test(note)
  ),
  'IPM/INM/Crop Production/IEC must preserve the schedule/staff/venue/audience-dependent limitation'
);

const seedsSeedlings = cavoBySlug.get(
  'request-for-vegetable-seeds-and-request-for-vegetable-and-fruit-bearing-seedlings'
);
assert.ok(seedsSeedlings, 'Seeds and Seedlings must be published');
assert.ok(
  seedsSeedlings!.public_notes.some(note =>
    /subject to availability/i.test(note)
  ),
  'Seeds and Seedlings must preserve the availability limitation'
);
assert.equal(
  seedsSeedlings!.variants?.length,
  4,
  'Seeds and Seedlings must preserve all four request thresholds'
);
assert.deepEqual(
  seedsSeedlings!.variants?.map(variant => variant.label).sort(),
  [
    'Vegetable seeds — 2 packs or fewer',
    'Vegetable seeds — more than 2 packs',
    'Vegetable or fruit-bearing seedlings — 100 or fewer',
    'Vegetable or fruit-bearing seedlings — more than 100',
  ].sort()
);
assert.ok(
  seedsSeedlings!.variants?.every(variant => Boolean(variant.processing_time)),
  'every seed/seedling threshold must preserve its own processing time'
);
assert.ok(
  seedsSeedlings!.variants?.some(variant =>
    /City Nursery/i.test(variant.note ?? '')
  ),
  'approved seedling release must preserve the City Nursery routing'
);

const animalVaccination = cavoBySlug.get(
  'request-for-animal-vaccination-and-treatment'
);
assert.ok(
  animalVaccination,
  'Animal Vaccination and Treatment must be published'
);
assert.match(
  animalVaccination!.processing_time.text,
  /Walk-in:.*On-site:/i,
  'walk-in and on-site processing times must remain distinct, not collapsed into one figure'
);
assert.ok(
  animalVaccination!.public_notes.some(note => /not guaranteed/i.test(note)),
  'Animal Vaccination and Treatment must preserve the supply/scheduling limitation'
);

const livestockIec = cavoBySlug.get(
  'request-for-livestock-production-iec-seminar'
);
assert.ok(livestockIec, 'Livestock Production/IEC Seminar must be published');
assert.ok(
  livestockIec!.public_notes.some(note =>
    /schedule, staff, venue, and target audience/i.test(note)
  ),
  'Livestock Production/IEC Seminar must preserve its schedule-dependent limitation'
);

const pdpMic = cavoBySlug.get(
  'request-for-meat-inspection-certificate-mic-poultry-dressing-plant-pdp'
);
assert.ok(pdpMic, 'PDP Meat Inspection Certificate must be published');
assert.ok(
  pdpMic!.public_notes.some(
    note => /NMMPIC/.test(note) && /not published/i.test(note)
  ),
  'PDP service must explicitly state that NMMPIC is not published through this service'
);
assert.ok(
  !/NMMPIC.{0,40}(available|issued)(?!.{0,80}not)/i.test(
    JSON.stringify(pdpMic)
  ),
  'PDP service must not claim NMMPIC availability'
);

const slaughterhouseMic = cavoBySlug.get(
  'request-for-meat-inspection-certificate-mic-and-or-national-meat-and-meat-products-certificate-nmmpic-city-slaughterhouse'
);
assert.ok(
  slaughterhouseMic,
  'City Slaughterhouse MIC/NMMPIC must be published'
);
assert.ok(
  slaughterhouseMic!.public_notes.some(note =>
    /inspected and passed at the City Slaughterhouse/i.test(note)
  ),
  'City Slaughterhouse service must preserve the inspected-and-passed limitation'
);

assert.ok(
  cavo.every(
    service =>
      service.online_channels.length === 0 && service.appointment === null
  ),
  'CAVO records must not promote a CAVO-specific online application or appointment channel'
);

const expectedCcsfpServices = [
  ['02', 'Administration of College Entrance Test'],
  ['03', 'Administration of Faculty Evaluation'],
  ['04', 'Administration of Pre-Employment Examination'],
  ['06', 'Consultation/Referral'],
  ['07', 'Dental Services'],
  ['08', 'Admission'],
  ['09', 'Distribution of Copy of Grades'],
  ['13', 'Issuance of Referral Letter'],
  ['14', 'Medical Consultation'],
].map(([suffix, title]) => [
  `charter-2026-2e-city-college-of-san-fernando-pampanga-external-${suffix}`,
  title,
]);
assert.deepEqual(
  ccsfp.map(service => [service.id, service.title]),
  expectedCcsfpServices,
  'Education must contain exactly the nine approved CCSFP ids and titles'
);
for (const suffix of ['01', '05', '10', '11', '12']) {
  assert.ok(
    !services.some(service =>
      service.id.endsWith(
        `city-college-of-san-fernando-pampanga-external-${suffix}`
      )
    ),
    `held CCSFP record external-${suffix} must remain unpublished`
  );
}
for (const title of [
  'Acceptance of Book Donations',
  'Borrowing/Returning of Books',
  'Enrollment',
  'Issuance of Certifications and Other Credentials',
  'Issuance of Good Moral Certificate',
]) {
  assert.ok(!services.some(service => service.title === title));
}
const educationBySlug = new Map(ccsfp.map(service => [service.slug, service]));
for (const [slug, limitation] of [
  [
    'administration-of-college-entrance-test',
    /announced admission\/testing schedules/i,
  ],
  [
    'administration-of-faculty-evaluation',
    /once per semester.*not a standing/is,
  ],
  [
    'administration-of-pre-employment-examination',
    /endorsed.*scheduled recruitment\/examination.*not an announcement/is,
  ],
  [
    'consultation-referral',
    /subject-teacher referral.*Guidance's scheduling.*private/is,
  ],
  ['dental-services', /Clinic schedule and staffing.*varies/is],
  [
    'admission',
    /No admission application window is currently verified as open/i,
  ],
  [
    'distribution-of-copy-of-grades',
    /grade posting and clearance.*semester schedule/is,
  ],
  [
    'issuance-of-referral-letter',
    /Library hours.*receiving library's own availability/is,
  ],
  [
    'medical-consultation',
    /Clinic hours, staff availability, triage, and referral needs/i,
  ],
] as const) {
  const service = educationBySlug.get(slug);
  assert.ok(service, `expected Education service missing: ${slug}`);
  assert.match(service.public_notes.join(' '), limitation);
}
assert.ok(
  ccsfp.every(
    service =>
      service.forms.length === 0 &&
      service.online_channels.length === 0 &&
      service.appointment === null
  ),
  'CCSFP records must not publish permanent forms, online channels, or appointments'
);
assert.doesNotMatch(
  JSON.stringify(ccsfp),
  /AY 2025[–-]2026|admission ongoing|scholarship application deadline|enrollment deadline/i
);

const compost = cenro[0];
assert.equal(
  compost.id,
  'charter-2026-2e-city-environment-and-natural-resources-office-external-03'
);
assert.equal(compost.title, 'Sale of Compost Fertilizer');
assert.equal(compost.fee.text, 'PHP 350.00 per sack');
assert.equal(compost.processing_time.text, '21 minutes per sack');
assert.deepEqual(
  compost.client_steps.map(step => step.instruction),
  [
    'Obtain and complete the Compost Purchase Order Form at the BOSS-CENRO Desk.',
    "Receive the order-of-payment form, then pay PHP 350.00 per sack at City Treasurer's Office Window 5 in the City Hall main lobby and obtain the official receipt.",
    'Present the Compost Purchase Order Form and official receipt at the City Composting Center in the CGSO Compound, NPM, Del Pilar, City of San Fernando.',
    'Complete the acknowledgement receipt and compost acceptance slip, sign the logbook, and receive the ordered compost.',
  ]
);
assert.match(
  compost.public_notes.join(' '),
  /subject to current compost availability/i
);
assert.doesNotMatch(JSON.stringify(compost), /PHP 12.{0,20}(kilogram|kg)/i);
assert.equal(compost.forms.length, 0);
assert.equal(compost.online_channels.length, 0);
assert.equal(compost.appointment, null);
assert.doesNotMatch(
  JSON.stringify(compost),
  /guaranteed compost|guaranteed stock|tree-cutting permit|cleanup drive|tree planting|recycling campaign|coordination meeting|procurement|inspection program/i
);
for (const [suffix, title] of [
  [
    '01',
    'Issuance of Certificate of No Anticipated/Outstanding Issues Logged for Trees Located in Public Places',
  ],
  ['02', 'Issuance of Certificate of No Objection'],
] as const) {
  assert.ok(
    !services.some(service =>
      service.id.endsWith(
        `city-environment-and-natural-resources-office-external-${suffix}`
      )
    ),
    `held CENRO record external-${suffix} must remain unpublished`
  );
  assert.ok(!services.some(service => service.title === title));
}
assert.match(servicesPageSource, /DENR\/PENRO process/);
assert.match(
  servicesPageSource,
  /CENRO is not presented here as the national permit issuer/
);

const expectedCcroServices = [
  ['02', 'Applying for a Marriage License'],
  [
    '03',
    'Petition for Correction of Clerical Error /Change of First Name / Change of Sex and Correction of Day and Month of Birth (R.A. 9048 and R.A. 10172)',
  ],
  [
    '04',
    'Registration of Adoption (Under RA 11642, The Domestic Administrative Adoption and Alternative Child Care Act)',
  ],
  ['05', 'Registration of Court Decree'],
  ['07', 'Registration of Death or Fetal Death – Timely'],
  ['08', 'Registration of Legal Instruments - Legitimation'],
  ['09', 'Registration of Legal Instruments - R.A. 9255'],
  ['10', 'Registration of Legal Instruments – Other Legal Instruments'],
  [
    '11',
    'Registration of Live Birth for Children in Need of Special Protection (CNSP)',
  ],
  [
    '12',
    'Registration of Live Birth for Marital (Legitimate) and Non-Marital (Illegitimate) Child – Delayed',
  ],
  ['13', 'Registration of Live Birth for Marital (Legitimate) Child – Timely'],
  [
    '14',
    'Registration of Live Birth for Non-Marital (Illegitimate) Child – Timely',
  ],
  [
    '16',
    'Registration of Live Birth under Birth Registration Assistance Project (BRAP)',
  ],
  ['18', 'Registration of Marriage – Timely'],
  [
    '19',
    'Requesting Certified Copy of Birth, Death, Marriage and other Civil Registry Documents',
  ],
].map(([suffix, title]) => [
  `charter-2026-2e-city-civil-registry-office-external-${suffix}`,
  title,
]);
assert.deepEqual(
  ccro.map(service => [service.id, service.title]),
  expectedCcroServices,
  'Civil Registry must contain exactly the fifteen approved CCRO ids and titles'
);
for (const [suffix, title] of [
  [
    '01',
    'Advance/Piecemeal Copy of Civil Registry Documents to Phil. Statistics Authority (PSA)',
  ],
  ['06', 'Registration of Death or Fetal Death – Delayed'],
  [
    '15',
    'Registration of Live Birth of Persons with No known Parent/s (Foundling)',
  ],
  ['17', 'Registration of Marriage – Delayed'],
] as const) {
  assert.ok(
    !services.some(service =>
      service.id.endsWith(`city-civil-registry-office-external-${suffix}`)
    ),
    `held CCRO record external-${suffix} must remain unpublished`
  );
  assert.ok(!services.some(service => service.title === title));
}
assert.ok(
  ccro.every(
    service =>
      service.forms.length === 0 &&
      service.online_channels.length === 0 &&
      service.appointment === null
  ),
  'CCRO records must not publish unsupported forms, online channels, or appointments'
);
const ccroNotes = ccro.flatMap(service => service.public_notes).join(' ');
for (const boundary of [
  /PSA/i,
  /court/i,
  /NACC|RACCO/i,
  /City Health Office/i,
]) {
  assert.match(ccroNotes, boundary);
}
assert.match(
  ccroNotes,
  /does not include|not included|separate|outside|depends on|subject to/i,
  'CCRO notes must preserve external-agency responsibility and timing boundaries'
);
assert.doesNotMatch(
  JSON.stringify(ccro),
  /mass wedding|mobile registration activit|dated campaign/i
);

const expectedOscaServices = [
  ['03', 'Applying for a New Senior Citizen’s Card (ID)'],
  ['04', 'Applying for the Replacement of the Lost Senior Citizen’s Card'],
].map(([suffix, title]) => [
  `charter-2026-2e-city-mayors-office-community-affairs-division-external-${suffix}`,
  title,
]);
assert.deepEqual(
  osca.map(service => [service.id, service.title]),
  expectedOscaServices,
  'Senior Citizens must contain exactly the two approved OSCA ids and titles'
);
assert.ok(
  osca.every(
    service =>
      service.office.acronym === 'OSCA' &&
      service.office.name === "Office for Senior Citizen's Affairs" &&
      service.office.division === "City Mayor's Office"
  ),
  "OSCA records must preserve the City Mayor's Office parent relationship"
);
assert.ok(
  osca.every(
    service =>
      service.forms.length === 0 &&
      service.online_channels.length === 0 &&
      service.appointment === null &&
      service.office_hours === null
  ),
  'OSCA records must not claim online application, appointment, or unqualified office hours'
);
assert.ok(
  osca.every(service => service.office_contact.emails.length === 0),
  'OSCA records must not publish an OSCA-specific email'
);
assert.ok(
  osca.every(service => service.office_contact.phone === '(045) 649-8080'),
  'OSCA records must preserve the institutional contact number'
);
assert.ok(
  osca.every(service => /Heroes Hall/i.test(service.office_contact.address)),
  'OSCA records must preserve the Heroes Hall location'
);
assert.ok(
  osca.every(service => service.fee.text === 'None'),
  'OSCA records must preserve the free application/replacement fee'
);
assert.equal(
  osca.find(service => service.id.endsWith('-03'))?.processing_time.text,
  '14 minutes',
  'the new Senior Citizen ID record must preserve its 14-minute processing time'
);
assert.equal(
  osca.find(service => service.id.endsWith('-04'))?.processing_time.text,
  '8 minutes',
  'the lost-card replacement record must preserve its 8-minute processing time'
);
assert.doesNotMatch(
  JSON.stringify(osca),
  /ext\.?\s*126|osca@|renewal|damaged.card|transfer|record update|guaranteed (id|booklet)/i,
  'OSCA records must not introduce an unapproved contact, email, or unreviewed procedure'
);
assert.doesNotMatch(
  JSON.stringify(osca),
  /medicine booklet|ncsc|digital nscid|social pension|dswd/i,
  'OSCA records must not expand into unreviewed adjacent OSCA programs as standalone services'
);

assert.equal(cadmino.length, 1, 'exactly one CAdminO record is published');
const infrastructure = cadmino[0];
assert.equal(
  infrastructure.id,
  'charter-2026-2e-city-administrators-office-external-02'
);
assert.equal(
  infrastructure.title,
  'Processing of Complaints/and other Issues Related to the Territorial Jurisdiction of the City of San Fernando, Pampanga (Operations Management Services)'
);
assert.ok(
  infrastructure.office.acronym === 'CAdminO' &&
    infrastructure.office.name === 'City Administrator’s Office' &&
    infrastructure.office.division === 'Administrative Services Division',
  "the Infrastructure & Public Works record must preserve the City Administrator's Office parent relationship"
);
assert.deepEqual(
  [...infrastructure.topics].sort(),
  [
    'bridges',
    'drainage-flooding',
    'other-city-infrastructure',
    'public-buildings-facilities',
    'roads',
    'streetlights-public-lighting',
  ],
  'the Infrastructure & Public Works record must preserve all six reviewed topic aliases'
);
assert.ok(
  infrastructure.topic_limitation_note.length > 0,
  'the Infrastructure & Public Works record must preserve its topic/jurisdiction limitation note'
);
assert.match(
  infrastructure.topic_limitation_note,
  /does not establish|ownership|jurisdiction/i,
  'the topic limitation note must preserve the ownership/jurisdiction disclaimer'
);
assert.equal(infrastructure.fee.text, 'None');
assert.match(
  infrastructure.processing_time.text,
  /5 minutes.*11 hours 55 minutes.*12 hours/i,
  'the processing time must preserve the 5-minute acknowledgment plus 11h55m referral = 12h breakdown'
);
assert.match(
  infrastructure.public_notes.join(' '),
  /not a repair-completion time/i,
  'the 12-hour figure must be marked as intake/referral only, not repair completion'
);
assert.match(
  infrastructure.public_notes.join(' '),
  /inspection, evaluation, funding, procurement, scheduling, resolution, and repair time.*not stated/i,
  'unstated downstream repair timing must remain explicit'
);
assert.match(
  infrastructure.public_notes.join(' '),
  /City may route the concern|responsibility depends on who owns or maintains/i,
  'jurisdiction/ownership limitation must be preserved in public notes'
);
assert.equal(
  infrastructure.forms.length,
  0,
  'the Infrastructure & Public Works record must not publish forms'
);
assert.equal(
  infrastructure.online_channels.length,
  0,
  'the Infrastructure & Public Works record must not publish online channels'
);
assert.equal(infrastructure.appointment, null);
assert.equal(infrastructure.office_hours, null);
assert.doesNotMatch(
  JSON.stringify(infrastructure),
  /road.repair service|bridge.repair service|drainage.repair service|streetlight.repair service|facility repair service|@cityofsanfernando\.gov\.ph.{0,40}(facebook|messenger)|addressing public|work order|water district|ocbo|cpdco|guaranteed (repair|response)|SLA/i,
  'the record must not introduce an excluded repair service, alternate channel, or guaranteed SLA'
);
assert.doesNotMatch(
  JSON.stringify(infrastructure),
  /complainant name|complainant identity|photo attachment|video attachment|property owner|inspection finding|work order number|enforcement record/i,
  'the record must not expose complaint contents, complainant identity, or internal enforcement records'
);

assert.equal(
  createHash('sha256')
    .update(
      JSON.stringify(
        services.filter(service => service.office.acronym !== 'CAdminO')
      )
    )
    .digest('hex'),
  'bd1612926008c2c76a19ea4d956d7a442c1f22b47fb52df400805a4831b39883',
  'the previous 154 published service records must remain semantically unchanged'
);

assert.equal(
  createHash('sha256')
    .update(
      JSON.stringify(
        services.filter(
          service =>
            service.office.acronym !== 'CAdminO' &&
            service.office.acronym !== 'OSCA'
        )
      )
    )
    .digest('hex'),
  '333dde4980076d8d93741dd2c25643a5080a247bb06e6d8aa2a6e44087feaf8c',
  'the previous 152 published service records must remain semantically unchanged'
);

assert.equal(
  createHash('sha256')
    .update(
      JSON.stringify(
        services.filter(
          service =>
            service.office.acronym !== 'CAdminO' &&
            service.office.acronym !== 'OSCA' &&
            service.office.acronym !== 'CCRO'
        )
      )
    )
    .digest('hex'),
  '7838777b7f7d4c4728e77a85a411755f48032bfa11442a46ca1b590c1bd3a934',
  'the previous 137 published service records must remain semantically unchanged'
);

assert.equal(
  createHash('sha256')
    .update(
      JSON.stringify(
        services.filter(
          service =>
            service.office.acronym !== 'CAdminO' &&
            service.office.acronym !== 'OSCA' &&
            service.office.acronym !== 'CENRO' &&
            service.office.acronym !== 'CCRO'
        )
      )
    )
    .digest('hex'),
  '9d5b8aaa9642da485d053d29470296174e09bb19345030025c81111dda268687',
  'the previous 136 published service records must remain semantically unchanged'
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
  createHash('sha256')
    .update(
      JSON.stringify(
        services.filter(
          service =>
            service.office.acronym !== 'CAdminO' &&
            service.office.acronym !== 'OSCA' &&
            service.office.acronym !== 'CCSFP' &&
            service.office.acronym !== 'CENRO' &&
            service.office.acronym !== 'CCRO'
        )
      )
    )
    .digest('hex'),
  '52ac69f845e42bb2e7e101c62222b829146b0e0de072c68d2d45e2626010c02f',
  'the previous 127 published service records must remain semantically unchanged'
);
assert.equal(
  createHash('sha256')
    .update(
      JSON.stringify(
        services.filter(
          service =>
            service.office.acronym !== 'CAdminO' &&
            service.office.acronym !== 'OSCA' &&
            service.office.acronym !== 'CHO' &&
            service.office.acronym !== 'CIPPESO' &&
            service.office.acronym !== 'CAVO' &&
            service.office.acronym !== 'CCSFP' &&
            service.office.acronym !== 'CENRO' &&
            service.office.acronym !== 'CCRO'
        )
      )
    )
    .digest('hex'),
  '74691515890427c26704f91983229fd52c48ac17961a6baa32d605974eb347c1',
  'the previous fifty-four published service records must remain semantically unchanged'
);
assert.equal(
  createHash('sha256')
    .update(
      JSON.stringify(
        services.filter(
          service =>
            service.office.acronym !== 'CAdminO' &&
            service.office.acronym !== 'OSCA' &&
            service.office.acronym !== 'CIPPESO' &&
            service.office.acronym !== 'CAVO' &&
            service.office.acronym !== 'CCSFP' &&
            service.office.acronym !== 'CENRO' &&
            service.office.acronym !== 'CCRO'
        )
      )
    )
    .digest('hex'),
  'eeac0f55132ddb2f84ba5341306ff1ba650d77ea2e0073ae9a3dc06af31ef717',
  'the previous 113 published service records must remain semantically unchanged'
);
assert.equal(
  createHash('sha256')
    .update(
      JSON.stringify(
        services.filter(
          service =>
            service.office.acronym !== 'CAdminO' &&
            service.office.acronym !== 'OSCA' &&
            service.office.acronym !== 'CAVO' &&
            service.office.acronym !== 'CCSFP' &&
            service.office.acronym !== 'CENRO' &&
            service.office.acronym !== 'CCRO'
        )
      )
    )
    .digest('hex'),
  '204a1f9206106a5cbd4665fd99e91fb4002348deb38ca14ed0f48e8a1b4c9e2f',
  'the previous 120 published service records must remain semantically unchanged'
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
  '  routes: 155/155; BLPD: 8; CDRRMO: 7; CSWDO: 39 (Assistance Programs: 19, PWD Services: 6, Social Welfare: 14); CHO: 59 (Health Services: 59); CIPPESO: 7 (Employment: 7); CAVO: 7 (Agriculture & Fisheries: 7); CCSFP: 9 (Education: 9); CENRO: 1 (Environment: 1); CCRO: 15 (Civil Registry: 15); OSCA: 2 (Senior Citizens: 2); CAdminO: 1 (Infrastructure & Public Works: 1); External: 155; published categories: 13/14; planned categories: 1/14'
);
