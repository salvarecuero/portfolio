import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { embedOrigin, isReadyMessage, createEmbedTimers, lruEvict, shouldMount } from './embedLifecycle';

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

describe('createEmbedTimers', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const make = (over: Partial<Parameters<typeof createEmbedTimers>[0]> = {}) => {
    const onSpinner = vi.fn(), onReveal = vi.fn(), onFallback = vi.fn();
    const t = createEmbedTimers({ onSpinner, onReveal, onFallback, ...over });
    return { t, onSpinner, onReveal, onFallback };
  };

  it('handshake reveals once and cancels the rest', () => {
    const { t, onReveal, onFallback, onSpinner } = make();
    t.onReady(); t.onReady();
    vi.advanceTimersByTime(5000);
    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(onFallback).not.toHaveBeenCalled();
    expect(onSpinner).not.toHaveBeenCalled();
  });

  it('shows the spinner at the delay when not yet revealed', () => {
    const { onSpinner } = make({ spinnerMs: 600 });
    vi.advanceTimersByTime(599); expect(onSpinner).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); expect(onSpinner).toHaveBeenCalledTimes(1);
  });

  it('reveal before the spinner delay suppresses the spinner', () => {
    const { t, onSpinner } = make({ spinnerMs: 600 });
    vi.advanceTimersByTime(500); t.onReady();
    vi.advanceTimersByTime(600); expect(onSpinner).not.toHaveBeenCalled();
  });

  it('falls back at the ceiling when no handshake arrives', () => {
    const { onFallback, onReveal } = make({ fallbackMs: 4000 });
    vi.advanceTimersByTime(3999); expect(onFallback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); expect(onFallback).toHaveBeenCalledTimes(1);
    expect(onReveal).not.toHaveBeenCalled();
  });

  it('error falls back immediately and once', () => {
    const { t, onFallback } = make();
    t.onError(); t.onError();
    vi.advanceTimersByTime(5000);
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  it('reveal and fallback are mutually exclusive - first wins', () => {
    const { t, onReveal, onFallback } = make();
    t.onReady(); t.onError();
    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(onFallback).not.toHaveBeenCalled();
  });

  it('cancel suppresses everything', () => {
    const { t, onReveal, onFallback, onSpinner } = make();
    t.cancel(); t.onReady(); vi.advanceTimersByTime(5000);
    expect(onReveal).not.toHaveBeenCalled();
    expect(onFallback).not.toHaveBeenCalled();
    expect(onSpinner).not.toHaveBeenCalled();
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
