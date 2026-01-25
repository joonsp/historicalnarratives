<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { timeline, formattedYear, type TimelineMode } from '../stores/timeline';

  let intervalId: number | null = null;
  let currentState = { year: 1800, isPlaying: false, playSpeed: 10, mode: 'chronological' as TimelineMode, minYear: -1000, maxYear: 2026 };

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

  function setMode(mode: TimelineMode) {
    timeline.setMode(mode);
  }

  let yearDisplay: string;
  formattedYear.subscribe(y => yearDisplay = y);
</script>

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

  <div class="mode-selector">
    <button 
      class="mode-btn" 
      class:active={currentState.mode === 'chronological'}
      on:click={() => setMode('chronological')}
    >
      📅 Chronological
    </button>
    <button 
      class="mode-btn" 
      class:active={currentState.mode === 'hh-release'}
      on:click={() => setMode('hh-release')}
    >
      🎙️ HH Release Order
    </button>
    <button 
      class="mode-btn" 
      class:active={currentState.mode === 'hh-chronological'}
      on:click={() => setMode('hh-chronological')}
    >
      ⏳ HH by Period
    </button>
  </div>

  <div class="keyboard-hints">
    <span>Space: Play/Pause</span>
    <span>←→: Navigate</span>
    <span>↑↓: Speed</span>
  </div>
</div>

<style>
  .timeline-container {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 16px 24px;
    border-radius: 16px;
    min-width: 600px;
    max-width: 90vw;
    z-index: 1000;
  }

  .timeline-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .year-display {
    min-width: 120px;
  }

  .year {
    font-size: 24px;
    font-weight: bold;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .controls {
    display: flex;
    gap: 8px;
  }

  .control-btn, .play-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 16px;
  }

  .control-btn:hover, .play-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .play-btn {
    padding: 8px 20px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border: none;
  }

  .speed-control {
    font-size: 12px;
    opacity: 0.7;
    min-width: 80px;
    text-align: right;
  }

  .slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .slider-label {
    font-size: 12px;
    opacity: 0.7;
    min-width: 60px;
  }

  .slider {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
    transition: transform 0.2s;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .mode-selector {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .mode-btn {
    flex: 1;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: inherit;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .mode-btn.active {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
    border-color: rgba(59, 130, 246, 0.5);
  }

  .keyboard-hints {
    display: flex;
    justify-content: center;
    gap: 20px;
    font-size: 10px;
    opacity: 0.5;
  }
</style>
