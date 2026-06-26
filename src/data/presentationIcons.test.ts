import { describe, it, expect } from "vitest";
import { stackIcons } from "./presentationIcons";

describe("stackIcons registry", () => {
  it("keeps the existing simple-icons SVG entries as { brand, path }", () => {
    for (const name of ["TypeScript", "Next.js", "Docker"]) {
      const icon = stackIcons[name];
      expect(icon, name).toBeDefined();
      expect("path" in icon!).toBe(true);
      if ("path" in icon!) expect(icon.path.length).toBeGreaterThan(20);
      expect(icon!.brand).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("registers every Simple Tool Stack technology that has a glyph", () => {
    for (const name of [
      "Next.js",
      "Docker",
      "Cloudflare",
      "WebAssembly",
      "Turborepo",
      "Traefik",
      "Hono",
      "Mantine",
      "Sablier",
    ]) {
      expect(stackIcons[name], name).toBeDefined();
      expect(stackIcons[name]!.brand).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("represents Sablier as a custom mask (no simple-icons glyph)", () => {
    const sablier = stackIcons["Sablier"]!;
    expect("mask" in sablier).toBe(true);
    if ("mask" in sablier) expect(sablier.mask).toMatch(/^data:image\/webp;base64,/);
  });

  it("returns undefined for an unknown technology (text-pill fallback)", () => {
    expect(stackIcons["NoSuchTech"]).toBeUndefined();
  });
});
