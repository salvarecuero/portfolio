/**
 * Shared `prefers-reduced-motion` probe for the client scripts. The MediaQueryList is
 * created once and reused (it stays live, so `.matches` reflects the current setting),
 * and the lookup is SSR/test-safe (returns false when there is no `window`).
 */
let mql: MediaQueryList | undefined;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  mql ??= window.matchMedia("(prefers-reduced-motion: reduce)");
  return mql.matches;
}
