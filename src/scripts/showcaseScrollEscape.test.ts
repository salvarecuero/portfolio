import { describe, expect, it } from "vitest";
import { createEscapeState, decideShowcaseEscape, type EscapeState } from "./showcaseScrollEscape";

const base = (
  state: EscapeState,
  over: Partial<Parameters<typeof decideShowcaseEscape>[0]> = {},
) => ({
  deltaY: -40,
  scrollTop: 1000,
  showcaseTop: 1000,
  now: 100,
  state,
  ...over,
});

describe("decideShowcaseEscape", () => {
  it("ignores downward wheel input", () => {
    const state = createEscapeState();
    expect(decideShowcaseEscape(base(state, { deltaY: 20 }))).toBe("ignore");
  });

  it("ignores upward input when the page is not snapped to the showcase top", () => {
    const state = createEscapeState();
    expect(decideShowcaseEscape(base(state, { scrollTop: 940 }))).toBe("ignore");
  });

  it("bounces on the first upward attempt from the showcase top", () => {
    const state = createEscapeState();
    expect(decideShowcaseEscape(base(state))).toBe("bounce");
    expect(state.confirmAfter).toBeGreaterThan(100);
    expect(state.armedUntil).toBeGreaterThan(state.confirmAfter);
  });

  it("blocks the rest of the first wheel burst", () => {
    const state = createEscapeState();
    expect(decideShowcaseEscape(base(state, { now: 100 }))).toBe("bounce");
    expect(decideShowcaseEscape(base(state, { now: 220 }))).toBe("block");
  });

  it("allows a second upward gesture after the bounce delay", () => {
    const state = createEscapeState();
    expect(decideShowcaseEscape(base(state, { now: 100 }))).toBe("bounce");
    expect(decideShowcaseEscape(base(state, { now: 260 }))).toBe("allow");
  });

  it("requires a fresh bounce after the armed window expires", () => {
    const state = createEscapeState();
    expect(decideShowcaseEscape(base(state, { now: 100 }))).toBe("bounce");
    expect(decideShowcaseEscape(base(state, { now: 2400 }))).toBe("bounce");
  });
});
