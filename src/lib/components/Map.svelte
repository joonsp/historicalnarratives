<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import { timeline } from '../stores/timeline';
  import {
    historicalEvents,
    getEventsForYear,
    loadBordersForYear,
    findClosestSnapshot,
    getEmpireColor
  } from '../data/borders';
  import type { HistoricalEvent, BorderCollection, BorderFeature } from '../data/borders';

  let mapContainer: HTMLDivElement;
  let map: L.Map;
  let eventMarkers: L.Marker[] = [];

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
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Subscribe to timeline changes
    const unsubscribe = timeline.subscribe(state => {
      updateMarkers(state.year);
      updateBorders(state.year);
    });

    return () => {
      unsubscribe();
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
</style>
