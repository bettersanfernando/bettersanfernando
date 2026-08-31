import { useEffect, useRef } from 'react';
import {
  FullscreenControl,
  LngLatBounds,
  Map as MapLibreMap,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
  type LngLatBoundsLike,
  type MapLayerMouseEvent,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { BarangayFeature, CityFeature } from '../../data/civic/geography';
import type { BarangayProjectSummary } from '../../data/civic/projectMap';

const SOURCE_ID = 'barangay-project-distribution';
const FILL_LAYER_ID = 'barangay-project-fill';
const OUTLINE_LAYER_ID = 'barangay-project-outline';
const SELECTED_LAYER_ID = 'barangay-project-selected';

setWorkerUrl(mapLibreWorkerUrl);

interface BarangayProjectMapProps {
  boundaries: readonly BarangayFeature[];
  cityBoundary: CityFeature;
  summaries: readonly BarangayProjectSummary[];
  selectedPsgc: string | null;
  onSelect: (psgc: string) => void;
}

function getBounds(feature: CityFeature): LngLatBoundsLike {
  const bounds = new LngLatBounds();
  for (const ring of feature.geometry.coordinates) {
    for (const coordinate of ring) bounds.extend(coordinate);
  }
  return bounds;
}

export default function BarangayProjectMap({
  boundaries,
  cityBoundary,
  summaries,
  selectedPsgc,
  onSelect,
}: BarangayProjectMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const counts = new Map(summaries.map(item => [item.psgcCode, item]));
    const collection = {
      type: 'FeatureCollection' as const,
      features: boundaries.map(boundary => ({
        ...boundary,
        properties: {
          ...boundary.properties,
          project_count:
            counts.get(boundary.properties.psgc_code)?.projectCount ?? 0,
        },
      })),
    };
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
      bounds: getBounds(cityBoundary),
      fitBoundsOptions: { padding: 28 },
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      maxPitch: 0,
    });

    map.addControl(new NavigationControl({ showCompass: false }));
    map.addControl(new FullscreenControl());
    map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      map.addSource(SOURCE_ID, { type: 'geojson', data: collection });
      map.addLayer({
        id: FILL_LAYER_ID,
        type: 'fill',
        source: SOURCE_ID,
        paint: {
          'fill-color': [
            'step',
            ['get', 'project_count'],
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
          'fill-opacity': 0.86,
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
        paint: { 'line-color': '#ff4d00', 'line-width': 4 },
      });

      map.on('mousemove', FILL_LAYER_ID, (event: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = event.features?.[0];
        if (!feature) return;
        const name = String(feature.properties?.name ?? 'Barangay');
        const count = Number(feature.properties?.project_count ?? 0);
        map
          .getCanvas()
          .setAttribute(
            'aria-label',
            `${name}: ${count} project${count === 1 ? '' : 's'}`
          );
      });
      map.on('mouseleave', FILL_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
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
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [boundaries, cityBoundary, summaries]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer(SELECTED_LAYER_ID)) return;
    map.setFilter(SELECTED_LAYER_ID, [
      '==',
      ['get', 'psgc_code'],
      selectedPsgc ?? '',
    ]);
  }, [selectedPsgc]);

  return (
    <div
      ref={containerRef}
      className="h-[28rem] w-full bg-gray-100 sm:h-[36rem]"
      aria-label="Interactive barangay project distribution map"
    />
  );
}
