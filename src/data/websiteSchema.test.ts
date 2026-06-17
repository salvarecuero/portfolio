import { describe, it, expect } from 'vitest';
import { buildWebsiteSchema } from './websiteSchema';
import { presentation } from './presentation';

describe('buildWebsiteSchema', () => {
  it('builds a minimal WebSite node with the site url + author', () => {
    const s = buildWebsiteSchema({ siteUrl: 'https://salvarecuero.dev/' });
    expect(s['@type']).toBe('WebSite');
    expect(s.url).toBe('https://salvarecuero.dev/');
    expect(s.name).toBe(presentation.name);
    expect(s.author).toEqual({ '@type': 'Person', name: presentation.name });
  });
});
