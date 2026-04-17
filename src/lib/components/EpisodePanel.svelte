<script lang="ts">
  import { timeline, type TimelineMode } from '../stores/timeline';
  import {
    hardcoreHistoryEpisodes,
    getEpisodesByReleaseDate,
    getEpisodesByPeriod,
    getEpisodeForYear,
    type HHEpisode
  } from '../data/hardcoreHistory';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ episodeSelect: HHEpisode; close: void }>();

  export let isOpen = true;
  let searchQuery = '';
  let currentMode: TimelineMode = 'chronological';
  let currentYear = 1800;
  let collapsedSeries = new Set<string>();
  let selectedEpisodeId: string | null = null;

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

  // Get related episode for current year
  $: relatedEpisode = getEpisodeForYear(currentYear);

  // Show related episode only if no episode is explicitly selected
  $: showRelatedEpisode = !selectedEpisodeId && relatedEpisode;

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
    selectedEpisodeId = episode.id;
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
      <div class="header-row">
        <h2>🎙️ Hardcore History</h2>
        <button class="close-btn" on:click={() => dispatch('close')} title="Close">✕</button>
      </div>

      {#if showRelatedEpisode}
        <div class="related-episode-section">
          <div class="related-header">
            <span class="related-icon">🎙️</span>
            <span class="related-title">Episode Related to selected times</span>
          </div>
          <button
            class="episode-card related"
            on:click={() => selectEpisode(relatedEpisode)}
          >
            <div class="episode-header">
              <span class="episode-number">#{relatedEpisode.number || '+'}</span>
              <span class="episode-title">{relatedEpisode.title}</span>
            </div>
            <div class="episode-meta">
              <span class="period">
                {formatYear(relatedEpisode.periodStart)} — {formatYear(relatedEpisode.periodEnd)}
              </span>
              <span class="regions">{relatedEpisode.regions.slice(0, 2).join(', ')}</span>
            </div>
            <p class="episode-desc">{relatedEpisode.description}</p>
          </button>
        </div>
        <div class="separator"></div>
      {/if}

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
    width: 340px;
    max-height: calc(100vh - 200px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    margin-right: 10px;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .panel {
      width: 100%;
      height: 100%;
      max-height: 100%;
      margin-right: 0;
    }

    .close-btn {
      min-width: 44px;
      min-height: 44px;
    }
  }

  .panel-header {
    padding: 16px;
    border-bottom: 2px solid var(--ink);
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-header h2 {
    margin: 0 0 12px;
    font-family: var(--font-pixel);
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--parchment);
    border: 2px solid var(--ink);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 14px;
    cursor: pointer;
    transition: none;
    flex-shrink: 0;
  }

  .close-btn:hover,
  .close-btn:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .mode-selector {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .mode-btn {
    flex: 1;
    min-width: fit-content;
    padding: 7px 8px;
    background: var(--parchment);
    border: 2px solid var(--ink);
    color: var(--ink);
    font-family: var(--font-pixel);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
    white-space: nowrap;
  }

  .mode-btn:hover,
  .mode-btn:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .mode-btn.active {
    background: var(--ink);
    color: var(--parchment);
  }

  .search-input {
    width: 100%;
    padding: 10px 14px;
    background: var(--parchment-2);
    border: 2px solid var(--ink);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.04em;
    outline: none;
    transition: none;
  }

  .search-input:focus {
    border-color: var(--rubric);
    background: var(--parchment);
  }

  .search-input::placeholder {
    color: var(--ink-faded);
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
    background: var(--parchment-2);
    border: 1px solid var(--ink);
    cursor: pointer;
    transition: none;
    margin-bottom: 8px;
  }

  .series-header:hover,
  .series-header:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .series-icon {
    font-size: 10px;
    color: var(--rubric);
  }

  .series-title {
    font-family: var(--font-pixel);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ink);
    margin: 0;
    flex: 1;
    text-align: left;
  }

  .series-header:hover .series-title,
  .series-header:focus-visible .series-title,
  .series-header:hover .series-icon,
  .series-header:focus-visible .series-icon,
  .series-header:hover .series-count,
  .series-header:focus-visible .series-count {
    color: var(--parchment);
  }

  .series-count {
    font-family: var(--font-pixel);
    font-size: 9px;
    padding: 2px 6px;
    background: var(--rubric);
    color: var(--parchment);
    border: 1px solid var(--ink);
  }

  .series-episodes {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-left: 4px;
  }

  .episode-card {
    width: 100%;
    text-align: left;
    padding: 12px 10px;
    background: transparent;
    border: none;
    border-bottom: 1px dotted var(--ink-faded);
    color: var(--ink);
    cursor: pointer;
    transition: none;
    margin-bottom: 0;
    display: block;
  }

  .episode-card:hover,
  .episode-card:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }
  .episode-card:hover *,
  .episode-card:focus-visible * {
    color: var(--parchment) !important;
    border-color: var(--parchment) !important;
  }

  .episode-card.active {
    background: var(--parchment-2);
    border-left: 3px solid var(--rubric);
  }

  .episode-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .episode-number {
    font-family: var(--font-pixel);
    font-size: 10px;
    padding: 2px 6px;
    background: var(--rubric);
    color: var(--parchment);
    border: 1px solid var(--ink);
    letter-spacing: 0.05em;
  }

  .episode-title {
    font-family: var(--font-pixel);
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--ink);
    line-height: 1.3;
  }

  .episode-meta {
    display: flex;
    gap: 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-faded);
    margin-bottom: 6px;
  }

  .episode-desc {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 13px;
    color: var(--ink-2);
    margin: 0 0 8px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .episode-link {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--rubric);
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: none;
  }

  .episode-link:hover {
    color: var(--ink);
  }

  .separator {
    height: 1px;
    background: var(--ink);
    margin: 12px 0;
    opacity: 0.5;
  }

  .related-episode-section {
    margin-top: 12px;
    margin-bottom: 12px;
  }

  .related-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    padding: 0 4px;
  }

  .related-icon {
    font-size: 12px;
    color: var(--rubric);
  }

  .related-title {
    font-family: var(--font-pixel);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--rubric);
  }

  .episode-card.related {
    background: var(--parchment-2);
    border: 2px solid var(--rubric);
    border-bottom: 2px solid var(--rubric);
    box-shadow: 2px 2px 0 var(--ink);
  }
</style>
