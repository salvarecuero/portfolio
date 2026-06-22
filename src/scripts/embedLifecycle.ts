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

export interface EmbedTimers {
  onReady(): void; // valid handshake → reveal (once)
  onError(): void; // iframe error → fallback (once)
  cancel(): void;  // drop all pending timers (e.g. on unmount)
}

/**
 * Handshake-gated embed lifecycle timers. Reveal fires ONLY on the readiness handshake
 * (onReady). Failure (onFallback) fires on the iframe error (onError) or when the ceiling
 * elapses with no handshake. Reveal and fallback are mutually exclusive and exactly-once.
 * The spinner (onSpinner) is independent: it fires once at the spinner delay if neither
 * reveal nor fallback has settled, and is cancelled when one does.
 */
export function createEmbedTimers(opts: {
  onSpinner: () => void;
  onReveal: () => void;
  onFallback: () => void;
  spinnerMs?: number;
  fallbackMs?: number;
}): EmbedTimers {
  const spinnerMs = opts.spinnerMs ?? 600;
  const fallbackMs = opts.fallbackMs ?? 4000;
  let settled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const clearAll = () => { for (const t of timers) clearTimeout(t); timers.length = 0; };
  const settle = (cb: () => void) => { if (settled) return; settled = true; clearAll(); cb(); };
  // Spinner-delay: fires once if still unsettled (clearAll on settle prevents a late fire).
  timers.push(setTimeout(() => { if (!settled) opts.onSpinner(); }, spinnerMs));
  // Ceiling: give up on the embed and fall back to media.
  timers.push(setTimeout(() => settle(opts.onFallback), fallbackMs));
  return {
    onReady: () => settle(opts.onReveal),
    onError: () => settle(opts.onFallback),
    cancel: () => { settled = true; clearAll(); },
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
