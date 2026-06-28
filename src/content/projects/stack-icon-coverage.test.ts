import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { stackIcons } from "../../data/presentationIcons";

// Every technology a Project lists in its `stack` frontmatter is rendered as an icon-only
// glyph in the Showcase (StackIcons.astro). The design choice is "an icon for every entry"
// (no text fallback, nothing skipped), so a stack name with no entry in the shared
// `stackIcons` registry must be a build-time failure, not a silent gap on the Stage.
const dir = fileURLToPath(new URL(".", import.meta.url));

function stackNamesOf(md: string): string[] {
  const block = md.match(/stack:\s*(\[[^\]]*\])/s); // captures [ ... ], inline or multi-line
  if (!block) return [];
  return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

describe("stack icon coverage", () => {
  const files = readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  const known = new Set(Object.keys(stackIcons));

  it("every project stack name has an icon in the registry", () => {
    const missing: string[] = [];
    for (const f of files) {
      const md = readFileSync(new URL(`./${f}`, import.meta.url), "utf8");
      for (const name of stackNamesOf(md)) {
        if (!known.has(name)) missing.push(`${f}: ${name}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
