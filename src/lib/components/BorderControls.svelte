<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    toggleBorders: void;
    opacityChange: number;
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
    <span class="control-icon">🗺️</span>
    <span class="control-title">Historical Borders</span>
  </div>

  <div class="control-row">
    <button
      class="toggle-button"
      class:active={enabled}
      on:click={handleToggle}
      title={enabled ? 'Hide borders' : 'Show borders'}
    >
      {enabled ? '👁️ Visible' : '👁️‍🗨️ Hidden'}
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
    border-radius: 12px;
    min-width: 220px;
    user-select: none;
    animation: slideIn 0.3s ease-out;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-left: 10px;
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

  .control-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .control-icon {
    font-size: 18px;
  }

  .control-title {
    font-size: 14px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .control-row {
    margin-bottom: 12px;
  }

  .control-row:last-child {
    margin-bottom: 0;
  }

  .toggle-button {
    width: 100%;
    padding: 8px 12px;
    background: rgba(51, 65, 85, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #cbd5e1;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .toggle-button:hover {
    background: rgba(71, 85, 105, 0.7);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .toggle-button.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
    color: #93c5fd;
  }

  .toggle-button.active:hover {
    background: rgba(59, 130, 246, 0.4);
  }

  .slider-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #cbd5e1;
    margin-bottom: 6px;
  }

  .opacity-value {
    font-weight: 600;
    color: #93c5fd;
  }

  .opacity-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(51, 65, 85, 0.6);
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .opacity-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
  }

  .opacity-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .opacity-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
  }

  .opacity-slider::-moz-range-thumb:hover {
    transform: scale(1.2);
  }

  @media (max-width: 768px) {
    .border-controls {
      min-width: unset;
      padding: 12px;
      width: 100%;
      max-height: calc(100vh - 150px);
      overflow-y: auto;
      margin-left: 0;
    }
  }
</style>
