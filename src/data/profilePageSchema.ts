import { buildPersonSchema, type PersonSchema } from "./personSchema";

export interface ProfilePageSchema {
  "@context": "https://schema.org";
  "@type": "ProfilePage";
  "@id": string;
  url: string;
  mainEntity: PersonSchema;
}

// Pure builder for schema.org/ProfilePage. Per Google's ProfilePage guidance, mainEntity
// is the Person the page is about; embedding the full Person (which carries its own @id)
// keeps a single connected entity graph. Astro URL resolution is passed in.
export function buildProfilePageSchema({
  siteUrl,
  imageUrl,
}: {
  siteUrl: string;
  imageUrl: string;
}): ProfilePageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${siteUrl}#profilepage`,
    url: siteUrl,
    mainEntity: buildPersonSchema({ siteUrl, imageUrl }),
  };
}
