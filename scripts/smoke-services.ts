#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { getServiceBySlug, getServices } from '../src/data/civic/services.ts';

const services = getServices();
const blpd = services.filter(service => service.office.acronym === 'BLPD');
const cdrrmo = services.filter(service => service.office.acronym === 'CDRRMO');

assert.equal(services.length, 15);
assert.equal(blpd.length, 8);
assert.equal(cdrrmo.length, 7);
assert.equal(new Set(services.map(service => service.id)).size, 15);
assert.equal(new Set(services.map(service => service.slug)).size, 15);
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
  'all 15 service detail routes must resolve through the adapter'
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
console.log('  routes: 15/15; BLPD: 8; CDRRMO: 7; External: 15');
