/**
 * Narrative Cache Layer
 *
 * Caches AI-generated narratives in localStorage to avoid redundant API calls.
 */

import type { NarrativeTimeline } from '../data/narrativeTimelines';

interface CachedNarrative {
  query: string;
  queryHash: string;
  narrative: NarrativeTimeline;
  generatedAt: string; // ISO date string
  model: string;
  version: number;
}

const CACHE_KEY = 'historymap-narrative-cache';
const CACHE_VERSION = 1;
const MAX_CACHE_SIZE = 20;
const CACHE_EXPIRY_DAYS = 30;

/**
 * Generate a simple hash from a string
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if a cached narrative is recent enough
 */
function isRecent(generatedAt: string): boolean {
  const generated = new Date(generatedAt);
  const now = new Date();
  const daysDiff = (now.getTime() - generated.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff < CACHE_EXPIRY_DAYS;
}

/**
 * Get cached narrative if available and recent
 */
export function getCachedNarrative(query: string): NarrativeTimeline | null {
  try {
    const normalizedQuery = query.toLowerCase().trim();
    const hash = hashString(normalizedQuery);

    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return null;

    const cache: CachedNarrative[] = JSON.parse(cacheStr);
    const cached = cache.find((c) => c.queryHash === hash && c.version === CACHE_VERSION);

    if (cached && isRecent(cached.generatedAt)) {
      return cached.narrative;
    }

    return null;
  } catch (error) {
    console.error('Error reading from narrative cache:', error);
    return null;
  }
}

/**
 * Cache a generated narrative
 */
export function cacheNarrative(query: string, narrative: NarrativeTimeline): void {
  try {
    const normalizedQuery = query.toLowerCase().trim();
    const hash = hashString(normalizedQuery);

    let cache: CachedNarrative[] = [];

    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (cacheStr) {
      cache = JSON.parse(cacheStr);
    }

    // Remove old entry if exists
    cache = cache.filter((c) => c.queryHash !== hash);

    // Add new entry
    cache.push({
      query: normalizedQuery,
      queryHash: hash,
      narrative,
      generatedAt: new Date().toISOString(),
      model: 'claude-3-5-sonnet-20241022',
      version: CACHE_VERSION,
    });

    // Keep only most recent entries
    if (cache.length > MAX_CACHE_SIZE) {
      cache.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
      cache = cache.slice(0, MAX_CACHE_SIZE);
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error writing to narrative cache:', error);
  }
}

/**
 * Clear all cached narratives
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing narrative cache:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { count: number; oldestDate: string | null; newestDate: string | null } {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) {
      return { count: 0, oldestDate: null, newestDate: null };
    }

    const cache: CachedNarrative[] = JSON.parse(cacheStr);
    if (cache.length === 0) {
      return { count: 0, oldestDate: null, newestDate: null };
    }

    const dates = cache.map((c) => new Date(c.generatedAt).getTime());
    const oldest = new Date(Math.min(...dates)).toISOString();
    const newest = new Date(Math.max(...dates)).toISOString();

    return {
      count: cache.length,
      oldestDate: oldest,
      newestDate: newest,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { count: 0, oldestDate: null, newestDate: null };
  }
}
