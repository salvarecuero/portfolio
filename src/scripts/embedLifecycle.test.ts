import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { embedOrigin, isReadyMessage, createRevealRace, lruEvict, shouldMount } from './embedLifecycle';

describe('embedOrigin', () => {
  it('returns scheme+host+port only', () => {
    expect(embedOrigin('https://rangetube.netlify.app/path?x=1')).toBe('https://rangetube.netlify.app');
  });
});

describe('isReadyMessage', () => {
  it('accepts the exact shape', () => {
    expect(isReadyMessage({ type: 'portfolio:ready', v: 1 })).toBe(true);
  });
  it('rejects wrong type / version / non-object', () => {
    expect(isReadyMessage({ type: 'x', v: 1 })).toBe(false);
    expect(isReadyMessage({ type: 'portfolio:ready', v: 2 })).toBe(false);
    expect(isReadyMessage(null)).toBe(false);
    expect(isReadyMessage('portfolio:ready')).toBe(false);
  });
});

describe('createRevealRace', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('message wins immediately and fires once', () => {
    const onReveal = vi.fn();
    const r = createRevealRace({ onReveal });
    r.onMessage();
    r.onMessage();
    vi.advanceTimersByTime(5000);
    expect(onReveal).toHaveBeenCalledTimes(1);
  });
  it('load reveals after the grace delay', () => {
    const onReveal = vi.fn();
    const r = createRevealRace({ onReveal, graceMs: 400 });
    r.onLoad();
    vi.advanceTimersByTime(399); expect(onReveal).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); expect(onReveal).toHaveBeenCalledTimes(1);
  });
  it('hard ceiling reveals when nothing else fires', () => {
    const onReveal = vi.fn();
    createRevealRace({ onReveal, ceilingMs: 3500 });
    vi.advanceTimersByTime(3500); expect(onReveal).toHaveBeenCalledTimes(1);
  });
  it('cancel suppresses all reveals', () => {
    const onReveal = vi.fn();
    const r = createRevealRace({ onReveal });
    r.cancel(); r.onMessage(); vi.advanceTimersByTime(5000);
    expect(onReveal).not.toHaveBeenCalled();
  });
});

describe('lruEvict', () => {
  it('returns null under cap', () => expect(lruEvict(['a', 'b'], 3)).toBeNull());
  it('returns the oldest over cap', () => expect(lruEvict(['a', 'b', 'c', 'd'], 3)).toBe('a'));
});

describe('shouldMount', () => {
  const d = { mode: 'embed' as const, isDesktop: true, embedMobile: false, requiresLaunch: false };
  it('mounts embed on desktop', () => expect(shouldMount(d)).toBe(true));
  it('skips non-embed', () => expect(shouldMount({ ...d, mode: 'media' })).toBe(false));
  it('skips requiresLaunch', () => expect(shouldMount({ ...d, requiresLaunch: true })).toBe(false));
  it('skips mobile unless embedMobile', () => {
    expect(shouldMount({ ...d, isDesktop: false })).toBe(false);
    expect(shouldMount({ ...d, isDesktop: false, embedMobile: true })).toBe(true);
  });
});
