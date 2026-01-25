/**
 * Narrative Store
 *
 * Manages narrative playback state and controls.
 * Operates independently from the timeline store when in narrative mode.
 */

import { writable, derived, get } from 'svelte/store';
import type { NarrativeTimeline, NarrativeStep } from '../data/narrativeTimelines';
import { getNarrativeById } from '../data/narrativeTimelines';
import { timeline } from './timeline';

interface NarrativeState {
  // Playback state
  isPlaying: boolean;
  currentNarrativeId: string | null;
  currentStepIndex: number;
  stepProgress: number; // 0-1 within current step

  // Configuration
  autoAdvance: boolean; // Auto-advance to next step
  stepDuration: number; // Default step duration override (seconds)
  transitionSpeed: number; // Animation speed multiplier (1 = normal)

  // UI state
  showNarrativePlayer: boolean;
  showStepCard: boolean;
}

// Playback interval reference
let playbackInterval: ReturnType<typeof setInterval> | null = null;

function createNarrativeStore() {
  const { subscribe, set, update } = writable<NarrativeState>({
    isPlaying: false,
    currentNarrativeId: null,
    currentStepIndex: 0,
    stepProgress: 0,
    autoAdvance: true,
    stepDuration: 5,
    transitionSpeed: 1,
    showNarrativePlayer: false,
    showStepCard: true,
  });

  /**
   * Get current step duration accounting for default override
   */
  function getCurrentStepDuration(state: NarrativeState): number {
    const narrative = getNarrativeById(state.currentNarrativeId || '');
    if (!narrative) return state.stepDuration;

    const step = narrative.steps[state.currentStepIndex];
    return step?.duration || state.stepDuration;
  }

  /**
   * Check if current step is the last step
   */
  function isLastStep(state: NarrativeState): boolean {
    const narrative = getNarrativeById(state.currentNarrativeId || '');
    if (!narrative) return true;
    return state.currentStepIndex >= narrative.steps.length - 1;
  }

  /**
   * Advance to next step
   */
  function advanceToNextStep(state: NarrativeState): NarrativeState {
    const narrative = getNarrativeById(state.currentNarrativeId || '');
    if (!narrative || isLastStep(state)) {
      return { ...state, isPlaying: false, stepProgress: 1 };
    }

    return {
      ...state,
      currentStepIndex: state.currentStepIndex + 1,
      stepProgress: 0
    };
  }

  /**
   * Go back to previous step
   */
  function goToPreviousStep(state: NarrativeState): NarrativeState {
    if (state.currentStepIndex <= 0) {
      return { ...state, stepProgress: 0 };
    }

    return {
      ...state,
      currentStepIndex: state.currentStepIndex - 1,
      stepProgress: 0
    };
  }

  /**
   * Start playback loop
   */
  function startPlayback() {
    if (playbackInterval) {
      clearInterval(playbackInterval);
    }

    playbackInterval = setInterval(() => {
      update(state => {
        if (!state.isPlaying) return state;

        const stepDuration = getCurrentStepDuration(state);
        const increment = (100 / (stepDuration * 100)) * state.transitionSpeed;

        if (state.stepProgress + increment >= 1) {
          // Step complete
          if (state.autoAdvance && !isLastStep(state)) {
            return advanceToNextStep(state);
          } else {
            return { ...state, isPlaying: false, stepProgress: 1 };
          }
        }

        return { ...state, stepProgress: state.stepProgress + increment };
      });
    }, 10); // Update 100 times per second
  }

  /**
   * Stop playback loop
   */
  function stopPlayback() {
    if (playbackInterval) {
      clearInterval(playbackInterval);
      playbackInterval = null;
    }
  }

  return {
    subscribe,

    /**
     * Load a narrative by ID and prepare for playback
     */
    loadNarrative: (id: string) => {
      const narrative = getNarrativeById(id);
      if (!narrative) {
        console.error(`Narrative not found: ${id}`);
        return;
      }

      stopPlayback();

      // Jump timeline to the starting year of the narrative
      if (narrative.steps && narrative.steps.length > 0) {
        timeline.setYear(narrative.steps[0].year);
      }

      update(state => ({
        ...state,
        currentNarrativeId: id,
        currentStepIndex: 0,
        stepProgress: 0,
        isPlaying: false,
        showNarrativePlayer: true,
        showStepCard: true
      }));
    },

    /**
     * Start playback
     */
    play: () => {
      update(state => ({ ...state, isPlaying: true }));
      startPlayback();
    },

    /**
     * Pause playback
     */
    pause: () => {
      update(state => ({ ...state, isPlaying: false }));
      stopPlayback();
    },

    /**
     * Toggle play/pause
     */
    togglePlay: () => {
      const state = get({ subscribe });
      if (state.isPlaying) {
        update(s => ({ ...s, isPlaying: false }));
        stopPlayback();
      } else {
        update(s => ({ ...s, isPlaying: true }));
        startPlayback();
      }
    },

    /**
     * Advance to next step
     */
    nextStep: () => {
      stopPlayback();
      update(state => advanceToNextStep(state));
    },

    /**
     * Go back to previous step
     */
    previousStep: () => {
      stopPlayback();
      update(state => goToPreviousStep(state));
    },

    /**
     * Jump to a specific step by index
     */
    jumpToStep: (index: number) => {
      stopPlayback();
      update(state => {
        const narrative = getNarrativeById(state.currentNarrativeId || '');
        if (!narrative || index < 0 || index >= narrative.steps.length) {
          return state;
        }

        return {
          ...state,
          currentStepIndex: index,
          stepProgress: 0,
          isPlaying: false
        };
      });
    },

    /**
     * Exit narrative mode and return to free explore
     */
    exitNarrative: () => {
      stopPlayback();
      set({
        isPlaying: false,
        currentNarrativeId: null,
        currentStepIndex: 0,
        stepProgress: 0,
        autoAdvance: true,
        stepDuration: 5,
        transitionSpeed: 1,
        showNarrativePlayer: false,
        showStepCard: false
      });
    },

    /**
     * Set auto-advance mode
     */
    setAutoAdvance: (value: boolean) => {
      update(state => ({ ...state, autoAdvance: value }));
    },

    /**
     * Set transition speed multiplier
     */
    setTransitionSpeed: (value: number) => {
      update(state => ({
        ...state,
        transitionSpeed: Math.max(0.25, Math.min(3, value))
      }));
    },

    /**
     * Set default step duration
     */
    setStepDuration: (value: number) => {
      update(state => ({
        ...state,
        stepDuration: Math.max(2, Math.min(30, value))
      }));
    },

    /**
     * Toggle step card visibility
     */
    toggleStepCard: () => {
      update(state => ({ ...state, showStepCard: !state.showStepCard }));
    }
  };
}

