<script lang="ts">
  import { isNarrativeMode } from '../stores/narrative';
  import { createEventDispatcher } from 'svelte';
  import NarrativeLibrary from './NarrativeLibrary.svelte';
  import BorderControls from './BorderControls.svelte';
  import PlacesPanel from './PlacesPanel.svelte';

  const dispatch = createEventDispatcher<{
    openNarratives: void;
    openBorders: void;
    openPlaces: void;
    toggleBorders: void;
    opacityChange: number;
    flyTo: { lat: number; lng: number; zoom: number };
    closeNarratives: void;
    closeBorders: void;
    closePlaces: void;
  }>();

  export let narrativesOpen = false;
  export let bordersOpen = false;
  export let placesOpen = false;

  function handleToggleBorders() {
    dispatch('toggleBorders');
  }

  function handleOpacityChange(event: CustomEvent<number>) {
    dispatch('opacityChange', event.detail);
  }
</script>

<div class="control-bar glass">
  {#if !$isNarrativeMode}
    <div class="section-label">Narratives</div>
    <div class="button-row">
      <button
        class="control-btn"
        class:active={bordersOpen}
        on:click={() => dispatch('openBorders')}
        title="Historical Borders"
      >
        🗺️ <span class="btn-label">Borders</span>
      </button>

      <button
        class="control-btn"
        class:active={narrativesOpen}
        on:click={() => dispatch('openNarratives')}
        title="Historical Narratives"
      >
        📚 <span class="btn-label">Narratives</span>
      </button>

      <button
        class="control-btn"
        class:active={placesOpen}
        on:click={() => dispatch('openPlaces')}
        title="Explore Places"
      >
        📍 <span class="btn-label">Places</span>
      </button>
    </div>
  {/if}
</div>

<!-- Panels rendered outside .glass to avoid backdrop-filter containing block on mobile -->
{#if !$isNarrativeMode && (narrativesOpen || bordersOpen || placesOpen)}
  <div class="panel-area">
    {#if narrativesOpen}
      <NarrativeLibrary isOpen={narrativesOpen} on:close={() => dispatch('closeNarratives')} />
    {/if}
    {#if bordersOpen}
      <BorderControls
        isOpen={bordersOpen}
        on:toggleBorders={handleToggleBorders}
        on:opacityChange={handleOpacityChange}
        on:close={() => dispatch('closeBorders')}
      />
    {/if}
    {#if placesOpen}
      <PlacesPanel isOpen={placesOpen} on:flyTo on:close={() => dispatch('closePlaces')} />
    {/if}
  </div>
{/if}

<style>
  .control-bar {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: 12px;
    z-index: 1100;
    animation: slideIn 0.3s ease-out;
  }

  .section-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
    margin-bottom: 0.25rem;
    text-align: right;
  }

  .button-row {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .panel-area {
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 1099;
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
      min-width: 44px;
      min-height: 44px;
      justify-content: center;
    }

    .btn-label {
      display: none;
    }

    .panel-area {
      top: 100px;
      left: 10px;
      right: 10px;
      bottom: 0;
    }
  }
</style>
