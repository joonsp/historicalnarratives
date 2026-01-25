/**
 * Narrative Timeline Data Structures
 *
 * Defines types and helper functions for AI-generated narrative timelines
 * that guide users through historical journeys on the map.
 */

export interface NarrativeStep {
  id: string;
  sequenceNumber: number;
  year: number; // Historical year for context (negative for BCE)
  location: [number, number]; // [lat, lng]
  duration: number; // Display duration in seconds
  title: string;
  description: string; // AI-generated narrative text
  eventType: 'battle' | 'treaty' | 'journey' | 'discovery' | 'decision' | 'founding' | 'siege' | 'crossing';
  mapZoom: number; // Target zoom level
  transitionType: 'fly' | 'pan' | 'zoom';
  transitionDuration?: number; // Override default animation time
  relatedEventIds?: string[];
  media?: {
    imageUrl?: string;
    caption?: string;
  };
  links?: Array<{
    title: string;
    url: string;
  }>;
}

export interface NarrativeTimeline {
  id: string;
  title: string;
  description: string;
  theme: string;
  steps: NarrativeStep[];
  totalDuration: number; // Total duration in seconds
  createdBy: 'ai' | 'manual';
  createdAt: Date;
  tags: string[];
  startYear: number;
  endYear: number;
  regions: string[]; // Geographic regions covered
}

export interface NarrativeCache {
  query: string;
  queryHash: string;
  narrative: NarrativeTimeline;
  generatedAt: Date;
  model: string;
  version: number;
}

// In-memory store of all narratives
let narratives: Map<string, NarrativeTimeline> = new Map();

// Timestamp to track when narratives are updated (for reactivity)
let narrativesVersion = 0;

/**
 * Initialize narratives by loading persisted ones from localStorage
 */
async function initializeNarratives(): Promise<void> {
  try {
    // Import here to avoid circular dependencies
    const { getAllPersistedNarratives } = await import('../stores/persistedNarratives');
    const persisted = getAllPersistedNarratives();
    
    persisted.forEach(narrative => {
      narratives.set(narrative.id, narrative);
    });
    
    narrativesVersion++; // Trigger reactivity
    
    if (persisted.length > 0) {
      console.log(`📚 Loaded ${persisted.length} persisted narratives from localStorage`);
    }
  } catch (error) {
    console.warn('Failed to load persisted narratives:', error);
  }
}

// Auto-initialize when module loads
initializeNarratives();

/**
 * Register a narrative timeline in the global store
 */
export function registerNarrative(narrative: NarrativeTimeline): void {
  narratives.set(narrative.id, narrative);
  narrativesVersion++; // Trigger reactivity
}

/**
 * Get a narrative by its unique ID
 */
export function getNarrativeById(id: string): NarrativeTimeline | undefined {
  return narratives.get(id);
}

/**
 * Get all narratives matching a specific theme
 */
export function getNarrativesByTheme(theme: string): NarrativeTimeline[] {
  return Array.from(narratives.values()).filter(n =>
    n.theme.toLowerCase() === theme.toLowerCase()
  );
}

/**
 * Get all narratives that cover a specific region
 */
export function getNarrativesByRegion(region: string): NarrativeTimeline[] {
  return Array.from(narratives.values()).filter(n =>
    n.regions.some(r => r.toLowerCase().includes(region.toLowerCase()))
  );
}

/**
 * Get all narratives with any of the specified tags
 */
export function getNarrativesByTags(tags: string[]): NarrativeTimeline[] {
  const lowerTags = tags.map(t => t.toLowerCase());
  return Array.from(narratives.values()).filter(n =>
    n.tags.some(tag => lowerTags.includes(tag.toLowerCase()))
  );
}

/**
 * Get all registered narratives (triggers reactivity check)
 */
export function getAllNarratives(): NarrativeTimeline[] {
  // Reference version to trigger Svelte reactivity
  void narrativesVersion;
  return Array.from(narratives.values());
}

/**
 * Get the version number (for reactive components to track changes)
 */
export function getNarrativesVersion(): number {
  return narrativesVersion;
}

/**
 * Search narratives by title or description
 */
export function searchNarratives(query: string): NarrativeTimeline[] {
  const lowerQuery = query.toLowerCase();
  return Array.from(narratives.values()).filter(n =>
    n.title.toLowerCase().includes(lowerQuery) ||
    n.description.toLowerCase().includes(lowerQuery) ||
    n.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Calculate total duration of a narrative from its steps
 */
export function calculateTotalDuration(steps: NarrativeStep[]): number {
  return steps.reduce((total, step) => {
    const stepDuration = step.duration || 5; // Default 5 seconds
    const transitionDuration = step.transitionDuration || 2; // Default 2 seconds
    return total + stepDuration + transitionDuration;
  }, 0);
}

/**
 * Validate a narrative timeline structure
 */
export function validateNarrative(narrative: NarrativeTimeline): boolean {
  // Check required fields
  if (!narrative.id || !narrative.title || !narrative.steps) {
    return false;
  }

  // Check steps array
  if (!Array.isArray(narrative.steps) || narrative.steps.length === 0) {
    return false;
  }

  // Validate each step
  for (const step of narrative.steps) {
    if (!step.id || !step.title || !step.location) {
      return false;
    }

    // Validate location coordinates
    const [lat, lng] = step.location;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return false;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return false;
    }

    // Validate sequence number
    if (typeof step.sequenceNumber !== 'number' || step.sequenceNumber < 1) {
      return false;
    }
  }

  // Verify steps are in sequence order
  const sequences = narrative.steps.map(s => s.sequenceNumber).sort((a, b) => a - b);
  for (let i = 0; i < sequences.length; i++) {
    if (sequences[i] !== i + 1) {
      return false;
    }
  }

  return true;
}

/**
 * Get the geographic bounds of a narrative (for map fitting)
 */
export function getNarrativeBounds(narrative: NarrativeTimeline): [[number, number], [number, number]] | null {
  if (!narrative.steps || narrative.steps.length === 0) {
    return null;
  }

  const lats = narrative.steps.map(s => s.location[0]);
  const lngs = narrative.steps.map(s => s.location[1]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return [[minLat, minLng], [maxLat, maxLng]];
}
