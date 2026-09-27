<script lang="ts">
  import Map from './lib/components/Map.svelte';
  import TimeSlider from './lib/components/TimeSlider.svelte';
  import EventInfo from './lib/components/EventInfo.svelte';
  import NarrativePlayer from './lib/components/NarrativePlayer.svelte';
  import StepCard from './lib/components/StepCard.svelte';
  import ControlBar from './lib/components/ControlBar.svelte';
  import AreaNarrativeDialog from './lib/components/AreaNarrativeDialog.svelte';
  import { isNarrativeMode, narrative } from './lib/stores/narrative';
  import { detectArea, type DetectedArea } from './lib/utils/areaDetection';
  import type L from 'leaflet';
  import { onMount } from 'svelte';
  import { fireReveal, revealTick as tick, resolving } from './lib/stores/reveal';
  import AtlasFrame from './lib/components/AtlasFrame.svelte';

  let mapComponent: Map;
  let narrativesOpen = false;
  let bordersOpen = false;
  let placesOpen = false;

  // Cursor position for the dither overlay's clear-hole mask. Set on the
  // overlay itself: on <html> the inherited custom props would restyle every
  // element (thousands of map paths) on each mouse move.
  let ditherLayer: HTMLDivElement;
  let mouseFrame = 0;
  function handleMouseMove(e: MouseEvent) {
    if (mouseFrame) return;
    const { clientX, clientY } = e;
    mouseFrame = requestAnimationFrame(() => {
      ditherLayer?.style.setProperty('--mx', `${clientX}px`);
      ditherLayer?.style.setProperty('--my', `${clientY}px`);
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

  function handleToggleBorders() {
    mapComponent?.toggleBorders();
  }

  function handleOpacityChange(event: CustomEvent<number>) {
    mapComponent?.setBorderOpacity(event.detail);
  }

  function toggleNarratives() {
    narrativesOpen = !narrativesOpen;
    if (narrativesOpen) {
      bordersOpen = false;
      placesOpen = false;
      fireReveal();
    }
  }

  function toggleBorders() {
    bordersOpen = !bordersOpen;
    if (bordersOpen) {
      narrativesOpen = false;
      placesOpen = false;
      fireReveal();
    }
  }

  function togglePlaces() {
    placesOpen = !placesOpen;
    if (placesOpen) {
      narrativesOpen = false;
      bordersOpen = false;
      fireReveal();
    }
  }
</script>

<main>
  <Map bind:this={mapComponent} on:mapClick={handleMapClick} />
  <AtlasFrame />

  <div class="scriptorium-topbar">
    <span class="topbar-left">&#x2756; Historia Narrativa</span>
    <span class="topbar-center">&mdash; SCRIPTORIUM EDITION &mdash;</span>
    <span class="topbar-right">MMXXVI &middot; Folio I</span>
  </div>

  {#key $tick}
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
    {#key $tick}
      <NarrativePlayer />
      <StepCard />
    {/key}
  {:else}
    <EventInfo />
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

  {#if $resolving}
    <div class="resolving-chip" aria-hidden="true">
      resolving <span class="dither-chip"></span>
    </div>
  {/if}


  <div class="dither-layer" bind:this={ditherLayer}></div>
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

  /* Sits in the top bar, left of the folio mark */
  .resolving-chip {
    position: fixed;
    top: 11px;
    right: 190px;
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
</style>
