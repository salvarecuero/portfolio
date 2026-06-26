/**
 * Lifecycle decision for the Showcase intro from IntersectionObserver readings.
 *
 * - `play`   - the Showcase just became dominant (ratio >= playThreshold) for the first
 *              time → start the intro.
 * - `settle` - the intro had started but the Showcase dropped below settleThreshold before
 *              it played to completion → finish it now so the fixed `$ showcase` overlay does
 *              not linger over the Presentation. Fires at most once.
 * - `none`   - no transition.
 *
 * Fires `play` at most once and `settle` at most once, so the intro never replays (this is
 * what prevents the ratio 0.6→1.0 restart and the replay-over-Presentation bugs). The two
 * thresholds give hysteresis: a dip between settle and play thresholds after playing does not
 * settle, so a reading that grazes the play edge cannot kill the intro it just started.
 */
export type IntroAction = "play" | "settle" | "none";

export function createIntroController(playThreshold = 0.6, settleThreshold = 0.5) {
  let played = false;
  let settled = false;
  return function next(entry: IntersectionObserverEntry): IntroAction {
    const ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
    if (!played) {
      if (ratio >= playThreshold) {
        played = true;
        return "play";
      }
      return "none";
    }
    if (!settled && ratio < settleThreshold) {
      settled = true;
      return "settle";
    }
    return "none";
  };
}
