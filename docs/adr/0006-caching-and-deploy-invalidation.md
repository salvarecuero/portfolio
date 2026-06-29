# Caching strategy and deploy invalidation on Cloudflare Pages

The portfolio is static output deployed to Cloudflare Pages via Git integration. The caching
goal follows the project's first-class performance priority: serve repeat visits as fast as
possible while guaranteeing a new deployment is visible immediately, with no manual step.

## How Cloudflare Pages caching works (the constraints we design within)

- **Default response headers.** Pages serves every asset (HTML and static files alike) with
  `Cache-Control: public, max-age=0, must-revalidate` plus an `ETag`. This is not "no cache":
  the browser stores the file and, on the next request, sends a conditional request; when the
  `ETag` matches it gets a tiny `304 Not Modified` and reuses the local copy. Fresh and cheap.
- **Edge cache.** Pages caches build output on its CDN with a ~1 week TTL, but each deployment
  is atomic and versioned: the new build replaces the old one and is served immediately.
- **Hashed assets.** Astro content-hashes everything under `/_astro/` (JS, CSS, images, and the
  self-hosted fonts under `/_astro/fonts`). A content change produces a new filename, so a fresh
  build never collides with a cached file.

The consequence: **deploy invalidation is already automatic** (atomic deploy + content hashing +
`ETag` revalidation on HTML). There is nothing to build. The only realistic way to break it is to
over-cache by hand.

## Decision

Override CF's defaults in exactly two places, and deliberately leave everything else on the
default. The policy lives in `public/_headers` (copied verbatim to the dist root by Astro):

| Asset class                                               | Policy                                                          | Rationale                                                                                                                        |
| --------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/_astro/*` (hashed JS, CSS, images, fonts)               | `public, max-age=31536000, immutable`                           | Hashed filenames make a forever cache unambiguously safe; the browser never revalidates.                                         |
| HTML (`index.html`, `projects/*`), `robots.txt`, sitemaps | **No override** — inherit `max-age=0, must-revalidate` + `ETag` | Revalidation on every request is what makes a deployment show up instantly.                                                      |
| favicons, `apple-touch-icon`                              | `public, max-age=604800, stale-while-revalidate=86400`          | Non-hashed but change rarely; a week of cache lets repeat visits skip even the 304 request, and SWR refreshes in the background. |
| `og.png`                                                  | `public, max-age=86400, stale-while-revalidate=604800`          | Non-hashed; bounded to a day fresh so a redesign propagates next-day. Social crawlers refetch on their own cadence regardless.   |

For a non-hashed asset that needs an instant swap, the escape hatch is to rename the file or run
**Purge Everything** in the dashboard. Both are off the normal path.

**Guardrail.** Do not create a zone-level "Cache Everything" Cache Rule on `salvarecuero.dev`.
It would cache HTML outside of Pages' per-deployment versioning and serve stale content after a
deploy. This (or pinning HTML to a long `max-age` in `_headers`) is the single thing that breaks
deploy invalidation.

The contract is guarded by `tests/headers-caching.test.ts`, which asserts the immutable rule, the
non-hashed asset rules, and that HTML/sitemaps are never pinned to a long cache.

## Considered options

- **Cache moderately + `stale-while-revalidate` on non-hashed assets (chosen).** Best repeat-visit
  performance for assets that rarely change, with self-healing freshness.
- **Leave all non-hashed assets on the CF default.** Always fresh via 304, zero staleness risk;
  rejected only because the 304 round-trip on otherwise-static brand assets is avoidable, with SWR
  removing the staleness downside.
- **Long, hard cache on favicons/og with no SWR.** Maximum performance, but a change stays pinned
  until the file is renamed or the cache is purged. Rejected: the cost outweighs the marginal gain.
- **Edge-cache HTML via a Cache Rule for faster global TTFB.** Rejected: Pages already serves HTML
  from the nearest data center (the edge is the origin), so there is no round-trip to save, and it
  would compromise deploy invalidation.
