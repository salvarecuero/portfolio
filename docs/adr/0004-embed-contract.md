# Embed contract between the portfolio and the Projects

For a Project to be shown in Embed mode, its own repo/deploy implements a contract toward the portfolio. The committed contract has two parts:

1. **`frame-ancestors` (CSP)** — mandatory. The Project's deploy sends `Content-Security-Policy: frame-ancestors <portfolio-origin>` to allow being embedded only by the portfolio. Without it the browser refuses the iframe. Scoped to the exact origin, never `*`.
2. **Readiness handshake (`postMessage`)** — the Project emits `parent.postMessage({type:'portfolio:ready'}, <portfolio-origin>)` when it is actually interactive (not on the iframe's `load`, which fires before the app is usable). The portfolio listens, validates `event.origin`, and only then fades the Poster out. This is what makes the fade-in exact, with no spinner.

It is only possible because the Projects are owned.

## Considered Options

- **Embed mode via query param (`?embed=1`)** — when the Project detects the param, it hides its own chrome (nav/footer/cookie banner) and skips heavy third-party scripts, serving a cleaner and lighter view (with `noindex`). Not discarded: it remains a per-Project candidate to implement case by case, given its variable cost. Not part of the firm contract yet. See the design note below.

### `?embed=1` optimization (designed, deferred)

A Project may opt into an embed-optimized view: when it detects `?embed=1` it (a) hides its own
chrome (nav, footer, cookie banner) so only the app surface shows inside the Stage, (b) skips heavy
third-party scripts (analytics, chat widgets) that are pointless inside an embed and cost load time,
and (c) emits `<meta name="robots" content="noindex">` so the embed URL is not indexed as a
duplicate of the canonical app.

**Portfolio side (optional opt-in, not yet implemented):** an `embed.embedParam` boolean content
field (default `false`). When `true`, the controller appends `?embed=1` to the iframe `src` it
assigns on mount (the only change — the lazy-mount, handshake, keep-alive, and warming are
unchanged). Origin validation is unaffected: `event.origin` is compared against the origin derived
by `embedOrigin(url)` (`new URL(url).origin`), which ignores the query string.

**Status: deferred.** The cost is per-Project and lives mostly in the Project's own repo, so it is
implemented case by case when a Project benefits (e.g. a Project with a heavy nav/cookie banner or
third-party scripts). It is not part of the firm contract. The future optimization skill (Phase 7)
is the natural home for both sides of this mechanism.

## Consequences

- The contract is the basis for a future skill that encapsulates the embed/optimization mechanism. Phase 2 is the reference implementation of that mechanism (`src/scripts/embedController.ts` + `embedLifecycle.ts`).
- The exclusion criterion for Embed mode is "deploy hard-requires cross-origin isolation (`COOP`/`COEP`)", not "runs WASM/AI" — see ADR 0002. bye-bg was initially assumed to require isolation and placed in Media mode, but verification of its source showed it does not (WebGPU primary, single-threaded WASM fallback; no `SharedArrayBuffer`). It now implements this contract and runs as a live Embed.

## Phase 2 as built

- **Two-way handshake, protocol `v: 1`.** The parent attaches its `message` listener *before* setting `iframe.src`, posts `portfolio:hello` on iframe `load`, and the child posts `portfolio:ready` on a retry interval until it receives `portfolio:ack`. The `hello` covers the race where the child becomes ready before the parent's listener exists. Messages carry `{ type, v }`; the parent validates `event.origin` (=== the origin derived from `embed.url`), `event.source` (=== the iframe's `contentWindow`), and the shape/version before acking and revealing. Posts always use an explicit `targetOrigin`, never `*`.
- **First-wins fallback reveal.** So an uninstrumented embed still reveals, the Poster fades on whichever fires first of: the `portfolio:ready` message, iframe `load` + 400 ms grace, or a 3.5 s hard ceiling. The reveal is idempotent (fires once; the losers are cancelled). The fallback means the portfolio works before a Project deploys the contract, then upgrades to the exact `ready`-driven reveal once it does. Pure decision in `createRevealRace` (unit-tested).
- **`requiresLaunch`.** When set, the embed is not auto-mounted; the Poster shows with an explicit launch affordance and the iframe mounts on click.
- **`frame-ancestors` scope.** The portfolio's parent origins are `https://salvarecuero.dev` and `http://localhost:<dev-port>`; the Project allowlists exactly these and adds no `X-Frame-Options` (one mechanism only).
