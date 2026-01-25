/**
 * Embeddings API Client
 *
 * Calls the backend /api/embeddings endpoint to generate embeddings
 * using Anthropic's voyage-3-lite model.
 */

interface EmbeddingsResponse {
  embeddings: number[][];
  model: string;
  usage: {
    input_tokens?: number;
  };
}

/**
 * Generate embedding for a single text query
 *
 * @param query - The text to embed
 * @returns The embedding vector (1024 dimensions for voyage-3-lite)
 * @throws Error if the API call fails
 */
export async function generateEmbedding(query: string): Promise<number[]> {
  const embeddings = await generateEmbeddings([query]);
  return embeddings[0];
}

/**
 * Generate embeddings for multiple texts
 *
 * @param texts - Array of texts to embed
 * @returns Array of embedding vectors
 * @throws Error if the API call fails
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const response = await fetch(`${backendUrl}/api/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      texts,
      model: 'voyage-3-lite',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Embeddings request failed: ${response.status}`);
  }

  const data: EmbeddingsResponse = await response.json();

  if (!data.embeddings || !Array.isArray(data.embeddings)) {
    throw new Error('Invalid response from embeddings API');
  }

  return data.embeddings;
}

/**
 * Check if embeddings API is available
 * This is a quick check that doesn't consume tokens
 */
export async function checkEmbeddingsAvailability(): Promise<boolean> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  try {
    const response = await fetch(`${backendUrl}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      return data.hasApiKey === true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
