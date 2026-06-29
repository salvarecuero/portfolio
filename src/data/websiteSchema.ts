import { presentation } from "./presentation";

export interface WebsiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  "@id": string;
  url: string;
  name: string;
  author: { "@id": string };
}

// Pure builder for schema.org/WebSite. Secondary node: it identifies the site and links
// to the Person entity by @id (the Person is the primary entity, emitted via ProfilePage
// on the home). Astro URL resolution is passed in; siteUrl ends with a trailing slash.
export function buildWebsiteSchema({ siteUrl }: { siteUrl: string }): WebsiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    url: siteUrl,
    name: presentation.name,
    author: { "@id": `${siteUrl}#person` },
  };
}
