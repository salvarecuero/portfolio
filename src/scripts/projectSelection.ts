/**
 * Pure selection logic for the Showcase Selector. Framework- and DOM-free so it
 * unit-tests without a browser (mirrors galleryNav.ts / introTrigger.ts).
 */
export function projectFromHash(hash: string, ids: string[]): string | null {
  const id = hash.replace(/^#/, "");
  return id && ids.includes(id) ? id : null;
}

export function nextTab(i: number, n: number): number {
  if (n <= 0) return 0;
  return (i + 1) % n;
}

export function prevTab(i: number, n: number): number {
  if (n <= 0) return 0;
  return (i - 1 + n) % n;
}
