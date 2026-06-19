import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import ProjectArticle from "./ProjectArticle.astro";
import placeholder from "../assets/posters/placeholder.webp";

const entry = {
  id: "demo",
  data: {
    title: "Demo Project",
    summary: "A short summary of the demo.",
    stack: ["React", "Astro"],
    links: { live: "https://demo.example.com" },
    media: [{ type: "image" as const, src: placeholder, alt: "demo overview" }],
    accent: "#e8634c",
    description: [
      "First paragraph of the description.",
      "Second paragraph of the description.",
    ],
  },
};

async function render(props: { entry: any } = { entry }) {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectArticle, { props });
}

describe("ProjectArticle", () => {
  it("renders the hero eyebrow, title and summary", async () => {
    const html = await render();
    expect(html).toContain("Demo Project");
    expect(html).toContain("A short summary of the demo.");
    expect(html).toMatch(/class="[^"]*eyebrow[^"]*"[^>]*>\s*Project/);
  });

  it("renders each description paragraph in the body", async () => {
    const html = await render();
    expect(html).toContain("First paragraph of the description.");
    expect(html).toContain("Second paragraph of the description.");
    expect((html.match(/class="body-p"/g) ?? []).length).toBe(2);
  });

  it("renders the stack chips and the live link", async () => {
    const html = await render();
    expect(html).toContain("React");
    expect(html).toContain("Astro");
    expect(html).toContain("https://demo.example.com");
  });

  it("applies the per-Project accent as a token override", async () => {
    const html = await render();
    expect(html).toContain("--accent:#e8634c");
  });

  it("falls back to no accent override when the Project sets none", async () => {
    const noAccent = { entry: { ...entry, data: { ...entry.data, accent: undefined } } };
    const html = await render(noAccent);
    expect(html).not.toContain("--accent:");
  });

  it("captions the first media item with the live host", async () => {
    const html = await render();
    expect(html).toMatch(/class="cap"[^>]*>\s*demo\.example\.com/);
  });

  it("omits the media caption when the Project has no live link", async () => {
    const noLive = { entry: { ...entry, data: { ...entry.data, links: {} } } };
    const html = await render(noLive);
    expect(html).not.toContain('class="cap"');
  });
});
