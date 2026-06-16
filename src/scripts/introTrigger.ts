/**
 * Play-on-enter trigger logic for the Showcase intro.
 * Rising-edge: fires `onPlay` exactly once, the first time the target is dominant
 * (intersectionRatio >= threshold). Returns true on that firing so the caller can
 * `unobserve`. Never fires again (once per page load) — this is what prevents the
 * ratio 0.6→1.0 restart and the replay-over-Presentation bugs.
 */
export function createIntroTrigger(onPlay: () => void, threshold = 0.6) {
  let fired = false;
  return function handle(entries: IntersectionObserverEntry[]): boolean {
    if (fired) return false;
    for (const e of entries) {
      if (e.isIntersecting && e.intersectionRatio >= threshold) {
        fired = true;
        onPlay();
        return true;
      }
    }
    return false;
  };
}
