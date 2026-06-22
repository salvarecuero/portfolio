# Agent-facing markdown at the deploy root

AI agents and chatbots that browse the web increasingly read a site to answer a user's
question about its owner ("is this person available for hire", "what has she built"). For a
visually-driven portfolio, the rendered HTML is a poor source: the meaningful content is
spread across islands, images, and structured data tuned for a human reader. The goal here
is to give those agents a clean, high-signal prose surface, so what they relay is accurate
and complete, complementing the JSON-LD already emitted for search engines.

## Decision

Serve a small set of hand-authored and generated markdown files from the deploy root,
following the emerging `llms.txt` convention:

| URL | Source | Authoring |
| --- | --- | --- |
| `/llms.txt` | `public/llms.txt` | hand-authored index; links to the pages below |
| `/hire.md` | `public/hire.md` | hand-authored hiring profile |
| `/contact.md` | `public/contact.md` | hand-authored contact and availability |
| `/projects.md` | `src/pages/projects.md.ts` | generated from the `projects` collection |

`/projects.md` is generated, not hand-written, because the projects already exist as typed
content in `src/content/projects/`. The endpoint reads `getCollection("projects")`, sorts by
`order` (matching the Selector), and renders each project's summary, description, stack, and
links via the pure `renderProjectsMarkdown` helper in `src/lib/projectsMarkdown.ts`. Adding or
editing a project updates `/projects.md` for free, so it never drifts from the catalog. The
other three files are hand-authored prose (bio, rate, contact) with no such source of truth,
so they live as static files in `public/`.

**Content-Type.** A static `.md` would otherwise be served by Cloudflare Pages as a download
(`application/octet-stream`). `public/_headers` pins `/*.md` to `text/markdown; charset=utf-8`.
This also covers the generated `/projects.md`: a static build writes the endpoint's body to
`dist/projects.md` but discards the Response's own `Content-Type`, so the type is set in
`_headers`, not in the route. `/llms.txt` keeps the default `text/plain`, which is the
convention and is readable as-is.

**Discoverability.** `/llms.txt` sits at the well-known path agents probe, and lists the other
three pages. No new compute is introduced: every file is part of the static build and the
existing cache and deploy model (ADR 0006).

## Guarding tests

- `src/lib/projectsMarkdown.test.ts` checks the generator: ordering by `order`, presence of
  each project's title, summary, description, stack and links, slug-derived page URLs, and
  that `Repo` is emitted only when present.
- `tests/no-em-dashes.test.ts` is extended to cover `llms.txt`, `hire.md`, and `contact.md`,
  so the hand-authored agent prose stays under the same no-em-dash rule as the rest of the
  user-facing copy.

## Considered options

- **Hand-author all four files (rejected for `/projects.md`).** Simplest, but `/projects.md`
  would duplicate the content collection and drift from it on every project change.
- **Cloudflare's "Markdown for Agents" edge feature.** Auto-converts rendered HTML to markdown
  on an `Accept: text/markdown` request. Rejected: it offers no authoring control and would
  emit a mechanical conversion of a visual page, the opposite of the high-signal goal.
- **`Accept: text/markdown` content negotiation via a Pages Function.** The "proper" HTTP way,
  same URL returning markdown when asked. Rejected for now: it introduces the first edge
  compute into a pure-static deploy, and few agents send the header today, so reach is mostly
  future-facing. The static files have broader reach now and can coexist with negotiation later.
