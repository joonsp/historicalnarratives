<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import EpisodePanel from './EpisodePanel.svelte';
  import type { HHEpisode } from '../data/hardcoreHistory';

  const dispatch = createEventDispatcher<{
    openEpisodes: void;
    episodeSelect: HHEpisode;
    closeEpisodes: void;
  }>();

  export let episodesOpen = false;

  function handleEpisodeSelect(event: CustomEvent<HHEpisode>) {
    dispatch('episodeSelect', event.detail);
  }
</script>

<div class="curated-section glass">
  <div class="section-label">&#9670; Curated</div>
  <button
    class="curated-btn"
    class:active={episodesOpen}
    on:click={() => dispatch('openEpisodes')}
    title="Hardcore History Episodes"
  >
    HH Episodes
  </button>
</div>

<!-- Panel rendered outside .glass to avoid backdrop-filter containing block on mobile -->
{#if episodesOpen}
  <div class="panel-area-left">
    <EpisodePanel isOpen={episodesOpen} on:episodeSelect={handleEpisodeSelect} on:close={() => dispatch('closeEpisodes')} />
  </div>
{/if}

<style>
  .curated-section {
    position: fixed;
    top: 54px;
    left: 20px;
    padding: 0.75rem;
    z-index: 1100;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .section-label {
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--rubric);
    margin-bottom: 0.4rem;
  }

  .curated-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 10px 14px;
    background: var(--parchment);
    border: 2px solid var(--ink);
    color: var(--ink);
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
    white-space: nowrap;
  }

  .curated-btn:hover,
  .curated-btn:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .curated-btn.active {
    background: var(--ink);
    color: var(--parchment);
  }

  .curated-btn.active:hover {
    background: var(--rubric);
  }

  .panel-area-left {
    position: fixed;
    top: 140px;
    left: 20px;
    z-index: 1100;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .curated-section {
      top: 44px;
      left: 10px;
      padding: 0.5rem;
      gap: 0.375rem;
    }

    .section-label {
      font-size: 9px;
    }

    .curated-btn {
      padding: 0.5rem 0.75rem;
      font-size: 9px;
      min-width: 44px;
      min-height: 44px;
    }

    .panel-area-left {
      top: 110px;
      left: 10px;
      right: 10px;
      bottom: 0;
    }
  }
</style>
