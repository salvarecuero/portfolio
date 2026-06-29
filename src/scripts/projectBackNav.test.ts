import { describe, it, expect } from "vitest";
import { arrivedFromHome } from "./projectBackNav";

const origin = "https://salvarecuero.dev";

describe("arrivedFromHome", () => {
  it("is true when the referrer is the same-origin home page", () => {
    expect(arrivedFromHome(`${origin}/`, origin)).toBe(true);
  });

  it("is true when the home referrer carries a Project hash", () => {
    // document.referrer strips the fragment in practice, but a hashed home still resolves
    // to pathname "/", so the user was in the Showcase.
    expect(arrivedFromHome(`${origin}/#rangetube`, origin)).toBe(true);
  });

  it("is false when there is no referrer (direct entry)", () => {
    expect(arrivedFromHome("", origin)).toBe(false);
  });

  it("is false when the referrer is a different origin", () => {
    expect(arrivedFromHome("https://news.ycombinator.com/", origin)).toBe(false);
  });

  it("is false when the referrer is another page on the site", () => {
    expect(arrivedFromHome(`${origin}/projects/rangetube/`, origin)).toBe(false);
  });

  it("is false for a malformed referrer", () => {
    expect(arrivedFromHome("not a url", origin)).toBe(false);
  });
});
