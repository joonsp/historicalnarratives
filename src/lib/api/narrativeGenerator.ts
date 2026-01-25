/**
 * AI Narrative Generator
 *
 * Generates narrative timelines using Claude AI based on natural language queries.
 * This is a placeholder implementation that can be activated with an API key.
 */

import type { NarrativeTimeline, NarrativeStep } from '../data/narrativeTimelines';
import { registerNarrative, calculateTotalDuration } from '../data/narrativeTimelines';
import { getCachedNarrative, cacheNarrative } from './narrativeCache';
import { generateEmbedding } from './embeddingsClient';
import { getSemanticCache, saveNarrative } from '../stores/persistedNarratives';
import { findSimilarNarrative, validateEmbedding } from '../utils/semanticSearch';

interface GenerationRequest {
  query: string;
  theme?: string;
  startYear?: number;
  endYear?: number;
  stepCount?: number;
}

/**
 * System prompt for Claude AI
 */
const NARRATIVE_SYSTEM_PROMPT = `You are a historical timeline generator for an interactive map application.

When given a query about a historical event, period, or narrative, generate a structured JSON timeline with:
1. 5-15 chronological steps (events/locations)
2. Precise geographic coordinates (lat/lng)
3. Brief but engaging descriptions (2-3 sentences each)
4. Historical significance and context
5. Links to resources when relevant

Focus on:
- Historical accuracy and verifiable facts
- Geographic specificity (actual battle sites, cities, routes)
- Narrative flow (tell a compelling story)
- Educational value (context, significance, consequences)

Output ONLY valid JSON matching this schema:
{
  "title": "...",
  "description": "...",
  "theme": "...",
  "steps": [
    {
      "title": "...",
      "year": -480,
      "location": [38.7967, 22.5367],
      "description": "...",
      "eventType": "battle",
      "mapZoom": 8
    }
  ],
  "tags": ["tag1", "tag2"],
  "startYear": -480,
  "endYear": -323,
  "regions": ["Greece", "Persia"]
}`;

/**
 * Build the user prompt from the request
 */
function buildPrompt(request: GenerationRequest): string {
  let prompt = `Create a historical narrative timeline for: ${request.query}\n\n`;

  if (request.theme) {
    prompt += `Theme: ${request.theme}\n`;
  }

  if (request.startYear !== undefined && request.endYear !== undefined) {
    prompt += `Time period: ${request.startYear} to ${request.endYear}\n`;
  }

  if (request.stepCount) {
    prompt += `Number of steps: approximately ${request.stepCount}\n`;
  }

  prompt += '\nReturn ONLY the JSON object, no additional text.';

  return prompt;
}

/**
 * Parse Claude's response and create a NarrativeTimeline
 */
function parseNarrativeResponse(responseText: string): NarrativeTimeline {
  // Try to extract JSON from the response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response');
  }

  const data = JSON.parse(jsonMatch[0]);

  // Validate required fields
  if (!data.title || !data.steps || !Array.isArray(data.steps)) {
    throw new Error('Invalid narrative structure');
  }

  // Generate ID from title
  const id = `ai-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  // Ensure steps have required fields
  const steps: NarrativeStep[] = data.steps.map((step: any, index: number) => ({
    id: `${id}-step-${index + 1}`,
    sequenceNumber: index + 1,
    year: step.year || 0,
    location: step.location as [number, number],
    duration: step.duration || 6,
    title: step.title,
    description: step.description,
    eventType: step.eventType || 'journey',
    mapZoom: step.mapZoom || 8,
    transitionType: step.transitionType || 'fly',
    transitionDuration: step.transitionDuration,
    relatedEventIds: step.relatedEventIds,
    media: step.media,
    links: step.links,
  }));

  const narrative: NarrativeTimeline = {
    id,
    title: data.title,
    description: data.description || '',
    theme: data.theme || 'Custom',
    steps,
    totalDuration: calculateTotalDuration(steps),
    createdBy: 'ai',
    createdAt: new Date(),
    tags: data.tags || [],
    startYear: data.startYear || steps[0]?.year || 0,
    endYear: data.endYear || steps[steps.length - 1]?.year || 0,
    regions: data.regions || [],
  };

  return narrative;
}

/**
 * Generate a narrative timeline using Claude AI via backend server
 *
 * NOTE: This requires the backend server to be running (npm run dev:server)
 * and ANTHROPIC_API_KEY to be set in .env file.
 */
export async function generateNarrative(request: GenerationRequest): Promise<NarrativeTimeline> {
  // Step 1: Check exact cache first (backward compatibility)
  const exactCached = getCachedNarrative(request.query);
  if (exactCached) {
    console.log('✅ Using exact cached narrative for:', request.query);
    registerNarrative(exactCached);
    return exactCached;
  }

  // Step 2: Generate embedding for semantic search
  // Note: Currently disabled - Anthropic doesn't provide embeddings API
  // Would need Voyage AI or similar service for semantic search
  let queryEmbedding: number[] | null = null;
  
  // Uncomment this block if you add an embeddings service:
  /*
  try {
    queryEmbedding = await generateEmbedding(request.query);
    
    if (!validateEmbedding(queryEmbedding)) {
      console.warn('Invalid embedding generated, skipping semantic search');
      queryEmbedding = null;
    }
  } catch (error) {
    console.warn('Failed to generate embedding, skipping semantic search:', error);
  }
  */

  // Step 3: Semantic search in persisted narratives (only if embeddings are available)
  if (queryEmbedding) {
    const semanticCache = getSemanticCache().filter(entry => entry.embedding.length > 0);
    
    if (semanticCache.length > 0) {
      const similarMatch = findSimilarNarrative(queryEmbedding, semanticCache, 0.85);

      if (similarMatch) {
        console.log(
          `🔍 Using semantically similar narrative (${(similarMatch.similarity * 100).toFixed(1)}% match):`,
          `"${similarMatch.entry.query}" → "${request.query}"`
        );
        registerNarrative(similarMatch.entry.narrative);
        return similarMatch.entry.narrative;
      }
    } else {
      console.log('ℹ️ No embeddings available for semantic search (narratives will still persist)');
    }
  }

  // Step 4: No match found - generate new narrative
  console.log('🤖 Generating new narrative for:', request.query);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const response = await fetch(`${backendUrl}/api/generate-narrative`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: request.query,
      theme: request.theme,
      startYear: request.startYear,
      endYear: request.endYear,
      stepCount: request.stepCount,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Request failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.narrative) {
    throw new Error('Invalid response from server');
  }

  // Parse and validate the narrative
  const narrative = parseNarrativeResponse(data.narrative);

  // Step 5: Save to persistent storage (with or without embedding)
  if (data.queryEmbedding && validateEmbedding(data.queryEmbedding)) {
    console.log('💾 Saved with semantic search enabled');
    saveNarrative(request.query, data.queryEmbedding, narrative);
  } else {
    // Save with empty embedding array - still persists, but no semantic search
    saveNarrative(request.query, [], narrative);
  }

  // Also save to transient cache for backward compatibility
  cacheNarrative(request.query, narrative);

  // Step 6: Register in the global store
  registerNarrative(narrative);

  return narrative;
}

/**
 * Check if AI generation is available (backend server is running)
 * This makes a quick health check to the backend
 */
export async function checkAIAvailability(): Promise<boolean> {
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

/**
 * Synchronous check - returns true if we should show AI UI
 * Use checkAIAvailability() for actual backend health check
 */
export function isAIGenerationAvailable(): boolean {
  // Always return true to show the UI - actual availability is checked when generating
  // This avoids async issues in component initialization
  return true;
}
