import { writable } from 'svelte/store';

/**
 * Global dither-reveal loader (Scriptorium design).
 *
 * Every `.glass` panel plays the reveal when it mounts (see app.css).
 * - `fireReveal()` bumps `revealTick`; App re-keys its panels on it, so they
 *   remount and replay. Use it for "page changes" (opening a panel, loading a
 *   narrative).
 * - `track(promise)` is for async fetches: it shows the "resolving" chip while
 *   the promise is pending (if it takes >100ms), then replays the reveal on the
 *   panels in place — without remounting, so their local state survives.
 */
const REVEAL_MS = 900;
const SLOW_MS = 100;

export const revealTick = writable(0);
export const resolving = writable(false);

let pending = 0;
let chipTimer: ReturnType<typeof setTimeout> | null = null;

function sync() {
  resolving.set(pending > 0 || chipTimer !== null);
}

function holdChip() {
  if (chipTimer) clearTimeout(chipTimer);
  chipTimer = setTimeout(() => {
    chipTimer = null;
    sync();
  }, REVEAL_MS);
  sync();
}

export function fireReveal() {
  revealTick.update((t) => t + 1);
  holdChip();
}

/** Restart the reveal animation on mounted panels (class off → reflow → on). */
function replayInPlace() {
  // Wait a frame so the awaiting component has rendered its new content.
  requestAnimationFrame(() => {
    const panels = document.querySelectorAll<HTMLElement>('.glass');
    panels.forEach((el) => el.classList.add('reveal-reset'));
    void document.body.offsetWidth;
    panels.forEach((el) => el.classList.remove('reveal-reset'));
    holdChip();
  });
}

/**
 * Show the resolving chip while `promise` is pending. When it settles, replay
 * the dither reveal unless `reveal` is false (e.g. background border loads).
 */
export function track<T>(promise: Promise<T>, { reveal = true } = {}): Promise<T> {
  let slow = false;
  const slowTimer = setTimeout(() => {
    slow = true;
    pending += 1;
    sync();
  }, SLOW_MS);

  const settle = () => {
    clearTimeout(slowTimer);
    if (!slow) return;
    pending -= 1;
    sync();
    if (reveal) replayInPlace();
  };
  promise.then(settle, settle);
  return promise;
}
