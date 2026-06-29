import { describe, it, expect } from "vitest";
import { createIntroController, cssTimeToMs } from "./introTrigger";

const entry = (isIntersecting: boolean, intersectionRatio: number) =>
  ({ isIntersecting, intersectionRatio }) as IntersectionObserverEntry;

describe("createIntroController", () => {
  it("plays once when the target becomes dominant, then never replays", () => {
    const next = createIntroController(0.6, 0.5);
    expect(next(entry(true, 0.3))).toBe("none"); // below play threshold
    expect(next(entry(true, 0.7))).toBe("play"); // crosses → play
    expect(next(entry(true, 1))).toBe("none"); // no restart at full ratio
  });

  it("never settles before it has played", () => {
    const next = createIntroController(0.6, 0.5);
    expect(next(entry(true, 0.4))).toBe("none"); // below play, also below settle - but not played
    expect(next(entry(false, 0))).toBe("none"); // left view, but intro never started
  });

  it("settles once when the showcase leaves the dominant zone mid-intro", () => {
    const next = createIntroController(0.6, 0.5);
    expect(next(entry(true, 0.7))).toBe("play");
    expect(next(entry(true, 0.55))).toBe("none"); // dipped below play but above settle → hysteresis, no settle
    expect(next(entry(true, 0.3))).toBe("settle"); // dropped below settle threshold → settle
    expect(next(entry(false, 0))).toBe("none"); // already settled, no repeat
    expect(next(entry(true, 0.7))).toBe("none"); // and never replays the intro
  });

  it("settles when the showcase scrolls fully out of view", () => {
    const next = createIntroController(0.6, 0.5);
    expect(next(entry(true, 0.8))).toBe("play");
    expect(next(entry(false, 0))).toBe("settle");
  });
});

describe("cssTimeToMs", () => {
  it("keeps millisecond CSS values as milliseconds", () => {
    expect(cssTimeToMs("2800ms", 100)).toBe(2800);
  });

  it("converts minified second CSS values to milliseconds", () => {
    expect(cssTimeToMs("2.8s", 100)).toBe(2800);
  });

  it("uses the fallback for invalid or unitless values", () => {
    expect(cssTimeToMs("", 2800)).toBe(2800);
    expect(cssTimeToMs("2.8", 2800)).toBe(2800);
  });
});
