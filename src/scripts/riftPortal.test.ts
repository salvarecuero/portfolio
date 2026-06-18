import { describe, it, expect } from 'vitest';
import { chooseReveal } from './riftPortal';

describe('chooseReveal', () => {
  it('uses webgl when capable and motion is allowed', () => {
    expect(chooseReveal({ reduceMotion: false, webglAvailable: true, loadFailed: false })).toBe('webgl');
  });
  it('falls back under reduced motion', () => {
    expect(chooseReveal({ reduceMotion: true, webglAvailable: true, loadFailed: false })).toBe('fallback');
  });
  it('falls back without WebGL', () => {
    expect(chooseReveal({ reduceMotion: false, webglAvailable: false, loadFailed: false })).toBe('fallback');
  });
  it('falls back when the scene chunk failed to load', () => {
    expect(chooseReveal({ reduceMotion: false, webglAvailable: true, loadFailed: true })).toBe('fallback');
  });
});
