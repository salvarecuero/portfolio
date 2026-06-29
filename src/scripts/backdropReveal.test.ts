import { describe, it, expect, vi } from "vitest";
import { createBackdropReveal, backdropAria } from "./backdropReveal";

describe("backdropAria", () => {
  it('maps the normal state to an un-pressed "View backdrop" control', () => {
    expect(backdropAria(false)).toEqual({ pressed: "false", label: "View backdrop" });
  });
  it('maps the revealed state to a pressed "Hide backdrop" control', () => {
    expect(backdropAria(true)).toEqual({ pressed: "true", label: "Hide backdrop" });
  });
});

describe("createBackdropReveal", () => {
  it("starts in the normal (not revealed) state without notifying", () => {
    const onChange = vi.fn();
    const reveal = createBackdropReveal(onChange);
    expect(reveal.isRevealed()).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("toggle() flips the state and notifies each real transition", () => {
    const onChange = vi.fn();
    const reveal = createBackdropReveal(onChange);
    expect(reveal.toggle()).toBe(true); // normal → revealed (changed)
    expect(reveal.isRevealed()).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(reveal.toggle()).toBe(true); // revealed → normal (changed)
    expect(reveal.isRevealed()).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("restore() only acts (and notifies) when currently revealed", () => {
    const onChange = vi.fn();
    const reveal = createBackdropReveal(onChange);
    expect(reveal.restore()).toBe(false); // already normal → no-op
    expect(onChange).not.toHaveBeenCalled();
    reveal.toggle(); // → revealed
    onChange.mockClear();
    expect(reveal.restore()).toBe(true); // revealed → normal (changed)
    expect(reveal.isRevealed()).toBe(false);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(false);
  });
});
