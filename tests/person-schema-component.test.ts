import { expect, test } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import PersonSchema from "../src/components/PersonSchema.astro";

test("renders a JSON-LD script with the Person data", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(PersonSchema, {
    props: { imageUrl: "https://salvarecuero.dev/img.webp" },
  });
  expect(html).toContain('type="application/ld+json"');

  const json = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? "";
  const parsed = JSON.parse(json);
  expect(parsed["@type"]).toBe("Person");
  expect(parsed.name).toBe("Salvador Recuero");
  expect(parsed.image).toBe("https://salvarecuero.dev/img.webp");
  expect(parsed.url).toContain("salvarecuero.dev");
});
