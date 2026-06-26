import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const md = readFileSync(fileURLToPath(new URL("./simple-tool-stack.md", import.meta.url)), "utf8");

describe("Simple Tool Stack content", () => {
  it("uses accurate summary copy (no false 'no sign-up' / 'no uploads' claims)", () => {
    expect(md).not.toMatch(/no sign-?up/i);
    expect(md).not.toMatch(/no uploads/i);
  });
  it("describes tools generally, not only image and text", () => {
    expect(md).toMatch(/summary:\s*"A hub of small tools that each do one thing well\./);
  });
});
