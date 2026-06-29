// src/scripts/viewMode.ts
/**
 * Pure (DOM-free) logic for the Showcase embed/media view switcher. Unit-tested without
 * a browser (mirrors embedLifecycle.ts / backdropReveal.ts). DOM wiring: viewModeController.ts.
 */
export type ViewMode = "embed" | "media";
export type ViewPreference = "interactive" | "screenshots";

export const VIEW_PREF_KEY = "showcase:view-pref";

export function preferenceToView(pref: ViewPreference): ViewMode {
  return pref === "screenshots" ? "media" : "embed";
}

export function viewToPreference(view: ViewMode): ViewPreference {
  return view === "media" ? "screenshots" : "interactive";
}

/** Read the session preference, defaulting to "interactive" (embed-first). */
export function readViewPreference(storage: Pick<Storage, "getItem">): ViewPreference {
  return storage.getItem(VIEW_PREF_KEY) === "screenshots" ? "screenshots" : "interactive";
}

export function writeViewPreference(storage: Pick<Storage, "setItem">, pref: ViewPreference): void {
  storage.setItem(VIEW_PREF_KEY, pref);
}

export interface ResolvedView {
  view: ViewMode;
  interactiveDisabled: boolean;
}

/**
 * The view a Project shows on activation. A failed embed forces media and disables the
 * Interactive option (cannot return to a known-broken embed); otherwise the session
 * preference decides. Does not mutate the stored preference.
 */
export function resolveView(opts: {
  preference: ViewPreference;
  embedFailed: boolean;
}): ResolvedView {
  if (opts.embedFailed) return { view: "media", interactiveDisabled: true };
  return { view: preferenceToView(opts.preference), interactiveDisabled: false };
}

export interface SwitcherAria {
  embedPressed: "true" | "false";
  mediaPressed: "true" | "false";
  interactiveDisabled: boolean;
}

export function switcherAria(view: ViewMode, interactiveDisabled: boolean): SwitcherAria {
  return {
    embedPressed: view === "embed" ? "true" : "false",
    mediaPressed: view === "media" ? "true" : "false",
    interactiveDisabled,
  };
}
