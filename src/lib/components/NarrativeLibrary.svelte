<script lang="ts">
  import { onMount } from 'svelte';
  import { narrative, isNarrativeMode } from '../stores/narrative';
  import { sampleNarratives } from '../data/sampleNarratives';
  import { generateNarrative, isAIGenerationAvailable } from '../api/narrativeGenerator';
  import { getAllNarratives, getNarrativesVersion } from '../data/narrativeTimelines';

  export let isOpen = false;
  let searchQuery = '';
  let selectedTheme = 'all';
  let activeTab: 'browse' | 'create' = 'browse';

  // AI generation state
  let aiQuery = '';
  let isGenerating = false;
  let error = '';
  let aiAvailable = isAIGenerationAvailable();

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

  function useExample(example: string) {
    aiQuery = example;
  }
</script>

{#if isOpen}
  <div class="narrative-library glass">
    <!-- Header with tabs -->
    <div class="library-header">
      <h2>📚 Historical Journeys</h2>
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
    {:else}
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
    {/if}
  </div>
{/if}

<style>
  .narrative-library {
    position: fixed;
    top: 80px;
    right: 20px;
    width: 420px;
    max-height: calc(100vh - 100px);
    padding: 1.5rem;
    z-index: 900;
    display: flex;
    flex-direction: column;
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

  .library-header {
    margin-bottom: 1rem;
  }

  .library-header h2 {
    margin: 0 0 0.75rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
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

  .search-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: #f1f5f9;
    font-size: 0.9375rem;
    margin-bottom: 1rem;
    transition: all 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.08);
  }

  .search-input::placeholder {
    color: #64748b;
  }

  .theme-filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .theme-btn {
    padding: 0.5rem 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    color: #cbd5e1;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: capitalize;
  }

  .theme-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .theme-btn.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }

  .narrative-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .narrative-card {
    padding: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .narrative-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  .theme-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.625rem;
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .narrative-card h3 {
    margin: 0 0 0.5rem;
    font-size: 1.0625rem;
    font-weight: 600;
    color: #f1f5f9;
    padding-right: 60px;
  }

  .description {
    margin: 0 0 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #94a3b8;
  }

  .narrative-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
  }

  .narrative-meta span {
    font-size: 0.8125rem;
    color: #64748b;
  }

  .tags {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
    margin-top: 0.625rem;
  }

  .tag {
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .ai-badge {
    display: inline-block;
    margin-top: 0.625rem;
    padding: 0.25rem 0.5rem;
    background: rgba(168, 85, 247, 0.15);
    border: 1px solid rgba(168, 85, 247, 0.3);
    color: #a78bfa;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .no-results {
    text-align: center;
    color: #64748b;
    font-size: 0.9375rem;
    padding: 2rem 1rem;
  }

  /* Custom scrollbar */
  .narrative-list::-webkit-scrollbar {
    width: 6px;
  }

  .narrative-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .narrative-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .narrative-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Create Panel */
  .create-panel {
    padding-top: 0.5rem;
  }

  .create-panel h3 {
    margin: 0 0 1rem;
    font-size: 1.0625rem;
    font-weight: 600;
    color: #f1f5f9;
  }

  .warning {
    padding: 1rem;
    background: rgba(234, 179, 8, 0.1);
    border: 1px solid rgba(234, 179, 8, 0.3);
    border-radius: 8px;
    color: #fbbf24;
  }

  .warning p {
    margin: 0 0 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .warning p:last-child {
    margin-bottom: 0;
  }

  .warning strong {
    color: #fbbf24;
  }

  .warning pre {
    margin: 0.5rem 0;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    font-size: 0.8125rem;
    overflow-x: auto;
  }

  .warning code {
    background: rgba(0, 0, 0, 0.3);
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
    font-size: 0.8125rem;
  }

  .small {
    font-size: 0.8125rem;
    opacity: 0.8;
  }

  .create-panel form {
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

  .example-queries {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 1rem;
  }

  .examples-label {
    margin: 0 0 0.625rem;
    font-size: 0.8125rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .example-btn {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.625rem 0.875rem;
    margin-bottom: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #cbd5e1;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .example-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: #a78bfa;
    color: #f1f5f9;
    transform: translateX(2px);
  }

  .example-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .narrative-library {
      top: 80px;
      right: 10px;
      width: calc(100% - 20px);
      max-height: calc(100vh - 100px);
    }

    .theme-filters {
      overflow-x: auto;
      flex-wrap: nowrap;
    }

    .tabs {
      flex-wrap: wrap;
    }
  }
</style>
