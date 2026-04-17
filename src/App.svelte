<script lang="ts">
  import Map from './lib/components/Map.svelte';
  import TimeSlider from './lib/components/TimeSlider.svelte';
  import EventInfo from './lib/components/EventInfo.svelte';
  import NarrativePlayer from './lib/components/NarrativePlayer.svelte';
  import StepCard from './lib/components/StepCard.svelte';
  import ControlBar from './lib/components/ControlBar.svelte';
  import CuratedSection from './lib/components/CuratedSection.svelte';
  import AreaNarrativeDialog from './lib/components/AreaNarrativeDialog.svelte';
  import { isNarrativeMode, narrative } from './lib/stores/narrative';
  import { detectArea, type DetectedArea } from './lib/utils/areaDetection';
  import type { HHEpisode } from './lib/data/hardcoreHistory';
  import type L from 'leaflet';
  import { onMount } from 'svelte';

  let mapComponent: Map;
  let episodesOpen = false;
  let narrativesOpen = false;
  let bordersOpen = false;
  let placesOpen = false;

  let tick = 0;
  let resolving = false;
  let resolvingTimer: ReturnType<typeof setTimeout> | null = null;

  function fireReveal() {
    tick += 1;
    resolving = true;
    if (resolvingTimer) clearTimeout(resolvingTimer);
    resolvingTimer = setTimeout(() => { resolving = false; }, 900);
  }

  let mouseFrame = 0;
  function handleMouseMove(e: MouseEvent) {
    if (mouseFrame) return;
    const { clientX, clientY } = e;
    mouseFrame = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--mx', `${clientX}px`);
      document.documentElement.style.setProperty('--my', `${clientY}px`);
      mouseFrame = 0;
    });
  }

  onMount(() => {
    fireReveal();
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseFrame) cancelAnimationFrame(mouseFrame);
    };
  });

  let areaDialogArea: DetectedArea | null = null;
  let areaDialogPosition = { x: 0, y: 0 };
  let clickSeq = 0;

  async function handleMapClick(event: CustomEvent<{ latlng: L.LatLng; containerPoint: L.Point }>) {
    const { latlng, containerPoint } = event.detail;
    const seq = ++clickSeq;

    // Close open panels
    episodesOpen = false;
    narrativesOpen = false;
    bordersOpen = false;
    placesOpen = false;

    areaDialogPosition = { x: containerPoint.x, y: containerPoint.y };

    try {
      const layers = mapComponent?.getBorderLayers() || [];
      const result = await detectArea(latlng, layers);
      if (seq !== clickSeq) return; // stale click, discard
      areaDialogArea = result;
    } catch {
      if (seq === clickSeq) areaDialogArea = null;
    }
  }

  function handleNarrativeLoaded(event: CustomEvent<{ id: string }>) {
    narrative.loadNarrative(event.detail.id);
    areaDialogArea = null;
    fireReveal();
  }

  function handleEpisodeSelect(event: CustomEvent<HHEpisode>) {
    const episode = event.detail;
    mapComponent?.flyTo(episode.center[0], episode.center[1], episode.zoom);
  }

  function handleToggleBorders() {
    mapComponent?.toggleBorders();
  }

  function handleOpacityChange(event: CustomEvent<number>) {
    mapComponent?.setBorderOpacity(event.detail);
  }

  function toggleEpisodes() {
    episodesOpen = !episodesOpen;
    if (episodesOpen) {
      narrativesOpen = false;
      bordersOpen = false;
      placesOpen = false;
      fireReveal();
    }
  }

  function toggleNarratives() {
    narrativesOpen = !narrativesOpen;
    if (narrativesOpen) {
      episodesOpen = false;
      bordersOpen = false;
      placesOpen = false;
      fireReveal();
    }
  }

  function toggleBorders() {
    bordersOpen = !bordersOpen;
    if (bordersOpen) {
      episodesOpen = false;
      narrativesOpen = false;
      placesOpen = false;
      fireReveal();
    }
  }

  function togglePlaces() {
    placesOpen = !placesOpen;
    if (placesOpen) {
      episodesOpen = false;
      narrativesOpen = false;
      bordersOpen = false;
      fireReveal();
    }
  }
