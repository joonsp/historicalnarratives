<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import { timeline } from '../stores/timeline';
  import { narrative, currentStep, isNarrativeMode } from '../stores/narrative';
  import {
    historicalEvents,
    getEventsForYear,
    loadBordersForYear,
    findClosestSnapshot,
    getEmpireColor
  } from '../data/borders';
  import type { HistoricalEvent, BorderCollection, BorderFeature } from '../data/borders';
  import type { NarrativeStep } from '../data/narrativeTimelines';
  import { getNarrativeById } from '../data/narrativeTimelines';
  import { track } from '../stores/reveal';
  import { toRoman, formatYear, eventGlyph, waxSealSvg, waxSealSize, SEAL_COLORS } from '../utils/scriptorium';

  const dispatch = createEventDispatcher<{
    mapClick: { latlng: L.LatLng; containerPoint: L.Point };
  }>();

  let mapContainer: HTMLDivElement;
  let map: L.Map;
  let eventMarkers: L.Marker[] = [];

  // Narrative visualization
  let narrativeMarkers: L.Marker[] = [];
  let narrativePath: L.Polyline | null = null;
  let currentStepMarker: L.Marker | null = null;

  // Border state
  let borderLayers: L.GeoJSON[] = [];
  let currentBorderYear: number | null = null;
  let borderCache = new Map<number, L.GeoJSON>();
  let canvasRenderer: L.Canvas;
  let bordersEnabled = true; // Enabled by default
  let borderOpacity = 0.25;

  function createEventIcon(event: HistoricalEvent): L.DivIcon {
    const type = event.type || 'battle';
    const colors = SEAL_COLORS[type] ?? SEAL_COLORS.battle;
    const r = 11;
    const size = waxSealSize(r);
    return L.divIcon({
      className: 'wax-pin',
      html: waxSealSvg({ label: eventGlyph(type), r, pixel: false, fontSize: 11, ...colors }),
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  /** Two-line ink tooltip: amber "N° · year" over an italic serif title. */
  function sealTooltip(head: string, title: string): string {
    return `<div class="seal-tooltip-head">${head}</div><div class="seal-tooltip-title">${title}</div>`;
  }

  function updateMarkers(year: number) {
    // Clear existing markers
    eventMarkers.forEach(m => m.remove());
    eventMarkers = [];

    // Get events near this year
    const events = getEventsForYear(year, 5);

    events.forEach(event => {
      const marker = L.marker([event.location[0], event.location[1]], {
        icon: createEventIcon(event),
      });

      const yearStr = formatYear(event.year);

      marker.bindTooltip(sealTooltip(`${event.type} · ${yearStr}`, event.name), {
        direction: 'top',
        offset: [0, -14],
        className: 'seal-tooltip',
      });

      marker.bindPopup(`
        <div style="min-width: 200px; color: var(--ink);">
          <h3 style="margin: 0 0 8px; font-family: var(--font-pixel); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink);">${event.name}</h3>
          <p style="margin: 0 0 8px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faded);">${yearStr}</p>
          <p class="drop-cap" style="margin: 0 0 12px; font-family: var(--font-serif); color: var(--ink-2); line-height: 1.5;">${event.description}</p>
          ${event.wikipediaUrl ? `<a href="${event.wikipediaUrl}" target="_blank" style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--rubric); text-decoration: underline;">Learn more →</a>` : ''}
        </div>
      `);

      marker.addTo(map);
      eventMarkers.push(marker);
    });
  }

  export function flyTo(lat: number, lng: number, zoom: number) {
    if (map) {
      map.flyTo([lat, lng], zoom, { duration: 1.5 });
    }
  }

  // === Narrative Mode Functions ===

  /**
   * Create a custom marker for narrative steps
   */
  function createNarrativeStepMarker(step: NarrativeStep, isCurrent: boolean = false): L.DivIcon {
    const r = isCurrent ? 16 : 11;
    const size = waxSealSize(r);
    const colors = isCurrent
      ? { fill: '#8a6a2b', shade: '#5a4320', highlight: '#b8923f' }
      : SEAL_COLORS.battle;

    return L.divIcon({
      className: `wax-pin${isCurrent ? ' wax-pin--active' : ''}`,
      html: waxSealSvg({ label: toRoman(step.sequenceNumber), r, ...colors }),
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  /**
   * Animate to a narrative step
   */
  function animateToStep(step: NarrativeStep) {
    if (!map || !step) return;

    const { location, mapZoom, transitionType, transitionDuration } = step;
    const duration = (transitionDuration || 2) * (1 / $narrative.transitionSpeed);

    // Remove previous current step marker
    if (currentStepMarker) {
      currentStepMarker.remove();
      currentStepMarker = null;
    }

    // Perform map animation
    switch (transitionType) {
      case 'fly':
        map.flyTo(location, mapZoom, {
          duration: duration,
          easeLinearity: 0.25
        });
        break;
      case 'pan':
        map.panTo(location, { duration: duration });
        setTimeout(() => {
          if (map) map.setZoom(mapZoom, { duration: duration * 0.5 });
        }, duration * 500);
        break;
      case 'zoom':
        map.setView(location, mapZoom, { duration: duration });
        break;
    }

    // Add current step marker
    const marker = L.marker(location, {
      icon: createNarrativeStepMarker(step, true),
      zIndexOffset: 1000
    });

    const yearStr = formatYear(step.year);

    marker.bindPopup(`
      <div style="min-width: 250px; max-width: 350px; color: var(--ink);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; gap: 8px;">
          <h3 style="margin: 0; font-family: var(--font-pixel); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); line-height: 1.3;">${step.title}</h3>
          <span style="
            background: var(--rubric);
            color: var(--parchment);
            padding: 2px 8px;
            border: 1px solid var(--ink);
            font-family: var(--font-pixel);
            font-size: 10px;
            letter-spacing: 0.05em;
            white-space: nowrap;
          " aria-label="Step ${step.sequenceNumber}">N° ${toRoman(step.sequenceNumber)}</span>
        </div>
        <p style="margin: 0 0 8px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faded);">${yearStr}</p>
        <p class="drop-cap" style="margin: 0 0 12px; font-family: var(--font-serif); color: var(--ink-2); line-height: 1.5;">${step.description}</p>
        ${step.links && step.links.length > 0 ? `
          <div style="border-top: 1px dotted var(--ink-faded); padding-top: 12px;">
            ${step.links.map(link => `
              <a href="${link.url}" target="_blank" style="
                font-family: var(--font-mono);
                font-size: 11px;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: var(--rubric);
                text-decoration: underline;
                text-underline-offset: 2px;
                display: block;
                margin-top: 4px;
              ">${link.title} →</a>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `, {
      autoPan: false // Don't auto-pan when opening popup in narrative mode
    });

    marker.addTo(map);
    currentStepMarker = marker;

    // Auto-open popup
    setTimeout(() => {
      if (marker) marker.openPopup();
    }, duration * 1000 + 200);
  }

  /**
   * Draw journey path connecting all narrative steps
   */
  function drawNarrativePath(steps: NarrativeStep[]) {
    if (!map || !steps || steps.length < 2) return;

    // Remove existing path
    if (narrativePath) {
      narrativePath.remove();
      narrativePath = null;
    }

    const coordinates = steps.map(s => s.location as [number, number]);

    narrativePath = L.polyline(coordinates, {
      color: '#2b1d10',
      weight: 2,
      opacity: 0.75,
      dashArray: '3, 6',
      className: 'narrative-path'
    }).addTo(map);

    // Small seal for every step; the current step's large seal sits on top
    clearNarrativeMarkers();
    steps.forEach((step, index) => {
      const marker = L.marker(step.location, {
        icon: createNarrativeStepMarker(step, false),
        zIndexOffset: 100 + index
      });

      marker.bindTooltip(sealTooltip(`N° ${toRoman(step.sequenceNumber)} · ${formatYear(step.year)}`, step.title), {
        direction: 'top',
        offset: [0, -14],
        className: 'seal-tooltip',
      });

      marker.on('click', () => {
        narrative.jumpToStep(index);
      });

      marker.addTo(map);
      narrativeMarkers.push(marker);
    });
  }

  /**
   * Clear all narrative markers
   */
  function clearNarrativeMarkers() {
    narrativeMarkers.forEach(m => m.remove());
    narrativeMarkers = [];
  }

  /**
   * Clear all narrative visualization
   */
  function clearNarrativeVisualization() {
    clearNarrativeMarkers();

    if (currentStepMarker) {
      currentStepMarker.remove();
      currentStepMarker = null;
    }

    if (narrativePath) {
      narrativePath.remove();
      narrativePath = null;
    }
  }

  export function toggleBorders() {
    bordersEnabled = !bordersEnabled;
    if (bordersEnabled) {
      // Re-render borders for current year
      const state = $timeline;
      updateBorders(state.year);
    } else {
      // Remove all border layers
      borderLayers.forEach(layer => layer.remove());
      borderLayers = [];
    }
  }

  export function setBorderOpacity(opacity: number) {
    borderOpacity = Math.max(0, Math.min(1, opacity));
    // Update existing layers
    borderLayers.forEach(layer => {
      layer.setStyle(() => getStyleOptions());
    });
  }

  export function getBorderLayers(): L.GeoJSON[] {
    return borderLayers;
  }

  function getStyleOptions(feature?: any): L.PathOptions {
    if (!feature || !feature.properties) {
      return {
        fillColor: '#6b4a26',
        fillOpacity: borderOpacity,
        color: '#6b4a26',
        weight: 1,
        opacity: borderOpacity * 2.5,
      };
    }

    const name = feature.properties.name || '';
    const baseColor = feature.properties.color || getEmpireColor(name);

    return {
      fillColor: baseColor,
      fillOpacity: borderOpacity,
      color: baseColor,
      weight: 1,
      opacity: borderOpacity * 2.5, // Stroke slightly more opaque
    };
  }

  function onEachBorderFeature(feature: any, layer: L.Layer) {
    if (feature?.properties?.name) {
      const name = feature.properties.name;
      const year = feature.properties.year;
      const yearStr = year && year < 0 ? `${Math.abs(year)} BCE` : year ? `${year} CE` : '';

      layer.bindTooltip(`
        <div class="border-tooltip">
          <strong>${name}</strong>
          ${yearStr ? `<br><span style="font-size: 11px; opacity: 0.8;">${yearStr}</span>` : ''}
        </div>
      `, {
        sticky: true,
        className: 'custom-border-tooltip'
      });

      // Highlight on hover
      layer.on('mouseover', function(this: L.Path) {
        this.setStyle({
          fillOpacity: borderOpacity * 1.8,
          weight: 2
        });
      });

      layer.on('mouseout', function(this: L.Path) {
        this.setStyle(getStyleOptions(feature));
      });

      // Forward clicks to map so area dialog works on border polygons
      layer.on('click', function(e: L.LeafletMouseEvent) {
        map?.fire('click', e);
      });
    }
  }

  async function updateBorders(year: number) {
    if (!bordersEnabled) return;

    const snapshot = findClosestSnapshot(year);

    // No borders for this time period
    if (!snapshot) {
      borderLayers.forEach(layer => layer.remove());
      borderLayers = [];
      currentBorderYear = null;
      return;
    }

    // Same snapshot, no need to update
    if (currentBorderYear === snapshot.year) return;

    // Remove current borders
    borderLayers.forEach(layer => layer.remove());
    borderLayers = [];

    // Check cache first
    let layer = borderCache.get(snapshot.year);

    if (!layer) {
      // Load new borders
      const data = await track(loadBordersForYear(year), { reveal: false });
      if (!data || !data.features || data.features.length === 0) {
        currentBorderYear = snapshot.year;
        return;
      }

      // Create GeoJSON layer with styling and renderer
      layer = L.geoJSON(data, {
        style: getStyleOptions,
        onEachFeature: onEachBorderFeature,
        // @ts-ignore - renderer is valid but not in type definitions
        renderer: canvasRenderer
      });

      // Cache the layer (limit cache size to 5 snapshots)
      if (borderCache.size >= 5) {
        const firstKey = borderCache.keys().next().value as number;
        if (firstKey !== undefined) {
          const oldLayer = borderCache.get(firstKey);
          if (oldLayer) {
            oldLayer.remove();
          }
          borderCache.delete(firstKey);
        }
      }
      borderCache.set(snapshot.year, layer);
    }

    // Add to map
    if (map && layer) {
      layer.addTo(map);
      borderLayers.push(layer);
      currentBorderYear = snapshot.year;
    }
  }

  /** Dashed Ptolemaic graticule at ±30°/±60° latitude and every 60° longitude. */
  function addGraticule(renderer: L.Renderer) {
    const style: L.PolylineOptions = {
      renderer,
      pane: 'atlas',
      interactive: false,
      className: 'graticule',
      color: '#6b4a26',
      weight: 0.6,
      opacity: 0.4,
      dashArray: '2 4',
    };
    for (const lat of [-60, -30, 0, 30, 60]) {
      L.polyline([[lat, -180], [lat, 180]], style).addTo(map);
    }
    for (const lng of [-120, -60, 0, 60, 120]) {
      L.polyline([[-85, lng], [85, lng]], style).addTo(map);
    }
  }

  // Mono glyphs drifting in open water, plus one small ship.
  const seaDrifters: { glyph: string; at: [number, number]; dur: number }[] = [
    { glyph: '~~', at: [42, -38], dur: 45 },
    { glyph: '<><', at: [-28, -18], dur: 60 },
    { glyph: 'ooo', at: [22, -150], dur: 55 },
    { glyph: '≈≈', at: [-32, -115], dur: 38 },
    { glyph: '*', at: [-22, 78], dur: 70 },
    { glyph: 'ψ', at: [62, -14], dur: 50 },
    { glyph: '<><', at: [45.5, -9], dur: 52 },
    { glyph: '~~', at: [35.2, 18], dur: 42 },
    { glyph: '≈≈', at: [14, 62], dur: 48 },
  ];

  function addSeaDrifters() {
    const opts = (html: string): L.MarkerOptions => ({
      interactive: false,
      keyboard: false,
      zIndexOffset: -1000,
      icon: L.divIcon({ className: 'sea-drifter-icon', html, iconSize: [0, 0] }),
    });
    for (const d of seaDrifters) {
      L.marker(d.at, opts(`<span class="sea-drifter" style="--dur:${d.dur}s">${d.glyph}</span>`)).addTo(map);
    }
    L.marker([36, -30], opts('<svg class="sea-ship" width="16" height="14" viewBox="0 0 16 14"><path d="M8 0v10H2l6-10zM9 2l5 8H9z" fill="currentColor"/><path d="M0 11h16l-3 3H3z" fill="currentColor"/></svg>')).addTo(map);
  }

  onMount(() => {
    // Initialize Canvas renderer for better border performance
    canvasRenderer = L.canvas();

    // Initialize map
    map = L.map(mapContainer, {
      zoomControl: false,
      preferCanvas: true,
    }).setView([48.5, 10], 4);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Schematic atlas instead of raster tiles: dithered Natural Earth land on a
    // hatched parchment sea (see app.css + the <pattern> defs below).
    map.attributionControl.addAttribution(
      'Land: <a href="https://www.naturalearthdata.com/">Natural Earth</a> | Borders: <a href="https://github.com/aourednik/historical-basemaps">Ourednik</a> (GPL-3.0)'
    );
    map.createPane('atlas').style.zIndex = '250';
    const atlasRenderer = L.svg({ pane: 'atlas', padding: 0.5 });
    // The shimmer gets its own pane so its twinkle is a compositor-only opacity
    // animation on the pane; animating the paths themselves repaints the whole
    // land SVG several times a second.
    map.createPane('shimmer', map.getPane('atlas')).classList.add('shimmer-pane');
    const shimmerRenderer = L.svg({ pane: 'shimmer', padding: 0.5 });
    addGraticule(atlasRenderer);
    addSeaDrifters();
    track(fetch('/data/coastlines/ne_50m_land.geojson').then(r => r.ok ? r.json() : Promise.reject(r.statusText)), { reveal: false })
      .then((landGeo) => {
        if (!map) return;
        // Dithered land fill + ink outline, then a dotted shore shimmer on top
        L.geoJSON(landGeo, {
          pane: 'atlas',
          style: { renderer: atlasRenderer, interactive: false, className: 'atlas-land' },
        }).addTo(map);
        L.geoJSON(landGeo, {
          pane: 'shimmer',
          style: { renderer: shimmerRenderer, interactive: false, className: 'coast-shimmer' },
        }).addTo(map);
      })
      .catch((err) => console.warn('land layer failed to load', err));

    // Map click → area narrative dialog (skip in narrative mode)
    map.on('click', (e: L.LeafletMouseEvent) => {
      if ($isNarrativeMode) return;
      dispatch('mapClick', { latlng: e.latlng, containerPoint: e.containerPoint });
    });

    // Subscribe to timeline changes (only in free explore mode)
    const unsubscribeTimeline = timeline.subscribe(state => {
      if (!$isNarrativeMode) {
        updateMarkers(state.year);
        updateBorders(state.year);
      }
    });

    // Subscribe to narrative mode changes
    const unsubscribeNarrative = isNarrativeMode.subscribe(inNarrativeMode => {
      if (inNarrativeMode) {
        // Entering narrative mode: hide regular event markers
        eventMarkers.forEach(m => m.remove());
        eventMarkers = [];
      } else {
        // Exiting narrative mode: clear narrative visualization and restore events
        clearNarrativeVisualization();
        updateMarkers($timeline.year);
        updateBorders($timeline.year);
      }
    });

    // Subscribe to current step changes
    const unsubscribeCurrentStep = currentStep.subscribe(step => {
      if ($isNarrativeMode && step) {
        animateToStep(step);
      }
    });

    // Subscribe to narrative to draw path when narrative loads
    // Draw the dotted chronological route once, when a narrative loads.
    // (Reads the narrative directly: derived stores haven't updated yet here.)
    let drawnNarrativeId: string | null = null;
    const unsubscribeNarrativeState = narrative.subscribe(state => {
      if (!state.currentNarrativeId) {
        drawnNarrativeId = null;
        return;
      }
      if (state.currentNarrativeId === drawnNarrativeId) return;
      const steps = getNarrativeById(state.currentNarrativeId)?.steps ?? [];
      if (steps.length > 1) {
        drawNarrativePath(steps);
        drawnNarrativeId = state.currentNarrativeId;
      }
    });

    return () => {
      unsubscribeTimeline();
      unsubscribeNarrative();
      unsubscribeCurrentStep();
      unsubscribeNarrativeState();
    };
  });

  onDestroy(() => {
    // Clean up borders
    borderLayers.forEach(layer => layer.remove());
    borderCache.forEach(layer => layer.remove());
    borderCache.clear();

    if (map) {
      map.remove();
    }
  });
</script>

<div bind:this={mapContainer} class="map-container"></div>

<svg class="atlas-defs" width="0" height="0" aria-hidden="true">
  <defs>
    <pattern id="atlas-land" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="4" fill="#d9c9a3" />
      <circle cx="1" cy="1" r="0.7" fill="#2b1d10" opacity="0.4" />
      <rect x="2" y="2" width="1" height="1" fill="#2b1d10" opacity="0.3" />
    </pattern>
  </defs>
</svg>

<style>
  .atlas-defs {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
  }

  .map-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }

  /* Leaflet popup + tooltip + marker styles are defined globally in app.css.
     Only component-scoped overrides below. */

  /* Narrative mode styles */
  :global(.narrative-path) {
    animation: dash 1.5s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: -18;
    }
  }
</style>
