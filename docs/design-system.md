# Design System - Foundation

This document records the portfolio's design foundation. It describes the principles and implementation anchors that shape the visual system; the source files remain authoritative for exact component details.

## Foundation decisions

- **Tokens as CSS custom properties** are the source of truth for color, spacing, typography, radii, and related visual values.
- **Tailwind v4** consumes those tokens and compiles them to CSS with no client-side styling runtime.
- **Per-project theming** is expressed through runtime token overrides. Each project's accent color is set through `--accent` on the Showcase root instead of hardcoded component styles.
- **Hand-crafted components** define the interface. The site does not use a component library, which keeps the visual language specific to this portfolio.

## Design Scope

The visual system covers the Presentation, Showcase shell, project/tool detail pages, CTA pills,
stack icon rail, media gallery, and lightbox. These areas share the same token foundation while
allowing scoped section palettes where the experience calls for them.

Key implementation notes:

- **Accent tokens** are defined per project in content and applied at runtime through the Showcase root.
- **Type scale and palette** live in the token layer, with deliberate section-level palettes such as the Presentation's light surface and the Showcase's dark cosmos.
- **Theme switching** is not exposed as a user-facing control; contrast and mood are handled by scoped sections.
- **Primitives** are implemented directly in the components rather than maintained as a separate primitives package.

Treat `src/styles/` and the Astro components as authoritative whenever exact behavior or styling differs from this foundation note.

## Custom stack icons

Stack glyphs come from `src/data/presentationIcons.ts`. Each glyph is either a simple-icons SVG path
or, for a brand with no simple-icons glyph, a small `data:` URI WebP used as a CSS `mask` over
`background: currentColor`.

The mask approach lets custom logos tint from neutral ink to brand color on hover in the same way as
SVG path icons. Mask assets can be regenerated with `node scripts/gen-stack-icons.mjs`, which uses
sharp to produce a 40x40 lossless WebP and inline it as base64. Glyphs are inlined to avoid extra
network requests. A technology not in the registry renders as a plain text pill.
