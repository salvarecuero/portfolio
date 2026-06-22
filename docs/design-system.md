# Design System — Foundation

Record of the design system's foundation. It is the base to build on, not the final visual design (that is iterated later).

## Foundation decisions

- **Tokens as CSS custom properties** as the source of truth (colors, spacing, typography, radii, etc.).
- **Tailwind v4** consumes those tokens. Zero-runtime (compiles to CSS): Lighthouse-neutral.
- **Per-Project theming**: each Project's visual identity (and the chrome accent on switch / its Custom view) is expressed as a token override, not as hardcoded styles.
- The visual is hand-crafted; no component library is used, to avoid a generic aesthetic.

## Pending (to iterate)

- Type scale, base palette and dark/light.
- Set of primitives/components.
- Concrete definition of the per-Project accent tokens.

## Status (2026-06-17)

Phase 5 (design iteration) is **deferred by decision**: the current hand-crafted design ships as-is
(performance-first), and the items above — type scale, base palette, dark/light, the primitives set,
and the concrete per-Project accent token definitions — are revisited in a dedicated future session.
The token-as-source-of-truth foundation already supports that iteration without structural change.

## Custom stack icons

Stack glyphs come from `src/data/presentationIcons.ts`. Each is either a
simple-icons SVG path or, for a brand with no simple-icons glyph, a small
`data:`-URI WebP used as a CSS `mask` over `background: currentColor`. The mask
form tints ink → brand on hover exactly like the SVG paths, so custom logos stay
visually consistent. Regenerate a mask asset with `node scripts/gen-stack-icons.mjs`
(sharp → 40×40 lossless WebP → base64). Glyphs are inlined to keep zero extra
network requests. A technology not in the registry renders as a plain text pill.