</script>

<main>
  <Map bind:this={mapComponent} on:mapClick={handleMapClick} />

  <div class="scriptorium-topbar">
    <span class="topbar-left">&#x2756; Historia Narrativa</span>
    <span class="topbar-center">&mdash; SCRIPTORIUM EDITION &mdash;</span>
    <span class="topbar-right">MMXXVI &middot; Folio I</span>
  </div>

  {#key tick}
    <CuratedSection
      {episodesOpen}
      on:openEpisodes={toggleEpisodes}
      on:closeEpisodes={() => episodesOpen = false}
      on:episodeSelect={handleEpisodeSelect}
    />
  {/key}

  {#key tick}
    <ControlBar
      {narrativesOpen}
      {bordersOpen}
      {placesOpen}
      on:openNarratives={toggleNarratives}
      on:openBorders={toggleBorders}
      on:openPlaces={togglePlaces}
      on:closeNarratives={() => narrativesOpen = false}
      on:closeBorders={() => bordersOpen = false}
      on:closePlaces={() => placesOpen = false}
      on:toggleBorders={handleToggleBorders}
      on:opacityChange={handleOpacityChange}
      on:flyTo={e => mapComponent?.flyTo(e.detail.lat, e.detail.lng, e.detail.zoom)}
    />
  {/key}

  {#if $isNarrativeMode}
    {#key tick}
      <NarrativePlayer />
      <StepCard />
    {/key}
  {:else}
    <EventInfo {episodesOpen} />
    <TimeSlider />
  {/if}

  {#if areaDialogArea && !$isNarrativeMode}
    <AreaNarrativeDialog
      area={areaDialogArea}
      screenPosition={areaDialogPosition}
      on:close={() => areaDialogArea = null}
      on:narrativeLoaded={handleNarrativeLoaded}
    />
  {/if}

  {#if resolving}
    <div class="resolving-chip" aria-hidden="true">
      resolving <span class="dither-chip"></span>
    </div>
  {/if}

  <div class="credits-footer">
    <a href="https://github.com/aourednik/historical-basemaps" target="_blank" rel="noopener">
      Historical Borders
    </a>
    <span>&#9830;</span>
    <a href="https://carto.com/" target="_blank" rel="noopener">
      CartoDB
    </a>
    <span>&#9830;</span>
    <a href="https://www.dancarlin.com/hardcore-history-series/" target="_blank" rel="noopener">
      Hardcore History
    </a>
  </div>

  <div class="dither-layer"></div>
  <div class="scanlines"></div>
  <div class="crt-flicker"></div>
  <div class="vignette"></div>
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .scriptorium-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 24px;
    background: var(--parchment);
    border-bottom: 2px solid var(--ink);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-faded);
    z-index: 1150;
    pointer-events: none;
  }

  .scriptorium-topbar .topbar-center {
    font-family: var(--font-pixel);
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--ink);
  }

  .scriptorium-topbar .topbar-left,
  .scriptorium-topbar .topbar-right {
    font-family: var(--font-mono);
  }

  @media (max-width: 768px) {
    .scriptorium-topbar .topbar-center {
      display: none;
    }
    .scriptorium-topbar {
      font-size: 9px;
      padding: 8px 12px;
    }
  }

  .resolving-chip {
    position: fixed;
    top: 46px;
    right: 20px;
    z-index: 1160;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-faded);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .resolving-chip :global(.dither-chip) {
    width: 60px;
  }

  .credits-footer {
    position: fixed;
    bottom: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-faded);
    opacity: 0.75;
    transition: opacity 0.2s;
    z-index: 100;
  }

  .credits-footer:hover {
    opacity: 1;
  }

  .credits-footer a {
    color: var(--ink);
    text-decoration: none;
  }

  .credits-footer a:hover {
    color: var(--rubric);
  }

  .credits-footer span {
    color: var(--ink-faded);
  }

  @media (max-width: 768px) {
    .credits-footer {
      display: none;
    }
  }
</style>
