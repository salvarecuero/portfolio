/**
 * Centralized Showcase timing and sizing constants. Pure (no DOM / Astro deps) so the tested
 * lifecycle modules (embedLifecycle, showcaseScrollEscape) can import it under Node. The stage
 * crossfade duration is deliberately NOT here: it has a single source in CSS (--stage-swap)
 * that the controller reads, because the keyframes need the same value.
 */

// Embed lifecycle (embedLifecycle.ts / embedController.ts)
export const SPINNER_DELAY_MS = 600; // delay before the loading spinner appears (ADR 0002)
export const EMBED_FALLBACK_MS = 4000; // handshake ceiling before falling back to media (ADR 0004)
export const LIVE_CAP = 3; // max simultaneously mounted live embeds (LRU)
export const HELLO_INTERVAL_MS = 250; // parent -> child "hello" retry interval
export const HELLO_MAX_TRIES = 10; // stop retrying hello after this many attempts

// Scroll-escape bounce (showcaseScrollEscape.ts)
export const ESCAPE_CONFIRM_DELAY_MS = 150; // hysteresis before a single wheel event can bounce
export const ESCAPE_ARMED_MS = 2200; // window in which a second escape gesture is let through
export const ESCAPE_BOUNCE_OUT_MS = 160; // bounce: scroll out
export const ESCAPE_BOUNCE_HOLD_MS = 25; // bounce: hold at peek
export const ESCAPE_BOUNCE_BACK_MS = 210; // bounce: settle back
