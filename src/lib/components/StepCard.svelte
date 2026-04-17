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
    top: 110px;
    right: 20px;
    width: 300px;
    z-index: 900;
    pointer-events: none;
  }

  .queue-stack > * {
    pointer-events: auto;
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
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--rubric);
    text-transform: uppercase;
  }

  .queue-icon {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--ink);
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
    font-size: 12px;
    cursor: pointer;
    transition: none;
  }

  .close-btn:hover,
  .close-btn:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .stack-area {
    position: relative;
    display: grid;
    grid-template-areas: "stack";
    padding-bottom: 100px;
  }

  .stack-area > .peek-card {
    grid-area: stack;
  }

  .peek-card {
    width: 100%;
    padding: 12px 14px;
    background: var(--parchment);
    border: 2px solid var(--ink);
    box-shadow: 3px 3px 0 var(--ink);
    text-align: left;
    color: var(--ink);
    font: inherit;
    cursor: pointer;
    transform-origin: 50% 40%;
    transform: translate(var(--tx), var(--ty)) rotate(var(--rot));
    opacity: var(--op);
    transition:
      transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2),
      opacity 0.35s ease;
    will-change: transform, opacity;
    font-family: inherit;
  }

  .peek-card.up-next {
    border-color: var(--rubric);
    box-shadow: 3px 3px 0 var(--rubric);
  }

  .peek-card:hover,
  .peek-card:focus-visible {
    transform: translate(calc(var(--tx) * 0.3), calc(var(--ty) * 0.95)) rotate(calc(var(--rot) * 0.25)) scale(1.04);
    opacity: 1;
    z-index: 50;
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }
  .peek-card:hover *,
  .peek-card:focus-visible * {
    color: var(--parchment) !important;
    border-color: var(--parchment) !important;
  }

  .peek-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .peek-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 22px;
    padding: 0 6px;
    background: var(--rubric);
    color: var(--parchment);
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.05em;
    border: 1px solid var(--ink);
  }

  .peek-card.up-next .peek-number {
    background: var(--ink);
    color: var(--parchment);
  }

  .peek-year {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faded);
  }

  .peek-type {
    margin-left: auto;
    font-size: 14px;
  }

  .peek-title {
    font-family: var(--font-pixel);
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .show-queue-btn {
    position: fixed;
    top: 110px;
    right: 20px;
    padding: 10px 14px;
    background: var(--parchment);
    border: 2px solid var(--ink);
    box-shadow: 2px 2px 0 var(--ink);
    color: var(--ink);
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
    z-index: 900;
  }

  .show-queue-btn:hover,
  .show-queue-btn:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  @media (max-width: 768px) {
    .queue-stack {
      right: 10px;
      top: 100px;
      width: 260px;
    }

    .show-queue-btn {
      top: 100px;
      right: 10px;
    }

    .close-btn {
      min-width: 36px;
      min-height: 36px;
    }
  }
</style>
