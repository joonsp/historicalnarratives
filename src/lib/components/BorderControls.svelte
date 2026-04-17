<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    toggleBorders: void;
    opacityChange: number;
    close: void;
  }>();

  export let isOpen = false;
  let enabled = true;
  let opacity = 25; // 0-60%, default 25%

  function handleToggle() {
    enabled = !enabled;
    dispatch('toggleBorders');
  }

  function handleOpacityChange(event: Event) {
    const target = event.target as HTMLInputElement;
    opacity = parseInt(target.value);
    dispatch('opacityChange', opacity / 100);
  }
</script>

{#if isOpen}
  <div class="border-controls glass">
  <div class="control-header">
    <span class="control-icon">&#9670;</span>
    <span class="control-title">Historical Borders</span>
    <button class="close-btn" on:click={() => dispatch('close')} title="Close">✕</button>
  </div>

  <div class="control-row">
    <button
      class="toggle-button"
      class:active={enabled}
      on:click={handleToggle}
      title={enabled ? 'Hide borders' : 'Show borders'}
    >
      {enabled ? 'Visible' : 'Hidden'}
    </button>
  </div>

  {#if enabled}
    <div class="control-row">
      <label for="opacity-slider" class="slider-label">
        <span>Opacity</span>
        <span class="opacity-value">{opacity}%</span>
      </label>
      <input
        id="opacity-slider"
        type="range"
        min="10"
        max="60"
        value={opacity}
        on:input={handleOpacityChange}
        class="opacity-slider"
      />
    </div>
  {/if}
  </div>
{/if}

<style>
  .border-controls {
    padding: 16px;
    min-width: 220px;
    user-select: none;
    margin-left: 10px;
  }

  .control-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--ink);
  }

  .close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--parchment);
    border: 2px solid var(--ink);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 14px;
    cursor: pointer;
    transition: none;
    flex-shrink: 0;
    margin-left: auto;
  }

  .close-btn:hover,
  .close-btn:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .control-icon {
    font-size: 14px;
    color: var(--rubric);
  }

  .control-title {
    font-family: var(--font-pixel);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .control-row {
    margin-bottom: 12px;
  }

  .control-row:last-child {
    margin-bottom: 0;
  }

  .toggle-button {
    width: 100%;
    padding: 10px 12px;
    background: var(--parchment);
    border: 2px solid var(--ink);
    color: var(--ink);
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .toggle-button:hover,
  .toggle-button:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .toggle-button.active {
    background: var(--ink);
    color: var(--parchment);
  }

  .toggle-button.active:hover {
    background: var(--rubric);
  }

  .slider-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink);
    margin-bottom: 6px;
  }

  .opacity-value {
    font-family: var(--font-pixel);
    font-size: 10px;
    color: var(--rubric);
  }

  .opacity-slider {
    width: 100%;
    height: 6px;
    background: var(--parchment-3);
    border: 1px solid var(--ink);
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .opacity-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    background: var(--rubric);
    border: 2px solid var(--ink);
    cursor: pointer;
  }

  .opacity-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: var(--rubric);
    border: 2px solid var(--ink);
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .border-controls {
      min-width: unset;
      padding: 12px;
      width: 100%;
      max-height: 100%;
      overflow-y: auto;
      margin-left: 0;
    }

    .close-btn {
      min-width: 44px;
      min-height: 44px;
    }
  }
</style>
