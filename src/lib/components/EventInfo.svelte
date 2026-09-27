<script lang="ts">
  import { timeline } from '../stores/timeline';
  import { getEventsForYear, type HistoricalEvent } from '../data/borders';
  import { eventGlyph } from '../utils/scriptorium';

  let currentYear = 1800;
  let visibleEvents: HistoricalEvent[] = [];

  timeline.subscribe(state => {
    currentYear = state.year;
    visibleEvents = getEventsForYear(currentYear, 3);
  });

  function formatYear(year: number): string {
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
  }
</script>

{#if visibleEvents.length > 0}
  <div class="event-info glass">
    <div>
      <h3>&#9670; Nearby Events</h3>
      {#each visibleEvents as event}
        <div class="event-item">
          <span class="event-icon">{eventGlyph(event.type)}</span>
          <div class="event-details">
            <span class="event-name">{event.name}</span>
            <span class="event-year">{formatYear(event.year)}</span>
            {#if event.wikipediaUrl}
              <a href={event.wikipediaUrl} target="_blank" rel="noopener" class="wiki-link">
                Wikipedia →
              </a>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .event-info {
    position: fixed;
    top: 54px;
    left: 20px;
    width: 300px;
    padding: 16px;
    z-index: 800;
  }

  h3 {
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--rubric);
    margin: 0 0 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--ink);
  }

  .event-item {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px dotted var(--ink-faded);
  }

  .event-item:last-child {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
  }

  .event-icon {
    font-size: 14px;
    color: var(--rubric);
  }

  .event-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .event-name {
    font-family: var(--font-pixel);
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
    line-height: 1.3;
  }

  .event-year {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faded);
  }

  .wiki-link {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--rubric);
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: none;
  }

  .wiki-link:hover {
    color: var(--ink);
  }


  @media (max-width: 768px) {
    .event-info {
      left: 10px;
      top: auto;
      bottom: 180px;
      width: calc(100% - 20px);
    }
  }
</style>
