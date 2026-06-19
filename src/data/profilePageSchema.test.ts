import { describe, it, expect } from 'vitest';
import { buildProfilePageSchema } from './profilePageSchema';

describe('buildProfilePageSchema', () => {
  it('wraps the Person as mainEntity under a ProfilePage', () => {
    const pp = buildProfilePageSchema({
      siteUrl: 'https://salvarecuero.dev/',
      imageUrl: 'https://salvarecuero.dev/_astro/photo.abc.jpg',
    });
    expect(pp['@type']).toBe('ProfilePage');
    expect(pp['@id']).toBe('https://salvarecuero.dev/#profilepage');
    expect(pp.url).toBe('https://salvarecuero.dev/');
    expect(pp.mainEntity['@type']).toBe('Person');
    expect(pp.mainEntity['@id']).toBe('https://salvarecuero.dev/#person');
  });
});
