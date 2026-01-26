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
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    max-width: 500px;
    padding: 0.5rem;
    z-index: 999;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translate(-50%, -10px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }

  .warning-compact {
    padding: 0.5rem 0.75rem;
    background: rgba(234, 179, 8, 0.1);
    border: 1px solid rgba(234, 179, 8, 0.3);
    border-radius: 6px;
    color: #fbbf24;
    font-size: 0.75rem;
    white-space: nowrap;
  }

  form {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .prompt-input {
    flex: 1;
    min-width: 300px;
    padding: 0.5rem 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    color: #f1f5f9;
    font-size: 0.875rem;
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
    padding: 0.5rem 0.75rem;
    background: linear-gradient(135deg, #a78bfa, #8b5cf6);
    border: none;
    border-radius: 6px;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
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

  .error-compact {
    padding: 0.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .narrative-prompt {
      top: 10px;
      max-width: calc(100vw - 20px);
    }

    .prompt-input {
      min-width: 200px;
      font-size: 0.8125rem;
    }

    .generate-btn {
      font-size: 0.875rem;
      min-width: 36px;
    }
  }
</style>
