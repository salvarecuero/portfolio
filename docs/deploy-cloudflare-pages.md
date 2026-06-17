# Deploy — Cloudflare Pages (static Astro)

The portfolio is a static Astro build (`output: 'static'` default — **no adapter**). Domain/DNS are
already on Cloudflare. This is the connect reference; the build artifacts (headers, sitemap, robots,
OG image, Node pin) are committed.

## Before the first deploy

- **`public/cv.pdf` must exist.** The Presentation's "Download CV" pill links to `/cv.pdf`
  (`presentation.cvUrl`). The file is not yet committed, so the link would 404 in production. Add
  `public/cv.pdf` before deploying, or hide/repoint the CV pill — do not ship the 404.

## Project settings (Cloudflare dashboard → Pages → Create → Connect to Git)

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Adapter | none (static) |

## Environment variables (Settings → Environment variables)

- `PNPM_VERSION` = the pnpm major in use (currently `9`; the v3 build image does not detect pnpm from
  the lockfile). The committed `pnpm-lock.yaml` pins exact dependency versions for a reproducible install.
- Node version is pinned by the committed `.nvmrc` (`22.16.0`); no `NODE_VERSION` var needed.

Do **not** add a `wrangler.toml`/`wrangler.jsonc` — for a static Pages project it would override the
dashboard env vars.

## Branch strategy (choose at connect time)

v1 is frozen at tag `v1.0` (tags never deploy on CF Pages — `v1.0` is safe). Active work is on `v2`;
the repo's default branch is `main`. Two options:

- **(a) Production branch = `v2`:** point production at `v2` directly; `main` becomes a preview branch.
  Fastest to ship without a merge.
- **(b) Merge `v2` → `main`, Production branch = `main`:** conventional; `v2` PRs get auto preview
  URLs before merge. Recommended once `v2` is stable.

All non-production branches get auto preview URLs (`<branch-alias>.<project>.pages.dev`).

## Custom domain

After the first deploy, add the custom domain (`salvarecuero.dev`) in the Pages project's Custom
domains tab; DNS is already on Cloudflare so it provisions automatically.

## Post-connect verification

- Hit the deploy URL; confirm `_headers` applied: `curl -I https://<deploy>/_astro/<hashed>.js`
  shows `cache-control: public, max-age=31536000, immutable`.
- `curl -I https://<deploy>/` shows the security headers (`X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`).
- Confirm `robots.txt`, `sitemap.xml`, `og.png`, `apple-touch-icon.png` are reachable at the root.
- Re-run Lighthouse on the production URL.
