# Showcase Projects

Each Project is a `.md`/`.mdx` file in this directory. The frontmatter follows the
schema in `src/content.config.ts`; the document body is the long description.

Files prefixed with `_` (like this one) are excluded from the loader.

Main fields:

- `title`, `summary`
- `mode`: `embed` | `media` | `custom` (see CONTEXT.md)
- `poster`: base visual layer
- `order`: order in the Selector
- `accent`: identity accent (overrides `--accent`)
- `embed`: `{ url, requiresLaunch }` — only `mode: embed` (see ADR 0004)
- `links`: `{ live, repo }`
- `stack`: list of technologies
