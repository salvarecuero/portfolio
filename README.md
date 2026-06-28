<div align="center">

<img src="public/icon-512.png" alt="salvarecuero.dev logo" width="104" height="104" />

# Portfolio

**Personal portfolio, v2.** A content-first site where you scroll and you're already _inside_ a live project.

<br />

[![Live](https://img.shields.io/badge/live-salvarecuero.dev-2b8fd6?style=for-the-badge&logo=cloudflare&logoColor=white)](https://salvarecuero.dev)
&nbsp;
[![Astro](https://img.shields.io/badge/Astro-BC52EE?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![Tailwind v4](https://img.shields.io/badge/Tailwind_v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## What it is

A standalone Astro site built around one idea: **load only what the first screen needs, then resolve seamlessly into a live project**.

The **Presentation** loads as HTML-first, zero-JS content. The **Showcase** then renders each project through one of three modes — a real **live embed**, a **media gallery**, or a **custom view** for non-web work — behind a flat cover that fades the instant the app signals readiness. No image-to-app jump, no spinner on a fast load.

> **Performance is first-class.** The target is the Lighthouse ceiling: zero JS by default, on-demand hydration, static output cached at the edge.

## Highlights

|                                 |                                                                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🛰️ **Poster-backed keep-alive** | Embeds mount lazily and stay alive across switches, so returns are instant. ([ADR&nbsp;0002](docs/adr/0002-showcase-poster-backed-keepalive.md))   |
| 🤝 **Embed contract**           | Cross-origin projects signal readiness over a defined handshake, with a media-gallery fallback. ([ADR&nbsp;0004](docs/adr/0004-embed-contract.md)) |
| 🎨 **Per-project theming**      | Each project's identity is a runtime `--accent` token override, not hardcoded styles.                                                              |
| 🧩 **Typed content**            | Projects are static Astro Content Collections — no backend.                                                                                        |

## Stack

- **[Astro](https://astro.build)** — islands architecture, zero JS by default. ([ADR&nbsp;0001](docs/adr/0001-astro-over-next.md))
- **[Tailwind v4](https://tailwindcss.com)** — design tokens as CSS custom properties, compiled to zero-runtime CSS.
- **Cloudflare Pages** — static `dist/` output cached at the edge. ([deploy notes](docs/deploy-cloudflare-pages.md))

## Getting started

```bash
pnpm install
pnpm dev        # dev server
```

| Command                       | What it does                                       |
| ----------------------------- | -------------------------------------------------- |
| `pnpm dev`                    | Start the dev server                               |
| `pnpm build`                  | Static build to `dist/`                            |
| `pnpm preview`                | Serve the build                                    |
| `pnpm check`                  | Typecheck `.astro` files                           |
| `pnpm lint` · `pnpm format`   | Lint (oxlint) · format (oxfmt + Prettier)          |
| `pnpm test` · `pnpm test:e2e` | Unit tests (Vitest) · DOM integration (Playwright) |

## Structure

```
src/
├─ pages/              routes (single page: index.astro)
├─ layouts/            Layout.astro — imports global styles
├─ components/         Presentation, Showcase, and showcase/ islands
├─ content/projects/   one .md per project (typed schema)
├─ data/               schemas, presentation + showcase content
└─ styles/global.css   Tailwind + design tokens (@theme)
```

## Docs

- **[Architecture decisions](docs/adr/)** — the ADR log (0001–0008).
- **[Design system](docs/design-system.md)** — token foundation and per-project theming.

<div align="center">
<br />

Built by [Salvador Recuero](https://salvarecuero.dev) · [contact@salvarecuero.dev](mailto:contact@salvarecuero.dev)

</div>
