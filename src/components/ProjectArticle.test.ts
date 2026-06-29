import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import ProjectArticle from "./ProjectArticle.astro";
import placeholder from "../assets/posters/placeholder.webp";

const entry = {
  id: "demo",
  data: {
    title: "Demo Project",
    summary: "A short summary of the demo.",
    stack: ["React", "Sablier", "NoSuchTech"],
    links: { live: "https://demo.example.com" },
    media: [{ type: "image" as const, src: placeholder, alt: "demo overview" }],
    accent: "#e8634c",
    description: ["First paragraph of the description.", "Second paragraph of the description."],
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
    // two paragraphs total: one lead + one plain
    expect((html.match(/class="body-p( lead)?"/g) ?? []).length).toBe(2);
  });

  it("marks only the first description paragraph as the lead", async () => {
    const html = await render();
    expect((html.match(/class="body-p lead"/g) ?? []).length).toBe(1);
    expect((html.match(/class="body-p"/g) ?? []).length).toBe(1); // second paragraph, no lead
    // lead is the first paragraph in source order
    expect(html.indexOf('class="body-p lead"')).toBeLessThan(html.indexOf('class="body-p"'));
  });

  it("renders the stack chips and the live link", async () => {
    const html = await render();
    expect(html).toContain("React");
    expect(html).toContain("Sablier");
    expect(html).toContain("NoSuchTech");
    expect(html).toContain("https://demo.example.com");
  });

  it("renders the live CTA as a primary button above the stack", async () => {
    const html = await render();
    expect(html).toContain("https://demo.example.com");
    expect(html).toMatch(/class="[^"]*cta[^"]*"[\s\S]*?Visit live site/);
    // CTA appears before the stack list in source order
    expect(html.indexOf("Visit live site")).toBeLessThan(html.indexOf('class="stack"'));
  });

  it("renders the repository as a secondary ghost link when present", async () => {
    const withRepo = {
      entry: {
        ...entry,
        data: { ...entry.data, links: { ...entry.data.links, repo: "https://github.com/x/y" } },
      },
    };
    const html = await render(withRepo);
    expect(html).toMatch(/class="[^"]*ghost[^"]*"[\s\S]*?Repository/);
    expect(html).toContain("https://github.com/x/y");
  });

  it("renders the stack as icon pills: svg glyph, mask glyph, and text fallback", async () => {
    const html = await render();
    // React -> simple-icons SVG path inside a stack <li>
    expect(html).toMatch(/<li[^>]*>[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?React[\s\S]*?<\/li>/);
    // Sablier -> mask span carrying the data-URI, no <svg>
    expect(html).toMatch(/class="[^"]*mask-ic[^"]*"[^>]*--m:url\('data:image\/webp/);
    expect(html).toContain("Sablier");
    // NoSuchTech -> plain text pill (no glyph), label still present
    expect(html).toContain("NoSuchTech");
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

  it("renders the back control as an icon circle with a two-line label", async () => {
    const html = await render();
    // a chevron svg inside the back control's icon circle
    expect(html).toMatch(/class="[^"]*back[^"]*"[\s\S]*?<svg[\s\S]*?M15 18l-6-6 6-6/);
    expect(html).toContain("Back");
    expect(html).toContain("Salvador Recuero");
  });

  it("wraps media images in a lightbox trigger and renders the overlay once", async () => {
    const html = await render();
    expect(html).toMatch(/data-lightbox-trigger[^>]*data-full=/);
    expect(html).toContain("Click to enlarge");
    // single overlay container with the close + image hooks
    expect((html.match(/data-lightbox(?![-\w])/g) ?? []).length).toBe(1);
    expect(html).toContain("data-lightbox-close");
    expect(html).toContain("data-lightbox-img");
  });

  it("gives the lightbox trigger an accessible name that includes its visible label", async () => {
    // WCAG 2.5.3 (Label in Name): the button's visible text is "Click to enlarge",
    // so its accessible name (aria-label) must contain that exact string.
    const html = await render();
    const btn = html.match(/<button[^>]*class="frame-trigger"[^>]*>/)?.[0] ?? "";
    const label = btn.match(/aria-label="([^"]*)"/)?.[1] ?? "";
    expect(label.toLowerCase()).toContain("click to enlarge");
  });

  it("exposes the lightbox overlay as a labelled modal dialog", async () => {
    const html = await render();
    expect(html).toMatch(/data-lightbox[^>]*role="dialog"/);
    expect(html).toMatch(/data-lightbox[^>]*aria-modal="true"/);
    // the dialog carries an accessible name (no visible heading inside it)
    expect(html).toMatch(/data-lightbox[^>]*aria-label="[^"]+"/);
  });
});
