# Showcase Media mode: media-set gallery + mobile fallback

Media mode presents a Project through a **navigable set of media** (images and/or a short looping video) rather than a single poster. The set's first item is the Poster (the cover image for Media mode; for Embeds the gallery is the no-JS baseline and the handshake-failure fallback, not the loading layer — see ADR 0002). Projects provide a desktop (landscape) set and an optional mobile (portrait) set; the active set matches the Stage orientation, so captures are never landscape-cropped on a portrait Stage.

Images are optimized through `astro:assets` (`image()` schema helper, `<Picture>` AVIF/WebP, `object-fit: cover` against captures authored near the Stage aspect ratio, so there is no letterbox and the dark cosmos surface fills any residual sliver). Video is a muted/looped/`playsinline` clip that autoplays only when scrolled into view and is deferred (`preload="none"` + lazy + an IntersectionObserver source swap) so initial load behaves like a static image; `prefers-reduced-motion` shows the still poster frame instead and never loads the video. The gallery requires a small client script (carousel + the video observer), a pragmatic, Lighthouse-cheap exception to zero-JS-by-default.

## Mobile / Embed fallback

On narrow viewports the default is to show the Media set and **not mount live Embeds** (a global breakpoint, `--showcase-embed-min`). A per-Project opt-in to embed on mobile (`embed.mobile`) overrides this default; it is wired end-to-end (schema -> `data-embed-mobile` -> `shouldMount`), though no Project currently sets it.

## Considered Options

- **Single poster image (the previous model):** rejected — a landscape capture cover-cropped on a portrait Stage loses most of the content; a single still also undersells interactive Projects.
- **One `<picture media>` to art-direct desktop/mobile:** rejected for the gallery — the two sets differ in count and content, not just crop, so the switch is CSS show/hide of two gallery instances (the hidden one's lazy media never downloads).
- **Device-frame mockups around captures:** rejected — the Stage is already chrome; a second frame nests and shrinks the capture.

## Consequences

- Out of scope here (Phase 2, ADR 0002/0004): iframe lifecycle, keep-alive, the readiness handshake, and the `embed.mobile` override.
- Video is encoded manually (AV1/WebM → VP9/WebM → H.264/MP4, no audio, ~720p, ~1–2 MB) and served from `public/media/`; the schema only references the sources and the poster frame.
