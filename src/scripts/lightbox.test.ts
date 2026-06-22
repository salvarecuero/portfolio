import { describe, it, expect } from "vitest";
import { setLightboxOpen, trapFocusTarget } from "./lightbox";

// Minimal fake element — node test env has no DOM.
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
