# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HistoryMap is an interactive historical map web app built with Svelte 5 that visualizes historical events and integrates Dan Carlin's Hardcore History podcast metadata. Users can explore history through time using a timeline slider, view historical events on a map, and navigate to specific time periods via podcast episodes.

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

- **`hardcoreHistory.ts`**: Podcast episode metadata
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

- **`App.svelte`**: Root component orchestrating Map, TimeSlider, EpisodePanel, and EventInfo
  - Uses `bind:this={mapComponent}` to call `flyTo()` method on Map component
  - Listens to `on:episodeSelect` from EpisodePanel

- **`Map.svelte`**: Leaflet map with CartoDB dark tiles
  - Subscribes to timeline store and updates markers reactively
  - Creates custom DivIcon markers with emoji based on event type
  - Uses `updateMarkers()` to show/hide events based on current year

- **`TimeSlider.svelte`**: Timeline controls and keyboard shortcuts
  - Keyboard handlers: Space (play/pause), arrows (navigate), ↑↓ (speed)
  - Animation loop using `setInterval` with speed-based timing
  - Mode switcher for chronological vs. Hardcore History ordering

- **`EpisodePanel.svelte`**: Episode browser with filtering by mode
  - Dispatches `episodeSelect` custom events with episode data
  - Lists episodes sorted by release date or chronological period

- **`EventInfo.svelte`**: Info overlay for events and episodes

### Styling

- **Tailwind CSS v4** with Vite plugin (not PostCSS)
- Global glassmorphism styles in `src/app.css` (`.glass` class)
- Dark theme optimized for CartoDB dark tile layer
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
3. **Custom Leaflet markers**: DivIcon with inline styles, emoji-based event type indicators
4. **Component method calls**: Parent components use `bind:this` to call child methods directly
5. **Time-based filtering**: Events appear/disappear based on `getEventsForYear()` with ±2 year tolerance

## Future Enhancements (from README)

- Dynamic historical border overlays (GeoJSON)
- Deep linking for sharing specific moments
- Search across events and episodes
- Mobile gesture controls
