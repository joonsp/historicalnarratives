<script lang="ts">
  import { track } from '../stores/reveal';
  import { createEventDispatcher } from 'svelte';
  import { fetchPlaceHappenings, type Happening } from '../api/placeHappenings';
  import { generateNarrative } from '../api/narrativeGenerator';
  import { narrative } from '../stores/narrative';
  import { timeline } from '../stores/timeline';

  const dispatch = createEventDispatcher<{
    flyTo: { lat: number; lng: number; zoom: number };
    close: void;
  }>();

  export let isOpen = false;

  let placeInput = '';
  let mode: 'history' | 'popculture' = 'history';
  let happenings: Happening[] = [];
  let isLoading = false;
  let isLoadingMore = false;
  let error = '';
  let offset = 0;
  let exploringIndex: number | null = null;
  let hasSearched = false;

  function formatYear(year: number): string {
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
  }

  async function handleSearch() {
    if (!placeInput.trim()) return;

    isLoading = true;
    error = '';
    happenings = [];
    offset = 0;
    hasSearched = true;

    try {
      happenings = await track(fetchPlaceHappenings(placeInput.trim(), mode, 0));
      offset = happenings.length;
      if (happenings.length > 0) {
        dispatch('flyTo', {
          lat: happenings[0].location[0],
          lng: happenings[0].location[1],
          zoom: 6
        });
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to fetch happenings';
    } finally {
      isLoading = false;
    }
  }

  async function handleLoadMore() {
    if (!placeInput.trim()) return;

    isLoadingMore = true;
    error = '';

    try {
      const more = await track(fetchPlaceHappenings(placeInput.trim(), mode, offset, happenings.map(h => h.title)));
      happenings = [...happenings, ...more];
      offset += more.length;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load more';
    } finally {
      isLoadingMore = false;
    }
  }

  async function handleExplore(happening: Happening, index: number) {
    exploringIndex = index;
    error = '';

    try {
      const generated = await track(generateNarrative({
        query: `${happening.title} in ${placeInput.trim()}`
      }));
      narrative.loadNarrative(generated.id);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to generate narrative';
    } finally {
      exploringIndex = null;
    }
  }

  function handleModeChange(newMode: 'history' | 'popculture') {
    if (newMode === mode) return;
    mode = newMode;
    if (hasSearched && placeInput.trim()) {
      handleSearch();
    }
  }
</script>

{#if isOpen}
  <div class="places-panel glass">
    <div class="panel-header">
      <h2>Places</h2>
      <button class="close-btn" on:click={() => dispatch('close')} title="Close">✕</button>
    </div>

    <!-- Mode toggle -->
    <div class="mode-toggle">
      <button
        class="tab-btn"
        class:active={mode === 'history'}
        on:click={() => handleModeChange('history')}
      >
        History
      </button>
      <button
        class="tab-btn"
        class:active={mode === 'popculture'}
        on:click={() => handleModeChange('popculture')}
      >
        Pop Culture
      </button>
    </div>

    <!-- Search form -->
    <form on:submit|preventDefault={handleSearch}>
      <input
        type="text"
        placeholder="Enter a place (e.g. Rome/Italy)"
        bind:value={placeInput}
        disabled={isLoading}
        class="prompt-input"
      />

      <button type="submit" disabled={isLoading || !placeInput.trim()} class="generate-btn">
        {#if isLoading}
          <span class="spinner"></span>
          Searching...
        {:else}
          Search
        {/if}
      </button>
    </form>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <!-- Results -->
    {#if happenings.length > 0}
      <div class="results-list">
        {#each happenings as happening, i}
          <div class="happening-card">
            <div class="happening-rank">#{i + 1}</div>
            <h3>{happening.title}</h3>
            <button
              class="happening-year"
              on:click={() => {
                timeline.setYear(happening.year);
                dispatch('flyTo', {
                  lat: happening.location[0],
                  lng: happening.location[1],
                  zoom: 10
                });
              }}
              title="Jump timeline to {formatYear(happening.year)}"
            >{formatYear(happening.year)}</button>
            <p class="happening-significance">{happening.significance}</p>
            <button
              class="explore-btn"
              disabled={exploringIndex !== null}
              on:click={() => handleExplore(happening, i)}
            >
              {#if exploringIndex === i}
                <span class="spinner"></span>
                Generating...
              {:else}
                Explore
              {/if}
            </button>
          </div>
        {/each}
      </div>

      <!-- Load more -->
      <button
        class="load-more-btn"
        disabled={isLoadingMore}
        on:click={handleLoadMore}
      >
        {#if isLoadingMore}
          <span class="spinner"></span>
          Loading...
        {:else}
          Load more
        {/if}
      </button>
    {:else if hasSearched && !isLoading}
      <p class="no-results">No happenings found. Try a different place.</p>
    {/if}
  </div>
{/if}

<style>
  .places-panel {
    width: 420px;
    max-height: calc(100vh - 200px);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    margin-left: 10px;
  }

  .panel-header {
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--ink);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-header h2 {
    margin: 0;
    font-family: var(--font-pixel);
    font-size: 14px;
    letter-spacing: 0.08em;
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

  .mode-toggle {
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px dotted var(--ink-faded);
    padding-bottom: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .tab-btn {
    padding: 8px 14px;
    background: var(--parchment);
    border: 2px solid var(--ink);
    color: var(--ink);
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
  }

  .tab-btn:hover,
  .tab-btn:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .tab-btn.active {
    background: var(--ink);
    color: var(--parchment);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .prompt-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid var(--ink);
    background: var(--parchment-2);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.04em;
    transition: none;
  }

  .prompt-input:focus {
    outline: none;
    border-color: var(--rubric);
    background: var(--parchment);
  }

  .prompt-input::placeholder {
    color: var(--ink-faded);
  }

  .prompt-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .generate-btn {
    padding: 10px 16px;
    background: var(--rubric);
    border: 2px solid var(--ink);
    color: var(--parchment);
    font-family: var(--font-pixel);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 2px 2px 0 var(--ink);
  }

  .generate-btn:hover:not(:disabled),
  .generate-btn:focus-visible:not(:disabled) {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .generate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    padding: 0.75rem;
    background: var(--parchment-2);
    border: 2px solid var(--rubric);
    color: var(--rubric);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14px;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .results-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 0.75rem;
  }

  .results-list::-webkit-scrollbar {
    width: 8px;
  }
  .results-list::-webkit-scrollbar-track {
    background: var(--parchment-3);
  }
  .results-list::-webkit-scrollbar-thumb {
    background: var(--ink);
    border: 1px solid var(--parchment-3);
  }
  .results-list::-webkit-scrollbar-thumb:hover {
    background: var(--ink-2);
  }

  .happening-card {
    padding: 14px 12px;
    border: none;
    border-bottom: 1px dotted var(--ink-faded);
    background: transparent;
    position: relative;
  }

  .happening-rank {
    position: absolute;
    top: 14px;
    right: 12px;
    font-family: var(--font-pixel);
    font-size: 10px;
    color: var(--ink-faded);
  }

  .happening-card h3 {
    margin: 0 0 6px;
    font-family: var(--font-pixel);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
    padding-right: 2rem;
    line-height: 1.3;
  }

  .happening-year {
    display: inline-block;
    padding: 3px 8px;
    background: var(--parchment-2);
    border: 1px solid var(--ink);
    color: var(--rubric);
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.08em;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: none;
  }

  .happening-year:hover,
  .happening-year:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .happening-significance {
    margin: 0 0 10px;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink-2);
  }

  .explore-btn {
    padding: 6px 12px;
    background: var(--parchment);
    border: 2px solid var(--ink);
    color: var(--ink);
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .explore-btn:hover:not(:disabled),
  .explore-btn:focus-visible:not(:disabled) {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .explore-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .load-more-btn {
    width: 100%;
    padding: 10px;
    background: var(--parchment);
    border: 2px solid var(--ink);
    color: var(--ink);
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .load-more-btn:hover:not(:disabled),
  .load-more-btn:focus-visible:not(:disabled) {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .load-more-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .no-results {
    text-align: center;
    color: var(--ink-faded);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14px;
    padding: 2rem 1rem;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .places-panel {
      width: 100%;
      height: 100%;
      max-height: 100%;
      margin-left: 0;
    }

    .close-btn {
      min-width: 44px;
      min-height: 44px;
    }
  }
</style>
