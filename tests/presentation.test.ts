import { beforeAll, expect, test } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Presentation from "../src/components/Presentation.astro";
import { presentation } from "../src/data/presentation";

let html = "";

beforeAll(async () => {
  const container = await AstroContainer.create();
  html = await container.renderToString(Presentation);
});

test("h1 is the full name", () => {
  expect(html).toMatch(/<h1[^>]*>Salvador Recuero<\/h1>/);
});

test("shows the role", () => {
  expect(html).toContain("Software Engineer");
});

test("renders exactly the visible stack chips", () => {
  const items = html.match(/<li[^>]*>/g) ?? [];
  expect(items.length).toBe(presentation.stack.length);
  for (const tech of presentation.stack) expect(html).toContain(tech);
});

test("photo uses a descriptive alt text including the name", () => {
  expect(html).toMatch(/<img[^>]*alt="Photo of Salvador Recuero"/);
});

test("scroll cue links to the Showcase", () => {
  expect(html).toMatch(/<a[^>]*href="#showcase"/);
});

test("includes the Person JSON-LD", () => {
  expect(html).toContain('type="application/ld+json"');
});
