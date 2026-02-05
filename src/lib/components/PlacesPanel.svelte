<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fetchPlaceHappenings, type Happening } from '../api/placeHappenings';
  import { generateNarrative } from '../api/narrativeGenerator';
  import { narrative } from '../stores/narrative';
  import { timeline } from '../stores/timeline';

  const dispatch = createEventDispatcher<{
    flyTo: { lat: number; lng: number; zoom: number };
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
      happenings = await fetchPlaceHappenings(placeInput.trim(), mode, 0);
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
      const more = await fetchPlaceHappenings(placeInput.trim(), mode, offset, happenings.map(h => h.title));
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
      const generated = await generateNarrative({
        query: `${happening.title} in ${placeInput.trim()}`
      });
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
    max-height: calc(100vh - 300px);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease-out;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    margin-left: 10px;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .panel-header {
    margin-bottom: 1rem;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .mode-toggle {
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .tab-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #cbd5e1;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .tab-btn.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .prompt-input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: #f1f5f9;
    font-size: 0.9375rem;
    transition: all 0.2s;
  }

  .prompt-input:focus {
    outline: none;
    border-color: #a78bfa;
    background: rgba(255, 255, 255, 0.08);
  }

  .prompt-input::placeholder {
    color: #64748b;
  }

  .prompt-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .generate-btn {
    padding: 0.875rem 1.25rem;
    background: linear-gradient(135deg, #a78bfa, #8b5cf6);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .generate-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }

  .generate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error {
    padding: 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #ef4444;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .results-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .results-list::-webkit-scrollbar {
    width: 6px;
  }

  .results-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .results-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .results-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .happening-card {
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    position: relative;
  }

  .happening-rank {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
  }

  .happening-card h3 {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    font-weight: 600;
    color: #f1f5f9;
    padding-right: 2rem;
  }

  .happening-year {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #60a5fa;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .happening-year:hover {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
  }

  .happening-significance {
    margin: 0 0 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #94a3b8;
  }

  .explore-btn {
    padding: 0.5rem 1rem;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 6px;
    color: #60a5fa;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .explore-btn:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.5);
    transform: translateY(-1px);
  }

  .explore-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .load-more-btn {
    width: 100%;
    padding: 0.875rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #cbd5e1;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .load-more-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }

  .load-more-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .no-results {
    text-align: center;
    color: #64748b;
    font-size: 0.9375rem;
    padding: 2rem 1rem;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .places-panel {
      width: 100%;
      max-height: calc(100vh - 150px);
      margin-left: 0;
    }
  }
</style>
