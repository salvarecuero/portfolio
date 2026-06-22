import { describe, it, expect } from "vitest";
import { setLightboxOpen } from "./lightbox";

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
