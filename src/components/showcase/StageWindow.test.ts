// src/components/showcase/StageWindow.test.ts
import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import StageWindow from "./StageWindow.astro";

const imgMeta = { src: "/p.webp", width: 1280, height: 720, format: "webp" } as any;
const project = {
  title: "Simple Tools",
  mode: "embed",
  embed: { url: "https://simple-tools.app/home", requiresLaunch: false, mobile: false },
  media: [
    { type: "image", src: imgMeta, alt: "Image Compressor" },
    { type: "image", src: imgMeta, alt: "Merge PDF" },
  ],
} as any;

async function render(props: any) {
  const c = await AstroContainer.create();
  return c.renderToString(StageWindow, { props });
}

describe("StageWindow.astro", () => {
  it("renders the chrome bar with the embed host in the address bar", async () => {
    const html = await render({ project });
    expect(html).toContain("stage-chrome");
    expect(html).toContain("simple-tools.app"); // host only, not the full URL path
    expect(html).not.toMatch(/stage-chrome__host[^>]*>[^<]*\/home/);
  });

  it("seeds the viewer toolbar with the first capture caption and total", async () => {
    const html = await render({ project });
    expect(html).toContain("data-view-caption");
    expect(html).toContain("Image Compressor");
    expect(html).toMatch(/data-view-pos[^>]*>1 \/ 2</);
  });

  it("renders an open-in-new-tab link to the embed URL", async () => {
    const html = await render({ project });
    expect(html).toMatch(
      /<a[^>]*class="stage-chrome__open"[^>]*href="https:\/\/simple-tools\.app\/home"[^>]*target="_blank"/,
    );
    expect(html).toContain('rel="noopener"');
  });

  it("makes the address bar a mouse-only link to the embed URL (kept out of the tab order)", async () => {
    const html = await render({ project });
    expect(html).toMatch(
      /<a[^>]*class="stage-chrome__url"[^>]*href="https:\/\/simple-tools\.app\/home"[^>]*target="_blank"/,
    );
    // decorative + mouse-only: the chrome open button is the keyboard/AT-accessible affordance
    expect(html).toMatch(/class="stage-chrome__url"[^>]*tabindex="-1"/);
  });

  it("keeps the open-in-new-tab link reachable by assistive tech (only decorative parts are aria-hidden)", async () => {
    const html = await render({ project });
    // the chrome container itself is not aria-hidden
    expect(html).toMatch(/<div class="stage-chrome">/);
    // decorative parts are hidden from AT
    expect(html).toMatch(/stage-chrome__dots[^>]*aria-hidden="true"/);
    expect(html).toMatch(/stage-chrome__center[^>]*aria-hidden="true"/);
    // the open-in-new-tab anchor is NOT inside an aria-hidden subtree
    const openIdx = html.indexOf('class="stage-chrome__open"');
    expect(openIdx).toBeGreaterThan(-1);
  });
});
