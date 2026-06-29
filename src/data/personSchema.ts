import { presentation } from "./presentation";

export interface PersonSchemaInput {
  /** Absolute site origin WITH trailing slash, e.g. "https://salvarecuero.dev/". Used verbatim as the schema.org `url`. */
  siteUrl: string;
  /** Absolute URL to the photo. */
  imageUrl: string;
}

export interface PersonSchema {
  "@context": "https://schema.org";
  "@type": "Person";
  "@id": string;
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  image: string;
  email: string;
  knowsAbout: string[];
  sameAs: string[];
}

// Pure builder for the schema.org/Person JSON-LD. Astro-specific URL resolution
// (Astro.site, hashed image src) happens in the component and is passed in.
export function buildPersonSchema({ siteUrl, imageUrl }: PersonSchemaInput): PersonSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}#person`,
    name: presentation.name,
    jobTitle: presentation.role,
    description: presentation.description,
    url: siteUrl,
    image: imageUrl,
    email: presentation.email,
    knowsAbout: [...presentation.knowsAbout],
    sameAs: [presentation.socials.github, presentation.socials.linkedin],
  };
}
