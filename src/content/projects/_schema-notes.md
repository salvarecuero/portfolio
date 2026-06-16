# Showcase Projects

Each Project is a `.md`/`.mdx` file in this directory. The frontmatter follows the
schema in `src/content.config.ts`; the document body is the long description.

Files prefixed with `_` (like this one) are excluded from the loader.

Main fields:

- `title`, `summary`
- `mode`: `embed` | `media` | `custom` (see CONTEXT.md)
- `media`: the Media set (ordered). Each item is `{ type: image, src, alt }` or
  `{ type: video, poster, sources: [{ src, type }], alt }`. `media[0]` is the Poster
  (base layer / Embed fade-in). Image `src`/`poster` are paths under `src/assets`
  (optimized by astro:assets); video `sources` are paths under `public/media/`
  (pre-encoded: AV1/WebM → VP9/WebM → H.264/MP4, no audio, ~720p).
- `mediaMobile`: optional portrait set for narrow viewports (the mobile-rendered site).
- `order`: order in the Selector
- `accent`: identity accent (overrides `--accent`)
- `embed`: `{ url, requiresLaunch }` — only `mode: embed` (see ADR 0004)
- `links`: `{ live, repo }`
- `stack`: list of technologies
