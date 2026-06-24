// Selector tab glyphs (24x24 viewBox, stroke-based). Keyed by `icon` in a Project's
// frontmatter; `default` is used when a Project omits `icon` or the key is unknown.
export const showcaseIcons: Record<string, string> = {
  default: "M12 2 2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5",
  layers: "M12 2 2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5",
  target: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M12 12m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0",
  image: "M3 3h18v18H3z M3 16l5-5 4 4 3-3 6 6 M8.5 8.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0",
  spark: "M12 3v18 M3 12h18 M5.6 5.6l12.8 12.8 M18.4 5.6 5.6 18.4",
  // dual-handle range slider - RangeTube's signature start/end control
  range: "M3 12h18 M9 12m-2.4 0a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0 M15 12m-2.4 0a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0",
  // magic wand + sparkle - bye-bg's one-tap background removal
  wand: "M4 20 13 11 M16.5 3v6 M13.5 6h6",
};

export function iconPath(key?: string): string {
  return (key && showcaseIcons[key]) || showcaseIcons.default;
}
