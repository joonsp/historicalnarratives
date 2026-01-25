<script lang="ts">
  import { isNarrativeMode } from '../stores/narrative';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    openEpisodes: void;
    openNarratives: void;
    openBorders: void;
  }>();

  export let episodesOpen = false;
  export let narrativesOpen = false;
  export let bordersOpen = false;
</script>

<div class="control-bar glass">
  {#if !$isNarrativeMode}
    <button
      class="control-btn"
      class:active={episodesOpen}
      on:click={() => dispatch('openEpisodes')}
      title="Hardcore History Episodes"
    >
      🎙️ <span class="btn-label">HH Episodes</span>
    </button>

    <button
      class="control-btn"
      class:active={narrativesOpen}
      on:click={() => dispatch('openNarratives')}
      title="Historical Narratives"
    >
      📚 <span class="btn-label">Narratives</span>
    </button>
  {/if}

  <button
    class="control-btn"
    class:active={bordersOpen}
    on:click={() => dispatch('openBorders')}
    title="Historical Borders"
  >
    🗺️ <span class="btn-label">Borders</span>
  </button>
</div>

<style>
  .control-bar {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 12px;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
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

  .control-btn {
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

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
    color: #f1f5f9;
    transform: translateY(-2px);
  }

  .control-btn.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
    color: #60a5fa;
  }

  .control-btn.active:hover {
    background: rgba(59, 130, 246, 0.3);
  }

  .btn-label {
    font-size: 0.875rem;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .control-bar {
      top: 10px;
      right: 10px;
      padding: 0.375rem;
      gap: 0.375rem;
    }

    .control-btn {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
    }

    .btn-label {
      display: none;
    }
  }
</style>
