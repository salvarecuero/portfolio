import { describe, it, expect } from "vitest";
import { decideHashSync } from "./showcaseHashSync";

describe("decideHashSync", () => {
  it("sets the active id when the Showcase is in view and the hash is empty", () => {
    expect(decideHashSync({ inShowcase: true, activeId: "alpha", currentHash: "" })).toEqual({
      type: "set",
      id: "alpha",
    });
  });

  it("does nothing when the hash already matches the active Project", () => {
    expect(decideHashSync({ inShowcase: true, activeId: "alpha", currentHash: "#alpha" })).toEqual({
      type: "none",
    });
  });

  it("re-syncs to the active id when the hash points at a different Project", () => {
    expect(decideHashSync({ inShowcase: true, activeId: "alpha", currentHash: "#beta" })).toEqual({
      type: "set",
      id: "alpha",
    });
  });

  it("does nothing in the Showcase when there is no active Project", () => {
    expect(decideHashSync({ inShowcase: true, activeId: null, currentHash: "" })).toEqual({
      type: "none",
    });
  });

  it("clears a stale hash when the Presentation is in view", () => {
    expect(decideHashSync({ inShowcase: false, activeId: "alpha", currentHash: "#alpha" })).toEqual(
      { type: "clear" },
    );
  });

  it("does nothing at the Presentation when the hash is already empty", () => {
    expect(decideHashSync({ inShowcase: false, activeId: "alpha", currentHash: "" })).toEqual({
      type: "none",
    });
  });
});
