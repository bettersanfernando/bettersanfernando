'use client';

import { useEffect, useRef } from 'react';
import {
  FullscreenControl,
  GeoJSONSource,
  LngLatBounds,
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  ScaleControl,
  setWorkerUrl,
  type LngLatBoundsLike,
  type MapLayerMouseEvent,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { BarangayFeature, CityFeature } from '../../data/civic/geography';
import type { BarangayProjectSummary } from '../../data/civic/projectMap';
import type { ProjectLifecycleStatus } from '../../data/civic/projects';
import { titleCaseEnum } from '../../lib/utils';

// Next.js port of BarangayProjectMap.tsx. Rendered only via a client-only
// dynamic import (see ../../app/projects/map/project-map-view.tsx) so
// this file — and the maplibre-gl bundle it pulls in — never loads on any
// other route.
//
// The worker script is referenced by a plain, stable string path rather
// than `new URL('maplibre-gl/dist/...', import.meta.url)` (a webpack Asset
// Modules idiom for bare, cross-package specifiers that Turbopack does not
// reliably rewrite into a real servable URL). Getting this wrong is why the
// map used to render its controls/background but never any barangay
// polygons: GeoJSON tiling happens in the worker, so if the worker never
// starts, the fill/outline layers stay permanently empty with no error.
// `public/maplibre-gl-worker.mjs` is kept in sync with the installed
// maplibre-gl version by `scripts/sync-maplibre-worker.mjs` (wired to
// `postinstall`), so this path is always valid regardless of bundler.
setWorkerUrl('/maplibre-gl-worker.mjs');

const SOURCE_ID = 'barangay-project-distribution';
const FILL_LAYER_ID = 'barangay-project-fill';
const OUTLINE_LAYER_ID = 'barangay-project-outline';
const SELECTED_LAYER_ID = 'barangay-project-selected';

interface BarangayProjectMapProps {
  boundaries: readonly BarangayFeature[];
  cityBoundary: CityFeature;
  summaries: readonly BarangayProjectSummary[];
  selectedPsgc: string | null;
  onSelect: (psgc: string) => void;
  lifecycleFilter: ProjectLifecycleStatus | null;
  lockedView?: boolean;
  className?: string;
}

function getFitPadding(width: number, isLocked: boolean): number {
  if (!isLocked) return 28;
  if (width >= 1024) return 24;
  if (width >= 640) return 16;
  return 12;
}

function metricFor(
  summary: BarangayProjectSummary | undefined,
  lifecycleFilter: ProjectLifecycleStatus | null
): number {
  if (!summary) return 0;
  return lifecycleFilter
    ? summary.lifecycleCounts[lifecycleFilter]
    : summary.projectCount;
}

function metricLabel(
  count: number,
  lifecycleFilter: ProjectLifecycleStatus | null
): string {
  const noun = lifecycleFilter
    ? `${titleCaseEnum(lifecycleFilter).toLowerCase()} record`
    : 'published project record';
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function boundsFromRings(
  rings: readonly (readonly [number, number])[][]
): LngLatBoundsLike {
  const bounds = new LngLatBounds();
  for (const ring of rings) {
    for (const coordinate of ring)
      bounds.extend(coordinate as [number, number]);
  }
  return bounds;
}

function buildCollection(
  boundaries: readonly BarangayFeature[],
  summaries: readonly BarangayProjectSummary[],
  lifecycleFilter: ProjectLifecycleStatus | null
) {
  const byPsgc = new Map(summaries.map(item => [item.psgcCode, item]));
  return {
    type: 'FeatureCollection' as const,
    features: boundaries.map(boundary => ({
      ...boundary,
      properties: {
        ...boundary.properties,
        metric_count: metricFor(
          byPsgc.get(boundary.properties.psgc_code),
          lifecycleFilter
        ),
      },
    })),
  };
}

export default function BarangayProjectMap({
  boundaries,
  cityBoundary,
  summaries,
  selectedPsgc,
  onSelect,
  lifecycleFilter,
  lockedView = false,
  className,
}: BarangayProjectMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);
  const summariesRef = useRef(summaries);
  const lifecycleFilterRef = useRef(lifecycleFilter);
  const hoveredIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    summariesRef.current = summaries;
  }, [summaries]);
  useEffect(() => {
    lifecycleFilterRef.current = lifecycleFilter;
  }, [lifecycleFilter]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const cityBounds = boundsFromRings(cityBoundary.geometry.coordinates);
    const initialWidth = containerRef.current.clientWidth || 800;
    const initialPadding = getFitPadding(initialWidth, lockedView);

    const map = new MapLibreMap({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#f1f3f5' },
          },
        ],
      },
      bounds: cityBounds,
      fitBoundsOptions: { padding: initialPadding },
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      maxPitch: 0,
      dragPan: !lockedView,
      scrollZoom: !lockedView,
      boxZoom: !lockedView,
      doubleClickZoom: !lockedView,
      touchZoomRotate: !lockedView,
      keyboard: !lockedView,
    });

    if (!lockedView) {
      map.addControl(new NavigationControl({ showCompass: false }));
      map.addControl(new FullscreenControl());
      map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');
    }

    const popup = new Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: '220px',
    });

    map.on('load', () => {
      const collection = buildCollection(
        boundaries,
        summariesRef.current,
        lifecycleFilterRef.current
      );
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: collection,
        promoteId: 'psgc_code',
      });
      map.addLayer({
        id: FILL_LAYER_ID,
        type: 'fill',
        source: SOURCE_ID,
        paint: {
          'fill-color': [
            'step',
            ['get', 'metric_count'],
            '#e9ecef',
            1,
            '#cce0fb',
            5,
            '#66a3f3',
            10,
            '#0066eb',
            20,
            '#003d8d',
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.96,
            0.82,
          ],
        },
      });
      map.addLayer({
        id: OUTLINE_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: { 'line-color': '#ffffff', 'line-width': 1.25 },
      });
      map.addLayer({
        id: SELECTED_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        filter: ['==', ['get', 'psgc_code'], ''],
        paint: { 'line-color': '#0066EB', 'line-width': 3 },
      });

      map.on('mousemove', FILL_LAYER_ID, (event: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = event.features?.[0];
        if (!feature) return;

        if (
          hoveredIdRef.current !== null &&
          hoveredIdRef.current !== feature.id
        ) {
          map.setFeatureState(
            { source: SOURCE_ID, id: hoveredIdRef.current },
            { hover: false }
          );
        }
        if (feature.id !== undefined) {
          hoveredIdRef.current = feature.id;
          map.setFeatureState(
            { source: SOURCE_ID, id: feature.id },
            { hover: true }
          );
        }

        const name = String(feature.properties?.name ?? 'Barangay');
        const count = Number(feature.properties?.metric_count ?? 0);
        const label = metricLabel(count, lifecycleFilterRef.current);

        const nameEl = document.createElement('p');
        nameEl.className = 'text-sm font-bold text-gray-900';
        nameEl.textContent = name;
        const countEl = document.createElement('p');
        countEl.className = 'mt-0.5 text-xs text-gray-600';
        countEl.textContent = label;
        const wrapper = document.createElement('div');
        wrapper.append(nameEl, countEl);

        popup.setLngLat(event.lngLat).setDOMContent(wrapper).addTo(map);
        map.getCanvas().setAttribute('aria-label', `${name}: ${label}`);
      });
      map.on('mouseleave', FILL_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
        if (hoveredIdRef.current !== null) {
          map.setFeatureState(
            { source: SOURCE_ID, id: hoveredIdRef.current },
            { hover: false }
          );
          hoveredIdRef.current = null;
        }
        map
          .getCanvas()
          .setAttribute(
            'aria-label',
            'Interactive barangay project distribution map'
          );
      });

      map.on('click', FILL_LAYER_ID, (event: MapLayerMouseEvent) => {
        const psgc = event.features?.[0]?.properties?.psgc_code;
        if (typeof psgc === 'string') onSelectRef.current(psgc);
      });

      if (lockedView && containerRef.current) {
        const width = containerRef.current.clientWidth;
        const padding = getFitPadding(width, true);
        map.fitBounds(cityBounds, { padding, duration: 0 });
      }
    });

    mapRef.current = map;

    // Handle container resize properly: invalidate map size and refit
    // the full city bounds with responsive padding when lockedView is active.
    let lastWidth = 0;
    let lastHeight = 0;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      if (
        Math.abs(width - lastWidth) < 1 &&
        Math.abs(height - lastHeight) < 1
      ) {
        return;
      }
      lastWidth = width;
      lastHeight = height;

      map.resize();

      if (lockedView) {
        const padding = getFitPadding(width, true);
        map.fitBounds(cityBounds, { padding, duration: 0 });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      popup.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [boundaries, cityBoundary, lockedView]);

  // Recolor/re-tooltip in place when the lifecycle filter or underlying
  // counts change, without tearing down the map.
  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource(SOURCE_ID);
    if (!map || !(source instanceof GeoJSONSource)) return;
    source.setData(buildCollection(boundaries, summaries, lifecycleFilter));
  }, [boundaries, summaries, lifecycleFilter]);

  // Selecting (or clearing) a barangay reframes the camera: to that
  // boundary's extent when selected, back to the full city when cleared.
  // In lockedView mode, the camera framing stays locked to the full city.
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer(SELECTED_LAYER_ID)) return;
    map.setFilter(SELECTED_LAYER_ID, [
      '==',
      ['get', 'psgc_code'],
      selectedPsgc ?? '',
    ]);

    if (lockedView) {
      return;
    }

    if (selectedPsgc === null) {
      map.fitBounds(boundsFromRings(cityBoundary.geometry.coordinates), {
        padding: 28,
        duration: 500,
      });
      return;
    }
    const boundary = boundaries.find(
      b => b.properties.psgc_code === selectedPsgc
    );
    if (boundary) {
      map.fitBounds(boundsFromRings(boundary.geometry.coordinates), {
        padding: 60,
        maxZoom: 15,
        duration: 500,
      });
    }
  }, [selectedPsgc, boundaries, cityBoundary, lockedView]);

  return (
    <div
      ref={containerRef}
      className={
        className ??
        'h-[26rem] w-full bg-gray-100 sm:h-[32rem] lg:h-full lg:min-h-[36rem]'
      }
      aria-label="Interactive barangay project distribution map"
    />
  );
}
