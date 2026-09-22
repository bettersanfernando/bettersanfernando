#!/usr/bin/env -S node --experimental-strip-types
// Batch 4 focused coverage: the four canonical dynamic route families
// (service category/legacy-slug dispatcher, service detail, project detail,
// office detail) exist, remain Server Components, derive
// generateStaticParams() from the civic accessors (never a copied array),
// generate the exact expected counts, and never emit a legacy one-segment
// service URL or a removed government/document dynamic pattern. Full
// route/content parity sweeps are Batch 7's job — this only checks what's
// new in this batch.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import {
  getServiceBySlug,
  getServiceCategory,
  getServiceHref,
  getServices,
} from '../src/data/civic/services.ts';
import { getProjectById, getProjects } from '../src/data/civic/projects.ts';
import {
  getCityOfficeById,
  getCityOffices,
} from '../src/data/civic/government.ts';

const routeFiles = {
  categoryDispatcher: 'src/app/services/[category]/page.tsx',
  serviceDetail: 'src/app/services/[category]/[serviceSlug]/page.tsx',
  projectDetail: 'src/app/projects/[projectId]/page.tsx',
  officeDetail: 'src/app/government/offices/[officeId]/page.tsx',
};

// 1. All four required dynamic route files exist.
for (const [name, filePath] of Object.entries(routeFiles)) {
  assert.ok(existsSync(filePath), `${name} must exist at ${filePath}`);
}

