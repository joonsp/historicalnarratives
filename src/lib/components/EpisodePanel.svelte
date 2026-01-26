<script lang="ts">
  import { timeline, type TimelineMode } from '../stores/timeline';
  import {
    hardcoreHistoryEpisodes,
    getEpisodesByReleaseDate,
    getEpisodesByPeriod,
    type HHEpisode
  } from '../data/hardcoreHistory';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ episodeSelect: HHEpisode }>();

  export let isOpen = true;
  let searchQuery = '';
  let currentMode: TimelineMode = 'chronological';
  let currentYear = 1800;
  let collapsedSeries = new Set<string>();

  timeline.subscribe(state => {
    currentMode = state.mode;
    currentYear = state.year;
  });

  $: episodes = currentMode === 'hh-release' 
    ? getEpisodesByReleaseDate() 
    : currentMode === 'hh-chronological'
    ? getEpisodesByPeriod()
    : getEpisodesByPeriod();

  $: filteredEpisodes = searchQuery 
    ? episodes.filter(ep => 
        ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.series?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : episodes;

  $: groupedEpisodes = groupBySeries(filteredEpisodes);

  function groupBySeries(eps: HHEpisode[]): Map<string, HHEpisode[]> {
    const groups = new Map<string, HHEpisode[]>();
    eps.forEach(ep => {
      const series = ep.series || 'Standalone';
      if (!groups.has(series)) {
        groups.set(series, []);
      }
      groups.get(series)!.push(ep);
    });
    return groups;
  }

  function selectEpisode(episode: HHEpisode) {
    timeline.setYear(episode.periodStart);
    dispatch('episodeSelect', episode);
  }

  function formatYear(year: number): string {
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
  }

  function isEpisodeActive(episode: HHEpisode): boolean {
    return currentYear >= episode.periodStart && currentYear <= episode.periodEnd;
  }

  function toggleSeries(series: string) {
    if (collapsedSeries.has(series)) {
      collapsedSeries.delete(series);
    } else {
      collapsedSeries.add(series);
    }
    collapsedSeries = collapsedSeries; // trigger reactivity
  }

  function isSeriesCollapsed(series: string): boolean {
    return collapsedSeries.has(series);
  }
</script>

{#if isOpen}
  <div class="panel glass">
    <div class="panel-header">
      <h2>🎙️ Hardcore History</h2>

      <!-- Timeline Mode Selector -->
      <div class="mode-selector">
        <button
          class="mode-btn"
          class:active={currentMode === 'chronological'}
          on:click={() => timeline.setMode('chronological')}
          title="Chronological Order"
        >
          📅 Chronological
        </button>
        <button
          class="mode-btn"
          class:active={currentMode === 'hh-release'}
          on:click={() => timeline.setMode('hh-release')}
          title="Release Order"
        >
          🎙️ Release
        </button>
        <button
          class="mode-btn"
          class:active={currentMode === 'hh-chronological'}
          on:click={() => timeline.setMode('hh-chronological')}
          title="Historical Order"
        >
          ⏳ Historical
        </button>
      </div>

      <input
        type="text"
        placeholder="Search episodes..."
        bind:value={searchQuery}
        class="search-input"
      />
    </div>

      <div class="episodes-list">
        {#each [...groupedEpisodes] as [series, seriesEpisodes]}
          <div class="series-group">
            <button
              class="series-header"
              on:click={() => toggleSeries(series)}
            >
              <span class="series-icon">{isSeriesCollapsed(series) ? '▶' : '▼'}</span>
              <h3 class="series-title">{series}</h3>
              <span class="series-count">{seriesEpisodes.length}</span>
            </button>

            {#if !isSeriesCollapsed(series)}
              <div class="series-episodes">
                {#each seriesEpisodes as episode}
                  <button
                    class="episode-card"
                    class:active={isEpisodeActive(episode)}
                    on:click={() => selectEpisode(episode)}
                  >
                    <div class="episode-header">
                      <span class="episode-number">#{episode.number || '+'}</span>
                      <span class="episode-title">{episode.title}</span>
                    </div>
                    <div class="episode-meta">
                      <span class="period">
                        {formatYear(episode.periodStart)} — {formatYear(episode.periodEnd)}
                      </span>
                      <span class="regions">{episode.regions.slice(0, 2).join(', ')}</span>
                    </div>
                    <p class="episode-desc">{episode.description}</p>
                    <a
                      href={episode.url}
                      target="_blank"
                      rel="noopener"
                      class="episode-link"
                      on:click|stopPropagation
                    >
                      Listen →
                    </a>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    top: 130px;
    left: 20px;
    width: 320px;
    max-height: calc(100vh - 180px);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 900;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .panel-header h2 {
    margin: 0 0 12px;
    font-size: 18px;
    font-weight: 600;
  }

  .mode-selector {
    display: flex;
    gap: 0.375rem;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .mode-btn {
    flex: 1;
    min-width: fit-content;
    padding: 0.5rem 0.625rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: #cbd5e1;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .mode-btn.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
    color: #60a5fa;
  }

  .search-input {
    width: 100%;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: inherit;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
  }

  .search-input:focus {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(255, 255, 255, 0.15);
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .episodes-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }

  .series-group {
    margin-bottom: 12px;
  }

  .series-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 8px;
  }

  .series-header:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .series-icon {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    transition: transform 0.2s;
  }

  .series-title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    flex: 1;
    text-align: left;
    font-weight: 600;
  }

  .series-count {
    font-size: 11px;
    padding: 2px 8px;
    background: rgba(59, 130, 246, 0.2);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .series-episodes {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 8px;
  }

  .episode-card {
    width: 100%;
    text-align: left;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: inherit;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 8px;
    display: block;
  }

  .episode-card:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }

  .episode-card.active {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
    border-color: rgba(59, 130, 246, 0.4);
  }

  .episode-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .episode-number {
    font-size: 11px;
    padding: 2px 6px;
    background: rgba(59, 130, 246, 0.3);
    border-radius: 4px;
  }

  .episode-title {
    font-weight: 600;
    font-size: 14px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .episode-meta {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 6px;
  }

  .episode-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 8px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .episode-link {
    font-size: 12px;
    color: #60a5fa;
    text-decoration: none;
    transition: color 0.2s;
  }

  .episode-link:hover {
    color: #93c5fd;
  }
</style>
