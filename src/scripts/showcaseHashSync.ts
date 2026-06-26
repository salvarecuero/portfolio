/**
 * Pure decision for keeping the `#<project-id>` hash in sync with the scrolled-to
 * section. The hash means "Showcase, with this Project active"; an empty hash means
 * "Presentation". Without this, scrolling back up to the Presentation leaves a stale
 * hash behind, so a reload would deep-link straight back into the Showcase.
 *
 * DOM-free so it unit-tests without a browser (mirrors projectSelection.ts). The
 * IntersectionObserver wiring that feeds it lives in showcaseController.ts.
 */
export type HashSyncAction = { type: "set"; id: string } | { type: "clear" } | { type: "none" };

export function decideHashSync(state: {
  inShowcase: boolean;
  activeId: string | null;
  currentHash: string;
}): HashSyncAction {
  if (state.inShowcase) {
    if (state.activeId && state.currentHash !== `#${state.activeId}`) {
      return { type: "set", id: state.activeId };
    }
    return { type: "none" };
  }
  return state.currentHash ? { type: "clear" } : { type: "none" };
}
