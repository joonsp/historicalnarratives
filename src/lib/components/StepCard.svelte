<script lang="ts">
  import { narrative, currentStep } from '../stores/narrative';

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
</script>

{#if $narrative.showStepCard && $currentStep}
  <div class="step-card glass">
    <!-- Header -->
    <div class="step-header">
      <span class="step-number">#{$currentStep.sequenceNumber}</span>
      <span class="step-year">{formatYear($currentStep.year)}</span>
      <span class="event-type">
        {eventTypeEmojis[$currentStep.eventType] || '📍'}
      </span>
    </div>

    <!-- Title -->
    <h3 class="step-title">{$currentStep.title}</h3>

    <!-- Description -->
    <p class="step-description">{$currentStep.description}</p>

    <!-- Media -->
    {#if $currentStep.media?.imageUrl}
      <div class="step-media">
        <img
          src={$currentStep.media.imageUrl}
          alt={$currentStep.media.caption || $currentStep.title}
          loading="lazy"
        />
        {#if $currentStep.media.caption}
          <p class="media-caption">{$currentStep.media.caption}</p>
        {/if}
      </div>
    {/if}

    <!-- Links -->
    {#if $currentStep.links && $currentStep.links.length > 0}
      <div class="step-links">
        {#each $currentStep.links as link}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            class="step-link"
          >
            {link.title} →
          </a>
        {/each}
      </div>
    {/if}

    <!-- Toggle button -->
    <button
      class="toggle-btn"
      on:click={() => narrative.toggleStepCard()}
      aria-label="Hide step card"
    >
      ✕
    </button>
  </div>
{:else if !$narrative.showStepCard && $currentStep}
  <!-- Show button when card is hidden -->
  <button
    class="show-card-btn glass"
    on:click={() => narrative.toggleStepCard()}
    aria-label="Show step card"
  >
    📖 Show Details
  </button>
{/if}

<style>
  .step-card {
    position: fixed;
    top: 80px;
    right: 20px;
    width: 380px;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    padding: 1.5rem;
    z-index: 900;
    animation: slideIn 0.3s ease-out;
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

  .step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border-radius: 50%;
    font-weight: 700;
    font-size: 0.9375rem;
  }

  .step-year {
    font-size: 0.875rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .event-type {
    font-size: 1.25rem;
    margin-left: auto;
  }

  .step-title {
    margin: 0 0 1rem;
    font-size: 1.375rem;
    font-weight: 700;
    color: #f1f5f9;
    line-height: 1.3;
  }

  .step-description {
    margin: 0 0 1.25rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: #cbd5e1;
  }

  .step-media {
    margin-bottom: 1.25rem;
  }

  .step-media img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    display: block;
    margin-bottom: 0.5rem;
  }

  .media-caption {
    margin: 0;
    font-size: 0.8125rem;
    color: #94a3b8;
    font-style: italic;
  }

  .step-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .step-link {
    color: #60a5fa;
    text-decoration: none;
    font-size: 0.9375rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: all 0.2s;
    padding: 0.375rem 0;
  }

  .step-link:hover {
    color: #3b82f6;
    transform: translateX(2px);
  }

  .toggle-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 28px;
    height: 28px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 50%;
    color: #ef4444;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 14px;
    font-weight: 600;
  }

  .toggle-btn:hover {
    background: rgba(239, 68, 68, 0.25);
    transform: scale(1.1);
  }

  .show-card-btn {
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 0.75rem 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9375rem;
    transition: all 0.2s;
    z-index: 900;
  }

  .show-card-btn:hover {
    background: rgba(59, 130, 246, 0.3);
    transform: scale(1.05);
  }

  /* Custom scrollbar */
  .step-card::-webkit-scrollbar {
    width: 6px;
  }

  .step-card::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .step-card::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .step-card::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .step-card {
      right: 10px;
      width: calc(100% - 20px);
      max-width: 380px;
      top: 70px;
      max-height: calc(100vh - 180px);
    }

    .show-card-btn {
      top: 70px;
      right: 10px;
    }

    .step-title {
      font-size: 1.25rem;
    }
  }
</style>
