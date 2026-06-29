import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Selector from "./showcase/Selector.astro";
import Stage from "./showcase/Stage.astro";
import placeholder from "../assets/posters/placeholder.webp";

describe("Selector", () => {
  it("renders a tab per project with the active one marked", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Selector, {
      props: {
        projects: [
          {
            id: "a",
            slug: "a",
            title: "Alpha",
            iconPath: "M0 0",
            active: true,
            summary: "",
            media: [],
          },
          {
            id: "b",
            slug: "b",
            title: "Beta",
            iconPath: "M0 0",
            active: false,
            summary: "",
            media: [],
          },
        ],
      },
    });
    expect(html).toContain("Alpha");
    expect(html).toContain("Beta");
    expect(html).toMatch(/class="[^"]*tab[^"]*active/);
  });

  it("exposes the tabs with APG tablist semantics and roving tabindex", async () => {
    const container = await AstroContainer.create();
    // A legacy order-index prefix on the id must not reach the DOM/URL: the tab keys off the
    // clean slug, never the raw id (ADR 0008).
    const html = await container.renderToString(Selector, {
      props: {
        projects: [
          {
            id: "01-a",
            slug: "a",
            title: "Alpha",
            iconPath: "M0 0",
            active: true,
            summary: "",
            media: [],
            accent: "#aabbcc",
          },
          {
            id: "02-b",
            slug: "b",
            title: "Beta",
            iconPath: "M0 0",
            active: false,
            summary: "",
            media: [],
          },
        ],
      },
    });
    expect(html).toMatch(/role="tablist"/);
    expect((html.match(/role="tab"/g) ?? []).length).toBe(2);
    expect(html).toMatch(
      /aria-selected="true"[^>]*tabindex="0"|tabindex="0"[^>]*aria-selected="true"/,
    );
    expect(html).toContain('aria-controls="panel-a"');
    expect(html).toContain('id="tab-a"');
    expect(html).toContain('data-project="a"');
    expect(html).not.toContain("01-a"); // the order prefix never leaks into the DOM key
    expect(html).toContain('aria-selected="false"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('data-accent="#aabbcc"');
  });
});

describe("Stage", () => {
  // id carries a legacy order prefix; slug is the clean key the DOM/URL must use (ADR 0008).
  const project = {
    id: "00-alpha",
    slug: "alpha",
    title: "Alpha",
    iconPath: "M0 0",
    active: true,
    summary: "",
    media: [{ type: "image" as const, src: placeholder, alt: "overview" }],
  };

  it("renders the active Stage as a visible tabpanel wired to its tab", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Stage, { props: { project, active: true } });
    expect(html).toMatch(/role="tabpanel"/);
    expect(html).toContain('id="panel-alpha"');
    expect(html).toContain('aria-labelledby="tab-alpha"');
    expect(html).toContain('data-project="alpha"');
    expect(html).not.toContain("00-alpha"); // the order prefix never leaks into the DOM key
    expect(html).not.toMatch(/<section[^>]*\shidden/);
    expect(html).toMatch(/class="[^"]*\bis-active\b/); // SSR / no-JS: only the active Stage paints
  });

  it("renders an inactive Stage hidden and not active", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Stage, { props: { project, active: false } });
    expect(html).toMatch(/<section[^>]*\shidden/);
    expect(html).not.toMatch(/\bis-active\b/);
  });
});
