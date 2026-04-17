<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { formattedYear, timeline } from '../stores/timeline';
  import { narrative } from '../stores/narrative';
  import { getBorderSnapshotRange } from '../data/borders';
  import { generateNarrative } from '../api/narrativeGenerator';
  import type { DetectedArea } from '../utils/areaDetection';

  const dispatch = createEventDispatcher<{
    close: void;
    narrativeLoaded: { id: string };
  }>();

  export let area: DetectedArea;
  export let screenPosition: { x: number; y: number };

  let isGenerating = false;
  let error = '';

  $: year = $timeline.year;
  $: snapshotRange = getBorderSnapshotRange(year);
  $: isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Clamp dialog position to viewport (desktop only)
  $: dialogStyle = isMobile ? '' : (() => {
    const margin = 16;
    const dialogW = 320;
    const dialogH = 220;
    const x = Math.min(screenPosition.x, window.innerWidth - dialogW - margin);
    const y = Math.min(screenPosition.y, window.innerHeight - dialogH - margin);
    return `left: ${Math.max(margin, x)}px; top: ${Math.max(margin, y)}px;`;
  })();

  async function handleGenerate() {
    isGenerating = true;
    error = '';

    const periodDesc = snapshotRange.description;
    const coordStr = `${area.lat.toFixed(2)}, ${area.lng.toFixed(2)}`;
    const query = `History of ${area.name} around ${$formattedYear}. ` +
      `Period: ${periodDesc} (${snapshotRange.startYear} to ${snapshotRange.endYear}). ` +
      `Coordinates: ${coordStr}.` +
      (area.modernName ? ` Modern name: ${area.modernName}.` : '');

    try {
      const generated = await generateNarrative({ query });
      dispatch('narrativeLoaded', { id: generated.id });
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to generate narrative';
    } finally {
      isGenerating = false;
    }
  }

  function handleBackdropClick() {
    if (!isGenerating) dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !isGenerating) dispatch('close');
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="backdrop" on:click={handleBackdropClick}></div>

<div class="area-dialog glass" class:mobile={isMobile} style={dialogStyle}>
  <div class="dialog-header">
    <div class="area-name">{area.name}</div>
    <button class="close-btn" on:click={() => dispatch('close')} disabled={isGenerating}>
      ✕
    </button>
  </div>

  {#if area.source === 'border' && area.modernName}
    <div class="modern-name">{area.modernName} (modern)</div>
  {/if}

  <div class="meta-row">
    <span class="year-badge">{$formattedYear}</span>
    <span class="period-label">{snapshotRange.description}</span>
  </div>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <button
    class="generate-btn"
    on:click={handleGenerate}
    disabled={isGenerating}
  >
    {#if isGenerating}
      <span class="spinner"></span>
      Generating...
    {:else}
      Generate Narrative
    {/if}
  </button>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 1050;
  }

  .area-dialog {
    position: fixed;
    z-index: 1060;
    width: 320px;
    padding: 16px 20px;
  }

  .area-dialog.mobile {
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    padding: 20px 24px 32px;
  }

  .dialog-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--ink);
  }

  .area-name {
    font-family: var(--font-pixel);
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink);
    line-height: 1.3;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--parchment);
    border: 2px solid var(--ink);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 14px;
    cursor: pointer;
    flex-shrink: 0;
    transition: none;
  }

  .close-btn:hover:not(:disabled),
  .close-btn:focus-visible:not(:disabled) {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .close-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .modern-name {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 13px;
    color: var(--ink-faded);
    margin-bottom: 0.5rem;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  .year-badge {
    padding: 2px 8px;
    background: var(--parchment-2);
    border: 1px solid var(--ink);
    color: var(--rubric);
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.1em;
  }

  .period-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-faded);
  }

  .error {
    padding: 8px 10px;
    background: var(--parchment-2);
    border: 2px solid var(--rubric);
    color: var(--rubric);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 13px;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }

  .generate-btn {
    width: 100%;
    padding: 12px 16px;
    background: var(--rubric);
    border: 2px solid var(--ink);
    color: var(--parchment);
    font-family: var(--font-pixel);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 2px 2px 0 var(--ink);
  }

  .generate-btn:hover:not(:disabled),
  .generate-btn:focus-visible:not(:disabled) {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .generate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .close-btn {
      min-width: 44px;
      min-height: 44px;
      width: 44px;
      height: 44px;
    }

    .generate-btn {
      padding: 16px;
      min-height: 48px;
    }
  }
</style>
