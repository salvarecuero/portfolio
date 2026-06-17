import { presentation } from "./presentation";

export interface WebsiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  url: string;
  name: string;
  author: { "@type": "Person"; name: string };
}

// Pure builder for the schema.org/WebSite JSON-LD. Identifies the site (alongside the
// existing Person node) — author links it to the person. Astro URL resolution is passed in.
export function buildWebsiteSchema({ siteUrl }: { siteUrl: string }): WebsiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl,
    name: presentation.name,
    author: { "@type": "Person", name: presentation.name },
  };
}
