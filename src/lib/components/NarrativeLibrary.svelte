<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { narrative, isNarrativeMode } from '../stores/narrative';
  import { sampleNarratives } from '../data/sampleNarratives';
  import { generateNarrative, generateNarrativeFromContent, isAIGenerationAvailable } from '../api/narrativeGenerator';
  import { scrapeUrl } from '../api/urlScraper';
  import type { ScrapedContent } from '../api/urlScraper';
  import { getAllNarratives, getNarrativesVersion } from '../data/narrativeTimelines';

  const dispatch = createEventDispatcher<{ close: void }>();

  export let isOpen = false;
  let searchQuery = '';
  let selectedTheme = 'all';
  let activeTab: 'browse' | 'create' | 'from-url' = 'browse';

  // AI generation state
  let aiQuery = '';
  let isGenerating = false;
  let error = '';
  let aiAvailable = isAIGenerationAvailable();

  // From URL state
  let urlInput = '';
  let focusQuery = '';
  let scrapedContent: ScrapedContent | null = null;
  let isScraping = false;
  let isGeneratingFromUrl = false;
  let scrapeError = '';
  let urlStep: 'input' | 'preview' = 'input';

  // Track narratives version for reactivity
  let narrativesVersion = 0;

  // Poll for narrative updates every 100ms for first 2 seconds after mount
  onMount(() => {
    let pollCount = 0;
    const maxPolls = 20; // 20 * 100ms = 2 seconds
    
    const pollInterval = setInterval(() => {
      const currentVersion = getNarrativesVersion();
      if (currentVersion !== narrativesVersion) {
        narrativesVersion = currentVersion;
      }
      
      pollCount++;
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
      }
    }, 100);

    return () => clearInterval(pollInterval);
  });

  const exampleQueries = [
    "Tell me about Alexander the Great's conquest of Persia",
    "Show me Napoleon's campaigns",
    "The Lewis and Clark expedition",
    "Julius Caesar's Gallic Wars",
    "Hannibal's march to Rome",
  ];

  // Combine sample narratives with all registered narratives (including AI-generated)
  // Force re-evaluation when narrativesVersion changes
  $: allNarratives = (() => {
    void narrativesVersion; // Track version changes
    const all = getAllNarratives();
    const aiNarratives = all.filter(n => n.createdBy === 'ai');
    return [...sampleNarratives, ...aiNarratives];
  })();

  // Get unique themes from all narratives
  $: themes = ['all', ...Array.from(new Set(allNarratives.map(n => n.theme)))];

  // Filter narratives based on search and theme
  $: filteredNarratives = allNarratives.filter(n => {
    const matchesTheme = selectedTheme === 'all' || n.theme === selectedTheme;
    const matchesSearch = searchQuery === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTheme && matchesSearch;
  });

  function handleNarrativeClick(narrativeId: string) {
    narrative.loadNarrative(narrativeId);
  }

  function formatYearRange(start: number, end: number): string {
    const startStr = start < 0 ? `${Math.abs(start)} BCE` : `${start} CE`;
    const endStr = end < 0 ? `${Math.abs(end)} BCE` : `${end} CE`;
    return `${startStr} - ${endStr}`;
  }

  function formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  async function handleAISubmit() {
    if (!aiQuery.trim()) return;

    isGenerating = true;
    error = '';

    try {
      const generated = await generateNarrative({ query: aiQuery.trim() });
      narrative.loadNarrative(generated.id);
      aiQuery = ''; // Clear input on success
      activeTab = 'browse'; // Switch back to browse after generation
      
      // Force update to show new narrative
      narrativesVersion = getNarrativesVersion();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to generate narrative. Please try again.';
      console.error('Narrative generation error:', e);
    } finally {
      isGenerating = false;
    }
  }

  async function handleScrape() {
    if (!urlInput.trim()) return;

    isScraping = true;
    scrapeError = '';
    scrapedContent = null;

    try {
      scrapedContent = await scrapeUrl(urlInput.trim());
      urlStep = 'preview';
    } catch (e) {
      scrapeError = e instanceof Error ? e.message : 'Failed to extract content from URL';
    } finally {
      isScraping = false;
    }
  }

  async function handleGenerateFromUrl() {
    if (!scrapedContent) return;

    isGeneratingFromUrl = true;
    scrapeError = '';

    try {
      const generated = await generateNarrativeFromContent({
        sourceContent: scrapedContent.content,
        sourceTitle: scrapedContent.title,
        sourceUrl: scrapedContent.sourceUrl,
        sourceType: scrapedContent.sourceType,
        focusQuery: focusQuery.trim() || undefined,
      });
      narrative.loadNarrative(generated.id);

      // Reset state
      urlInput = '';
      focusQuery = '';
      scrapedContent = null;
      urlStep = 'input';
      activeTab = 'browse';
      narrativesVersion = getNarrativesVersion();
    } catch (e) {
      scrapeError = e instanceof Error ? e.message : 'Failed to generate narrative';
      console.error('Narrative from URL error:', e);
    } finally {
      isGeneratingFromUrl = false;
    }
  }

  function resetUrlFlow() {
    urlStep = 'input';
    scrapedContent = null;
    scrapeError = '';
    focusQuery = '';
  }

  function formatWordCount(text: string): string {
    const words = text.split(/\s+/).filter(Boolean).length;
    if (words > 1000) return `${(words / 1000).toFixed(1)}k words`;
    return `${words} words`;
  }

  function useExample(example: string) {
    aiQuery = example;
  }
