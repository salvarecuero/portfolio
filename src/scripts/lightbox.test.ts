import { describe, it, expect } from "vitest";
import { setLightboxOpen, trapFocusTarget, clampPan, toggleZoom, applyPan } from "./lightbox";

// Minimal fake element - node test env has no DOM.
function fakeEl() {
  const classes = new Set<string>();
  const attrs: Record<string, string> = {};
  return {
    classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c), has: (c: string) => classes.has(c) },
    setAttribute: (k: string, v: string) => { attrs[k] = v; },
    _classes: classes,
    _attrs: attrs,
  };
}

describe("setLightboxOpen", () => {
  it("opens: adds .open and sets aria-hidden=false", () => {
    const el = fakeEl();
    setLightboxOpen(el as any, true);
    expect(el._classes.has("open")).toBe(true);
    expect(el._attrs["aria-hidden"]).toBe("false");
  });
  it("closes: removes .open and sets aria-hidden=true", () => {
    const el = fakeEl();
    setLightboxOpen(el as any, true);
    setLightboxOpen(el as any, false);
    expect(el._classes.has("open")).toBe(false);
    expect(el._attrs["aria-hidden"]).toBe("true");
  });
});

describe("trapFocusTarget", () => {
  const a = {} as any, b = {} as any, c = {} as any;

  it("wraps to the last element on shift+tab from the first", () => {
    expect(trapFocusTarget([a, b, c], a, true)).toBe(c);
  });

  it("wraps to the first element on tab from the last", () => {
    expect(trapFocusTarget([a, b, c], c, false)).toBe(a);
  });

  it("returns null in the middle so the browser moves focus normally", () => {
    expect(trapFocusTarget([a, b, c], b, false)).toBe(null);
    expect(trapFocusTarget([a, b, c], b, true)).toBe(null);
  });

  it("returns null when there is nothing focusable", () => {
    expect(trapFocusTarget([], null, false)).toBe(null);
  });
});

describe("clampPan", () => {
  it("returns 0 when there is no overflow (image fits)", () => {
    expect(clampPan(10, 100, 200)).toBe(0);
    expect(clampPan(0, 200, 100)).toBe(0);
  });
  it("allows offsets within half the overflow", () => {
    // overflow = 200-100 = 100, limit = 50
    expect(clampPan(30, 200, 100)).toBe(30);
    expect(clampPan(-30, 200, 100)).toBe(-30);
  });
  it("clamps to +/- half the overflow at the edges", () => {
    expect(clampPan(100, 200, 100)).toBe(50);
    expect(clampPan(-100, 200, 100)).toBe(-50);
  });
});

describe("toggleZoom", () => {
  it("zooms in from fit, leaving pan at origin", () => {
    expect(toggleZoom({ zoomed: false, offsetX: 0, offsetY: 0 }))
      .toEqual({ zoomed: true, offsetX: 0, offsetY: 0 });
  });
  it("zooms out and resets any pan offset back to origin", () => {
    expect(toggleZoom({ zoomed: true, offsetX: 30, offsetY: -20 }))
      .toEqual({ zoomed: false, offsetX: 0, offsetY: 0 });
  });
});

describe("applyPan", () => {
  it("ignores panning when not zoomed", () => {
    const state = { zoomed: false, offsetX: 0, offsetY: 0 };
    expect(applyPan(state, 30, 40, 200, 200, 100, 100)).toBe(state);
  });
  it("adds a delta to the offset when zoomed, clamped per axis", () => {
    // scaled 200, viewport 100 => limit 50 on each axis
    expect(applyPan({ zoomed: true, offsetX: 0, offsetY: 0 }, 30, 40, 200, 200, 100, 100))
      .toEqual({ zoomed: true, offsetX: 30, offsetY: 40 });
  });
  it("clamps the dragged offset at the edges", () => {
    expect(applyPan({ zoomed: true, offsetX: 0, offsetY: 0 }, 999, -999, 200, 200, 100, 100))
      .toEqual({ zoomed: true, offsetX: 50, offsetY: -50 });
  });
});
