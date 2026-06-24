import { describe, it, expect } from 'vitest';
import { buildSeoMeta, siteOrigin } from './seo';

const base = {
  fallbackOrigin: 'https://salvarecuero.dev',
  pathname: '/',
  title: 'Salvador Recuero - Software Engineer',
  description: 'desc',
};

describe('buildSeoMeta', () => {
  it('builds an ABSOLUTE og:image from a path + Astro.site', () => {
    const m = buildSeoMeta({ ...base, site: new URL('https://salvarecuero.dev') });
    expect(m.ogImage).toBe('https://salvarecuero.dev/og.png');
  });

  it('builds canonical + og:url from pathname against the site origin', () => {
    const m = buildSeoMeta({ ...base, site: new URL('https://salvarecuero.dev') });
    expect(m.canonical).toBe('https://salvarecuero.dev/');
    expect(m.ogUrl).toBe('https://salvarecuero.dev/');
  });

  it('falls back to fallbackOrigin when site is undefined', () => {
    const m = buildSeoMeta({ ...base, site: undefined });
    expect(m.ogImage).toBe('https://salvarecuero.dev/og.png');
    expect(m.canonical).toBe('https://salvarecuero.dev/');
  });

  it('defaults image to /og.png and type to website; honours overrides', () => {
    const d = buildSeoMeta({ ...base, site: undefined });
    expect(d.ogImage).toBe('https://salvarecuero.dev/og.png');
    expect(d.ogType).toBe('website');
    const o = buildSeoMeta({ ...base, site: undefined, image: '/custom.png', type: 'profile' });
    expect(o.ogImage).toBe('https://salvarecuero.dev/custom.png');
    expect(o.ogType).toBe('profile');
  });
});

describe('siteOrigin', () => {
  it('returns the site origin with a trailing slash', () => {
    expect(siteOrigin(new URL('https://salvarecuero.dev'), 'https://x.dev')).toBe('https://salvarecuero.dev/');
  });
  it('falls back when site is undefined, normalizing the trailing slash', () => {
    expect(siteOrigin(undefined, 'https://salvarecuero.dev')).toBe('https://salvarecuero.dev/');
  });
});
