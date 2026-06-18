# Showcase architecture: presentation modes + poster-backed keep-alive

The Showcase displays each Project through one of three **Presentation modes**: Embed (real live app), Media (Poster only) and Custom view (a presentation built in the portfolio for non-web Projects). The UX goal is "you scroll and you are already inside a live Project", with no spinners.

To achieve this: every Embed is backed by its **Poster** (the same visual layer as Media), and the live app fades in over it once it finishes mounting — the Poster is the only "loading state", never a spinner. Embeds are mounted lazily and kept alive (not unmounted when switching Projects), so returns are instant. The default Embed is prefetched during the Presentation's idle time (post-load / `requestIdleCallback`, so it does not affect the hero's Lighthouse metrics); the rest are prefetched on idle and on intent (hover/focus on the Selector).

## Considered Options

- **Eager (mount all Embeds on load):** rejected — very heavy initial load and high memory; unfeasible with WASM apps.
- **One at a time (unmount the others):** rejected — every switch reloads and lags, exactly the "bad implementation" we want to avoid.

## Consequences

- **Exclusion criterion — *functionally requires* cross-origin isolation.** A Project is unfit to be a live co-mounted Embed only if it cannot work without `SharedArrayBuffer` (multi-threaded WASM). Granting `SharedArrayBuffer` inside the iframe requires the whole chain to be cross-origin isolated, which would force the portfolio itself to send `COEP` page-wide — contagious, and it would break the other (non-isolated) embeds. Such a Project goes in Media mode with an explicit launch (takeover/new tab) instead. Note the criterion is *requiring* isolation, **not** merely running WASM/AI, and **not** merely *setting* `COOP`/`COEP`: `COEP` does not block framing, so an app that sets it but degrades gracefully can still be embedded — it just runs un-isolated inside the iframe (no `SharedArrayBuffer`).
  - **No current Project hits this.** bye-bg was initially placed in Media mode on the assumption that its isolation made it non-embeddable; that was wrong. Its production deploy *does* set `COOP`/`COEP` (to enable multi-threaded WASM via `SharedArrayBuffer`), but it does not *require* it: inference runs on WebGPU (primary) or single-threaded WASM (fallback). So it is a live Embed (mode `embed`); inside the Showcase iframe it runs un-isolated (WebGPU / single-threaded WASM), and standalone it keeps the multi-threaded path.
- Embeds are only possible on owned Projects, enabling `frame-ancestors` toward the portfolio domain; third-party sites are out of Embed mode.
- Memory grows with each visited Project (bounded to the handful of Projects in the Showcase).

## Phase 2 as built

- **Keep-alive is toggle-only.** Switching never moves the iframe in the DOM — only the Stage's `hidden`/ARIA toggles. Reparenting an iframe reloads it (the browser detaches/re-attaches the document), which would defeat keep-alive; the render-all Stage model makes the toggle sufficient.
- **LRU cap (3).** To bound renderer-process memory, at most 3 embeds stay live; mounting a 4th unsets `src` on the least-recently-used (restoring its Poster) so a later return re-mounts cleanly. Pure decision in `lruEvict` (unit-tested); wiring in `embedController.ts`.
- **Mobile = Media fallback.** Below `--showcase-embed-min` (800px) an embed Project shows its Media gallery (`mediaMobile ?? media`) and mounts no iframe. A per-Project `embed.mobile` (default `false`) opts one Project into mounting the Embed on mobile too.
- **Warming stays off the hero's critical path.** `preconnect`/`dns-prefetch` for embed origins are injected from JS at idle (post-`load` / `requestIdleCallback`) and on Selector hover/focus intent — never in the static `<head>` — so the first paint and the hero's Lighthouse metrics are unchanged. The iframe ships with no `src` (`loading="lazy"` is not relied on for `display:none` Stages) and is assigned `src` on first activation.
