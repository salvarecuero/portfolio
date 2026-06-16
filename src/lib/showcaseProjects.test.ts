import { describe, it, expect } from 'vitest';
import { toShowcaseProjects } from './showcaseProjects';

const raw = [
  { id: 'b', data: { title: 'B', order: 2, icon: 'target', accent: '#f00', poster: 'p', summary: 's', mode: 'media', stack: [], links: { live: 'https://b.dev' } } },
  { id: 'a', data: { title: 'A', order: 1, icon: undefined, accent: '#0f0', poster: 'p', summary: 's', mode: 'media', stack: [], links: { repo: 'https://git/a' } } },
];

describe('toShowcaseProjects', () => {
  it('sorts by order and marks the first active', () => {
    const out = toShowcaseProjects(raw as any);
    expect(out.map(p => p.title)).toEqual(['A', 'B']);
    expect(out[0].active).toBe(true);
    expect(out[1].active).toBe(false);
  });
  it('resolves a default icon path when icon is missing', () => {
    const out = toShowcaseProjects(raw as any);
    expect(out[0].iconPath.length).toBeGreaterThan(0);
  });
  it('passes links through', () => {
    const out = toShowcaseProjects(raw as any);
    expect(out[0].links?.repo).toBe('https://git/a');
  });
});
