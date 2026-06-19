import { expect, test } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import ProfilePageSchema from "../src/components/ProfilePageSchema.astro";

test("renders a JSON-LD script with a ProfilePage wrapping the Person", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ProfilePageSchema, {
    props: { imageUrl: "https://salvarecuero.dev/img.webp" },
  });
  expect(html).toContain('type="application/ld+json"');

  const json = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? "";
  const parsed = JSON.parse(json);
  expect(parsed["@type"]).toBe("ProfilePage");
  expect(parsed.mainEntity["@type"]).toBe("Person");
  expect(parsed.mainEntity.name).toBe("Salvador Recuero");
  expect(parsed.mainEntity.image).toBe("https://salvarecuero.dev/img.webp");
  expect(parsed.mainEntity.url).toContain("salvarecuero.dev");
});
