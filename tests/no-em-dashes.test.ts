import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Scope: the Project content files and the Presentation data, where the user-facing
// copy lives. It is deliberately NOT a repo-wide sweep — em dashes elsewhere (e.g.
// code comments in .astro/.ts) are out of this guard's remit. Extend the file list
// below if a new source of user-visible prose is added.
const EM_DASH = "—";

const projectsDir = new URL("../src/content/projects/", import.meta.url);
const projectFiles = readdirSync(projectsDir)
  .filter((f) => /\.(md|mdx)$/.test(f) && !f.startsWith("_"))
  .map((f) => fileURLToPath(new URL(f, projectsDir)));

const dataFiles = [
  fileURLToPath(new URL("../src/data/presentation.ts", import.meta.url)),
];

describe("no em dashes in committed prose", () => {
  it("discovers at least one project file (guard is not silently empty)", () => {
    expect(projectFiles.length).toBeGreaterThan(0);
  });

  for (const file of [...projectFiles, ...dataFiles]) {
    it(`has no em dash: ${file.split("/").slice(-2).join("/")}`, () => {
      const text = readFileSync(file, "utf8");
      expect(text.includes(EM_DASH)).toBe(false);
    });
  }
});
