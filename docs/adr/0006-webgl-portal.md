# WebGL cosmic-rift portal for the Portfolio tab

The Showcase's last tab, "Portfolio", reveals the reused Presentation through a transparent window framed by a dynamic cosmic-rift effect. The portfolio's standing priority is zero-JS-by-default and the Lighthouse ceiling (ADR 0001): the first paint loads only the Presentation's HTML, and the initial bundle stays minimal. A realistic animated rift wants a GPU shader, which means adding `three` — a heavy dependency whose presence in the initial bundle would directly contradict that priority. We chose to add `three` but **isolate it behind an interaction-gated dynamic import**, so it never enters the initial bundle and only loads when the Portfolio tab is activated.

- **Dynamic import on activation.** `riftScene.ts` is the only module that imports `three`; it is loaded via `await import('./riftScene')` inside the portal orchestrator (`riftPortal.ts`), reached only on the `showcase:activate` event for `id === 'portfolio'`. The build code-splits `three` into a `riftScene.*` chunk that `index.html` references solely through a dynamic `import(...)`, never as an entry chunk. First paint and the rest of the page are unaffected.
- **Canvas behind the Presentation.** The rift renders on a `<canvas>` behind the reused Presentation DOM, shown through a transparent window — the same Presentation component, no duplicated content.
- **Capability-only fallback.** `chooseReveal` selects the GL path only when WebGL is available **and** motion is allowed **and** the scene chunk loaded; reduced-motion, no-WebGL, or a scene-chunk load failure each force a static CSS reveal. The fallback loads zero dependency and is also the SSR / no-JS baseline, so the Portfolio tab is functional without any of the portal JS.
- **Fully procedural shader.** The starfield, nebula, and fracture are generated in GLSL — zero downloaded texture assets.
- **GL lifecycle.** On leave the orchestrator disposes the renderer, geometry, and material and cancels the RAF loop; it pauses the loop when the document is hidden or the panel scrolls off-screen; the DPR is capped (min(devicePixelRatio, 2)) to bound fill cost. Each scene renders into a throwaway canvas inserted beside a pristine host canvas, so `forceContextLoss()` on dispose never poisons the reused host and every re-activation re-creates a working context (the rupture replays on each arm).

## Considered Options

- **Pre-rendered transparent-window image.** A lighter static asset (a rendered rift behind the window) with no runtime GL. Lower cost and no dependency, but no live animation. Retained as the documented contingency: if the scene chunk or its runtime cannot meet the performance budget on the target hardware, this is the fallback approach.
- **`three` in the initial bundle.** Rejected outright: it would defeat the zero-JS-by-default / Lighthouse-ceiling priority (ADR 0001) for an effect most visitors never trigger.

## Consequences

- Accepted only because the first paint and the Presentation's Lighthouse scores are unaffected (verified: desktop Performance / Accessibility / SEO all 100, with the only Best-Practices deduction being the pre-existing third-party embed CSP/cookie item, unrelated to the portal). The `three` chunk loads exclusively on Portfolio activation.
- Making the egg a real tab inside the tablist (rather than a sibling button) resolves the prior `aria-required-children` accessibility workaround; the tablist now contains only `role="tab"` children and Accessibility stays a structural 100.
- The portal does not touch the embed contract (ADR 0004) or `public/_headers`; it adds no cross-origin surface (the rift and the Presentation are same-origin).
- The documented contingency stands: if the chunk/runtime cannot meet the performance budget, the pre-rendered-image approach above replaces the live scene without changing the orchestrator's capability-decision/fallback structure.
