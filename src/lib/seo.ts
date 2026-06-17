/**
 * Pure (DOM-free) SEO/social metadata resolution. The component (SEO.astro) passes in
 * Astro.site + Astro.url.pathname; this returns absolute URLs ready for the meta tags.
 * og:image MUST be absolute or social crawlers drop it — that is the reason this is a
 * tested seam rather than inline component logic.
 */
export interface SeoInput {
  /** Astro.site (production origin) or undefined in some contexts. */
  site: URL | undefined;
  /** Origin used when site is undefined (e.g. presentation.domain). */
  fallbackOrigin: string;
  /** Astro.url.pathname (e.g. "/"). */
  pathname: string;
  title: string;
  description: string;
  /** Image path served from the site root; default "/og.png". */
  image?: string;
  /** OpenGraph type; default "website". */
  type?: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogUrl: string;
  ogImage: string;
  ogType: string;
}

function originBase(site: URL | undefined, fallbackOrigin: string): URL {
  if (site) return site;
  // Ensure a trailing slash so new URL(path, base) resolves predictably.
  return new URL(fallbackOrigin.endsWith('/') ? fallbackOrigin : `${fallbackOrigin}/`);
}

export function buildSeoMeta(input: SeoInput): SeoMeta {
  const base = originBase(input.site, input.fallbackOrigin);
  const image = input.image ?? '/og.png';
  return {
    title: input.title,
    description: input.description,
    canonical: new URL(input.pathname, base).href,
    ogUrl: new URL(input.pathname, base).href,
    ogImage: new URL(image, base).href,
    ogType: input.type ?? 'website',
  };
}
