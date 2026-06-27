// src/scripts/viewMode.test.ts
import { describe, it, expect } from "vitest";
import {
  VIEW_PREF_KEY,
  preferenceToView,
  viewToPreference,
  readViewPreference,
  writeViewPreference,
  resolveView,
  switcherAria,
} from "./viewMode";

const fakeStorage = (initial: Record<string, string> = {}) => {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  };
};

describe("preference <-> view", () => {
  it("maps preference to view", () => {
    expect(preferenceToView("interactive")).toBe("embed");
    expect(preferenceToView("screenshots")).toBe("media");
  });
  it("maps view to preference", () => {
    expect(viewToPreference("embed")).toBe("interactive");
    expect(viewToPreference("media")).toBe("screenshots");
  });
});

describe("readViewPreference", () => {
  it("defaults to interactive when unset or unknown", () => {
    expect(readViewPreference(fakeStorage())).toBe("interactive");
    expect(readViewPreference(fakeStorage({ [VIEW_PREF_KEY]: "nonsense" }))).toBe("interactive");
  });
  it("returns screenshots only for the exact value", () => {
    expect(readViewPreference(fakeStorage({ [VIEW_PREF_KEY]: "screenshots" }))).toBe("screenshots");
  });
});

describe("writeViewPreference", () => {
  it("persists under the canonical key", () => {
    const s = fakeStorage();
    writeViewPreference(s, "screenshots");
    expect(s.getItem(VIEW_PREF_KEY)).toBe("screenshots");
  });
});

describe("resolveView", () => {
  it("interactive preference -> embed, enabled", () => {
    expect(resolveView({ preference: "interactive", embedFailed: false })).toEqual({
      view: "embed",
      interactiveDisabled: false,
    });
  });
  it("screenshots preference -> media, enabled", () => {
    expect(resolveView({ preference: "screenshots", embedFailed: false })).toEqual({
      view: "media",
      interactiveDisabled: false,
    });
  });
  it("a failed embed forces media and disables Interactive regardless of preference", () => {
    expect(resolveView({ preference: "interactive", embedFailed: true })).toEqual({
      view: "media",
      interactiveDisabled: true,
    });
  });
});

describe("switcherAria", () => {
  it("reflects the embed view", () => {
    expect(switcherAria("embed", false)).toEqual({
      embedPressed: "true",
      mediaPressed: "false",
      interactiveDisabled: false,
    });
  });
  it("reflects the media view with Interactive disabled", () => {
    expect(switcherAria("media", true)).toEqual({
      embedPressed: "false",
      mediaPressed: "true",
      interactiveDisabled: true,
    });
  });
});
