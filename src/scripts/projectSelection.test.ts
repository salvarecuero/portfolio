import { describe, it, expect } from "vitest";
import { projectFromHash, nextTab, prevTab } from "./projectSelection";

const ids = ["alpha", "beta", "gamma"];

describe("projectFromHash", () => {
  it("returns the id when the hash matches a known project", () => {
    expect(projectFromHash("#beta", ids)).toBe("beta");
  });
  it("tolerates a missing leading hash", () => {
    expect(projectFromHash("gamma", ids)).toBe("gamma");
  });
  it("returns null for an empty hash", () => {
    expect(projectFromHash("", ids)).toBeNull();
    expect(projectFromHash("#", ids)).toBeNull();
  });
  it("returns null when the hash matches no project", () => {
    expect(projectFromHash("#nope", ids)).toBeNull();
  });
});

describe("nextTab / prevTab", () => {
  it("moves forward and wraps past the end", () => {
    expect(nextTab(0, 3)).toBe(1);
    expect(nextTab(2, 3)).toBe(0);
  });
  it("moves backward and wraps before the start", () => {
    expect(prevTab(2, 3)).toBe(1);
    expect(prevTab(0, 3)).toBe(2);
  });
  it("is safe for an empty set", () => {
    expect(nextTab(0, 0)).toBe(0);
    expect(prevTab(0, 0)).toBe(0);
  });
});