export const narrative = createNarrativeStore();

// Derived stores

/**
 * Get the current narrative object
 */
export const currentNarrative = derived(
  narrative,
  ($narrative): NarrativeTimeline | null => {
    if (!$narrative.currentNarrativeId) return null;
    return getNarrativeById($narrative.currentNarrativeId) || null;
  }
);

/**
 * Get the current step object
 */
export const currentStep = derived(
  [narrative, currentNarrative],
  ([$narrative, $currentNarrative]): NarrativeStep | null => {
    if (!$currentNarrative) return null;
    return $currentNarrative.steps[$narrative.currentStepIndex] || null;
  }
);

/**
 * Check if in narrative mode
 */
export const isNarrativeMode = derived(
  narrative,
  ($narrative): boolean => $narrative.currentNarrativeId !== null
);

/**
 * Get formatted progress string (e.g., "Step 3 of 7")
 */
export const progressText = derived(
  [narrative, currentNarrative],
  ([$narrative, $currentNarrative]): string => {
    if (!$currentNarrative) return '';
    const current = $narrative.currentStepIndex + 1;
    const total = $currentNarrative.steps.length;
    return `Step ${current} of ${total}`;
  }
);

/**
 * Get overall progress percentage (0-100)
 */
export const overallProgress = derived(
  [narrative, currentNarrative],
  ([$narrative, $currentNarrative]): number => {
    if (!$currentNarrative) return 0;
    const stepWeight = 1 / $currentNarrative.steps.length;
    const baseProgress = $narrative.currentStepIndex * stepWeight;
    const stepProgress = $narrative.stepProgress * stepWeight;
    return (baseProgress + stepProgress) * 100;
  }
);

/**
 * Check if current step is the first step
 */
export const isFirstStep = derived(
  narrative,
  ($narrative): boolean => $narrative.currentStepIndex === 0
);

/**
 * Check if current step is the last step
 */
export const isLastStep = derived(
  [narrative, currentNarrative],
  ([$narrative, $currentNarrative]): boolean => {
    if (!$currentNarrative) return true;
    return $narrative.currentStepIndex >= $currentNarrative.steps.length - 1;
  }
);

// Keyboard shortcuts for narrative mode
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const state = get(narrative);

    // Only handle keyboard shortcuts when in narrative mode
    if (!state.currentNarrativeId) return;

    // Don't interfere with input fields
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case ' ':
        // Space: Play/Pause
        e.preventDefault();
        narrative.togglePlay();
        break;

      case 'ArrowRight':
        // Right arrow: Next step
        e.preventDefault();
        narrative.nextStep();
        break;

      case 'ArrowLeft':
        // Left arrow: Previous step
        e.preventDefault();
        narrative.previousStep();
        break;

      case 'Escape':
        // ESC: Exit narrative mode
        e.preventDefault();
        narrative.exitNarrative();
        break;

      case 'h':
        // H: Toggle step card visibility
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          narrative.toggleStepCard();
        }
        break;

      case 'a':
        // A: Toggle auto-advance
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          narrative.setAutoAdvance(!state.autoAdvance);
        }
        break;

      case '+':
      case '=':
        // +/=: Increase speed
        e.preventDefault();
        narrative.setTransitionSpeed(state.transitionSpeed + 0.25);
        break;

      case '-':
      case '_':
        // -/_: Decrease speed
        e.preventDefault();
        narrative.setTransitionSpeed(state.transitionSpeed - 0.25);
        break;
    }
  });
}
