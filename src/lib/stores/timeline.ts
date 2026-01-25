// Simple reactive store for timeline state
import { writable, derived } from 'svelte/store';

export type TimelineMode = 'chronological' | 'hh-release' | 'hh-chronological';

export interface TimelineState {
  year: number;
  isPlaying: boolean;
  playSpeed: number; // years per second
  mode: TimelineMode;
  minYear: number;
  maxYear: number;
}

const initialState: TimelineState = {
  year: 1800,
  isPlaying: false,
  playSpeed: 10,
  mode: 'chronological',
  minYear: -1000, // 1000 BCE
  maxYear: 2026,
};

function createTimelineStore() {
  const { subscribe, set, update } = writable<TimelineState>(initialState);

  return {
    subscribe,
    setYear: (year: number) => update(s => ({ ...s, year: Math.max(s.minYear, Math.min(s.maxYear, year)) })),
    togglePlay: () => update(s => ({ ...s, isPlaying: !s.isPlaying })),
    setPlaying: (isPlaying: boolean) => update(s => ({ ...s, isPlaying })),
    setSpeed: (playSpeed: number) => update(s => ({ ...s, playSpeed })),
    setMode: (mode: TimelineMode) => update(s => ({ ...s, mode })),
    stepForward: (step = 1) => update(s => ({ ...s, year: Math.min(s.maxYear, s.year + step) })),
    stepBackward: (step = 1) => update(s => ({ ...s, year: Math.max(s.minYear, s.year - step) })),
    reset: () => set(initialState),
  };
}

export const timeline = createTimelineStore();

// Derived store for formatted year display
export const formattedYear = derived(timeline, $t => {
  if ($t.year < 0) {
    return `${Math.abs($t.year)} BCE`;
  }
  return `${$t.year} CE`;
});
