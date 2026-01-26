<script lang="ts">
  import Map from './lib/components/Map.svelte';
  import TimeSlider from './lib/components/TimeSlider.svelte';
  import EventInfo from './lib/components/EventInfo.svelte';
  import NarrativePlayer from './lib/components/NarrativePlayer.svelte';
  import StepCard from './lib/components/StepCard.svelte';
  import ControlBar from './lib/components/ControlBar.svelte';
  import CuratedSection from './lib/components/CuratedSection.svelte';
  import { isNarrativeMode } from './lib/stores/narrative';
  import type { HHEpisode } from './lib/data/hardcoreHistory';

  let mapComponent: Map;
  let episodesOpen = false;
  let narrativesOpen = false;
  let bordersOpen = false;

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
    }
  }

  function toggleNarratives() {
    narrativesOpen = !narrativesOpen;
    if (narrativesOpen) {
      episodesOpen = false;
      bordersOpen = false;
    }
  }

  function toggleBorders() {
    bordersOpen = !bordersOpen;
    if (bordersOpen) {
      episodesOpen = false;
      narrativesOpen = false;
    }
  }
</script>

<main>
  <Map bind:this={mapComponent} />

  <!-- Curated Section (top-left) -->
  <CuratedSection
    {episodesOpen}
    on:openEpisodes={toggleEpisodes}
    on:episodeSelect={handleEpisodeSelect}
  />

  <!-- Control Bar (top-right) -->
  <ControlBar
    {narrativesOpen}
    {bordersOpen}
    on:openNarratives={toggleNarratives}
    on:openBorders={toggleBorders}
    on:toggleBorders={handleToggleBorders}
    on:opacityChange={handleOpacityChange}
  />

  <!-- Conditionally show narrative UI or regular UI -->
  {#if $isNarrativeMode}
    <!-- Narrative Mode -->
    <NarrativePlayer />
    <StepCard />
  {:else}
    <!-- Free Explore Mode -->
    <EventInfo {episodesOpen} />
    <TimeSlider hideOnMobile={episodesOpen || narrativesOpen || bordersOpen} />
  {/if}

  <!-- Credits footer -->
  <div class="credits-footer">
    <a href="https://github.com/aourednik/historical-basemaps" target="_blank" rel="noopener">
      Historical Borders
    </a>
    <span>•</span>
    <a href="https://carto.com/" target="_blank" rel="noopener">
      CartoDB
    </a>
    <span>•</span>
    <a href="https://www.dancarlin.com/hardcore-history-series/" target="_blank" rel="noopener">
      Hardcore History
    </a>
  </div>
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .credits-footer {
    position: fixed;
    bottom: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    opacity: 0.4;
    transition: opacity 0.2s;
    z-index: 100;
  }

  .credits-footer:hover {
    opacity: 0.8;
  }

  .credits-footer a {
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.2s;
  }

  .credits-footer a:hover {
    color: #60a5fa;
  }

  .credits-footer span {
    color: #64748b;
  }
</style>
