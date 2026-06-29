import { describe, it, expect } from "vitest";
import { renderProjectsMarkdown, type ProjectMarkdownEntry } from "./projectsMarkdown";

const ORIGIN = "https://salvarecuero.dev/";

// Deliberately out of `order` to prove the renderer sorts.
const fixtures: ProjectMarkdownEntry[] = [
  {
    id: "01-second",
    data: {
      title: "Second",
      summary: "The second one.",
      description: ["Para one.", "Para two."],
      stack: ["React", "Vite"],
      order: 1,
      links: { live: "https://second.example", repo: "https://github.com/x/second" },
    },
  },
  {
    id: "00-first",
    data: {
      title: "First",
      summary: "The first one.",
      description: ["Only para."],
      stack: ["Astro"],
      order: 0,
      links: { live: "https://first.example" },
    },
  },
];

describe("renderProjectsMarkdown", () => {
  const md = renderProjectsMarkdown(fixtures, ORIGIN);

  it("orders sections by `order`, not input order", () => {
    expect(md.indexOf("## First")).toBeLessThan(md.indexOf("## Second"));
  });

  it("includes every project's title, summary, and description paragraphs", () => {
    expect(md).toContain("## First");
    expect(md).toContain("The first one.");
    expect(md).toContain("Only para.");
    expect(md).toContain("## Second");
    expect(md).toContain("Para one.");
    expect(md).toContain("Para two.");
  });

  it("renders the stack line", () => {
    expect(md).toContain("Stack: Astro");
    expect(md).toContain("Stack: React, Vite");
  });

  it("derives the project-page URL from origin + slug (order prefix stripped)", () => {
    expect(md).toContain("Project page: https://salvarecuero.dev/projects/first");
    expect(md).toContain("Project page: https://salvarecuero.dev/projects/second");
  });

  it("emits Live, and Repo only when present", () => {
    expect(md).toContain("Live: https://first.example");
    expect(md).toContain("Repo: https://github.com/x/second");
    // First has no repo, so exactly one Repo line across the document.
    expect(md.match(/^Repo: /gm)?.length).toBe(1);
  });

  it("ends with a single trailing newline", () => {
    expect(md.endsWith("\n")).toBe(true);
    expect(md.endsWith("\n\n")).toBe(false);
  });
});
