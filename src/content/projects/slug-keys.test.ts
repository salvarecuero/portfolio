import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The content filename is the collection `id`, which is the canonical project key across the
// Showcase deep-link hash (#<id>), the Stage/Selector DOM ids (panel-<id>, tab-<id>), the embed
// controller entry map, and the detail route (/projects/<id>/). A leading order-index prefix
// (e.g. "02-rangetube") would leak the sort order into every one of those URL surfaces. The
// `order` frontmatter is the sort key, so the filename must stay index-free. See ADR 0008.
const dir = fileURLToPath(new URL(".", import.meta.url));

describe("project content keys", () => {
  const projectIds = readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => f.replace(/\.md$/, ""));

  it("has at least one project", () => {
    expect(projectIds.length).toBeGreaterThan(0);
  });

  it("no project id carries a leading order-index prefix", () => {
    const offenders = projectIds.filter((id) => /^\d+[-_]/.test(id));
    expect(offenders).toEqual([]);
  });
});
