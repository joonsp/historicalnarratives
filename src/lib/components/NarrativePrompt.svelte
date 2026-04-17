<script lang="ts">
  import { narrative } from '../stores/narrative';
  import { generateNarrative, isAIGenerationAvailable } from '../api/narrativeGenerator';

  let query = '';
  let isGenerating = false;
  let error = '';
  let aiAvailable = isAIGenerationAvailable();

  const exampleQueries = [
    "Tell me about Alexander the Great's conquest of Persia",
    "Show me Napoleon's campaigns",
    "The Lewis and Clark expedition",
    "Julius Caesar's Gallic Wars",
    "Hannibal's march to Rome",
  ];

  async function handleSubmit() {
    if (!query.trim()) return;

    isGenerating = true;
    error = '';

    try {
      const generated = await generateNarrative({ query: query.trim() });
      narrative.loadNarrative(generated.id);
      query = ''; // Clear input on success
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to generate narrative. Please try again.';
      console.error('Narrative generation error:', e);
    } finally {
      isGenerating = false;
    }
  }

  function useExample(example: string) {
    query = example;
  }
</script>

<div class="narrative-prompt glass">
  {#if !aiAvailable}
    <div class="warning-compact">
      ⚠️ AI unavailable - add VITE_ANTHROPIC_API_KEY to .env
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit}>
      <input
        type="text"
        placeholder="Create AI journey..."
        bind:value={query}
        disabled={isGenerating}
        class="prompt-input"
      />

      <button type="submit" disabled={isGenerating || !query.trim()} class="generate-btn">
        {#if isGenerating}
          <span class="spinner"></span>
        {:else}
          ✨
        {/if}
      </button>
    </form>

    {#if error}
      <p class="error-compact">{error}</p>
    {/if}
  {/if}
</div>

<style>
  .narrative-prompt {
    width: auto;
    max-width: 600px;
    padding: 8px;
  }

  .warning-compact {
    padding: 6px 10px;
    background: var(--parchment-2);
    border: 1px solid var(--rubric);
    color: var(--rubric);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  form {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .prompt-input {
    flex: 1;
    min-width: 300px;
    padding: 7px 12px;
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
    padding: 7px 12px;
    background: var(--rubric);
    border: 2px solid var(--ink);
    color: var(--parchment);
    font-family: var(--font-pixel);
    font-size: 11px;
    cursor: pointer;
    transition: none;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
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

  .error-compact {
    padding: 6px 10px;
    background: var(--parchment-2);
    border: 1px solid var(--rubric);
    color: var(--rubric);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 12px;
    margin-top: 8px;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .narrative-prompt {
      max-width: calc(100vw - 20px);
    }

    .prompt-input {
      min-width: 200px;
      font-size: 12px;
    }

    .generate-btn {
      font-size: 10px;
      min-width: 36px;
    }
  }
</style>
