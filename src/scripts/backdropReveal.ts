/**
 * Pure state logic for the Showcase backdrop reveal toggle. DOM-free so it unit-tests
 * without a browser (mirrors introTrigger.ts / projectSelection.ts). The DOM wiring lives
 * in cosmosReveal.ts.
 */
export interface BackdropAria {
  pressed: "true" | "false";
  label: string;
}

/** ARIA state for the toggle button at a given reveal state. */
export function backdropAria(revealed: boolean): BackdropAria {
  return revealed
    ? { pressed: "true", label: "Hide backdrop" }
    : { pressed: "false", label: "View backdrop" };
}

/**
 * Persistent toggle state. `toggle`/`restore` return true only when the state actually
 * changed, and `onChange` fires once per real transition (so the controller can keep the
 * DOM class + ARIA in sync without redundant writes).
 */
export function createBackdropReveal(onChange: (revealed: boolean) => void) {
  let revealed = false;
  const set = (next: boolean): boolean => {
    if (next === revealed) return false;
    revealed = next;
    onChange(revealed);
    return true;
  };
  return {
    isRevealed: () => revealed,
    toggle: () => set(!revealed),
    restore: () => set(false),
  };
}
