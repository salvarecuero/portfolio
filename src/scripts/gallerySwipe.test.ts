import { describe, it, expect } from 'vitest';
import { resolveSwipe } from './gallerySwipe';

describe('resolveSwipe', () => {
  const T = 45;
  it('returns -1 (advance) on a left swipe past the threshold', () => {
    expect(resolveSwipe(-60, 5, T)).toBe(-1);
  });
  it('returns +1 (go back) on a right swipe past the threshold', () => {
    expect(resolveSwipe(60, -5, T)).toBe(1);
  });
  it('returns 0 when horizontal travel is below the threshold', () => {
    expect(resolveSwipe(20, 0, T)).toBe(0);
  });
  it('returns 0 when vertical travel dominates (a scroll, not a swipe)', () => {
    expect(resolveSwipe(50, 80, T)).toBe(0);
  });
  it('treats travel exactly at the threshold as no swipe', () => {
    expect(resolveSwipe(45, 0, T)).toBe(0);
  });
});
