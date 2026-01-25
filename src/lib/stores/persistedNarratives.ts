/**
 * Persisted Narratives Store
 *
 * Manages AI-generated narratives with embeddings in localStorage for:
 * 1. Semantic caching (avoid regenerating similar queries)
 * 2. Persistence across page reloads
 * 3. Display in Browse tab alongside sample narratives
 */

import type { NarrativeTimeline } from '../data/narrativeTimelines';

export interface PersistedNarrative {
  id: string;
  query: string;
  queryEmbedding: number[]; // 1024-dim vector from voyage-3-lite
  narrative: NarrativeTimeline;
  generatedAt: string; // ISO date string
  lastAccessed: string; // ISO date string for LRU
  model: string;
  version: number;
}

const STORAGE_KEY = 'historymap-persisted-narratives';
const STORAGE_VERSION = 1;
const MAX_NARRATIVES = 50;

/**
 * Save a narrative with its embedding to persistent storage
 */
export function saveNarrative(
  query: string,
  embedding: number[],
  narrative: NarrativeTimeline
): void {
  try {
    let narratives = loadAllPersistedNarratives();

    // Remove existing entry with same ID if present
    narratives = narratives.filter(n => n.id !== narrative.id);

    // Add new entry
    const persisted: PersistedNarrative = {
      id: narrative.id,
      query: query.trim(),
      queryEmbedding: embedding,
      narrative,
      generatedAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      model: 'voyage-3-lite',
      version: STORAGE_VERSION,
    };

    narratives.push(persisted);

    // LRU pruning: keep only MAX_NARRATIVES, remove oldest by lastAccessed
    if (narratives.length > MAX_NARRATIVES) {
      narratives.sort((a, b) =>
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      );
      narratives = narratives.slice(0, MAX_NARRATIVES);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(narratives));
    console.log(`💾 Saved narrative "${narrative.title}" to localStorage (${narratives.length} total)`);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded - removing oldest narratives');
      // Emergency cleanup: remove oldest half
      const narratives = loadAllPersistedNarratives();
      narratives.sort((a, b) =>
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      );
      const pruned = narratives.slice(0, Math.floor(MAX_NARRATIVES / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    } else {
      console.error('Error saving persisted narrative:', error);
    }
  }
}

/**
 * Load all persisted narratives from localStorage
 */
export function loadAllPersistedNarratives(): PersistedNarrative[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const narratives: PersistedNarrative[] = JSON.parse(stored);

    // Filter by version
    return narratives.filter(n => n.version === STORAGE_VERSION);
  } catch (error) {
    console.error('Error loading persisted narratives:', error);
    return [];
  }
}

/**
 * Get a specific persisted narrative by ID and update lastAccessed
 */
export function getPersistedNarrative(id: string): NarrativeTimeline | null {
  try {
    const narratives = loadAllPersistedNarratives();
    const found = narratives.find(n => n.id === id);

    if (found) {
      // Update lastAccessed
      found.lastAccessed = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(narratives));
      return found.narrative;
    }

    return null;
  } catch (error) {
    console.error('Error getting persisted narrative:', error);
    return null;
  }
}

/**
 * Get all persisted narratives as NarrativeTimeline array for Browse tab
 */
export function getAllPersistedNarratives(): NarrativeTimeline[] {
  const persisted = loadAllPersistedNarratives();
  return persisted.map(p => {
    // Ensure createdAt is a Date object (it becomes a string after JSON.parse)
    const narrative = {
      ...p.narrative,
      createdAt: typeof p.narrative.createdAt === 'string' 
        ? new Date(p.narrative.createdAt) 
        : p.narrative.createdAt
    };
    return narrative;
  });
}

/**
 * Get semantic cache entries (embeddings) for similarity search
 */
export interface SemanticCacheEntry {
  id: string;
  query: string;
  embedding: number[];
  narrative: NarrativeTimeline;
}

export function getSemanticCache(): SemanticCacheEntry[] {
  const persisted = loadAllPersistedNarratives();
  return persisted.map(p => ({
    id: p.id,
    query: p.query,
    embedding: p.queryEmbedding,
    narrative: p.narrative,
  }));
}

/**
 * Clear all persisted narratives
 */
export function clearPersistedNarratives(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing persisted narratives:', error);
  }
}

/**
 * Get storage statistics
 */
export function getStorageStats(): {
  count: number;
  sizeKB: number;
  oldestDate: string | null;
  newestDate: string | null;
} {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { count: 0, sizeKB: 0, oldestDate: null, newestDate: null };
    }

    const narratives: PersistedNarrative[] = JSON.parse(stored);
    const sizeKB = Math.round(stored.length / 1024);

    if (narratives.length === 0) {
      return { count: 0, sizeKB, oldestDate: null, newestDate: null };
    }

    const dates = narratives.map(n => new Date(n.generatedAt).getTime());
    const oldest = new Date(Math.min(...dates)).toISOString();
    const newest = new Date(Math.max(...dates)).toISOString();

    return { count: narratives.length, sizeKB, oldestDate: oldest, newestDate: newest };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return { count: 0, sizeKB: 0, oldestDate: null, newestDate: null };
  }
}
