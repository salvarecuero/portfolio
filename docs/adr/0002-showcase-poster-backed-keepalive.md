# Showcase architecture: presentation modes + poster-backed keep-alive

The Showcase displays each Project through one of three **Presentation modes**: Embed (real live app), Media (Poster only) and Custom view (a presentation built in the portfolio for non-web Projects). The UX goal is "you scroll and you are already inside a live Project", with no spinners.

To achieve this: every Embed is backed by its **Poster** (the same visual layer as Media), and the live app fades in over it once it finishes mounting — the Poster is the only "loading state", never a spinner. Embeds are mounted lazily and kept alive (not unmounted when switching Projects), so returns are instant. The default Embed is prefetched during the Presentation's idle time (post-load / `requestIdleCallback`, so it does not affect the hero's Lighthouse metrics); the rest are prefetched on idle and on intent (hover/focus on the Selector).

## Considered Options

- **Eager (mount all Embeds on load):** rejected — very heavy initial load and high memory; unfeasible with WASM apps.
- **One at a time (unmount the others):** rejected — every switch reloads and lags, exactly the "bad implementation" we want to avoid.

## Consequences

- **bye-bg is the exception:** its WASM AI models likely require cross-origin isolation (`COOP`/`COEP`), a header that applies to the whole page and would break the other iframes. So bye-bg goes in Media mode with an explicit launch (takeover/new tab), not as a simultaneous live Embed.
- Embeds are only possible on owned Projects, enabling `frame-ancestors` toward the portfolio domain; third-party sites are out of Embed mode.
- Memory grows with each visited Project (bounded to the handful of Projects in the Showcase).
