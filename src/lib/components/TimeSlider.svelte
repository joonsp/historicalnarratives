<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { timeline, formattedYear } from '../stores/timeline';
  import { getBorderSnapshotRange } from '../data/borders';
  import NarrativePrompt from './NarrativePrompt.svelte';
  import { isNarrativeMode } from '../stores/narrative';

  let intervalId: number | null = null;
  let currentState = { year: 1800, isPlaying: false, playSpeed: 10, minYear: -1000, maxYear: 2026 };

  // Subscribe to timeline store
  const unsubscribe = timeline.subscribe(state => {
    currentState = state;
  });

  // Keyboard controls
  function handleKeydown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement) return;
    
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        timeline.togglePlay();
        break;
      case 'ArrowRight':
        e.preventDefault();
        timeline.stepForward(e.shiftKey ? 50 : 10);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        timeline.stepBackward(e.shiftKey ? 50 : 10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        timeline.setSpeed(Math.min(100, currentState.playSpeed + 5));
        break;
      case 'ArrowDown':
        e.preventDefault();
        timeline.setSpeed(Math.max(1, currentState.playSpeed - 5));
        break;
    }
  }

  // Play animation loop
  function startPlayback() {
    if (intervalId) return;
    intervalId = setInterval(() => {
      if (currentState.year >= currentState.maxYear) {
        timeline.setPlaying(false);
        return;
      }
      timeline.stepForward(1);
    }, 1000 / currentState.playSpeed) as unknown as number;
  }

  function stopPlayback() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // Watch for play state changes
  $: if (currentState.isPlaying) {
    startPlayback();
  } else {
    stopPlayback();
  }

  // Update playback speed
  $: if (currentState.isPlaying && intervalId) {
    stopPlayback();
    startPlayback();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    unsubscribe();
    stopPlayback();
  });

  function handleSliderInput(e: Event) {
    const target = e.target as HTMLInputElement;
    timeline.setYear(parseInt(target.value));
  }

  let yearDisplay: string;
  formattedYear.subscribe(y => yearDisplay = y);

  // Get the border snapshot range for display
  function getDisplayRange(year: number): string {
    const range = getBorderSnapshotRange(year);
    const startStr = range.startYear < 0 ? `${Math.abs(range.startYear)} BCE` : `${range.startYear} CE`;
    const endStr = range.endYear < 0 ? `${Math.abs(range.endYear)} BCE` : `${range.endYear} CE`;

    if (range.startYear === range.endYear) {
      return startStr;
    }

    return `${startStr} — ${endStr}`;
  }
</script>

