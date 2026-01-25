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
  <h3>🤖 AI Historical Journeys</h3>

  {#if !aiAvailable}
    <div class="warning">
      <p>
        <strong>⚠️ AI Generation Not Available</strong><br />
        To enable AI-powered narrative generation, add your Anthropic API key to a <code>.env</code> file:
      </p>
      <pre>VITE_ANTHROPIC_API_KEY=your_key_here</pre>
      <p class="small">For now, explore the pre-made sample narratives in the library.</p>
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit}>
      <input
        type="text"
        placeholder="Ask Claude to create a historical journey..."
        bind:value={query}
        disabled={isGenerating}
        class="prompt-input"
      />

      <button type="submit" disabled={isGenerating || !query.trim()} class="generate-btn">
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

<style>
  .narrative-prompt {
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 400px;
    padding: 1.5rem;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  h3 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
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
    .narrative-prompt {
      left: 10px;
      bottom: 10px;
      width: calc(100% - 20px);
      max-width: 400px;
    }
  }
</style>
