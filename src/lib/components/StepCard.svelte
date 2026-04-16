<script lang="ts">
  import { narrative, currentNarrative } from '../stores/narrative';
  import type { NarrativeStep } from '../data/narrativeTimelines';

  function formatYear(year: number): string {
    if (year < 0) {
      return `${Math.abs(year)} BCE`;
    }
    return `${year} CE`;
  }

  const eventTypeEmojis: Record<string, string> = {
    battle: '⚔️',
    treaty: '📜',
    journey: '🗺️',
    discovery: '🔍',
    decision: '⚖️',
    founding: '🏛️',
    siege: '🏰',
    crossing: '🌊',
  };

  const STACK_SIZE = 4;

  $: totalRemaining = Math.max(
    0,
    ($currentNarrative?.steps.length ?? 0) - $narrative.currentStepIndex - 1
  );

  $: upcomingSteps = ($currentNarrative?.steps ?? []).slice(
    $narrative.currentStepIndex + 1,
    $narrative.currentStepIndex + 1 + STACK_SIZE
  ) as NarrativeStep[];

  // Deterministic per-step seed so each card's wobble/rotation stays stable.
  function seeded(seq: number, salt: number): number {
    const x = Math.sin(seq * 12.9898 + salt * 78.233) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1; // -1..1
  }
</script>

{#if $narrative.showStepCard && totalRemaining > 0}
  <div class="queue-stack">
    <div class="queue-header">
      <span class="queue-label">
        <span class="queue-icon">🃏</span>
        Up next · {totalRemaining}
      </span>
      <button
        class="close-btn"
        on:click={() => narrative.toggleStepCard()}
        aria-label="Hide queue"
        title="Hide queue"
      >✕</button>
    </div>

    <div class="stack-area">
      {#each upcomingSteps as peek, i (peek.sequenceNumber)}
        <button
          type="button"
          class="peek-card glass"
          class:up-next={i === 0}
          style:--tx="{seeded(peek.sequenceNumber, 1) * 10}px"
          style:--ty="{i * 22}px"
          style:--rot="{seeded(peek.sequenceNumber, 2) * 6}deg"
          style:--op={1 - i * 0.1}
          style:z-index={STACK_SIZE + 5 - i}
          on:click={() => narrative.jumpToStep($narrative.currentStepIndex + i + 1)}
          title="Jump to #{peek.sequenceNumber} · {peek.title}"
        >
          <div class="peek-header">
            <span class="peek-number">#{peek.sequenceNumber}</span>
            <span class="peek-year">{formatYear(peek.year)}</span>
            <span class="peek-type">{eventTypeEmojis[peek.eventType] || '📍'}</span>
          </div>
          <div class="peek-title">{peek.title}</div>
        </button>
      {/each}
    </div>
  </div>
{:else if !$narrative.showStepCard && totalRemaining > 0}
  <button
    class="show-queue-btn glass"
    on:click={() => narrative.toggleStepCard()}
    aria-label="Show queue"
  >
    🃏 Queue · {totalRemaining}
  </button>
{/if}

<style>
  .queue-stack {
    position: fixed;
    top: 80px;
    right: 20px;
    width: 300px;
    z-index: 900;
    animation: slideIn 0.3s ease-out;
    pointer-events: none;
  }

  .queue-stack > * {
    pointer-events: auto;
  }

  @keyframes slideIn {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .queue-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    padding: 0 0.25rem;
  }

  .queue-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(226, 232, 240, 0.85);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  }

  .queue-icon {
    font-size: 1rem;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: #cbd5e1;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(8px);
  }

  .close-btn:hover {
    background: rgba(239, 68, 68, 0.25);
    color: #fca5a5;
    transform: scale(1.08);
  }

  .stack-area {
    position: relative;
    display: grid;
    grid-template-areas: "stack";
    /* Generous bottom padding so the deepest offset card doesn't get clipped visually. */
    padding-bottom: 100px;
  }

  .stack-area > .peek-card {
    grid-area: stack;
  }

  .peek-card {
    width: 100%;
    padding: 0.875rem 1.125rem;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    text-align: left;
    color: inherit;
    font: inherit;
    cursor: pointer;
    transform-origin: 50% 40%;
    transform: translate(var(--tx), var(--ty)) rotate(var(--rot));
    opacity: var(--op);
    transition:
      transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2),
      opacity 0.35s ease,
      filter 0.25s ease,
      border-color 0.25s ease,
      background 0.25s ease;
    filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.45));
    will-change: transform, opacity;
    font-family: inherit;
  }

  .peek-card.up-next {
    border-color: rgba(96, 165, 250, 0.45);
    background: rgba(30, 41, 59, 0.85);
    box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.18);
  }

  .peek-card:hover {
    transform: translate(calc(var(--tx) * 0.3), calc(var(--ty) * 0.95)) rotate(calc(var(--rot) * 0.25)) scale(1.04);
    opacity: 1;
    z-index: 50;
    filter: drop-shadow(0 14px 32px rgba(0, 0, 0, 0.55));
    border-color: rgba(96, 165, 250, 0.55);
  }

  .peek-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.375rem;
  }

  .peek-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    height: 22px;
    padding: 0 0.5rem;
    background: rgba(59, 130, 246, 0.35);
    color: #dbeafe;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.75rem;
  }

  .peek-card.up-next .peek-number {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
  }

  .peek-year {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .peek-type {
    margin-left: auto;
    font-size: 1rem;
  }

  .peek-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #e2e8f0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .show-queue-btn {
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 0.6rem 1rem;
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 10px;
    background: rgba(30, 41, 59, 0.85);
    color: #93c5fd;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.2s;
    z-index: 900;
  }

  .show-queue-btn:hover {
    background: rgba(59, 130, 246, 0.25);
    transform: translateY(-1px);
    border-color: rgba(96, 165, 250, 0.5);
  }

  @media (max-width: 768px) {
    .queue-stack {
      right: 10px;
      top: 70px;
      width: 260px;
    }

    .show-queue-btn {
      top: 70px;
      right: 10px;
    }

    .close-btn {
      min-width: 36px;
      min-height: 36px;
    }
  }
</style>
