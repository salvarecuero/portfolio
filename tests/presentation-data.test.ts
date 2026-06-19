import { expect, test } from "vitest";
import { presentation } from "../src/data/presentation";

test("name and role", () => {
  expect(presentation.name).toBe("Salvador Recuero");
  expect(presentation.role).toBe("Full-Stack Software Engineer");
});

test("exposes visible stack chips in order", () => {
  expect(presentation.stack).toEqual([
    "TypeScript", "Node.js", "React", "Next.js", "Astro", "Docker", "AWS",
  ]);
});

test("knowsAbout is a superset of the visible stack", () => {
  for (const tech of presentation.stack) {
    expect(presentation.knowsAbout).toContain(tech);
  }
});

test("has both social profiles", () => {
  expect(presentation.socials.github).toMatch(/github\.com\/salvarecuero/);
  expect(presentation.socials.linkedin).toMatch(/linkedin\.com\/in\/salvarecuero/);
});

test("exposes a downloadable CV url", () => {
  expect(presentation.cvUrl).toMatch(/\.pdf$/);
});

test("description mentions web apps and uses no em dash", () => {
  expect(presentation.description.toLowerCase()).toContain("web app");
  expect(presentation.description).not.toContain("—");
  expect(presentation.description).toContain("Open to remote work.");
});
