/**
 * Swipe decision for the Media gallery. Pure + framework-free so it unit-tests
 * without a DOM (mirrors galleryNav.ts). Returns a step direction only when the
 * horizontal travel exceeds the threshold AND dominates the vertical travel, so a
 * vertical page scroll / scroll-snap is never mistaken for a swipe.
 *
 *   -1 → advance (swipe left, show next)
 *    1 → go back (swipe right, show previous)
 *    0 → not a horizontal swipe
 */
export function resolveSwipe(dx: number, dy: number, threshold: number): -1 | 0 | 1 {
  if (Math.abs(dx) <= threshold) return 0;
  if (Math.abs(dx) <= Math.abs(dy)) return 0;
  return dx < 0 ? -1 : 1;
}
