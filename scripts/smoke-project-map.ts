#!/usr/bin/env -S node --experimental-strip-types
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import vm from 'vm';
import assert from 'node:assert/strict';
import * as TypeScript from 'typescript';
import { GPUInitializationError, LngLatBounds } from 'maplibre-gl';
import { getProjects } from '../src/data/civic/projects.ts';
import { BarangaysGeojsonSchema } from '../src/data/civic/geography.schemas.ts';
import { aggregateProjectsByBarangay } from '../src/data/civic/projectMap.ts';

type MapInitializationMode = 'success' | 'gpu-error' | 'unexpected-error';

function loadMapComponent(mode: MapInitializationMode) {
  const effects: Array<() => void | (() => void)> = [];
  const events: string[] = [];
  let mapUnavailable = false;
  let refCount = 0;

  class FakeMap {
    constructor() {
      if (mode === 'gpu-error') {
        throw new GPUInitializationError({}, null);
      }
      if (mode === 'unexpected-error') {
        throw new Error('unexpected map error');
      }
      events.push('map');
    }

    addControl = () => events.push('control');

    on() {}
    remove = () => events.push('map-remove');
  }

  const FakePopup = class {
    remove = () => events.push('popup-remove');
  };
  const FakeResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      void callback;
    }
    observe = () => events.push('observe');
    disconnect = () => events.push('disconnect');
  };

  const react = {
    useEffect(effect: () => void | (() => void)) {
      effects.push(effect);
    },
    useRef<T>(initialValue: T) {
      const current = refCount === 0 ? { clientWidth: 800 } : initialValue;
      refCount += 1;
      return { current: current as T };
    },
    useState(initialValue: boolean) {
      if (!mapUnavailable) mapUnavailable = initialValue;
      return [
        mapUnavailable,
        (nextValue: boolean) => (mapUnavailable = nextValue),
      ] as const;
    },
  };
  const source = readFileSync(
    new URL(
      '../src/components/projects/BarangayProjectMap.tsx',
      import.meta.url
    ),
    'utf8'
  );
  const compiled = TypeScript.transpileModule(source, {
    compilerOptions: {
      jsx: TypeScript.JsxEmit.ReactJSX,
      module: TypeScript.ModuleKind.CommonJS,
    },
    fileName: 'BarangayProjectMap.tsx',
  }).outputText;
  const module = { exports: {} as { default?: (props: unknown) => unknown } };
  const require = (id: string) => {
    if (id === 'maplibre-gl/dist/maplibre-gl.css') return {};
    if (id.endsWith('enum-labels')) return { enumLabel: () => '' };
    if (id.endsWith('PageMessages'))
      return { usePageT: () => (key: string) => key };
    const modules: Record<string, unknown> = {
      react,
      'react/jsx-runtime': {
        jsx: (type: unknown, props: Record<string, unknown>) => ({
          type,
          props,
        }),
      },
      'maplibre-gl': {
        FullscreenControl: class {},
        GeoJSONSource: class {},
        GPUInitializationError,
        LngLatBounds,
        Map: FakeMap,
        NavigationControl: class {},
        Popup: FakePopup,
        ScaleControl: class {},
        setWorkerUrl() {},
      },
    };
    if (id in modules) return modules[id];
    throw new Error(`Unexpected map component import: ${id}`);
  };

  vm.runInNewContext(compiled, {
    ResizeObserver: FakeResizeObserver,
    exports: module.exports,
    module,
    queueMicrotask(callback: () => void) {
      callback();
    },
    require,
  });

  const cityBoundary = {
    geometry: {
      coordinates: [
        [
          [0, 0],
          [1, 1],
        ],
      ],
    },
  };
  const render = () => {
    const rendered = module.exports.default?.({
      boundaries: [],
      cityBoundary,
      summaries: [],
      selectedPsgc: null,
      onSelect() {},
      lifecycleFilter: null,
    });
    return (
      typeof rendered === 'object' &&
      rendered !== null &&
      'props' in rendered &&
      (rendered as { props?: { role?: string } }).props?.role === 'status'
    );
  };

  return { effects, events, render };
}

function runMapInitializationSmoke(): void {
  const successful = loadMapComponent('success');
  successful.render();
  const cleanup = successful.effects[4]?.();
  assert.equal(typeof cleanup, 'function');
  cleanup?.();
  assert.equal(
    successful.events.join(','),
    'map,control,control,control,observe,disconnect,popup-remove,map-remove'
  );

  const gpuFailure = loadMapComponent('gpu-error');
  gpuFailure.render();
  assert.doesNotThrow(() => assert.equal(gpuFailure.effects[4]?.(), undefined));
  assert.deepEqual(gpuFailure.events, []);
  assert.equal(gpuFailure.render(), true);

  const unexpectedFailure = loadMapComponent('unexpected-error');
  unexpectedFailure.render();
  assert.throws(() => unexpectedFailure.effects[4]?.(), /unexpected map error/);
}

// BarangayProjectMap.tsx calls setWorkerUrl('/maplibre-gl-worker.mjs'), a
// literal public/ URL. Both files are gitignored and generated by
// scripts/sync-maplibre-worker.mjs (postinstall, and now also "build" —
// see package.json); if either is missing the map renders controls and
// background but no barangay polygons, with no build-time error otherwise.
for (const asset of [
  'public/maplibre-gl-worker.mjs',
  'public/maplibre-gl-shared.mjs',
]) {
  assert(
    existsSync(fileURLToPath(new URL(`../${asset}`, import.meta.url))),
    `${asset} is missing — run \`node scripts/sync-maplibre-worker.mjs\` (or \`pnpm install\`)`
  );
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

assert(distribution.totalProjects === 303, 'expected 303 total projects');
assert(
  distribution.attributedProjects === 278,
  'expected 278 barangay-attributed projects'
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

runMapInitializationSmoke();

console.log('[smoke-project-map] OK');
console.log(
  `  ${distribution.totalProjects} total, ${distribution.attributedProjects} attributed, ${distribution.unattributedProjects} unattributed`
);
console.log(`  ${distribution.barangays.length} barangay polygons represented`);