</script>

{#if isOpen}
  <div class="narrative-library glass">
    <!-- Header with tabs -->
    <div class="library-header">
      <div class="header-row">
        <h2>📚 Historical Journeys</h2>
        <button class="close-btn" on:click={() => dispatch('close')} title="Close">✕</button>
      </div>
      <div class="tabs">
        <button
          class="tab-btn"
          class:active={activeTab === 'browse'}
          on:click={() => activeTab = 'browse'}
        >
          Browse
        </button>
        <button
          class="tab-btn"
          class:active={activeTab === 'create'}
          on:click={() => activeTab = 'create'}
        >
          ✨ Create
        </button>
        <button
          class="tab-btn"
          class:active={activeTab === 'from-url'}
          on:click={() => activeTab = 'from-url'}
        >
          From URL
        </button>
      </div>
    </div>

    {#if activeTab === 'browse'}
      <!-- Search bar -->
      <input
        type="search"
        placeholder="Search narratives..."
        bind:value={searchQuery}
        class="search-input"
      />

      <!-- Theme filters -->
      <div class="theme-filters">
        {#each themes as theme}
          <button
            class="theme-btn"
            class:active={selectedTheme === theme}
            on:click={() => selectedTheme = theme}
          >
            {theme}
          </button>
        {/each}
      </div>

      <!-- Narrative list -->
      <div class="narrative-list">
      {#if filteredNarratives.length === 0}
        <p class="no-results">No narratives found. Try a different search.</p>
      {:else}
        {#each filteredNarratives as n (n.id)}
          <div
            class="narrative-card"
            on:click={() => handleNarrativeClick(n.id)}
            on:keydown={(e) => e.key === 'Enter' && handleNarrativeClick(n.id)}
            role="button"
            tabindex="0"
          >
            <!-- Theme badge -->
            <span class="theme-badge">{n.theme}</span>

            <!-- Title and description -->
            <h3>{n.title}</h3>
            <p class="description">{n.description}</p>

            <!-- Metadata -->
            <div class="narrative-meta">
              <span title="Number of locations">📍 {n.steps.length} steps</span>
              <span title="Estimated duration">⏱ {formatDuration(n.totalDuration)}</span>
              <span title="Time period">{formatYearRange(n.startYear, n.endYear)}</span>
            </div>

            <!-- Tags -->
            {#if n.tags.length > 0}
              <div class="tags">
                {#each n.tags.slice(0, 4) as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
            {/if}

            <!-- Creator badge -->
            {#if n.createdBy === 'ai'}
              <span class="ai-badge">🤖 AI Generated</span>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
    {:else if activeTab === 'create'}
      <!-- Create tab: AI generation -->
      <div class="create-panel">
        <h3>🤖 AI Historical Journeys</h3>

        {#if !aiAvailable}
          <div class="warning">
            <p>
              <strong>⚠️ Backend Server Required</strong><br />
              AI generation requires the backend server to be running. Follow these steps:
            </p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem; font-size: 0.875rem;">
              <li>Install dependencies: <code>npm install</code></li>
              <li>Create <code>.env</code> file with your API key:<br>
                <pre style="margin: 0.25rem 0;">ANTHROPIC_API_KEY=sk-ant-api03-your-key-here</pre>
              </li>
              <li>Start both servers:<br>
                <pre style="margin: 0.25rem 0;">npm run dev:all</pre>
              </li>
            </ol>
            <p class="small">For now, explore the pre-made sample narratives in the Browse tab.</p>
          </div>
        {:else}
          <form on:submit|preventDefault={handleAISubmit}>
            <input
              type="text"
              placeholder="Ask Claude to create a historical journey..."
              bind:value={aiQuery}
              disabled={isGenerating}
              class="prompt-input"
            />

            <button type="submit" disabled={isGenerating || !aiQuery.trim()} class="generate-btn">
              {#if isGenerating}
                <span class="spinner"></span>
                Generating...
              {:else}
                ✨ Generate
              {/if}
            </button>
          </form>

          {#if error}
            <p class="error">{error}</p>
          {/if}

          <div class="example-queries">
            <p class="examples-label">Example queries:</p>
            {#each exampleQueries as example}
              <button
                class="example-btn"
                on:click={() => useExample(example)}
                disabled={isGenerating}
              >
                {example}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {:else if activeTab === 'from-url'}
      <!-- From URL tab -->
      <div class="create-panel">
        {#if urlStep === 'input'}
          <h3>Generate from URL</h3>
          <p class="url-hint">Supports YouTube, articles, Wikipedia, podcast RSS feeds</p>

          <form on:submit|preventDefault={handleScrape}>
            <input
              type="url"
              placeholder="Paste a URL..."
              bind:value={urlInput}
              disabled={isScraping}
              class="prompt-input"
            />

            <button type="submit" disabled={isScraping || !urlInput.trim()} class="generate-btn">
              {#if isScraping}
                <span class="spinner"></span>
                Extracting...
              {:else}
                Extract Content
              {/if}
            </button>
          </form>

          {#if scrapeError}
            <p class="error">{scrapeError}</p>
          {/if}

        {:else if urlStep === 'preview' && scrapedContent}
          <div class="preview-card">
            <span class="source-badge source-{scrapedContent.sourceType}">
              {scrapedContent.sourceType === 'youtube' ? 'YouTube' : scrapedContent.sourceType === 'podcast' ? 'Podcast' : 'Article'}
            </span>

            <h3 class="preview-title">{scrapedContent.title}</h3>

            {#if scrapedContent.metadata.author || scrapedContent.metadata.siteName}
              <p class="preview-meta">
                {scrapedContent.metadata.author || ''}{scrapedContent.metadata.author && scrapedContent.metadata.siteName ? ' · ' : ''}{scrapedContent.metadata.siteName || ''}
              </p>
            {/if}

            <p class="preview-excerpt">
              {scrapedContent.content.slice(0, 300)}{scrapedContent.content.length > 300 ? '...' : ''}
            </p>
            <p class="preview-stats">{formatWordCount(scrapedContent.content)}</p>
          </div>

          <form on:submit|preventDefault={handleGenerateFromUrl}>
            <input
              type="text"
              placeholder="What do you want to learn? (optional)"
              bind:value={focusQuery}
              disabled={isGeneratingFromUrl}
              class="prompt-input"
            />

            <button type="submit" disabled={isGeneratingFromUrl} class="generate-btn">
              {#if isGeneratingFromUrl}
                <span class="spinner"></span>
                Generating...
              {:else}
                Generate Narrative
              {/if}
            </button>
          </form>

          {#if scrapeError}
            <p class="error">{scrapeError}</p>
          {/if}

          <button class="back-link" on:click={resetUrlFlow}>
            Try Different URL
          </button>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .narrative-library {
    width: 420px;
    max-height: calc(100vh - 200px);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    margin-left: 10px;
  }

  .library-header {
    margin-bottom: 1rem;
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--ink);
  }

  .library-header h2 {
    margin: 0;
    font-family: var(--font-pixel);
    font-size: 14px;
    letter-spacing: 0.08em;
    color: var(--ink);
    text-transform: uppercase;
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
    font-size: 16px;
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

  .tabs {
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

  .search-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--ink);
    background: var(--parchment-2);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
    transition: none;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--rubric);
    background: var(--parchment);
  }

  .search-input::placeholder {
    color: var(--ink-faded);
  }

  .theme-filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .theme-btn {
    padding: 6px 10px;
    border: 2px solid var(--ink);
    background: var(--parchment);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
  }

  .theme-btn:hover,
  .theme-btn:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }

  .theme-btn.active {
    background: var(--ink);
    color: var(--parchment);
  }

  .narrative-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .narrative-card {
    padding: 14px 12px;
    border: none;
    border-bottom: 1px dotted var(--ink-faded);
    background: transparent;
    color: var(--ink);
    cursor: pointer;
    transition: none;
    position: relative;
  }

  .narrative-card:hover,
  .narrative-card:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    outline: none;
  }
  .narrative-card:hover *,
  .narrative-card:focus-visible * {
    color: var(--parchment) !important;
    border-color: var(--parchment) !important;
  }

  .theme-badge {
    position: absolute;
    top: 14px;
    right: 12px;
    padding: 3px 8px;
    background: var(--parchment-2);
    color: var(--rubric);
    border: 1px solid var(--ink);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    font-weight: 600;
    text-transform: uppercase;
  }

  .narrative-card h3 {
    margin: 0 0 0.35rem;
    font-family: var(--font-pixel);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
    padding-right: 90px;
    line-height: 1.3;
  }

  .description {
    margin: 0 0 0.5rem;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink-faded);
  }

  .narrative-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
  }

  .narrative-meta span {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faded);
  }

  .tags {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .tag {
    padding: 2px 6px;
    background: var(--parchment-2);
    border: 1px solid var(--ink-faded);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.05em;
    color: var(--ink-faded);
  }

  .ai-badge {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 2px 6px;
    background: var(--parchment-2);
    border: 1px solid var(--rubric);
    color: var(--rubric);
    font-family: var(--font-pixel);
    font-size: 9px;
    letter-spacing: 0.1em;
  }

  .no-results {
    text-align: center;
    color: var(--ink-faded);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14px;
    padding: 2rem 1rem;
  }

  /* Custom scrollbar for narrative list */
  .narrative-list::-webkit-scrollbar {
    width: 8px;
  }
  .narrative-list::-webkit-scrollbar-track {
    background: var(--parchment-3);
  }
  .narrative-list::-webkit-scrollbar-thumb {
    background: var(--ink);
    border: 1px solid var(--parchment-3);
  }
  .narrative-list::-webkit-scrollbar-thumb:hover {
    background: var(--ink-2);
  }

  /* Create Panel */
  .create-panel {
    padding-top: 0.5rem;
  }

  .create-panel h3 {
    margin: 0 0 1rem;
    font-family: var(--font-pixel);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .warning {
    padding: 12px 14px;
    background: var(--parchment-2);
    border: 2px solid var(--rubric);
    color: var(--ink-2);
  }

  .warning p {
    margin: 0 0 0.75rem;
    font-family: var(--font-serif);
    font-size: 14px;
    line-height: 1.5;
  }

  .warning p:last-child { margin-bottom: 0; }
  .warning strong { color: var(--rubric); font-family: var(--font-pixel); font-size: 10px; letter-spacing: 0.1em; }

  .warning pre {
    margin: 0.5rem 0;
    padding: 8px 10px;
    background: var(--parchment-3);
    border: 1px solid var(--ink);
    font-family: var(--font-mono);
    font-size: 12px;
    overflow-x: auto;
    color: var(--ink);
  }

  .warning code {
    background: var(--parchment-3);
    padding: 1px 4px;
    border: 1px solid var(--ink-faded);
    font-family: var(--font-mono);
    font-size: 12px;
  }

  .small {
    font-size: 12px;
    opacity: 0.85;
  }

  .create-panel form {
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

  .example-queries {
    border-top: 1px dotted var(--ink-faded);
    padding-top: 1rem;
  }

  .examples-label {
    margin: 0 0 0.625rem;
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.15em;
    color: var(--rubric);
    text-transform: uppercase;
  }

  .example-btn {
    display: block;
    width: 100%;
    text-align: left;
    padding: 8px 12px;
    margin-bottom: 0.4rem;
    background: transparent;
    border: 1px dotted var(--ink-faded);
    color: var(--ink);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14px;
    cursor: pointer;
    transition: none;
  }

  .example-btn:hover:not(:disabled),
  .example-btn:focus-visible:not(:disabled) {
    background: var(--ink);
    color: var(--parchment);
    border-color: var(--ink);
    outline: none;
  }

  .example-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* From URL tab */
  .url-hint {
    margin: 0 0 1rem;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 13px;
    color: var(--ink-faded);
  }

  .preview-card {
    padding: 12px 14px;
    background: var(--parchment-2);
    border: 2px solid var(--ink);
    margin-bottom: 1rem;
    position: relative;
    box-shadow: 2px 2px 0 var(--ink);
  }

  .source-badge {
    display: inline-block;
    padding: 2px 6px;
    border: 1px solid var(--ink);
    font-family: var(--font-pixel);
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .source-youtube {
    background: var(--parchment);
    color: var(--rubric);
  }

  .source-article {
    background: var(--parchment);
    color: var(--ink);
  }

  .source-podcast {
    background: var(--parchment);
    color: var(--gold);
  }

  .preview-title {
    margin: 0 0 0.5rem;
    font-family: var(--font-pixel);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .preview-meta {
    margin: 0 0 0.5rem;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--ink-faded);
  }

  .preview-excerpt {
    margin: 0 0 0.5rem;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 13px;
    line-height: 1.5;
    color: var(--ink-2);
  }

  .preview-stats {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--ink-faded);
  }

  .back-link {
    display: block;
    width: 100%;
    text-align: center;
    padding: 0.5rem;
    margin-top: 0.75rem;
    background: none;
    border: 1px dotted var(--ink-faded);
    color: var(--ink-faded);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: none;
  }

  .back-link:hover,
  .back-link:focus-visible {
    background: var(--ink);
    color: var(--parchment);
    border-color: var(--ink);
    outline: none;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .narrative-library {
      width: 100%;
      height: 100%;
      max-height: 100%;
      margin-left: 0;
    }

    .theme-filters {
      overflow-x: auto;
      flex-wrap: nowrap;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .theme-filters::-webkit-scrollbar {
      display: none;
    }

    .tabs {
      flex-wrap: wrap;
    }

    .close-btn {
      min-width: 44px;
      min-height: 44px;
    }
  }
</style>
