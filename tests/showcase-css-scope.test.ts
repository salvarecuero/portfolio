import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles/showcase.css", "utf8");

describe("showcase CSS scoping", () => {
  it("keeps stack icon rules scoped to the Showcase rail", () => {
    expect(css).not.toMatch(/(^|[,{]\s*)\.stack-ic(?:[:\s,{>]|$)/m);
    expect(css).toContain(".stack-icons .stack-ic");
  });
});
