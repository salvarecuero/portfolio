import { describe, it, expect } from "vitest";
import { buildCreativeWorkSchema } from "./creativeWorkSchema";

const base = {
  pageUrl: "https://salvarecuero.dev/projects/rangetube/",
  personId: "https://salvarecuero.dev/#person",
  name: "RangeTube",
  description: "Loop any YouTube video between a custom start and end point.",
};

describe("buildCreativeWorkSchema", () => {
  it("builds a CreativeWork keyed by the page URL, authored by the Person @id", () => {
    const w = buildCreativeWorkSchema({
      ...base,
      image: "https://salvarecuero.dev/_astro/p.png",
      keywords: ["React", "Netlify"],
    });
    expect(w["@type"]).toBe("CreativeWork");
    expect(w["@id"]).toBe(base.pageUrl);
    expect(w.url).toBe(base.pageUrl);
    expect(w.name).toBe("RangeTube");
    expect(w.author).toEqual({ "@id": base.personId });
    expect(w.image).toBe("https://salvarecuero.dev/_astro/p.png");
    expect(w.keywords).toBe("React, Netlify");
  });

  it("omits image and keywords when not provided", () => {
    const w = buildCreativeWorkSchema(base);
    expect(w.image).toBeUndefined();
    expect(w.keywords).toBeUndefined();
  });
});
