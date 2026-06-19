import { describe, it, expect } from 'vitest';
import { buildBreadcrumbSchema } from './breadcrumbSchema';

describe('buildBreadcrumbSchema', () => {
  it('builds an ordered BreadcrumbList from items', () => {
    const b = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://salvarecuero.dev/' },
      { name: 'RangeTube', url: 'https://salvarecuero.dev/projects/rangetube/' },
    ]);
    expect(b['@type']).toBe('BreadcrumbList');
    expect(b.itemListElement).toHaveLength(2);
    expect(b.itemListElement[0]).toEqual({ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://salvarecuero.dev/' });
    expect(b.itemListElement[1].position).toBe(2);
    expect(b.itemListElement[1].item).toBe('https://salvarecuero.dev/projects/rangetube/');
  });
});
