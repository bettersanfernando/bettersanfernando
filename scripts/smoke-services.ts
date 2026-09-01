#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { getServiceBySlug, getServices } from '../src/data/civic/services.ts';

const services = getServices();

assert.equal(services.length, 8);
assert.equal(new Set(services.map(service => service.id)).size, 8);
assert.equal(new Set(services.map(service => service.slug)).size, 8);
assert.ok(
  services.every(
    service =>
      service.office.acronym === 'BLPD' &&
      service.classification.service_scope === 'External'
  )
);
assert.ok(
  services.every(
    service =>
      service.requirements.length > 0 && service.client_steps.length > 0
  )
);

const temporaryPermit = getServiceBySlug('permit-to-operate-temporary-permit');
assert.ok(temporaryPermit);
assert.equal(temporaryPermit.client_steps.at(-1)?.sequence, '*');
assert.equal(getServiceBySlug('missing-service'), undefined);

console.log('Services civic data smoke checks passed.');
