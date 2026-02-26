<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
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

  // Event type icons/colors
  const eventColors: Record<string, string> = {
    battle: '#ef4444',
    treaty: '#22c55e', 
    revolution: '#f97316',
    founding: '#3b82f6',
    collapse: '#8b5cf6',
  };

  function createEventIcon(event: HistoricalEvent): L.DivIcon {
    const color = eventColors[event.type] || '#ffffff';
    return L.divIcon({
      className: 'custom-event-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          cursor: pointer;
          transition: transform 0.2s;
        " class="event-dot">
          ${event.type === 'battle' ? '⚔️' : event.type === 'treaty' ? '📜' : event.type === 'revolution' ? '🔥' : event.type === 'founding' ? '🏛️' : '💀'}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
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

      const yearStr = event.year < 0 ? `${Math.abs(event.year)} BCE` : `${event.year} CE`;
      
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px; font-weight: bold; color: #1e293b;">${event.name}</h3>
          <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">${yearStr}</p>
          <p style="margin: 0 0 12px; color: #334155;">${event.description}</p>
          ${event.wikipediaUrl ? `<a href="${event.wikipediaUrl}" target="_blank" style="color: #3b82f6; text-decoration: none;">Learn more →</a>` : ''}
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
    const size = isCurrent ? 48 : 36;
    const pulseClass = isCurrent ? 'narrative-pulse' : '';

    return L.divIcon({
      className: 'narrative-step-marker',
      html: `
        <div class="step-marker ${pulseClass}" style="
          width: ${size}px;
          height: ${size}px;
          background: ${isCurrent ? '#3b82f6' : '#60a5fa'};
          border: ${isCurrent ? '4px' : '3px'} solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: ${isCurrent ? '18px' : '14px'};
          box-shadow: 0 4px 12px rgba(59, 130, 246, ${isCurrent ? '0.6' : '0.4'});
          position: relative;
          transition: all 0.3s ease;
        ">
          ${step.sequenceNumber}
          ${isCurrent ? '<div class="pulse"></div>' : ''}
        </div>
      `,
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

    const yearStr = step.year < 0 ? `${Math.abs(step.year)} BCE` : `${step.year} CE`;

    marker.bindPopup(`
      <div style="min-width: 250px; max-width: 350px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <h3 style="margin: 0; font-weight: bold; color: #1e293b;">${step.title}</h3>
          <span style="
            background: #3b82f6;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            margin-left: 8px;
          ">#${step.sequenceNumber}</span>
        </div>
        <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">${yearStr}</p>
        <p style="margin: 0 0 12px; color: #334155; line-height: 1.5;">${step.description}</p>
        ${step.links && step.links.length > 0 ? `
          <div style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
            ${step.links.map(link => `
              <a href="${link.url}" target="_blank" style="
                color: #3b82f6;
                text-decoration: none;
                display: block;
                margin-top: 4px;
                font-size: 13px;
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
      color: '#60a5fa',
      weight: 3,
      opacity: 0.6,
      dashArray: '10, 10',
      className: 'narrative-path'
    }).addTo(map);

    // Add markers for each step (except current)
    clearNarrativeMarkers();
    steps.forEach((step, index) => {
      if (index !== $narrative.currentStepIndex) {
        const marker = L.marker(step.location, {
          icon: createNarrativeStepMarker(step, false),
          zIndexOffset: 100 + index
        });

        const yearStr = step.year < 0 ? `${Math.abs(step.year)} BCE` : `${step.year} CE`;

        marker.bindTooltip(`
          <strong>#${step.sequenceNumber}: ${step.title}</strong><br>
          <span style="font-size: 11px; opacity: 0.8;">${yearStr}</span>
        `, {
          direction: 'top',
          offset: [0, -20]
        });

        marker.on('click', () => {
          narrative.jumpToStep(index);
        });

        marker.addTo(map);
        narrativeMarkers.push(marker);
      }
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

  function getStyleOptions(feature?: any): L.PathOptions {
    if (!feature || !feature.properties) {
      return {
        fillColor: '#78909c',
        fillOpacity: borderOpacity,
        color: '#78909c',
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
      const data = await loadBordersForYear(year);
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

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> | Borders: <a href="https://github.com/aourednik/historical-basemaps">Ourednik</a> (GPL-3.0)',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

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
    const unsubscribeNarrativeState = narrative.subscribe(state => {
      if (state.currentNarrativeId && state.currentStepIndex === 0) {
        const currentNarrative = $currentStep;
        if (currentNarrative) {
          // Get all steps from the narrative
          const narrativeId = state.currentNarrativeId;
          const allSteps = Array.from({ length: 20 }, (_, i) => {
            const n = getNarrativeById(narrativeId);
            return n?.steps[i];
          }).filter(Boolean) as NarrativeStep[];

          if (allSteps.length > 1) {
            drawNarrativePath(allSteps);
          }
        }
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

<style>
  .map-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }

  :global(.leaflet-popup-content-wrapper) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  :global(.leaflet-popup-tip) {
    background: rgba(255, 255, 255, 0.95);
  }

  :global(.event-dot:hover) {
    transform: scale(1.2);
  }

  :global(.custom-border-tooltip) {
    background: rgba(30, 41, 59, 0.95) !important;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    color: #f1f5f9;
    font-size: 13px;
  }

  :global(.custom-border-tooltip .leaflet-tooltip-left::before) {
    border-left-color: rgba(30, 41, 59, 0.95);
  }

  :global(.custom-border-tooltip .leaflet-tooltip-right::before) {
    border-right-color: rgba(30, 41, 59, 0.95);
  }

  /* Narrative mode styles */
  :global(.narrative-step-marker) {
    background: transparent !important;
    border: none !important;
  }

  :global(.step-marker) {
    position: relative;
    cursor: pointer;
  }

  :global(.step-marker:hover) {
    transform: scale(1.1);
  }

  :global(.narrative-pulse .pulse) {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #3b82f6;
    opacity: 0;
    animation: pulse 2s ease-out infinite;
    pointer-events: none;
    top: 0;
    left: 0;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.5;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }

  :global(.narrative-path) {
    stroke-dasharray: 10, 10;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: -20;
    }
  }
</style>
