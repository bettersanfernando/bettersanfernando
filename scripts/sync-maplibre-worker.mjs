#!/usr/bin/env node
// Copies maplibre-gl's worker script into public/ so it can be referenced by
// a stable, literal URL ("/maplibre-gl-worker.mjs") instead of relying on a
// bundler correctly rewriting `new URL('maplibre-gl/dist/...', import.meta.url)`
// for a bare package-relative path deep in node_modules. That pattern is a
// webpack Asset Modules idiom that Turbopack does not reliably resolve for
// paths outside the importing module's own directory — under Turbopack it
// silently produced a wrong URL, so the worker never loaded and the map
// rendered controls + background but no barangay polygons (GeoJSON tiling
// happens in the worker; if it never starts, layers stay empty forever).
// Re-run automatically via the "postinstall" script whenever dependencies
// are (re)installed, so this never goes stale on a maplibre-gl upgrade.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(projectRoot, 'node_modules/maplibre-gl/dist');
const publicDir = join(projectRoot, 'public');

// maplibre-gl-worker.mjs imports ./maplibre-gl-shared.mjs by a relative
// path, so both must be copied to the same directory for that import to
// resolve once served from public/.
const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];

mkdirSync(publicDir, { recursive: true });
for (const file of files) {
  copyFileSync(join(distDir, file), join(publicDir, file));
}
console.log(`[sync-maplibre-worker] copied ${files.join(', ')} to public/`);
