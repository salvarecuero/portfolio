export interface CreativeWorkSchemaInput {
  /** Absolute URL of the project's own page; used as both @id and url. */
  pageUrl: string;
  /** Person @id to attribute authorship to (e.g. "https://salvarecuero.dev/#person"). */
  personId: string;
  name: string;
  description: string;
  /** Absolute image URL (the project Poster). Optional. */
  image?: string;
  /** Project stack/tech; serialized to a comma-separated keywords string. Optional. */
  keywords?: string[];
}

export interface CreativeWorkSchema {
  "@context": "https://schema.org";
  "@type": "CreativeWork";
  "@id": string;
  name: string;
  description: string;
  url: string;
  image?: string;
  keywords?: string;
  author: { "@id": string };
}

// Pure builder for schema.org/CreativeWork — one per project page. CreativeWork (not
// SoftwareApplication) is used deliberately: the SoftwareApplication rich result requires
// price + aggregateRating, unattainable for personal projects. This grants entity signal,
// not a rich result. author references the Person @id to keep one connected graph.
export function buildCreativeWorkSchema(input: CreativeWorkSchemaInput): CreativeWorkSchema {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": input.pageUrl,
    name: input.name,
    description: input.description,
    url: input.pageUrl,
    ...(input.image ? { image: input.image } : {}),
    ...(input.keywords && input.keywords.length ? { keywords: input.keywords.join(", ") } : {}),
    author: { "@id": input.personId },
  };
}
