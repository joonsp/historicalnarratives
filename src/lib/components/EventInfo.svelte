<script lang="ts">
  import { timeline } from '../stores/timeline';
  import { getEventsForYear, type HistoricalEvent } from '../data/borders';
  import { getEpisodeForYear, type HHEpisode } from '../data/hardcoreHistory';

  export let episodesOpen = false;

  let currentYear = 1800;
  let visibleEvents: HistoricalEvent[] = [];
  let relatedEpisode: HHEpisode | undefined;

  timeline.subscribe(state => {
    currentYear = state.year;
    visibleEvents = getEventsForYear(currentYear, 3);
    relatedEpisode = getEpisodeForYear(currentYear);
  });

  const typeIcons: Record<string, string> = {
    battle: '⚔️',
    treaty: '📜',
    revolution: '🔥',
    founding: '🏛️',
    collapse: '💀',
  };

  function formatYear(year: number): string {
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
  }
</script>

{#if visibleEvents.length > 0 || (relatedEpisode && episodesOpen)}
  <div class="event-info glass">
    {#if visibleEvents.length > 0}
      <div class="events-section" class:has-divider={relatedEpisode && episodesOpen}>
        <h3>📍 Nearby Events</h3>
        {#each visibleEvents as event}
          <div class="event-item">
            <span class="event-icon">{typeIcons[event.type]}</span>
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
    {/if}

    {#if relatedEpisode && episodesOpen}
      <div class="episode-section">
        <h3>🎙️ Related Episode</h3>
        <div class="related-episode">
          <span class="ep-title">{relatedEpisode.title}</span>
          <span class="ep-period">
            {formatYear(relatedEpisode.periodStart)} — {formatYear(relatedEpisode.periodEnd)}
          </span>
          <a href={relatedEpisode.url} target="_blank" rel="noopener" class="listen-link">
            Listen on dancarlin.com →
          </a>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .event-info {
    position: fixed;
    top: 80px;
    left: 360px;
    width: 280px;
    padding: 16px;
    border-radius: 16px;
    z-index: 800;
  }

  h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px;
    opacity: 0.9;
  }

  .events-section {
    margin-bottom: 0;
  }

  .events-section.has-divider {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .event-item {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }

  .event-item:last-child {
    margin-bottom: 0;
  }

  .event-icon {
    font-size: 18px;
  }

  .event-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .event-name {
    font-weight: 500;
    font-size: 13px;
  }

  .event-year {
    font-size: 11px;
    opacity: 0.6;
  }

  .wiki-link, .listen-link {
    font-size: 11px;
    color: #60a5fa;
    text-decoration: none;
    transition: color 0.2s;
  }

  .wiki-link:hover, .listen-link:hover {
    color: #93c5fd;
  }

  .related-episode {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ep-title {
    font-weight: 500;
    font-size: 13px;
  }

  .ep-period {
    font-size: 11px;
    opacity: 0.6;
  }
</style>
