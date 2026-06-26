# Index-free slug as the canonical project key

Projects have a display order in the Showcase, and they each have a URL identity: the detail
route (`/projects/<slug>/`), the Showcase deep-link hash (`#<slug>`), and the per-project DOM
ids the controllers key off (`data-project`, `panel-<id>`, `tab-<id>`, the embed entry map).
These two concerns, ordering and identity, were entangled in the content filename.

Content files were named with a numeric order prefix (`00-simple-tool-stack.md`,
`01-bye-bg.md`, `02-rangetube.md`), so the Astro collection `id` carried that prefix. The
detail route already stripped it with a `projectSlug()` helper, but the Showcase used the raw
`id` as its DOM and hash key, so the deep-link hash was `#02-rangetube`. The ordering index
leaked into a user-visible, shareable URL, and the index was duplicated as both a sort key and
part of the identity.

## Decision

The clean, index-free slug is the single canonical project key across every URL surface. The
content filename is the slug (`rangetube.md`), so the collection `id` is the slug, and the
Showcase hash, the Stage/Selector DOM ids, the embed controller entry map, and the detail route
all share one key with no transformation between them.

Ordering is driven solely by the `order` frontmatter (`0`/`1`/`2`), which the Selector and the
generated `/projects.md` (ADR 0007) already sort by. Nothing reads the filename for order, so
dropping the prefix leaves ordering unchanged.

`projectSlug()` in `src/lib/showcaseProjects.ts` is kept as a guard that strips a leading
order-index prefix (`/^\d+[-_]/`). With index-free filenames it is an identity for current ids,
but it stays so a stray prefixed filename can never reach a URL.

## Guarding tests

- `src/content/projects/slug-keys.test.ts` asserts that no project `id` (content filename)
  carries a leading order-index prefix, so the index can never re-enter a URL surface.
- `e2e/showcase-selection.spec.ts` asserts the live behavior: a tab switch syncs the hash to the
  clean slug (`#rangetube`), and a `#rangetube` deep link on load activates the right Project.

## Considered options

- **Keep the prefixed filenames; switch only the Showcase DOM/hash key from `id` to `slug`
  (rejected).** Smaller diff, but it keeps two representations of identity in play (the prefixed
  `id` internally, the clean slug in the URL), leaves `projectSlug()` load-bearing on a hot path,
  and means every consumer must remember which form it holds. Renaming the files removes the
  divergence at the source.
- **A separate `slug` frontmatter field (rejected).** Redundant with the filename and an extra
  thing to keep consistent; the filename is already a unique, human-meaningful key.
