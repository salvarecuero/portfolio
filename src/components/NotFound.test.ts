import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import NotFound from "./NotFound.astro";

async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(NotFound);
}

describe("NotFound (404)", () => {
  it("renders the 404 marker", async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*code[^"]*"[^>]*>\s*404/);
  });

  it("renders the first-person warm copy", async () => {
    const html = await render();
    expect(html).toContain("I've landed on my share of 404s too");
    expect(html).toContain("here's a photo of Barsinso and me");
    expect(html).toContain("He's the best");
  });

  it("links back to the homepage with the parenthetical aside", async () => {
    const html = await render();
    expect(html).toMatch(/href="\/"/);
    expect(html).toContain("Back to the homepage");
    expect(html).toContain("even if that means you stop looking at him");
  });

  it("renders the photo with a descriptive, non-empty alt", async () => {
    const html = await render();
    const alt = html.match(/<img[^>]*\balt="([^"]*)"/)?.[1] ?? "";
    expect(alt.length).toBeGreaterThan(0);
    expect(alt).toContain("Barsinso");
  });

  it("captions the photo", async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*caption[^"]*"[^>]*>[\s\S]*?Barsinso/);
  });

  it("reads top to bottom: intro copy, then the photo it introduces, then the way out", async () => {
    const html = await render();
    const iCode = html.indexOf('class="code"');
    const iIntro = html.indexOf("here's a photo of Barsinso and me");
    const iImg = html.search(/<img\b/);
    const iBack = html.indexOf("Back to the homepage");
    // the line that announces the photo must come before the photo, not after it
    expect(iCode).toBeLessThan(iIntro);
    expect(iIntro).toBeLessThan(iImg);
    // the exit link sits below the photo (so "stop looking at him" lands with it in view)
    expect(iImg).toBeLessThan(iBack);
  });
});
