import { describe, it, expect } from 'vitest';
import { buildWebsiteSchema } from './websiteSchema';
import { presentation } from './presentation';

describe('buildWebsiteSchema', () => {
  it('builds a WebSite node with @id + author referencing the Person @id', () => {
    const s = buildWebsiteSchema({ siteUrl: 'https://salvarecuero.dev/' });
    expect(s['@type']).toBe('WebSite');
    expect(s['@id']).toBe('https://salvarecuero.dev/#website');
    expect(s.url).toBe('https://salvarecuero.dev/');
    expect(s.name).toBe(presentation.name);
    expect(s.author).toEqual({ '@id': 'https://salvarecuero.dev/#person' });
  });
});
