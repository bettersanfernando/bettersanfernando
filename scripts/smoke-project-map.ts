#!/usr/bin/env -S node --experimental-strip-types
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { getProjects } from '../src/data/civic/projects.ts';
import { BarangaysGeojsonSchema } from '../src/data/civic/geography.schemas.ts';
import { aggregateProjectsByBarangay } from '../src/data/civic/projectMap.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Project map smoke check failed: ${message}`);
}

const geographyPath = fileURLToPath(
  new URL(
    '../src/data/generated/civic/geography/barangays.geojson',
    import.meta.url
  )
);
const boundaries = BarangaysGeojsonSchema.parse(
  JSON.parse(readFileSync(geographyPath, 'utf8'))
).features;
const distribution = aggregateProjectsByBarangay(getProjects(), boundaries);

assert(distribution.totalProjects === 239, 'expected 239 total projects');
assert(
  distribution.attributedProjects === 214,
  'expected 214 barangay-attributed projects'
);
assert(
  distribution.unattributedProjects === 25,
  'expected 25 unattributed projects'
);
assert(distribution.barangays.length === 35, 'expected all 35 barangays');
assert(
  distribution.barangays.reduce((sum, item) => sum + item.projectCount, 0) ===
    distribution.attributedProjects,
  'barangay counts must sum to the attributed total'
);
assert(
  distribution.barangays.some(item => item.projectCount === 0),
  'expected barangays with no attributed projects to remain visible'
);
for (const barangay of distribution.barangays) {
  const lifecycleTotal = Object.values(barangay.lifecycleCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  assert(
    lifecycleTotal === barangay.projectCount,
    `${barangay.name} lifecycle counts do not match its total`
  );
}

console.log('[smoke-project-map] OK');
console.log(
  `  ${distribution.totalProjects} total, ${distribution.attributedProjects} attributed, ${distribution.unattributedProjects} unattributed`
);
console.log(`  ${distribution.barangays.length} barangay polygons represented`);
