<script lang="ts">
  import Map from './lib/components/Map.svelte';
  import TimeSlider from './lib/components/TimeSlider.svelte';
  import EpisodePanel from './lib/components/EpisodePanel.svelte';
  import EventInfo from './lib/components/EventInfo.svelte';
  import BorderControls from './lib/components/BorderControls.svelte';
  import type { HHEpisode } from './lib/data/hardcoreHistory';

  let mapComponent: Map;

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
</script>

<main>
  <Map bind:this={mapComponent} />
  <EpisodePanel on:episodeSelect={handleEpisodeSelect} />
  <EventInfo />
  <TimeSlider />
  <BorderControls
    on:toggleBorders={handleToggleBorders}
    on:opacityChange={handleOpacityChange}
  />

  <div class="title-overlay glass">
    <h1>🗺️ HistoryMap</h1>
    <p>Explore history through time</p>
  </div>
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .title-overlay {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 12px;
    text-align: center;
    z-index: 999;
    pointer-events: none;
  }

  .title-overlay h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .title-overlay p {
    margin: 4px 0 0;
    font-size: 12px;
    opacity: 0.6;
  }
</style>
