/**
 * Carousel index math for the Media gallery. Pure + framework-free so it unit-tests
 * without a DOM (mirrors introTrigger.ts). The gallery wraps around at both ends.
 */
export function wrapIndex(i: number, n: number): number {
  if (n <= 0) return 0;
  return ((i % n) + n) % n;
}

export function nextIndex(i: number, n: number): number {
  return wrapIndex(i + 1, n);
}

export function prevIndex(i: number, n: number): number {
  return wrapIndex(i - 1, n);
}
