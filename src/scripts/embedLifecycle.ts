/**
 * Pure (DOM-free) logic for the Showcase live-embed lifecycle. Unit-tested without a
 * browser, mirroring projectSelection.ts. The DOM wiring lives in embedController.ts.
 */
export const PROTOCOL_VERSION = 1;
export type EmbedMode = 'embed' | 'media' | 'custom';

export function embedOrigin(url: string): string {
  return new URL(url).origin;
}

export function isReadyMessage(data: unknown, version = PROTOCOL_VERSION): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === 'portfolio:ready' &&
    (data as { v?: unknown }).v === version
  );
}

export interface RevealRace {
  onMessage(): void; // valid ready message → reveal now
  onLoad(): void;    // iframe load → reveal after the grace delay
  cancel(): void;    // drop all pending timers (e.g. on unmount)
}

/**
 * First-wins, exactly-once reveal across {ready message, load+grace, hard ceiling}.
 * Whichever fires first wins; the rest are cancelled.
 */
export function createRevealRace(opts: {
  onReveal: () => void;
  graceMs?: number;
  ceilingMs?: number;
}): RevealRace {
  const graceMs = opts.graceMs ?? 400;
  const ceilingMs = opts.ceilingMs ?? 3500;
  let done = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const clearAll = () => { for (const t of timers) clearTimeout(t); timers.length = 0; };
  const reveal = () => { if (done) return; done = true; clearAll(); opts.onReveal(); };
  timers.push(setTimeout(reveal, ceilingMs)); // ceiling armed immediately
  return {
    onMessage: () => reveal(),
    onLoad: () => { if (!done) timers.push(setTimeout(reveal, graceMs)); },
    cancel: () => { done = true; clearAll(); },
  };
}

/** Which id to unmount when the live set exceeds the cap (oldest), or null. */
export function lruEvict(order: string[], cap: number): string | null {
  return order.length <= cap ? null : order[0];
}

/** Gate: mount a live iframe only for embed mode, on desktop (or embed.mobile), not requiresLaunch. */
export function shouldMount(opts: {
  mode: EmbedMode;
  isDesktop: boolean;
  embedMobile: boolean;
  requiresLaunch: boolean;
}): boolean {
  if (opts.mode !== 'embed') return false;
  if (opts.requiresLaunch) return false;
  if (!opts.isDesktop && !opts.embedMobile) return false;
  return true;
}
