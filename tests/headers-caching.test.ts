import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Guards the caching contract encoded in public/_headers (see
// docs/adr/0006-caching-and-deploy-invalidation.md). Cloudflare Pages serves this file
// verbatim from the dist root. The rules here are the only deliberate override of CF's
// defaults, so this test exists to catch accidental deletion or weakening of them.

const headersPath = fileURLToPath(new URL("../public/_headers", import.meta.url));
const raw = readFileSync(headersPath, "utf8");

// Parse the _headers grammar into a map of path-pattern -> joined header lines.
// A line with no leading whitespace that is not a comment starts a new path block;
// indented lines are that block's headers.
function parseBlocks(text: string): Map<string, string> {
  const blocks = new Map<string, string>();
  let current: string | null = null;
  for (const line of text.split("\n")) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    if (/^\s/.test(line)) {
      if (current) blocks.set(current, (blocks.get(current) ?? "") + line.trim() + "\n");
    } else {
      current = line.trim();
      if (!blocks.has(current)) blocks.set(current, "");
    }
  }
  return blocks;
}

const blocks = parseBlocks(raw);

describe("_headers caching contract", () => {
  it("caches content-hashed /_astro/* immutably for a year", () => {
    const cc = blocks.get("/_astro/*") ?? "";
    expect(cc).toMatch(/Cache-Control:\s*public,\s*max-age=31536000,\s*immutable/i);
  });

  for (const path of ["/favicon.ico", "/favicon.svg", "/apple-touch-icon.png"]) {
    it(`gives the rarely-changing ${path} a week of cache with stale-while-revalidate`, () => {
      const cc = blocks.get(path) ?? "";
      expect(cc).toMatch(/Cache-Control:\s*public,\s*max-age=604800,\s*stale-while-revalidate=/i);
    });
  }

  it("bounds /og.png to a day fresh, then stale-while-revalidate", () => {
    const cc = blocks.get("/og.png") ?? "";
    expect(cc).toMatch(/Cache-Control:\s*public,\s*max-age=86400,\s*stale-while-revalidate=/i);
  });

  it("does not pin HTML or sitemaps to a long cache (they revalidate on every deploy)", () => {
    // No explicit block for these paths: they inherit CF Pages' default
    // `max-age=0, must-revalidate` + ETag, which is what makes a deploy show up instantly.
    for (const path of ["/", "/index.html", "/*", "/robots.txt", "/sitemap-index.xml"]) {
      const cc = blocks.get(path) ?? "";
      expect(cc).not.toMatch(/max-age=(?!0\b)\d/i);
    }
  });
});
