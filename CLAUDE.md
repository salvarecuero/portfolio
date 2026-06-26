# Portfolio v2

Personal portfolio, v2. v1 is frozen at tag `v1.0`; v2 starts from scratch on the `v2` branch.

- Architecture decisions: see [docs/adr/](./docs/adr/).
- Design foundation: see [docs/design-system.md](./docs/design-system.md).

## Stack

- **Astro** (islands architecture). See ADR 0001.
- **Tailwind v4** with design tokens as CSS custom properties as the source of truth. Per-Project theming via token overrides.
- No backend: Project metadata is static content (Astro Content Collections, typed).

## Structure

- **Standalone Astro app**. Projects live and deploy in their own repos.
- The portfolio only contains: Posters, Project metadata, and Custom view components.
- Embeds point to the Projects' deployed URLs (cross-origin), under the embed contract (ADR 0004).
- Not a monorepo (no backend or shared code to justify it).
- **Deploy:** static output to **Cloudflare Pages** (domain and DNS already on Cloudflare), cached at the edge.

## Priorities

- **Performance is first-class**: the goal is the Lighthouse ceiling. It justifies the HTML-first approach (load only the Presentation first), zero-JS by default, and the Poster-no-spinner model of the Showcase.

## Commands

- `pnpm dev` — dev server
- `pnpm build` — static build to `dist/`
- `pnpm preview` — serve the build
- `pnpm check` — `astro check` (typecheck of `.astro` files)
- `pnpm lint` — `oxlint` (lint of JS/TS)
- `pnpm format` — `oxfmt` (TS/JS/CSS/MD/JSON) + Prettier (`.astro`), format in place; `pnpm format:check` verifies without writing
- `pnpm test` — unit tests (Vitest, the fast loop: pure decision logic and content guards)
- `pnpm test:e2e` — DOM-integration tests (Playwright against the production build, with a cross-origin embed stub); see `e2e/`

CI (`.github/workflows/ci.yml`) runs on push and PRs to `v2`/`main`: a fast `checks` job (lint, format:check, check, test, build) and a separate `e2e` job (Playwright). Every command above must pass before merge.

## Project layout

- `src/pages/` — routes (single page: `index.astro`)
- `src/layouts/` — layouts (`Layout.astro` imports the global styles)
- `src/styles/global.css` — Tailwind + tokens (`@theme`)
- `src/content.config.ts` — `projects` collection (Project schema)
- `src/content/projects/` — one `.md`/`.mdx` per Project

## Conventions

- **English only.** All text committed to the repo — code, comments, commit messages, docs, ADRs — is in English. (i18n with an EN/ES switch is a possible future consideration, not in scope now.)
- **Technical objectivity in the record.** Every commit message, code comment and doc (including ADRs) describes _what_ changes and, when relevant, _why_ — but the "why" **only when it has technical grounding** (an architecture trade-off, a fix for a measurable bug, a performance constraint). It never references session conversations, personal or situational explanations, or the private motivation behind a decision. If a justification has no technical grounding, it is omitted.
- **Formatting and linting.** Two formatters split by file type so they never fight: `oxfmt` formats TS/JS, CSS, Markdown and JSON; Prettier (`prettier-plugin-astro`) formats `.astro`. `oxlint` lints JS/TS. Run `pnpm format` and `pnpm lint` before committing. Oxc still does not parse `.astro` (no `.astro` linting by oxlint), but `.astro` is now formatted by Prettier and typechecked by `pnpm check`.
