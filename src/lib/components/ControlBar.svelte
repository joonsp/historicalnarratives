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
    <div class="section-label">&#9670; Archive</div>
    <div class="button-row">
      <button
        class="control-btn"
        class:active={bordersOpen}
        on:click={() => dispatch('openBorders')}
        title="Historical Borders"
      >
        <span class="btn-label">Borders</span>
      </button>

      <button
        class="control-btn"
        class:active={narrativesOpen}
        on:click={() => dispatch('openNarratives')}
        title="Historical Narratives"
      >
        <span class="btn-label">Narratives</span>
      </button>

      <button
        class="control-btn"
        class:active={placesOpen}
        on:click={() => dispatch('openPlaces')}
        title="Explore Places"
      >
        <span class="btn-label">Places</span>
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
    top: 54px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    z-index: 1100;
  }

  .section-label {
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--rubric);
    margin-bottom: 0.4rem;
    text-align: right;
  }

  .button-row {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .panel-area {
    position: fixed;
    top: 140px;
    right: 20px;
    z-index: 1100;
  }

  .control-btn {
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

  .control-btn:hover,
  .control-btn:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .control-btn.active {
    background: var(--ink);
    color: var(--parchment);
  }

  .control-btn.active:hover {
    background: var(--rubric);
  }

  .btn-label {
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.1em;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .control-bar {
      top: 44px;
      right: 10px;
      padding: 0.375rem;
      gap: 0.375rem;
    }

    .control-btn {
      padding: 0.5rem 0.75rem;
      font-size: 9px;
      min-width: 44px;
      min-height: 44px;
      justify-content: center;
    }

    .panel-area {
      top: 110px;
      left: 10px;
      right: 10px;
      bottom: 0;
    }
  }
</style>
