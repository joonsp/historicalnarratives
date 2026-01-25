/**
 * Semantic Search Utilities
 *
 * Cosine similarity and semantic matching for narrative caching.
 */

import type { SemanticCacheEntry } from '../stores/persistedNarratives';

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1, where:
 * - 1 = identical vectors
 * - 0 = orthogonal vectors
 * - -1 = opposite vectors
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have same dimension');
  }

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);

  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

/**
 * Find the most similar narrative in the cache based on embedding similarity
 *
 * @param queryEmbedding - The embedding vector for the query
 * @param cache - Array of cached narratives with embeddings
 * @param threshold - Minimum similarity score (default 0.85)
 * @returns The best matching cache entry and its similarity score, or null if no match above threshold
 */
export function findSimilarNarrative(
  queryEmbedding: number[],
  cache: SemanticCacheEntry[],
  threshold = 0.85
): { entry: SemanticCacheEntry; similarity: number } | null {
  if (cache.length === 0) {
    return null;
  }

  let bestMatch: { entry: SemanticCacheEntry; similarity: number } | null = null;

  for (const entry of cache) {
    try {
      const similarity = cosineSimilarity(queryEmbedding, entry.embedding);

      if (similarity >= threshold) {
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { entry, similarity };
        }
      }
    } catch (error) {
      console.warn(`Skipping invalid embedding for ${entry.id}:`, error);
      continue;
    }
  }

  return bestMatch;
}

/**
 * Validate that an embedding has the expected dimensions
 */
export function validateEmbedding(embedding: number[], expectedDim = 1024): boolean {
  if (!Array.isArray(embedding)) {
    return false;
  }

  if (embedding.length !== expectedDim) {
    return false;
  }

  // Check that all elements are numbers
  return embedding.every(val => typeof val === 'number' && !isNaN(val));
}