<div class="timeline-wrapper">
  <!-- AI Narrative Generation Input -->
  {#if !$isNarrativeMode}
    <NarrativePrompt />
  {/if}

<div class="timeline-container glass">
  <div class="timeline-header">
    <div class="year-display">
      <span class="year">{yearDisplay}</span>
    </div>
    
    <div class="controls">
      <button 
        class="control-btn" 
        on:click={() => timeline.stepBackward(50)}
        title="Jump back 50 years"
      >
        ⏮️
      </button>
      <button 
        class="control-btn" 
        on:click={() => timeline.stepBackward(10)}
        title="Step back 10 years"
      >
        ◀️
      </button>
      <button 
        class="play-btn" 
        on:click={() => timeline.togglePlay()}
        title="Play/Pause (Space)"
      >
        {currentState.isPlaying ? '⏸️' : '▶️'}
      </button>
      <button 
        class="control-btn" 
        on:click={() => timeline.stepForward(10)}
        title="Step forward 10 years"
      >
        ▶️
      </button>
      <button 
        class="control-btn" 
        on:click={() => timeline.stepForward(50)}
        title="Jump forward 50 years"
      >
        ⏭️
      </button>
    </div>

    <div class="speed-control">
      <span>Speed: {currentState.playSpeed}x</span>
    </div>
  </div>

  <div class="timeslot-display">
    <span>Showing timescale: {getDisplayRange(currentState.year)}</span>
  </div>

  <div class="timeline-body">
    <div class="slider-container">
      <span class="slider-label">{currentState.minYear < 0 ? `${Math.abs(currentState.minYear)} BCE` : currentState.minYear}</span>
      <input
        type="range"
        min={currentState.minYear}
        max={currentState.maxYear}
        value={currentState.year}
        on:input={handleSliderInput}
        class="slider"
      />
      <span class="slider-label">{currentState.maxYear}</span>
    </div>

    <div class="keyboard-hints">
      <span>Space: Play/Pause</span>
      <span>←→: Navigate</span>
      <span>↑↓: Speed</span>
    </div>
  </div>
</div>
</div>

<style>
  .timeline-wrapper {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    z-index: 1000;
    min-height: 20px;
    margin-bottom: 20px;
  }

  .timeline-container {
    padding: 16px 24px;
    min-width: 600px;
    max-width: 90vw;
  }

  .timeline-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .year-display {
    min-width: 140px;
  }

  .year {
    font-family: var(--font-pixel);
    font-size: 22px;
    letter-spacing: 0.04em;
    color: var(--rubric);
  }

  .controls {
    display: flex;
    gap: 6px;
  }

  .control-btn, .play-btn {
    background: var(--parchment);
    border: 2px solid var(--ink);
    padding: 6px 10px;
    color: var(--ink);
    font-family: var(--font-mono);
    cursor: pointer;
    transition: none;
    font-size: 14px;
    line-height: 1;
  }

  .control-btn:hover, .play-btn:hover,
  .control-btn:focus-visible, .play-btn:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .play-btn {
    padding: 6px 16px;
    background: var(--rubric);
    color: var(--parchment);
    box-shadow: 2px 2px 0 var(--ink);
  }

  .speed-control {
    display: flex;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faded);
    min-width: 80px;
    text-align: right;
  }

  .timeslot-display {
    text-align: center;
    margin-bottom: 16px;
    padding: 8px 16px;
    background: var(--parchment-2);
    border: 2px solid var(--ink);
  }

  .timeslot-display span {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .timeline-body {
    display: flex;
    flex-direction: column;
  }

  .slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .slider-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faded);
    min-width: 70px;
  }

  .slider {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--parchment-3);
    border: 1px solid var(--ink);
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--rubric);
    border: 2px solid var(--ink);
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: var(--rubric);
    border: 2px solid var(--ink);
    cursor: pointer;
  }

  .keyboard-hints {
    display: flex;
    justify-content: center;
    gap: 20px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faded);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .timeline-wrapper {
      bottom: 10px;
      gap: 8px;
      margin-bottom: 20px;
    }

    .timeline-container {
      padding: 8px 12px;
      min-width: unset;
      width: auto;
      max-width: calc(100vw - 20px);
    }

    .timeline-header {
      margin-bottom: 8px;
    }

    .year-display {
      min-width: unset;
      width: 38px;
      text-align: center;
    }

    .year {
      font-size: 14px;
      writing-mode: horizontal-tb;
    }

    .controls {
      gap: 4px;
    }

    .control-btn, .play-btn {
      padding: 6px 8px;
      font-size: 14px;
      border-radius: 6px;
    }

    .play-btn {
      padding: 6px 12px;
    }

    .speed-control {
      min-width: unset;
      font-size: 10px;
    }

    .timeslot-display {
      margin-bottom: 8px;
      padding: 6px 10px;
    }

    .timeslot-display span {
      font-size: 11px;
    }

    .slider-container {
      gap: 8px;
      margin-bottom: 8px;
    }

    .slider-label {
      font-size: 10px;
      min-width: 45px;
    }

    .slider {
      height: 4px;
    }

    .slider::-webkit-slider-thumb {
      width: 24px;
      height: 24px;
    }

    .control-btn, .play-btn {
      min-width: 44px;
      min-height: 44px;
    }

    .keyboard-hints {
      display: none;
    }
  }
</style>
