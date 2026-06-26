# Design System — Foundation

Record of the design system's foundation: the base the shipped visual design rests on. The visual design itself has since been iterated across the build (see Status); this document records the foundation, not an exhaustive spec of the shipped result.

## Foundation decisions

- **Tokens as CSS custom properties** as the source of truth (colors, spacing, typography, radii, etc.).
- **Tailwind v4** consumes those tokens. Zero-runtime (compiles to CSS): Lighthouse-neutral.
- **Per-Project theming**: each Project's visual identity (and the chrome accent on switch / its Custom view) is expressed as a token override, not as hardcoded styles.
- The visual is hand-crafted; no component library is used, to avoid a generic aesthetic.

## Status (2026-06-26)

The visual design has been iterated and ships as the current baseline; the earlier deferral
(the "Phase 5 deferred" status) is resolved. The iteration spans the Presentation, the Showcase
shell and play-on-enter intro, the project/tool detail pages, the CTA pills, and the lightbox.
The foundation above held through that work without structural change.

Notes on the items previously listed as pending:

- **Per-Project accent tokens** are defined and applied at runtime via the `--accent` override on
  the Showcase root, set per Project from content.
- **Type scale, palette and light/dark** are realized in the token layer plus deliberate
  per-section palettes (the Presentation's scoped light surface, the Showcase's dark cosmos),
  not a user-facing theme toggle.
- **Primitives** remain intentionally hand-crafted per component (no component library), per the
  foundation decision above; there is no separate primitives library.

Because the shipped design is the source of truth, treat the implementation (`src/styles/` and the
components) as authoritative over this record where they differ.

## Custom stack icons

Stack glyphs come from `src/data/presentationIcons.ts`. Each is either a
simple-icons SVG path or, for a brand with no simple-icons glyph, a small
`data:`-URI WebP used as a CSS `mask` over `background: currentColor`. The mask
form tints ink → brand on hover exactly like the SVG paths, so custom logos stay
visually consistent. Regenerate a mask asset with `node scripts/gen-stack-icons.mjs`
(sharp → 40×40 lossless WebP → base64). Glyphs are inlined to keep zero extra
network requests. A technology not in the registry renders as a plain text pill.
