# Astro as the portfolio stack (instead of Next.js)

Portfolio v2 is content-first (a static Presentation plus a Showcase with few interactive islands) with an explicit priority on the performance ceiling (best possible Lighthouse) and on loading only the first section's HTML first. We chose **Astro** over Next.js because its islands architecture maps 1:1 to that model (zero JS by default, on-demand hydration), its Content Collections model the Project catalog in a typed way, and the static output is cached on a CDN without friction. We need no backend (Project metadata is static content), which neutralizes Next's main advantage (integrated API routes). The accepted cost is the learning curve relative to Next, mitigated because islands are written in React.

## Considered Options

- **Next.js (App Router + RSC):** more familiar (v1 was pure React) and better if the site were app-like or needed an integrated backend. Rejected: higher JS floor, no native content model, and more friction for static deploy + full caching.
