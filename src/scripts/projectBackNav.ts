/**
 * Pure decision for the Project detail page's "Back" control. The detail pages are
 * standalone, indexable routes reached two ways: from the Showcase (the only place that
 * links to them) or directly (deep link, search result, new tab). The Back control wants
 * two behaviours - return to where the user was in the Showcase, or, on direct entry,
 * land on the Presentation.
 *
 * A same-origin home-page referrer means the user came from the Showcase, so the previous
 * history entry restores their exact place; otherwise the static href="/" is correct.
 * DOM-free so it unit-tests without a browser (mirrors projectSelection.ts).
 */
export function arrivedFromHome(referrer: string, origin: string): boolean {
  if (!referrer) return false;
  try {
    const url = new URL(referrer);
    return url.origin === origin && url.pathname === '/';
  } catch {
    return false;
  }
}
