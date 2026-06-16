import { describe, it, expect, vi } from 'vitest';
import { createIntroTrigger } from './introTrigger';

const entry = (isIntersecting: boolean, intersectionRatio: number) =>
  ({ isIntersecting, intersectionRatio } as IntersectionObserverEntry);

describe('createIntroTrigger', () => {
  it('fires onPlay once when the target becomes dominant, then never again', () => {
    const onPlay = vi.fn();
    const handle = createIntroTrigger(onPlay, 0.6);
    expect(handle([entry(true, 0.3)])).toBe(false);   // below threshold
    expect(onPlay).not.toHaveBeenCalled();
    expect(handle([entry(true, 0.7)])).toBe(true);     // crosses → fire + signal unobserve
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(handle([entry(true, 1)])).toBe(false);      // no restart at ratio 1
    expect(handle([entry(false, 0)])).toBe(false);     // no replay on the way out
    expect(onPlay).toHaveBeenCalledTimes(1);
  });
});
