<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import EpisodePanel from './EpisodePanel.svelte';
  import type { HHEpisode } from '../data/hardcoreHistory';

  const dispatch = createEventDispatcher<{
    openEpisodes: void;
    episodeSelect: HHEpisode;
  }>();

  export let episodesOpen = false;

  function handleEpisodeSelect(event: CustomEvent<HHEpisode>) {
    dispatch('episodeSelect', event.detail);
  }
</script>

<div class="curated-section glass">
  <div class="section-label">Curated Stuff</div>
  <button
    class="curated-btn"
    class:active={episodesOpen}
    on:click={() => dispatch('openEpisodes')}
    title="Hardcore History Episodes"
  >
    🎙️ HH Episodes
  </button>

  {#if episodesOpen}
    <div class="panel-container">
      <EpisodePanel isOpen={episodesOpen} on:episodeSelect={handleEpisodeSelect} />
    </div>
  {/if}
</div>

<style>
  .curated-section {
    position: fixed;
    top: 20px;
    left: 20px;
    padding: 0.75rem;
    border-radius: 12px;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .section-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .curated-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #cbd5e1;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .curated-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
    color: #f1f5f9;
    transform: translateY(-2px);
  }

  .curated-btn.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
    color: #60a5fa;
  }

  .curated-btn.active:hover {
    background: rgba(59, 130, 246, 0.3);
  }

  .panel-container {
    margin-top: 0.5rem;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .curated-section {
      top: 10px;
      left: 10px;
      padding: 0.5rem;
      gap: 0.375rem;
    }

    .section-label {
      font-size: 0.625rem;
    }

    .curated-btn {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
    }
  }
</style>
