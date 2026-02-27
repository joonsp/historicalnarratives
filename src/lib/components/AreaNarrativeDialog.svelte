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
    padding: 1rem 1.25rem;
    border-radius: 12px;
    animation: fadeIn 0.2s ease-out;
  }

  .area-dialog.mobile {
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    border-radius: 16px 16px 0 0;
    padding: 1.25rem 1.5rem 2rem;
    animation: slideUp 0.25s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .dialog-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .area-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: #f1f5f9;
    line-height: 1.3;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .close-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: #f1f5f9;
  }

  .close-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .modern-name {
    font-size: 0.8125rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }

  .year-badge {
    padding: 0.125rem 0.5rem;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #60a5fa;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .period-label {
    font-size: 0.75rem;
    color: #64748b;
  }

  .error {
    padding: 0.5rem 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #ef4444;
    font-size: 0.8125rem;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }

  .generate-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #a78bfa, #8b5cf6);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .generate-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }

  .generate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .close-btn {
      min-width: 44px;
      min-height: 44px;
      width: 44px;
      height: 44px;
      border-radius: 8px;
    }

    .generate-btn {
      padding: 1rem;
      min-height: 48px;
    }
  }
</style>
