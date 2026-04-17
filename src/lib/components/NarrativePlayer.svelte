<script lang="ts">
  import { narrative, currentNarrative, overallProgress, progressText, isFirstStep, isLastStep } from '../stores/narrative';

  $: progress = $overallProgress;
  $: canGoPrevious = !$isFirstStep;
  $: canGoNext = !$isLastStep;
</script>

{#if $narrative.showNarrativePlayer && $currentNarrative}
  <div class="narrative-player glass">
    <!-- Title bar -->
    <div class="player-header">
      <h2>{$currentNarrative.title}</h2>
      <button
        class="close-btn"
        on:click={() => narrative.exitNarrative()}
        aria-label="Exit narrative"
      >
        ✕
      </button>
    </div>

    <!-- Progress bar -->
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progress}%"></div>
    </div>
    <span class="step-indicator">{$progressText}</span>

    <!-- Controls -->
    <div class="player-controls">
      <button
        class="nav-btn"
        on:click={() => narrative.previousStep()}
        disabled={!canGoPrevious}
        aria-label="Previous step"
      >
        ← Previous
      </button>

      <button
        class="play-btn"
        on:click={() => narrative.togglePlay()}
        aria-label={$narrative.isPlaying ? 'Pause' : 'Play'}
      >
        {$narrative.isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>

      <button
        class="nav-btn"
        on:click={() => narrative.nextStep()}
        disabled={!canGoNext}
        aria-label="Next step"
      >
        Next →
      </button>
    </div>

    <!-- Settings -->
    <div class="player-settings">
      <label class="setting-item">
        <input
          type="checkbox"
          checked={$narrative.autoAdvance}
          on:change={(e) => narrative.setAutoAdvance(e.currentTarget.checked)}
        />
        <span>Auto-advance</span>
      </label>

      <label class="setting-item speed-control">
        <span>Speed:</span>
        <input
          type="range"
          min="0.25"
          max="3"
          step="0.25"
          value={$narrative.transitionSpeed}
          on:input={(e) => narrative.setTransitionSpeed(Number(e.currentTarget.value))}
        />
        <span class="speed-value">{$narrative.transitionSpeed}x</span>
      </label>
    </div>
  </div>
{/if}

<style>
  .narrative-player {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    min-width: 500px;
    max-width: 600px;
    padding: 18px 22px;
    z-index: 1000;
  }

  .player-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--ink);
  }

  .player-header h2 {
    margin: 0;
    font-family: var(--font-pixel);
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .close-btn {
    background: var(--parchment);
    border: 2px solid var(--ink);
    color: var(--ink);
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: none;
    font-family: var(--font-mono);
    font-size: 14px;
  }

  .close-btn:hover,
  .close-btn:focus-visible {
    background: var(--rubric);
    color: var(--parchment);
    outline: none;
  }

  .progress-bar {
    height: 8px;
    background: var(--parchment-3);
    border: 1px solid var(--ink);
    position: relative;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: var(--rubric);
    transition: width 0.1s linear;
  }

  .step-indicator {
    display: block;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ink-faded);
    margin-bottom: 14px;
  }

  .player-controls {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 14px;
  }

  .nav-btn,
  .play-btn {
    padding: 10px 16px;
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
    border: 2px solid var(--ink);
  }

  .nav-btn {
    background: var(--parchment);
    color: var(--ink);
  }

  .nav-btn:hover:not(:disabled),
  .nav-btn:focus-visible:not(:disabled) {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .play-btn {
    background: var(--rubric);
    color: var(--parchment);
    flex: 1;
    max-width: 200px;
    box-shadow: 2px 2px 0 var(--ink);
  }

  .play-btn:hover,
  .play-btn:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .player-settings {
    display: flex;
    gap: 22px;
    justify-content: center;
    padding-top: 10px;
    border-top: 1px dotted var(--ink-faded);
  }

  .setting-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink);
    cursor: pointer;
  }

  .setting-item input[type="checkbox"] {
    cursor: pointer;
    width: 16px;
    height: 16px;
    accent-color: var(--rubric);
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .speed-control input[type="range"] {
    width: 100px;
    cursor: pointer;
    accent-color: var(--rubric);
  }

  .speed-value {
    min-width: 40px;
    text-align: right;
    font-family: var(--font-pixel);
    font-size: 11px;
    color: var(--rubric);
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .narrative-player {
      min-width: auto;
      width: calc(100% - 40px);
      bottom: 10px;
    }

    .player-header h2 {
      font-size: 1rem;
    }

    .player-controls {
      flex-wrap: wrap;
    }

    .play-btn {
      flex: 1 1 100%;
      max-width: none;
    }

    .player-settings {
      flex-direction: column;
      gap: 0.75rem;
    }
  }
</style>
