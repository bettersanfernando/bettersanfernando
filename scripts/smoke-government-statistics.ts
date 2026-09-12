#!/usr/bin/env -S node --experimental-strip-types
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getGovernmentEntities,
  getGovernmentStructureMetadata,
  getVerifiedRelationships,
} from '../src/data/civic/governmentStructureSummary.ts';
import { mainNavigation } from '../src/data/navigation.ts';
import { plannedPages } from '../src/data/plannedPages.ts';

const entities = getGovernmentEntities();
const relationships = getVerifiedRelationships();
const metadata = getGovernmentStructureMetadata();

assert.equal(entities.length, 44, '44 reconciled entities');
assert.equal(metadata.betterSanFernandoDirectoryRecordCount, 44);
assert.equal(
  metadata.officialDepartmentDirectoryCount,
  33,
  '33 entities matched against the official Departments directory'
);
assert.equal(metadata.officialDepartmentTopLevelCount, 27);
assert.equal(metadata.officialDepartmentNestedCount, 6);
assert.equal(
  metadata.officialDepartmentTopLevelCount +
    metadata.officialDepartmentNestedCount,
  33
);
assert.equal(relationships.length, 14, '14 verified relationships');
assert.equal(metadata.barangayCount, 35);

const facilitiesAndServiceUnits = entities.filter(
  e => e.entity_type === 'facility' || e.entity_type === 'service_unit'
);
assert.equal(
  facilitiesAndServiceUnits.length,
  8,
  '8 verified public facilities or service units'
);

assert.ok(
  relationships.every(
    r =>
      r.verification_status === 'MATCHED_CURRENT_DEPARTMENTS_DIRECTORY' ||
      r.verification_status === 'VERIFIED_PUBLIC_FACILITY_OR_SERVICE_UNIT'
  ),
  'relationships must only include explicitly verified links'
);
assert.ok(
  entities
    .filter(
      e =>
        e.relationship_verification_status === 'HOLD_UNRESOLVED_CLASSIFICATION'
    )
    .every(
      held =>
        !relationships.some(
          r => r.child_id === held.id || r.parent_id === held.id
        )
    ),
  'held/unresolved entities must never appear inside the verified relationships list'
);

assert.ok(
  metadata.prohibitedClaimsAcknowledged.some(claim =>
    claim.includes('total office count')
  )
);
assert.ok(
  metadata.prohibitedClaimsAcknowledged.some(claim =>
    claim.includes('complete organizational chart')
  )
);
assert.ok(metadata.permanentLimitation.includes('not represent a complete'));

const externalAgencyNames = [
  'Department of Interior and Local Government',
  'Philippine National Police',
  'Bureau of Fire Protection',
  'Commission on Elections',
];
assert.ok(
  entities.every(entity => !externalAgencyNames.includes(entity.name)),
  'external agencies must not leak in as City Government entities'
);
assert.ok(
  entities
    .filter(e => e.is_city_government_unit)
    .every(e => e.government_level === 'city')
);

const pageSource = readFileSync('src/pages/GovernmentStatistics.tsx', 'utf8');
assert.match(pageSource, /partial/i);
assert.doesNotMatch(
  pageSource,
  /this is a complete organizational chart|the complete legal organization/i,
  'must never assert completeness of the org chart'
);
assert.doesNotMatch(
  pageSource,
  /44 (offices|city government units|total offices)/i
);
assert.match(pageSource, /permanentLimitation/);
assert.match(pageSource, /prohibitedClaimsAcknowledged/);

const governmentStatisticsDestinations = mainNavigation
  .flatMap(item => item.sections?.flatMap(section => section.items) ?? [])
  .filter(item => item.href === '/statistics/government');
assert.equal(governmentStatisticsDestinations.length, 1);
assert.equal(governmentStatisticsDestinations[0]?.kind, 'real');
assert.ok(!plannedPages.some(page => page.path === '/statistics/government'));

const appSource = readFileSync('src/App.tsx', 'utf8');
assert.match(
  appSource,
  /path="\/statistics\/government"[\s\S]{0,80}element={<GovernmentStatistics \/>}/
);

console.log('[smoke-government-statistics] OK');
console.log(
  `  entities: 44; directory matches: 33 (27+6); facilities/units: 8; relationships: 14`
);