// 2. Route files remain Server Components; must not import react-router or
//    react-helmet-async.
for (const [name, filePath] of Object.entries(routeFiles)) {
  const source = readFileSync(filePath, 'utf8');
  assert.ok(
    !/^\s*['"]use client['"]/m.test(source),
    `${name} (${filePath}) must remain a Server Component — it needs permanentRedirect()/notFound(), which are server-only`
  );
  assert.ok(
    !/from ['"]react-router(-dom)?['"]/.test(source),
    `${name} (${filePath}) must not import react-router/react-router-dom`
  );
  assert.ok(
    !/^\s*import .* from ['"](react-helmet-async|\.\.\/+components\/SEO)['"]/m.test(
      source
    ),
    `${name} (${filePath}) must not import react-helmet-async or the legacy SEO component`
  );
  assert.match(
    source,
    /export function generateStaticParams/,
    `${name} (${filePath}) must export generateStaticParams()`
  );
}

// 3. generateStaticParams() derives values from civic accessors, not a
//    copied/hardcoded array. The category dispatcher builds its param set
//    from a module-scope `validCategories` derived from getServices(); the
//    other three call their accessor directly inside generateStaticParams.
//    Either way, the accessor call must be present in the file, and the
//    function itself must never return a literal array of strings.
for (const [name, filePath] of Object.entries(routeFiles)) {
  const source = readFileSync(filePath, 'utf8');
  assert.match(
    source,
    /getServices\(\)|getProjects\(\)|getCityOffices\(\)/,
    `${name} (${filePath}) must call a civic accessor to source its static params, not a copied list`
  );
  const generateStaticParamsBody = source.match(
    /generateStaticParams\(\)\s*\{([\s\S]*?)\n\}/
  )?.[1];
  assert.ok(
    generateStaticParamsBody,
    `${name} (${filePath}) must define a generateStaticParams() function body`
  );
  assert.ok(
    !/return \[\s*['"]/.test(generateStaticParamsBody!),
    `${name} (${filePath})'s generateStaticParams() must not return a hardcoded literal array`
  );
}

// 4. Exact counts: 16 categories, 177 service details, 307 projects, 44
//    offices — 544 total canonical dynamic paths.
const services = getServices();
const categories = new Set(services.map(getServiceCategory));
const projects = getProjects();
const offices = getCityOffices();

assert.equal(categories.size, 16, 'expected exactly 16 service categories');
assert.equal(services.length, 177, 'expected exactly 177 services');
assert.equal(projects.length, 307, 'expected exactly 307 projects');
assert.equal(offices.length, 44, 'expected exactly 44 government offices');

const totalCanonicalPaths =
  categories.size + services.length + projects.length + offices.length;
assert.equal(
  totalCanonicalPaths,
  544,
  'expected exactly 544 total canonical dynamic paths (16 + 177 + 307 + 44)'
);

// 5. All generated parameters are unique.
assert.equal(
  new Set(services.map(s => s.slug)).size,
  services.length,
  'every service slug must be unique'
);
assert.equal(
  new Set(projects.map(p => p.id)).size,
  projects.length,
  'every project ID must be unique'
);
assert.equal(
  new Set(offices.map(o => o.office_id)).size,
  offices.length,
  'every office ID must be unique'
);

// 6. Every service belongs to its generated category — i.e. getServiceHref
//    (the canonical URL) always agrees with getServiceCategory for every
//    service, so the [category]/[serviceSlug] pairing generateStaticParams
//    produces is never mismatched.
for (const service of services) {
  const category = getServiceCategory(service);
  assert.equal(
    getServiceHref(service),
    `/services/${category}/${service.slug}`,
    `${service.slug} must resolve to its own generated category (${category})`
  );
}

// No service slug collides with a category identifier (category match must
// always be able to take precedence safely — see §5).
for (const service of services) {
  assert.ok(
    !categories.has(service.slug),
    `service slug "${service.slug}" must not collide with a category identifier`
  );
}

// 7. Every project ID resolves; 8. every office ID resolves.
for (const project of projects) {
  assert.ok(
    getProjectById(project.id),
    `project ID ${project.id} must resolve via getProjectById`
  );
}
for (const office of offices) {
  assert.ok(
    getCityOfficeById(office.office_id),
    `office ID ${office.office_id} must resolve via getCityOfficeById`
  );
}
assert.equal(
  getServiceBySlug('this-slug-does-not-exist'),
  undefined,
  'an unknown service slug must resolve to undefined, never throw'
);

// 9. No legacy service slug is emitted as a canonical static path — the
//    dispatcher's generateStaticParams() must only ever enumerate the 16
//    real categories, never a service slug.
const dispatcherSource = readFileSync(routeFiles.categoryDispatcher, 'utf8');
for (const service of services.slice(0, 5)) {
  assert.ok(
    !dispatcherSource.includes(`'${service.slug}'`),
    `${routeFiles.categoryDispatcher} must not hardcode service slug "${service.slug}"`
  );
}
assert.match(
  dispatcherSource,
  /permanentRedirect/,
  'the dispatcher must call permanentRedirect() for known legacy service slugs'
);
assert.match(
  dispatcherSource,
  /notFound/,
  'the dispatcher must call notFound() for unknown values'
);
assert.ok(
  !/dynamicParams\s*=\s*false/.test(dispatcherSource),
  'the dispatcher must not set dynamicParams = false — legacy service slugs must still reach the runtime dispatcher'
);

// 10. No removed legacy dynamic government/document route was added.
function collectAppFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return collectAppFiles(full);
    return [full];
  });
}
const allAppFiles = collectAppFiles('src/app');
for (const removedPattern of [
  'government/[category]',
  '[documentSlug]',
  '[lang]',
  'services/[slug]',
]) {
  assert.ok(
    !allAppFiles.some(file =>
      file.replaceAll('\\', '/').includes(removedPattern)
    ),
    `${removedPattern} is a removed legacy pattern (docs/NEXTJS-MIGRATION-SPEC.md §6) and must never be added`
  );
}

// 11. Public data is not copied into route files — spot-check that none of
//     the four route files embeds a real service title/office name/project
//     name as a literal string (a sign of copy-pasted data instead of a
//     civic accessor call).
const sampleService = services[0];
const sampleProject = projects[0];
const sampleOffice = offices[0];
const serviceDetailSource = readFileSync(routeFiles.serviceDetail, 'utf8');
const projectDetailSource = readFileSync(routeFiles.projectDetail, 'utf8');
const officeDetailSource = readFileSync(routeFiles.officeDetail, 'utf8');
assert.ok(
  !serviceDetailSource.includes(sampleService.title),
  `${routeFiles.serviceDetail} must not hardcode a real service title`
);
assert.ok(
  !projectDetailSource.includes(sampleProject.project_name),
  `${routeFiles.projectDetail} must not hardcode a real project name`
);
assert.ok(
  !officeDetailSource.includes(sampleOffice.office_name),
  `${routeFiles.officeDetail} must not hardcode a real office name`
);

console.log(
  `Batch 4 dynamic route smoke passed: 16 categories + 177 services + 307 projects + 44 offices = ${totalCanonicalPaths} canonical dynamic paths, all unique, all resolvable, no legacy slug/removed pattern leaked into static generation.`
);
