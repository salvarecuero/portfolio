# Embed contract between the portfolio and the Projects

For a Project to be shown in Embed mode, its own repo/deploy implements a contract toward the portfolio. The committed contract has two parts:

1. **`frame-ancestors` (CSP)** — mandatory. The Project's deploy sends `Content-Security-Policy: frame-ancestors <portfolio-origin>` to allow being embedded only by the portfolio. Without it the browser refuses the iframe. Scoped to the exact origin, never `*`.
2. **Readiness handshake (`postMessage`)** — the Project emits `parent.postMessage({type:'portfolio:ready'}, <portfolio-origin>)` when it is actually interactive (not on the iframe's `load`, which fires before the app is usable). The portfolio listens, validates `event.origin`, and only then fades the Poster out. This is what makes the fade-in exact, with no spinner.

It is only possible because the Projects are owned.

## Considered Options

- **Embed mode via query param (`?embed=1`)** — when the Project detects the param, it hides its own chrome (nav/footer/cookie banner) and skips heavy third-party scripts, serving a cleaner and lighter view (with `noindex`). Not discarded: it remains a per-Project candidate to implement case by case, given its variable cost. Not part of the firm contract yet.

## Consequences

- The contract is the basis for a future skill that encapsulates the embed/optimization mechanism.
- bye-bg is out of Embed mode (see ADR 0002): due to COEP it cannot coexist as a live iframe, so it does not implement this contract; it goes in Media mode with an explicit launch.
