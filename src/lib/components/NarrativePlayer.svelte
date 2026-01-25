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
    padding: 1.25rem 1.5rem;
    z-index: 1000;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }

  .player-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .player-header h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #f1f5f9;
  }

  .close-btn {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 18px;
    font-weight: 600;
  }

  .close-btn:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.1);
  }

  .progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #60a5fa, #3b82f6);
    transition: width 0.1s linear;
    border-radius: 3px;
  }

  .step-indicator {
    display: block;
    text-align: center;
    font-size: 0.875rem;
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  .player-controls {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .nav-btn,
  .play-btn {
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-btn {
    background: rgba(255, 255, 255, 0.05);
    color: #cbd5e1;
  }

  .nav-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: #f1f5f9;
  }

  .nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .play-btn {
    background: #3b82f6;
    color: white;
    flex: 1;
    max-width: 180px;
    border-color: #3b82f6;
  }

  .play-btn:hover {
    background: #2563eb;
    transform: scale(1.02);
  }

  .player-settings {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .setting-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #cbd5e1;
    cursor: pointer;
  }

  .setting-item input[type="checkbox"] {
    cursor: pointer;
    width: 16px;
    height: 16px;
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .speed-control input[type="range"] {
    width: 100px;
    cursor: pointer;
  }

  .speed-value {
    min-width: 40px;
    text-align: right;
    font-weight: 600;
    color: #3b82f6;
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
