import { beforeAll, expect, test } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Presentation from "../src/components/Presentation.astro";
import { presentation } from "../src/data/presentation";

let html = "";

beforeAll(async () => {
  const container = await AstroContainer.create();
  html = await container.renderToString(Presentation);
});

test("h1 is the full name (given + family, family set apart)", () => {
  // Name is split into weighted spans; assert both parts render inside the h1.
  expect(html).toMatch(/<h1[^>]*>[\s\S]*Salvador[\s\S]*Recuero[\s\S]*<\/h1>/);
  expect(html).toMatch(/<span class="family"[^>]*>Recuero<\/span>/);
});

test("shows the role", () => {
  expect(html).toContain("Software Engineer");
});

test("renders the strapline (app clause + code chip)", () => {
  expect(html).toContain("Beautiful");
  expect(html).toContain("fast");
  expect(html).toContain("reliable");
  expect(html).toMatch(/Clean,\s*<span class="tok"[^>]*>solid<\/span>\s*code\./);
});

test("renders exactly the visible stack chips", () => {
  // match list items only (`<li>`/`<li ...>`), not e.g. `<line>` inside an icon SVG
  const items = html.match(/<li[\s>]/g) ?? [];
  expect(items.length).toBe(presentation.stack.length);
  for (const tech of presentation.stack) expect(html).toContain(tech);
});

test("photo uses a descriptive alt text including the name", () => {
  expect(html).toMatch(/<img[^>]*alt="Photo of Salvador Recuero"/);
});

test("scroll cue links to the Showcase", () => {
  expect(html).toMatch(/<a[^>]*href="#showcase"/);
});

test("links to the GitHub and LinkedIn profiles", () => {
  expect(html).toContain(`href="${presentation.socials.github}"`);
  expect(html).toContain(`href="${presentation.socials.linkedin}"`);
});

test("offers the CV as a download", () => {
  expect(html).toMatch(/<a[^>]*href="\/cv\.pdf"[^>]*download/);
});

test("icon-only links carry accessible labels", () => {
  expect(html).toMatch(/aria-label="GitHub"/);
  expect(html).toMatch(/aria-label="LinkedIn"/);
  expect(html).toMatch(/aria-label="Download CV"/);
});

test("includes the Person JSON-LD", () => {
  expect(html).toContain('type="application/ld+json"');
});
