import { describe, it, expect } from "vitest";
import { wrapIndex, nextIndex, prevIndex } from "./galleryNav";

describe("galleryNav", () => {
  it("wraps an index into [0, n)", () => {
    expect(wrapIndex(0, 4)).toBe(0);
    expect(wrapIndex(4, 4)).toBe(0);
    expect(wrapIndex(-1, 4)).toBe(3);
    expect(wrapIndex(5, 4)).toBe(1);
  });
  it("next wraps past the end to 0", () => {
    expect(nextIndex(0, 3)).toBe(1);
    expect(nextIndex(2, 3)).toBe(0);
  });
  it("prev wraps before 0 to the last", () => {
    expect(prevIndex(0, 3)).toBe(2);
    expect(prevIndex(2, 3)).toBe(1);
  });
  it("is safe for an empty set", () => {
    expect(wrapIndex(1, 0)).toBe(0);
  });
});
