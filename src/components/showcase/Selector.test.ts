import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Selector from "./Selector.astro";

const projects = [
  { id: "alpha", title: "Alpha Project", iconPath: "M3 3h18", active: true },
  { id: "beta", title: "Beta Project With A Very Long Title", iconPath: "M3 3h18", active: false },
];

async function render(p: any[]) {
  const container = await AstroContainer.create();
  return container.renderToString(Selector, { props: { projects: p } });
}

describe("Selector", () => {
  it("renders each title inside a .tab-label span so it can be ellipsized", async () => {
    const html = await render(projects);
    expect((html.match(/class="tab-label"/g) ?? []).length).toBe(2);
    // Tolerate Astro's injected data-astro-source-* attributes between the
    // class and the tag close (see Stage.test.ts, same container renderer).
    expect(html).toMatch(/<span class="tab-label"[^>]*>Alpha Project<\/span>/);
  });
  it("marks the active project tab", async () => {
    const html = await render(projects);
    expect(html).toMatch(/class="tab active"/);
  });

  it("renders a Project's brand logo instead of a glyph + title", async () => {
    const html = await render([
      {
        id: "sts",
        slug: "simple-tool-stack",
        title: "Simple Tool Stack",
        iconPath: "M3 3h18",
        accent: "#6366F1",
        active: true,
      },
      {
        id: "rt",
        slug: "rangetube",
        title: "RangeTube",
        iconPath: "M3 3h18",
        accent: "#e8634c",
        active: false,
      },
      {
        id: "bb",
        slug: "bye-bg",
        title: "bye-bg",
        iconPath: "M3 3h18",
        accent: "#0ea5e9",
        active: false,
      },
    ]);
    // Branded tabs drop the generic title label entirely.
    expect(html).not.toMatch(/class="tab-label"/);
    // Simple Tools: wordmark beside the gradient mark.
    expect(html).toContain("tab-logo--sts");
    expect(html).toMatch(/Simple Tools/);
    // RangeTube: v2 wordmark plus A-B track with an accessible name.
    expect(html).toMatch(
      /class="tab-logo tab-logo--rangetube"[^>]*role="img"[^>]*aria-label="RangeTube"/,
    );
    expect(html).toContain("rt-track-line");
    expect(html).toContain("rt-handle--a");
    expect(html).toContain("rt-handle--b");
    // bye-bg: "bye" + accent "-bg".
    expect(html).toContain("tab-logo--byebg");
    expect(html).toMatch(/-bg/);
  });

  it("renders the view switcher, visible when the active Project is an embed", async () => {
    const c = await AstroContainer.create();
    const projects = [
      {
        slug: "sts",
        title: "Simple Tools",
        iconPath: "M0 0",
        accent: "#6366f1",
        active: true,
        mode: "embed",
      },
      {
        slug: "byebg",
        title: "bye-bg",
        iconPath: "M0 0",
        accent: "#16b8a6",
        active: false,
        mode: "media",
      },
    ] as any;
    const html = await c.renderToString(Selector, { props: { projects } });
    expect(html).toContain("data-view-switch");
    expect(html).not.toMatch(/data-view-switch[^>]*\shidden/); // active is embed -> visible
  });

  it("hides the view switcher when the active Project is not an embed", async () => {
    const c = await AstroContainer.create();
    const projects = [
      {
        slug: "byebg",
        title: "bye-bg",
        iconPath: "M0 0",
        accent: "#16b8a6",
        active: true,
        mode: "media",
      },
    ] as any;
    const html = await c.renderToString(Selector, { props: { projects } });
    expect(html).toMatch(/data-view-switch[^>]*\shidden/);
  });
});
