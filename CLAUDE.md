# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Historical Narrative is an interactive historical map web app built with Svelte 5 that visualizes historical events and integrates Dan Carlin's Hardcore History podcast metadata. Users can explore history through time using a timeline slider, view historical events on a map, navigate to specific time periods via podcast episodes, and create AI-generated narrative journeys using Claude.

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type-check Svelte and TypeScript
npm run check
```

## Architecture

### State Management

The app uses Svelte stores (not Svelte 5 runes) for global state:

- **`src/lib/stores/timeline.ts`**: Central timeline store managing:
  - Current year (supports BCE with negative numbers)
  - Play/pause state and animation speed
  - Timeline mode: `'chronological'` | `'hh-release'` | `'hh-chronological'`
  - Year range: -1000 (1000 BCE) to 2026 CE
  - Store methods: `setYear()`, `togglePlay()`, `setMode()`, `stepForward()`, `stepBackward()`
  - Derived store `formattedYear` formats year as "X BCE" or "X CE"

### Data Layer

Historical data is static TypeScript objects in `src/lib/data/`:

- **`hardcoreHistory.ts`**: Podcast episode metadata (currently unused in the UI; the episode browser was removed)
  - `HHEpisode` interface with geographic coordinates, time periods, and episode details
  - Helper functions: `getEpisodesByReleaseDate()`, `getEpisodesByPeriod()`, `getEpisodeForYear()`
  - Episodes span from ancient Persia (-550) to WWII (1945)

- **`borders.ts`**: Historical events data
  - `HistoricalEvent` interface with type (`battle`, `treaty`, `revolution`, `founding`, `collapse`)
  - Event coordinates for Leaflet markers
  - Helper functions: `getEventsForYear()`, `getEventsInRange()`
  - Includes placeholder for future GeoJSON border overlays

### Components

Component communication uses Svelte events and component bindings:

- **`App.svelte`**: Root component orchestrating Map, TimeSlider, ControlBar, narrative player and EventInfo
  - Uses `bind:this={mapComponent}` to call `flyTo()` method on Map component

- **`Map.svelte`**: Leaflet map drawn as a schematic atlas (no raster tiles): Natural Earth land (`public/data/coastlines/ne_50m_land.geojson`) with a dithered SVG pattern fill, graticule, sea drifters
  - Subscribes to timeline store and updates markers reactively
  - Markers are SVG wax seals (`waxSealSvg()` in `src/lib/utils/scriptorium.ts`): glyph per event type, Roman numerals for narrative steps
  - Uses `updateMarkers()` to show/hide events based on current year

- **`TimeSlider.svelte`**: Timeline controls and keyboard shortcuts
  - Keyboard handlers: Space (play/pause), arrows (navigate), ↑↓ (speed)
  - Animation loop using `setInterval` with speed-based timing
  - Mode switcher for chronological vs. Hardcore History ordering

- **`EventInfo.svelte`**: "Nearby events" overlay for the current year

### Styling

- **Tailwind CSS v4** with Vite plugin (not PostCSS)
- "Scriptorium" design (sepia parchment + CRT): tokens, CRT overlays and the dither-reveal live in `src/app.css`; `.glass` is the parchment panel class and plays the reveal on mount
- Loader: `src/lib/stores/reveal.ts` — `fireReveal()` re-keys panels (page-change feel), `track(promise)` shows the "resolving" chip and replays the reveal in place without remounting
- No emoji/icon libraries: use the glyph repertoire (◆ ❖ ✺ ✽ etc.)
- Component-scoped styles in Svelte `<style>` blocks

## Tech Stack Details

- **Svelte 5.43.8**: Uses classic stores, not runes-based state
- **TypeScript 5.9.3**: Strict type checking enabled with `checkJs: true`
- **Leaflet 1.9.4**: Map library (import from `'leaflet'` with CSS import)
- **Vite 7.2.4**: Build tool with HMR
- **Tailwind CSS 4.1.18**: Via `@tailwindcss/vite` plugin

## Key Patterns

1. **Negative years for BCE**: Historical events before year 0 use negative numbers (e.g., -480 for 480 BCE)
2. **Store-first architecture**: Timeline state lives in the store, components subscribe and react
3. **Custom Leaflet markers**: DivIcon wrapping an SVG wax seal (glyph or Roman numeral imprint)
4. **Component method calls**: Parent components use `bind:this` to call child methods directly
5. **Time-based filtering**: Events appear/disappear based on `getEventsForYear()` with ±2 year tolerance

## Future Enhancements (from README)

- Dynamic historical border overlays (GeoJSON)
- Deep linking for sharing specific moments
- Search across events and episodes
- Mobile gesture controls
