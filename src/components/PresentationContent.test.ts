import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PresentationContent from './PresentationContent.astro';

describe('PresentationContent', () => {
  it('renders the name as an <h1> when heading="h1"', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(PresentationContent, { props: { heading: 'h1', priority: true } });
    expect(html).toMatch(/<h1[^>]*class="name"/);
    expect(html).toContain('Salvador');
    expect(html).toContain('Software Engineer');
    expect(html).toContain('data-b="gh"');
  });

  it('renders the name as a <div class="name"> (no <h1>) when heading="div"', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(PresentationContent, { props: { heading: 'div', priority: false } });
    expect(html).toMatch(/<div[^>]*class="name"/);
    expect((html.match(/<h1/g) ?? []).length).toBe(0);
  });

  it('does not render PersonSchema JSON-LD (single-source stays in Presentation)', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(PresentationContent, { props: { heading: 'h1', priority: true } });
    expect(html).not.toContain('application/ld+json');
  });

  it('adds the compact modifier to .pres-world when compact', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(PresentationContent, { props: { heading: 'div', compact: true } });
    expect(html).toMatch(/class="pres-world compact"/);
  });

  it('has no compact class on .pres-world by default', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(PresentationContent, { props: { heading: 'h1', priority: true } });
    expect(html).toMatch(/class="pres-world"/);
    expect(html).not.toContain('pres-world compact');
  });

  it('compact + heading="div" still has no <h1> and no JSON-LD', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(PresentationContent, { props: { heading: 'div', compact: true } });
    expect((html.match(/<h1/g) ?? []).length).toBe(0);
    expect(html).not.toContain('application/ld+json');
  });
});
