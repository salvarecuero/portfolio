import { expect, test } from "vitest";
import { buildPersonSchema } from "../src/data/personSchema";
import { presentation } from "../src/data/presentation";

const schema = buildPersonSchema({
  siteUrl: "https://salvarecuero.dev/",
  imageUrl: "https://salvarecuero.dev/_astro/salvador-recuero.abc123.webp",
});

test("is a schema.org Person", () => {
  expect(schema["@context"]).toBe("https://schema.org");
  expect(schema["@type"]).toBe("Person");
});

test("uses name and role as jobTitle", () => {
  expect(schema.name).toBe("Salvador Recuero");
  expect(schema.jobTitle).toBe("Full-Stack Software Engineer");
});

test("carries the absolute url and image", () => {
  expect(schema.url).toBe("https://salvarecuero.dev/");
  expect(schema.image).toBe("https://salvarecuero.dev/_astro/salvador-recuero.abc123.webp");
});

test("sameAs lists both socials", () => {
  expect(schema.sameAs).toEqual([
    presentation.socials.github,
    presentation.socials.linkedin,
  ]);
});

test("knowsAbout matches the data module", () => {
  expect(schema.knowsAbout).toEqual([...presentation.knowsAbout]);
});

test("has a stable @id anchored at the site origin", () => {
  expect(schema["@id"]).toBe("https://salvarecuero.dev/#person");
});
