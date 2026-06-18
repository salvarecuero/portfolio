# Showcase architecture: presentation modes + poster-backed keep-alive

The Showcase displays each Project through one of three **Presentation modes**: Embed (real live app), Media (Poster only) and Custom view (a presentation built in the portfolio for non-web Projects). The UX goal is "you scroll and you are already inside a live Project", with no spinners.

To achieve this: every Embed is backed by its **Poster** (the same visual layer as Media), and the live app fades in over it once it finishes mounting — the Poster is the only "loading state", never a spinner. Embeds are mounted lazily and kept alive (not unmounted when switching Projects), so returns are instant. The default Embed is prefetched during the Presentation's idle time (post-load / `requestIdleCallback`, so it does not affect the hero's Lighthouse metrics); the rest are prefetched on idle and on intent (hover/focus on the Selector).

## Considered Options

- **Eager (mount all Embeds on load):** rejected — very heavy initial load and high memory; unfeasible with WASM apps.
- **One at a time (unmount the others):** rejected — every switch reloads and lags, exactly the "bad implementation" we want to avoid.

## Consequences

- **Exclusion criterion — requires cross-origin isolation in production.** A Project can only be a live co-mounted Embed if its deploy does *not* set `COOP`/`COEP`: those headers put the page in cross-origin isolation, which is contagious to the parent and would force the whole Showcase into isolation, breaking the other iframes. The trigger for needing them is `SharedArrayBuffer` (multi-threaded WASM) as a *hard requirement* — not merely running WASM or an AI model. A Project that hard-requires isolation goes in Media mode with an explicit launch (takeover/new tab) instead.
  - **No current Project hits this.** bye-bg was initially assumed to (and was placed in Media mode on that assumption), but verifying its source shows otherwise: inference runs on WebGPU (primary) or single-threaded WASM (fallback), neither of which needs `SharedArrayBuffer`. Its `COOP`/`COEP` headers exist only on the Vite **dev server** as an optional WASM multi-thread speed-up ("works without these but runs slower"); production is un-isolated. bye-bg is therefore a live Embed (mode `embed`), not Media.
- Embeds are only possible on owned Projects, enabling `frame-ancestors` toward the portfolio domain; third-party sites are out of Embed mode.
- Memory grows with each visited Project (bounded to the handful of Projects in the Showcase).

## Phase 2 as built

- **Keep-alive is toggle-only.** Switching never moves the iframe in the DOM — only the Stage's `hidden`/ARIA toggles. Reparenting an iframe reloads it (the browser detaches/re-attaches the document), which would defeat keep-alive; the render-all Stage model makes the toggle sufficient.
- **LRU cap (3).** To bound renderer-process memory, at most 3 embeds stay live; mounting a 4th unsets `src` on the least-recently-used (restoring its Poster) so a later return re-mounts cleanly. Pure decision in `lruEvict` (unit-tested); wiring in `embedController.ts`.
- **Mobile = Media fallback.** Below `--showcase-embed-min` (800px) an embed Project shows its Media gallery (`mediaMobile ?? media`) and mounts no iframe. A per-Project `embed.mobile` (default `false`) opts one Project into mounting the Embed on mobile too.
- **Warming stays off the hero's critical path.** `preconnect`/`dns-prefetch` for embed origins are injected from JS at idle (post-`load` / `requestIdleCallback`) and on Selector hover/focus intent — never in the static `<head>` — so the first paint and the hero's Lighthouse metrics are unchanged. The iframe ships with no `src` (`loading="lazy"` is not relied on for `display:none` Stages) and is assigned `src` on first activation.
