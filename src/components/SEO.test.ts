import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect } from 'vitest';
import SEO from './SEO.astro';

describe('SEO.astro', () => {
  it('emits title, description, canonical, OG, Twitter, favicons, theme-color, sitemap, JSON-LD', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(SEO, {
      props: { title: 'Salvador Recuero — Software Engineer', description: 'desc' },
    });
    expect(html).toContain('<title>Salvador Recuero — Software Engineer</title>');
    expect(html).toContain('rel="canonical"');
    // og:image must be absolute (https origin), never a bare /path.
    expect(html).toMatch(/property="og:image" content="https:\/\/[^"]+\/og\.png"/);
    expect(html).toContain('property="og:type" content="website"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).toContain('name="theme-color"');
    expect(html).toContain('rel="sitemap"');
    expect(html).toContain('"@type":"WebSite"');
  });
});
