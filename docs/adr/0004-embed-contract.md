# Embed contract between the portfolio and the Projects

For a Project to be shown in Embed mode, its own repo/deploy implements a contract toward the portfolio. The committed contract has two parts:

1. **`frame-ancestors` (CSP)** — mandatory. The Project's deploy sends `Content-Security-Policy: frame-ancestors <portfolio-origin>` to allow being embedded only by the portfolio. Without it the browser refuses the iframe. Scoped to the exact origin, never `*`.
2. **Readiness handshake (`postMessage`)** — the Project emits `parent.postMessage({type:'portfolio:ready'}, <portfolio-origin>)` when it is actually interactive (not on the iframe's `load`, which fires before the app is usable). The portfolio listens, validates `event.origin`, and only then fades the Poster out. This is what makes the fade-in exact, with no spinner.

It is only possible because the Projects are owned.

## Considered Options

- **Embed mode via query param (`?embed=1`)** — when the Project detects the param, it hides its own chrome (nav/footer/cookie banner) and skips heavy third-party scripts, serving a cleaner and lighter view (with `noindex`). Not discarded: it remains a per-Project candidate to implement case by case, given its variable cost. Not part of the firm contract yet.

## Consequences

- The contract is the basis for a future skill that encapsulates the embed/optimization mechanism. Phase 2 is the reference implementation of that mechanism (`src/scripts/embedController.ts` + `embedLifecycle.ts`).
- bye-bg is out of Embed mode (see ADR 0002): due to COEP it cannot coexist as a live iframe, so it does not implement this contract; it goes in Media mode with an explicit launch.

## Phase 2 as built

- **Two-way handshake, protocol `v: 1`.** The parent attaches its `message` listener *before* setting `iframe.src`, posts `portfolio:hello` on iframe `load`, and the child posts `portfolio:ready` on a retry interval until it receives `portfolio:ack`. The `hello` covers the race where the child becomes ready before the parent's listener exists. Messages carry `{ type, v }`; the parent validates `event.origin` (=== the origin derived from `embed.url`), `event.source` (=== the iframe's `contentWindow`), and the shape/version before acking and revealing. Posts always use an explicit `targetOrigin`, never `*`.
- **First-wins fallback reveal.** So an uninstrumented embed still reveals, the Poster fades on whichever fires first of: the `portfolio:ready` message, iframe `load` + 400 ms grace, or a 3.5 s hard ceiling. The reveal is idempotent (fires once; the losers are cancelled). The fallback means the portfolio works before a Project deploys the contract, then upgrades to the exact `ready`-driven reveal once it does. Pure decision in `createRevealRace` (unit-tested).
- **`requiresLaunch`.** When set, the embed is not auto-mounted; the Poster shows with an explicit launch affordance and the iframe mounts on click.
- **`frame-ancestors` scope.** The portfolio's parent origins are `https://salvarecuero.dev` and `http://localhost:<dev-port>`; the Project allowlists exactly these and adds no `X-Frame-Options` (one mechanism only).
